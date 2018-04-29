import MyMath from "./my-math";
import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Vector4 from "./vector4";
import Quaternion from "./quaternion";
import Plane from "./plane";
import TextAreaWrapper from "./text-area-wrapper";
import PMX from "./pmx";
import BinaryUtils from "./binary-utils";

class VirtualVertex {
  constructor(pairs) {
    this.pairs = _.sortBy(pairs, ([vertex,]) => vertex.getUUID());
  }
  toString() {
    return JSON.stringify(this.pairs.map(([vertex, blendRate]) => [vertex.getUUID(), Math.fround(blendRate)]));
  }
  toVertex() {
    const model = this.pairs[0][0].getRootNode();
    const vertices = this.pairs.map(([vertex,]) => vertex);
    if (vertices.some(vertex => vertex.weight instanceof PMX.Vertex.Weight.SDEF)) {
      throw new Error("Combining vertices failed: SDEF not supported.");
    }
    const boneUUIDSet = new Set(_(vertices).flatMap(vertex => [...vertex.weight.bones]).filter(bone => bone.weight > 0).map(bone => bone.uuid).value());
    let weightMap = new Map([...boneUUIDSet].map(boneUUID => [boneUUID, 0]));
    for (const [vertex, blendRate] of this.pairs) {
      weightMap = vertex.weight.bones.filter(bone => bone.weight > 0).reduce(
        (map, bone) => map.set(bone.uuid, map.get(bone.uuid) + bone.weight * blendRate),
        weightMap
      );
    }
    if (boneUUIDSet.size > 4) {
      const rawWeightMap = _.sortBy([...weightMap], ([,weight]) => weight).reverse().slice(0, 4);
      const sum = rawWeightMap.map(([,weight]) => weight).reduce((sum, weight) => sum + weight, 0);
      weightMap = new Map(rawWeightMap.map(([boneUUID, weight]) => [boneUUID, weight / sum]));
    }
    let newWeight;
    switch (weightMap.size) {
    case 1:
    case 2:
    case 4:
      newWeight = model.createNode(model.constructor.Vertex.Weight[`BDEF${weightMap.size}`]).init(
        [...weightMap].map(([boneUUID, weight]) => model.createNode(model.constructor.Vertex.Weight.Bone).init(boneUUID, weight))
      )
      break;
    case 3:
      let dummyBoneUUID = model.bones.find(bone => !weightMap.has(bone.getUUID()));
      if (dummyBoneUUID === undefined) dummyBoneUUID = null;
      newWeight = model.createNode(model.constructor.Vertex.Weight.BDEF4).init(
        [...weightMap].map(([boneUUID, weight]) => model.createNode(model.constructor.Vertex.Weight.Bone).init(boneUUID, weight))
          .concat([model.createNode(model.constructor.Vertex.Weight.Bone).init(dummyBoneUUID, 0)])
      );
      break;
    }
    function slerp(scalars, blendRates) {
      return _.zip(scalars, blendRates).map(([scalar, blendRate]) => scalar * blendRate).reduce((sum, x) => sum + x);
    }
    function vlerp(vectors, blendRates) {
      return _.zip(vectors, blendRates).map(([vector, blendRate]) => vector.multiply(blendRate)).reduce((sum, v) => sum.add(v));
    }
    const blendRates = this.pairs.map(([,blendRate]) => blendRate);
    return model.createNode(model.constructor.Vertex).init(
      vlerp(vertices.map(vertex => vertex.position), blendRates),
      vlerp(vertices.map(vertex => vertex.normal), blendRates).normalize(),
      vlerp(vertices.map(vertex => vertex.uv), blendRates),
      _.zip(...vertices.map(vertex => vertex.extraUVs)).map(uvs => vlerp(uvs, blendRates)),
      newWeight,
      slerp(vertices.map(vertex => vertex.edgeSizeRate), blendRates)
    );
  }
}

const MeshInfo = (() => {
  const _model = Symbol("model");
  const _vertexUUIDToVertexKey = Symbol("vertexUUIDToVertexKey");
  const _vertexKeyToVertexUUIDs = Symbol("vertexKeyToVertexUUIDs");
  const _vertexUUIDToFaceUUIDs = Symbol("vertexUUIDToFaceUUIDs");
  const _vertexUUIDToEdgeUUIDs = Symbol("vertexUUIDToEdgeUUIDs");
  const _edgeJSONToFaceUUIDs = Symbol("edgeJSONToFaceUUIDs");
  const _targetFaceUUIDs = Symbol("targetFaceUUIDs");
  const _getVertexKeyFrom = Symbol("getVertexKeyFrom");
  return class MeshInfo {
    // targetsは現在materialsとfacesのみサポート
    constructor(model, targets) {
      const targetFaces = _(targets)
        .map(target => typeof(target) === "string" ? model.getNode(target) : target)
        .flatMap(target => target instanceof PMX.Material ? [...target.faces] : target)
        .value();
      const targetVertices = [...new Set(
        _(targetFaces)
          .flatMap(face => face.getVertexNodes())
          .value()
      )];

      this[_model] = model;
      this[_vertexUUIDToVertexKey] = new Map(targetVertices.map(vertex => [
        vertex.getUUID(),
        JSON.stringify(Array.from(vertex.position).concat(Array.from(vertex.normal)).map(Math.fround))
      ]));
      this[_vertexKeyToVertexUUIDs] = new Map();
      this[_vertexUUIDToFaceUUIDs] = new Map(targetVertices.map(vertex => [vertex.getUUID(), []]));
      this[_vertexUUIDToEdgeUUIDs] = new Map(targetVertices.map(vertex => [vertex.getUUID(), new Set()]));
      this[_edgeJSONToFaceUUIDs] = new Map();
      this[_targetFaceUUIDs] = targetFaces.map(face => face.getUUID());

      for (const vertex of targetVertices) {
        const vertexKey = this[_getVertexKeyFrom](vertex);
        if (!this[_vertexKeyToVertexUUIDs].has(vertexKey)) this[_vertexKeyToVertexUUIDs].set(vertexKey, []);
        this[_vertexKeyToVertexUUIDs].get(vertexKey).push(vertex.getUUID());
      }

      for (const face of targetFaces) {
        const vertices = face.getVertexNodes();
        for (const vertex of vertices) {
          this[_vertexUUIDToFaceUUIDs].get(vertex.getUUID()).push(face.getUUID());
        }
        for (const edge of _.zip(vertices, vertices.slice(1).concat(vertices.slice(0, 1))).map(pair => _.sortBy(pair, vertex => vertex.getUUID()))) {
          const edgeUUID = edge.map(vertex => vertex.getUUID());
          const edgeJSON = JSON.stringify(edgeUUID);
          for (const vertex of edge) {
            this[_vertexUUIDToEdgeUUIDs].get(vertex.getUUID()).add(edgeJSON);
          }
          if (!this[_edgeJSONToFaceUUIDs].has(edgeJSON)) this[_edgeJSONToFaceUUIDs].set(edgeJSON, []);
          this[_edgeJSONToFaceUUIDs].get(edgeJSON).push(face.getUUID());
        }
      }
      this[_vertexUUIDToEdgeUUIDs] = new Map([...this[_vertexUUIDToEdgeUUIDs]].map(([vertexUUID, edgeJSONSet]) => [vertexUUID, [...edgeJSONSet].map(JSON.parse)]));
    }
    getTargetVertexUUIDs() {
      return [...this[_vertexUUIDToEdgeUUIDs].keys()];
    }
    getTargetVertices() {
      return this.getTargetVertexUUIDs().map(vertexUUID => this[_model].getNode(vertexUUID));
    }
    getTargetEdgeUUIDs() {
      return [...this[_edgeJSONToFaceUUIDs].keys()].map(edgeJSON => JSON.parse(edgeJSON));
    }
    getTargetEdges() {
      return this.getTargetEdgeUUIDs().map(edgeUUID => edgeUUID.map(vertexUUID => this[_model].getNode(vertexUUID)));
    }
    getTargetFaceUUIDs() {
      return this[_targetFaceUUIDs];
    }
    getTargetFaces() {
      return this.getTargetFaceUUIDs().map(faceUUID => this[_model].getNode(faceUUID));
    }
    [_getVertexKeyFrom](arg) {
      if (typeof(arg) === "object") arg = arg.getUUID();
      return this[_vertexUUIDToVertexKey].get(arg);
    }
    getVertexUUIDsFrom(arg, sharesVertexKey) {
      if (sharesVertexKey) {
        return this[_vertexKeyToVertexUUIDs].get(this[_getVertexKeyFrom](arg));
      } else {
        throw new Error("Unknown context");
      }
    }
    getVerticesFrom(arg, sharesVertexKey) {
      return this.getVertexUUIDsFrom(arg, sharesVertexKey).map(vertexUUID => this[_model].getNode(vertexUUID));
    }
    getEdgeUUIDsFrom(arg, sharesVertexKey) {
      if (Array.isArray(arg)) {
        const originalEdgeUUID = arg.map(uuidOrNode => typeof(uuidOrNode) === "string" ? uuidOrNode : uuidOrNode.getUUID());
        if (sharesVertexKey) {
          return _(this.getVertexUUIDsFrom(originalEdgeUUID[0], true))
            .flatMap(vertexUUID => this.getEdgeUUIDsFrom(vertexUUID, false))
            .filter(edgeUUID =>
              (
                this[_getVertexKeyFrom](edgeUUID[0]) === this[_getVertexKeyFrom](originalEdgeUUID[0]) &&
                this[_getVertexKeyFrom](edgeUUID[1]) === this[_getVertexKeyFrom](originalEdgeUUID[1])
              ) || (
                this[_getVertexKeyFrom](edgeUUID[1]) === this[_getVertexKeyFrom](originalEdgeUUID[0]) &&
                this[_getVertexKeyFrom](edgeUUID[0]) === this[_getVertexKeyFrom](originalEdgeUUID[1])
              )
            )
            .value();
        } else {
          throw new Error("Unknown context");
        }
      } else { // vertex
        if (typeof(arg) === "object") arg = arg.getUUID();
        if (sharesVertexKey) {
          return _(this.getVertexUUIDsFrom(arg, true))
            .flatMap(vertexUUID => this.getEdgeUUIDsFrom(vertexUUID, false))
            .value();
        } else {
          return this[_vertexUUIDToEdgeUUIDs].get(arg);
        }
      }
    }
    getEdgesFrom(arg, sharesVertexKey) {
      return this.getEdgeUUIDsFrom(arg, sharesVertexKey).map(edgeUUID => edgeUUID.map(vertexUUID => this[_model].getNode(vertexUUID)));
    }
    getFaceUUIDsFrom(arg, sharesVertexKey) {
      if (Array.isArray(arg)) {
        if (sharesVertexKey) {
          return _(this.getEdgeUUIDsFrom(arg, true))
            .flatMap(edgeUUID => this.getFaceUUIDsFrom(edgeUUID, false))
            .value();
        } else {
          const edgeUUID = arg.map(uuidOrNode => typeof(uuidOrNode) === "string" ? uuidOrNode : uuidOrNode.getUUID()).sort();
          return this[_edgeJSONToFaceUUIDs].get(JSON.stringify(edgeUUID));
        }
      } else { // vertex
        if (typeof(arg) === "object") arg = arg.getUUID();
        if (sharesVertexKey) {
          return _(this.getVertexUUIDsFrom(arg, true))
            .flatMap(vertexUUID => this.getFaceUUIDsFrom(vertexUUID, false))
            .value();
        } else {
          return this[_vertexUUIDToFaceUUIDs].get(arg);
        }
      }
    }
    getFacesFrom(arg, sharesVertexKey) {
      return this.getFaceUUIDsFrom(arg, sharesVertexKey).map(faceUUID => this[_model].getNode(faceUUID));
    }
  };
})();

export default class ExtendedPMX extends PMX {
  changeScale(scale) {
    for (const vertex of this.vertices) {
      vertex.position = vertex.position.multiply(scale);
    }
    for (const bone of this.bones) {
      bone.position = bone.position.multiply(scale);
      if (bone.connectionType === "position") bone.connection = bone.connection.multiply(scale);
    }
    for (const morph of this.morphs) {
      switch (morph.type) {
      case "vertex":
      case "bone":
        for (const offset of morph.offsets) {
          offset.displacement = offset.displacement.multiply(scale);
        }
        break;
      }
    }
    for (const rigidBody of this.rigidBodies) {
      rigidBody.size = rigidBody.size.multiply(scale);
      rigidBody.position = rigidBody.position.multiply(scale);
      rigidBody.mass = rigidBody.mass * scale ** 3;
    }
    for (const joint of this.joints) {
      if (joint.concreteJoint instanceof PMX.Joint.ConcreteJoint.Spring6DOF) {
        joint.concreteJoint.position = joint.concreteJoint.position.multiply(scale);
        joint.concreteJoint.lowerLimitInMoving = joint.concreteJoint.lowerLimitInMoving.multiply(scale);
        joint.concreteJoint.upperLimitInMoving = joint.concreteJoint.upperLimitInMoving.multiply(scale);
        joint.concreteJoint.springConstantInMoving = joint.concreteJoint.springConstantInMoving.multiply(scale ** 3);
      }
    }
  }
  createVirtualVertex(pairs) {
    return new VirtualVertex(pairs);
  }
  materializeVirtualVertex(virtualVertex) {
    if (Array.isArray(virtualVertex)) {
      virtualVertex = this.createVirtualVertex(virtualVertex);
    }
    const newVertex = virtualVertex.toVertex();
    this.vertices.push(newVertex);

    const vertexToBlendRate = new Map(virtualVertex.pairs);
    const morphToNewDisplacement = new Map();
    for (const vertex of virtualVertex.pairs.map(([vertex,]) => vertex)) {
      for (const {node, propertyNames} of vertex.getReferringNodes()) {
        if ((node instanceof PMX.Morph.Offset.Vertex && propertyNames[0] === "vertexUUID") ||
          (node instanceof PMX.Morph.Offset.UV && propertyNames[0] === "vertexUUID")) {
          const offset = node;
          const morph = offset.getParentNode();
          if (!morphToNewDisplacement.has(morph)) morphToNewDisplacement.set(morph, morph.type === "vertex" ? Vector3.zero : Vector4.zero);
          morphToNewDisplacement.set(morph, morphToNewDisplacement.get(morph).add(offset.displacement.multiply(vertexToBlendRate.get(offset.getVertexNode()))));
        }
      }
    }

    for (const [morph, newDisplacement] of morphToNewDisplacement) {
      morph.offsets.push(this.createNode(morph.type === "vertex" ? this.constructor.Morph.Offset.Vertex : this.constructor.Morph.Offset.UV).init(
        newVertex.getUUID(),
        newDisplacement,
      ));
    }

    return newVertex;
  }
  mergeVertices(vertices) {
    const newVertex = this.materializeVirtualVertex(vertices.map(vertex => [vertex, 1 / vertices.length]));
    for (const vertex of vertices) {
      for (const {node, propertyNames} of vertex.getReferringNodes()) {
        if (node instanceof PMX.Material.Face && propertyNames[0] === "vertexUUIDs") {
          node.vertexUUIDs[propertyNames[1]] = newVertex.getUUID();
        } else if (node instanceof PMX.Morph.Offset.Vertex && propertyNames[0] === "vertexUUID") {
          node.getParentNode().offsets.delete(node);
        } else if (node instanceof PMX.Morph.Offset.UV && propertyNames[0] === "vertexUUID") {
          node.getParentNode().offsets.delete(node);
        }
      }
      this.vertices.delete(vertex);
    }
    return newVertex;
  }
  createMeshInfo(targets = [...this.materials]) {
    return new MeshInfo(this, targets);
  }
  // this.modelは3つ以上の面が共有する辺を持たない
  // loopCount > 0
  // 法線未考慮
  async subdivideSurfaceAsync(loopCount, targets = [...this.materials], logger = new TextAreaWrapper()) {
    const core = async () => {
      await logger.appendAsync("メッシュ情報計算中...");
      const meshInfo = this.createMeshInfo(targets);
      const targetVertices = meshInfo.getTargetVertices();
      const targetEdges = meshInfo.getTargetEdges();
      const targetFaces = meshInfo.getTargetFaces();
      function toEdgeJSON(edge) {
        return JSON.stringify(edge.map(vertex => vertex.getUUID()).sort());
      }

      await logger.progressAsync("face point作成中...", targetFaces.length);
      const facePointMap = new Map();
      for (const face of targetFaces) {
        const facePoint = this.materializeVirtualVertex(face.getVertexNodes().map(vertex => [vertex, 1 / face.vertexUUIDs.length]));
        facePointMap.set(face, facePoint);
        await logger.progressAsync();
      }

      await logger.progressAsync("edge point作成中...", targetEdges.length);
      const edgePointMap = new Map();
      for (const edge of targetEdges) {
        const faces = meshInfo.getFacesFrom(edge, true);
        let edgePoint;
        switch (faces.length) {
        case 1:
          edgePoint = this.materializeVirtualVertex(edge.map(vertex => [vertex, 1 / 2]));
          break;
        case 2:
          edgePoint = this.materializeVirtualVertex(
            faces.map(face => facePointMap.get(face)).concat(edge).map(vertex => [vertex, 1 / 4])
          );
          const facesIgnoringVertexKey = meshInfo.getFacesFrom(edge, false);
          if (facesIgnoringVertexKey.length === 1) {
            edgePoint.uv = edge[0].uv.add(edge[1].uv).divide(2);
          }
          break;
        default:
          const errorEdgeJSON = JSON.stringify(_.sortBy(edge.map(errorVertex => this.vertices.findIndex(vertex => vertex === errorVertex)), _.identity));
          throw new Error(`An edge shared by more than two faces has been found: ${errorEdgeJSON} is shared by ${faces.length} faces`);
        }
        edgePointMap.set(toEdgeJSON(edge), edgePoint);
        await logger.progressAsync();
      }

      await logger.progressAsync("新規面作成中...", targetFaces.length);
      for (const face of targetFaces) {
        const vertices = face.getVertexNodes();
        const facePoint = facePointMap.get(face);
        const edgePoints = _.zip(vertices, vertices.slice(1).concat(vertices.slice(0, 1))).map(edge => edgePointMap.get(toEdgeJSON(edge)));
        for (let i = 0; i < vertices.length; i++) {
          face.getParentNode().faces.push(this.createNode(this.constructor.Material.Face).init([
            vertices[i].getUUID(),
            edgePoints[i].getUUID(),
            facePoint.getUUID(),
            edgePoints[(i - 1 + edgePoints.length) % edgePoints.length].getUUID(),
          ]));
        }
        await logger.progressAsync();
      }

      await logger.progressAsync("original point移動中...", targetVertices.length);
      const positionMap = new Map(targetVertices.map(vertex => [vertex, vertex.position]));
      function avg(vectors) {
        return vectors.reduce((sum, v) => sum.add(v), Vector3.zero).divide(vectors.length);
      }
      for (const originalVertex of targetVertices) {
        const pairs = meshInfo.getEdgesFrom(originalVertex, true).map(edge => ({edge, faces: meshInfo.getFacesFrom(edge, true)}));
        if (pairs.some(({faces}) => faces.length === 1)) {
          originalVertex.position = avg(
            _(pairs)
              .filter(({faces}) => faces.length === 1)
              .flatMap(({edge}) => edge.map(vertex => positionMap.get(vertex)))
              .concat(new Array(2).fill(positionMap.get(originalVertex)))
              .value()
          );
        } else {
          const F = avg(meshInfo.getFacesFrom(originalVertex, true).map(face => facePointMap.get(face).position));
          const R = avg(
            _(pairs)
              .groupBy(({edge}) => toEdgeJSON(edge))
              .flatMap(([{edge}]) => edge)
              .map(vertex => positionMap.get(vertex))
              .value()
          );
          const P = positionMap.get(originalVertex);
          const n = meshInfo.getFacesFrom(originalVertex, true).length;
          originalVertex.position = F.add(R.multiply(2)).add(P.multiply(n - 3)).divide(n);
        }
        await logger.progressAsync();
      }

      await logger.progressAsync("古い面の削除中...", targetFaces.length);
      for (const face of targetFaces) {
        face.getParentNode().faces.delete(face);
        await logger.progressAsync();
      }
    };

    for (let i = 0; i < loopCount; i++) {
      await logger.appendAsync(`${i + 1}/${loopCount}ループ目:`);
      await core();
    }

    await logger.progressAsync("面分割中...", targets.map(material => [...material.faces].filter(face => face.vertexUUIDs.length === 4).length).reduce(_.add, 0));
    for (const material of targets) {
      for (const face of [...material.faces].filter(face => face.vertexUUIDs.length === 4)) {
        const [a, b, c, d] = face.vertexUUIDs;
        material.faces.delete(face);
        material.faces.push(this.createNode(this.constructor.Material.Face).init([a, b, d]));
        material.faces.push(this.createNode(this.constructor.Material.Face).init([b, c, d]));
        logger.progressAsync();
      }
    }
    await logger.appendAsync("Catmull-Clark subdivision完了");
  }
  // material…毛の材質
  // positionOrigin…毛根の中心点
  // normalOrigin…毛根から毛の末端方向へ伸びるベクトル
  // localQuaternions…毛の節に付ける回転（毛根の1つ上から末端まで定義する）
  // r0…毛根における毛断面の半径
  // l…毛の長さ
  // n…毛断面を正何角形にするか
  // weight…毛を構成する頂点のウェイト
  // isSharp…毛の末端1/3を徐々に細らせるか
  // morphInfo…モーフごとの、移動後の原点と法線
  addHair(material, positionOrigin, normalOrigin, localQuaternions, r0, l, n, weight, isSharp, morphInfo) {
    // 毛を何分割するか
    const m = localQuaternions.length;
    function init(currentPositionOrigin, currentNormalOrigin) {
      const quaternions = localQuaternions.reduce((arr, q) => {
        arr.push(arr[arr.length - 1].multiply(q));
        return arr;
      }, [Quaternion.fromToRotation(new Vector3(0, 1, 0), currentNormalOrigin)]);
      const centers = new Array(m).fill().reduce((arr, v, i) => {
        arr.push(arr[arr.length - 1].add(quaternions[i + 1].rotate(new Vector3(0, l / m, 0))));
        return arr;
      }, [currentPositionOrigin]);
      const positions = new Array(n * (m + 1)).fill().map((_, i) => {
        const i1 = Math.floor(i / n);
        const i2 = i % n;
        const y = i1 * (l / m);
        const r = !isSharp || y <= l * 2 / 3 ? r0 : MyMath.lerp(r0, 0, (y / l - 2 / 3) * 3);
        const theta = 2 * Math.PI / n * (i2 + 0.5 * (i1 % 2));
        return centers[i1].add(quaternions[i1].rotate(new Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r)));
      });
      return {quaternions, centers, positions};
    }
    const {quaternions, centers, positions} = init(positionOrigin, normalOrigin);
    const morphToOffsets = new Map([...morphInfo].map(([morph, {positionOrigin: newPositionOrigin, normalOrigin: newNormalOrigin}]) => {
      const {positions: newPositions} = init(newPositionOrigin, newNormalOrigin);
      return [morph, _.zip(positions, newPositions).map(([oldPosition, newPosition]) => newPosition.subtract(oldPosition))];
    }));
    const uvs = new Array((n + 1) * (m + 1)).fill().map((_, i) => {
      const i1 = Math.floor(i / (n + 1));
      const i2 = i % (n + 1);
      const y = i1 * (l / m);
      const r = !isSharp || y <= l * 2 / 3 ? r0 : MyMath.lerp(r0, 0, (y / l - 2 / 3) * 3);
      const theta = 2 * Math.PI / n * (i2 + 0.5 * (i1 % 2));
      const u = theta / (2 * Math.PI);
      const v = (l - y) / (2 * Math.PI * r0);
      return new Vector2(u, v);
    });
    const normals = new Array(n * (m + 1)).fill().map((_, i) => {
      const i1 = Math.floor(i / n);
      const i2 = i % n;
      const iA = (i1 - 1) * n + [(i2 + n - 1) % n, i2][i1 % 2];
      const iB = (i1 - 1) * n + [i2, (i2 + 1) % n][i1 % 2];
      const iC = i1 * n + (i2 + n - 1) % n;
      const iD = i1 * n + (i2 + 1) % n;
      const iE = (i1 + 1) * n + [(i2 + n - 1) % n, i2][i1 % 2];
      const iF = (i1 + 1) * n + [i2, (i2 + 1) % n][i1 % 2];
      if (i1 === 0) {
        return Plane.through(positions[i], positions[iC], positions[iE]).normal()
          .add(Plane.through(positions[i], positions[iE], positions[iF]).normal())
          .add(Plane.through(positions[iD], positions[i], positions[iF]).normal())
          .normalize();
      } else if (i1 === m - 1) {
        return Plane.through(positions[iA], positions[iC], positions[i]).normal()
          .add(Plane.through(positions[iB], positions[iA], positions[i]).normal())
          .add(Plane.through(positions[iB], positions[i], positions[iD]).normal())
          .add(Plane.through(positions[i], positions[iC], positions[iE]).normal())
          .add(Plane.through(positions[iD], positions[i], positions[iF]).normal())
          .normalize();
      } else if (i1 === m) {
        if (isSharp) {
          return Plane.through(positions[iB], positions[iA], positions[i]).normal();
        } else {
          return Plane.through(positions[iA], positions[iC], positions[i]).normal()
            .add(Plane.through(positions[iB], positions[iA], positions[i]).normal())
            .add(Plane.through(positions[iB], positions[i], positions[iD]).normal())
            .normalize();
        }
      } else {
        return Plane.through(positions[iA], positions[iC], positions[i]).normal()
          .add(Plane.through(positions[iB], positions[iA], positions[i]).normal())
          .add(Plane.through(positions[iB], positions[i], positions[iD]).normal())
          .add(Plane.through(positions[i], positions[iC], positions[iE]).normal())
          .add(Plane.through(positions[i], positions[iE], positions[iF]).normal())
          .add(Plane.through(positions[iD], positions[i], positions[iF]).normal())
          .normalize();
      }
    });
    const vertices = new Array((n + 1) * (m + 1)).fill().map((_, i) => {
      const i1 = Math.floor(i / (n + 1));
      const i2 = i % (n + 1);
      return this.createNode(this.constructor.Vertex).init(
        positions[i1 * n + i2 % n],
        normals[i1 * n + i2 % n],
        uvs[i1 * (n + 1) + i2],
        [],
        weight.clone(),
        0,
      );
    });
    this.vertices.push(...vertices);
    material.faces.push(...new Array(isSharp ? 2 * n * (m - 1) + n : 2 * n * m).fill().map((_, i) => {
      const i1 = Math.floor(i / (2 * n));
      const i2 = Math.floor(i % (2 * n) / n);
      const i3 = i % n;
      if (isSharp ? (i1 < m && i2 === 0) || i1 === m : i2 === 0) {
        return this.createNode(this.constructor.Material.Face).init([
          i1 * (n + 1) + i3 + 1,
          i1 * (n + 1) + i3,
          (i1 + 1) * (n + 1) + [i3, i3 + 1][i1 % 2]
        ].map(j => vertices[j].getUUID()));
      } else {
        return this.createNode(this.constructor.Material.Face).init([
          i1 * (n + 1) + [i3 + 1, i3][i1 % 2],
          (i1 + 1) * (n + 1) + i3,
          (i1 + 1) * (n + 1) + i3 + 1
        ].map(j => vertices[j].getUUID()));
      }
    }));
    for (const [morph, offsets] of morphToOffsets) {
      for (const [vertex, i] of vertices.map((vertex, i) => [vertex, i])) {
        const i1 = Math.floor(i / (n + 1));
        const i2 = i % (n + 1);
        morph.offsets.push(this.createNode(this.constructor.Morph.Offset.Vertex).init(vertex.getUUID(), offsets[i1 * n + i2 % n]));
      }
    }
  }
  removeOrphanVertices() {
    outer:
    for (const vertex of [...this.vertices]) {
      for (const {node, propertyNames} of vertex.getReferringNodes()) {
        if (node instanceof PMX.Material.Face && propertyNames[0] === "vertexUUIDs") {
          continue outer;
        }
      }
      this.vertices.delete(vertex);
    }
  }
  removeOrphanTextures() {
    outer:
    for (const texture of [...this.textures]) {
      for (const {node, propertyNames} of texture.getReferringNodes()) {
        continue outer;
      }
      this.textures.delete(texture);
    }
  }
  addMasterBone() {
    if (this.bones.length > 0) {
      const centerBone = this.bones.head();
      const masterBone = centerBone.clone();
      const leftIKBone = this.bones.find(bone => bone.japaneseName === "左足ＩＫ");
      const rightIKBone = this.bones.find(bone => bone.japaneseName === "右足ＩＫ");
      masterBone.japaneseName = "全ての親";
      masterBone.englishName = "master";
      masterBone.position = Vector3.zero;
      masterBone.parentBoneUUID = null;
      masterBone.connectionType = "bone";
      masterBone.connectionUUID = centerBone.getUUID();
      this.bones.unshift(masterBone);
      centerBone.parentBoneUUID = masterBone.getUUID();
      leftIKBone.parentBoneUUID = masterBone.getUUID();
      rightIKBone.parentBoneUUID = masterBone.getUUID();
      this.displayElementGroups.head().elements.clear();
      this.displayElementGroups.head().elements.push(
        this.createNode(this.constructor.DisplayElementGroup.DisplayElement).init("bone", masterBone.getUUID()),
      );
      this.displayElementGroups.splice(
        this.displayElementGroups.find(displayElementGroup => displayElementGroup.japaneseName === "表情"),
        +0,
        this.createNode(this.constructor.DisplayElementGroup).init("センター", "center", false, [
          this.createNode(this.constructor.DisplayElementGroup.DisplayElement).init("bone", centerBone.getUUID()),
        ]),
      );
    } else {
      const masterBone = this.createNode(this.constructor.Bone).init(
        "全ての親",
        "master",
        Vector3.zero,
        null,
        0,
        Vector3.zero,
        true,
        true,
        true,
        true,
        null,
        0,
        false,
        false,
        null,
        null,
        null,
        false,
        null
      );
      this.bones.push(masterBone);
      this.displayElementGroups.push(
        this.createNode(this.constructor.DisplayElementGroup).init("Root", "Root", true, [
          this.createNode(this.constructor.DisplayElementGroup.DisplayElement).init("bone", masterBone.getUUID()),
        ]),
        this.createNode(this.constructor.DisplayElementGroup).init("表情", "Exp", true, []),
      );
    }
  }
  createVertexMorphDictionary(targetVertices) {
    const map = new Map(targetVertices.map(targetVertex => [targetVertex, new Map()]));
    for (const targetVertex of targetVertices) {
      for (const {node, propertyNames} of targetVertex.getReferringNodes()) {
        if (node instanceof PMX.Morph.Offset.Vertex && propertyNames[0] === "vertexUUID") {
          map.get(targetVertex).set(node.getParentNode(), targetVertex.position.add(node.displacement));
        }
      }
    }
    return function result(vertex, morph) {
      if (morph === undefined) {
        if (!map.has(vertex)) throw new Error("Out of scope");
        return map.get(vertex);
      } else {
        const innerMap = result(vertex);
        if (innerMap.has(morph)) return innerMap.get(morph);
        else return vertex.position;
      }
    };
  }
  static createEmptyModel() {
    return this.read(new Uint8Array([
      0x50, 0x4D, 0x58, 0x20, 0x00, 0x00, 0x00, 0x40, 0x08, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01,
      0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0xBB, 0x30, 0xF3, 0x30, 0xBF, 0x30, 0xFC,
      0x30, 0x0C, 0x00, 0x00, 0x00, 0x63, 0x00, 0x65, 0x00, 0x6E, 0x00, 0x74, 0x00, 0x65, 0x00, 0x72,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0x00, 0x00,
      0x00, 0x00, 0x1E, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x02, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x52, 0x00, 0x6F, 0x00,
      0x6F, 0x00, 0x74, 0x00, 0x08, 0x00, 0x00, 0x00, 0x52, 0x00, 0x6F, 0x00, 0x6F, 0x00, 0x74, 0x00,
      0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x68, 0x88, 0xC5, 0x60, 0x06,
      0x00, 0x00, 0x00, 0x45, 0x00, 0x78, 0x00, 0x70, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]));
  }
  static async importAsync(arg) {
    const binary = await BinaryUtils.readBinaryAsync(arg);
    return this.read(binary);
  }
}
ExtendedPMX.Header = class Header extends PMX.Header {};
ExtendedPMX.Info = class Info extends PMX.Info {};
ExtendedPMX.Vertex = class Vertex extends PMX.Vertex {};
ExtendedPMX.Vertex.Weight = {
  BDEF1: class BDEF1 extends PMX.Vertex.Weight.BDEF1 {},
  BDEF2: class BDEF2 extends PMX.Vertex.Weight.BDEF2 {},
  BDEF4: class BDEF4 extends PMX.Vertex.Weight.BDEF4 {},
  SDEF: class SDEF extends PMX.Vertex.Weight.SDEF {},
  Bone: class Bone extends PMX.Vertex.Weight.Bone {},
};
ExtendedPMX.Vertex.Weight.BDEF1.Bone = ExtendedPMX.Vertex.Weight.Bone;
ExtendedPMX.Vertex.Weight.BDEF2.Bone = ExtendedPMX.Vertex.Weight.Bone;
ExtendedPMX.Vertex.Weight.BDEF4.Bone = ExtendedPMX.Vertex.Weight.Bone;
ExtendedPMX.Vertex.Weight.SDEF.Bone = ExtendedPMX.Vertex.Weight.Bone;
ExtendedPMX.Texture = class Texture extends PMX.Texture {};
ExtendedPMX.Material = class Material extends PMX.Material {};
ExtendedPMX.Material.SphereTexture = class SphereTexture extends PMX.Material.SphereTexture {};
ExtendedPMX.Material.ToonTexture = class ToonTexture extends PMX.Material.ToonTexture {};
ExtendedPMX.Material.Face = class Face extends PMX.Material.Face {
  getEdgeUUIDs() {
    const edgeUUIDs = [];
    for (let i = 0; i < this.vertexUUIDs.length; i++) {
      edgeUUIDs.push([this.vertexUUIDs[i], this.vertexUUIDs[(i + 1) % this.vertexUUIDs.length]]);
    }
    return edgeUUIDs;
  }
  getEdgeNodes() {
    return this.getEdgeUUIDs().map(edgeUUID => edgeUUID.map(vertexUUID => this.getRootNode().getNode(vertexUUID)));
  }
};
ExtendedPMX.Bone = class Bone extends PMX.Bone {
  getChildBoneNodes() {
    const result = [];
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Bone && propertyNames[0] === "parentBoneUUID") {
        result.push(node);
      }
    }
    return result;
  }
};
ExtendedPMX.Bone.IKInfo = class IKInfo extends PMX.Bone.IKInfo {};
ExtendedPMX.Bone.IKInfo.Link = class Link extends PMX.Bone.IKInfo.Link {};
ExtendedPMX.Bone.Addition = class Addition extends PMX.Bone.Addition {};
ExtendedPMX.Morph = class Morph extends PMX.Morph {};
ExtendedPMX.Morph.Offset = {
  Group: class Group extends PMX.Morph.Offset.Group {},
  Vertex: class Vertex extends PMX.Morph.Offset.Vertex {},
  Bone: class Bone extends PMX.Morph.Offset.Bone {},
  UV: class UV extends PMX.Morph.Offset.UV {},
  Material: class Material extends PMX.Morph.Offset.Material {},
};
ExtendedPMX.DisplayElementGroup = class DisplayElementGroup extends PMX.DisplayElementGroup {};
ExtendedPMX.DisplayElementGroup.DisplayElement = class DisplayElement extends PMX.DisplayElementGroup.DisplayElement {};
ExtendedPMX.RigidBody = class RigidBody extends PMX.RigidBody {};
ExtendedPMX.Joint = class Joint extends PMX.Joint {};
ExtendedPMX.Joint.ConcreteJoint = {
  Spring6DOF: class Spring6DOF extends PMX.Joint.ConcreteJoint.Spring6DOF {},
};
