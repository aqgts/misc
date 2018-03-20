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
  createVirtualVertex(pairs) {
    return new VirtualVertex(pairs);
  }
  materializeVirtualVertex(virtualVertex) {
    if (Array.isArray(virtualVertex)) {
      virtualVertex = this.createVirtualVertex(virtualVertex);
    }
    const newVertex = virtualVertex.toVertex();
    this.vertices.push(newVertex);

    const vertexUUIDToBlendRate = new Map(virtualVertex.pairs);
    const morphToNewDisplacement = new Map();
    for (const vertex of virtualVertex.pairs.map(([vertex,]) => vertex)) {
      for (const {node, propertyNames} of vertex.getReferringNodes()) {
        if ((node instanceof PMX.Morph.Offset.Vertex && propertyNames[0] === "vertexUUID") ||
          (node instanceof PMX.Morph.Offset.UV && propertyNames[0] === "vertexUUID")) {
          const offset = node;
          const morph = offset.getParentNode();
          if (!morphToNewDisplacement.has(morph)) morphToNewDisplacement.set(morph, morph.type === "vertex" ? Vector3.zero : Vector4.zero);
          morphToNewDisplacement.set(morph, morphToNewDisplacement.get(morph).add(offset.displacement.multiply(vertexUUIDToBlendRate.get(offset.vertexUUID))));
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

    for (const material of this.materials) {
      for (const face of [...material.faces].filter(face => face.vertexUUIDs.length === 4)) {
        const [a, b, c, d] = face.vertexUUIDs;
        material.faces.delete(face);
        material.faces.push(this.createNode(this.constructor.Material.Face).init([a, b, d]));
        material.faces.push(this.createNode(this.constructor.Material.Face).init([b, c, d]));
      }
    }
    await logger.appendAsync("Catmull-Clark subdivision完了");
  }
  addHairMaterial(...args) {
    if (args.length === 1) {
      const [filePath] = args;
      let texture = this.textures.find(t => t.filePath === filePath);
      if (texture === undefined) {
        texture = this.createNode(this.constructor.Texture).init(filePath);
        this.textures.push(texture);
      }
      const material = this.createNode(this.constructor.Material).init(
        "毛", "hair",
        {red: 1, green: 1, blue: 1, alpha: 1},
        {red: 1, green: 1, blue: 1, coefficient: 5},
        {red: 0.8, green: 0.8, blue: 0.8},
        false, true, true, true, false,
        {red: 0, green: 0, blue: 0, alpha: 1, size: 0},
        texture.getUUID(),
        this.createNode(this.constructor.Material.SphereTexture).init(null, "disabled"),
        this.createNode(this.constructor.Material.ToonTexture).init(false, null),
        "", []
      );
      this.materials.push(material);
      return material;
    } else if (args.length === 3) {
      const [red, green, blue] = args;
      const material = this.createNode(this.constructor.Material).init(
        "毛", "hair",
        {red: red * 0.6, green: green * 0.6, blue: blue * 0.6, alpha: 1},
        {red: 1, green: 1, blue: 1, coefficient: 5},
        {red: red * 0.4, green: green * 0.4, blue: blue * 0.4},
        false, true, true, true, false,
        {red: 0, green: 0, blue: 0, alpha: 1, size: 0}, null,
        this.createNode(this.constructor.Material.SphereTexture).init(null, "disabled"),
        this.createNode(this.constructor.Material.ToonTexture).init(false, null),
        "", []
      );
      this.materials.push(material);
      return material;
    } else {
      throw new Error("Invalid arguments length");
    }
  }
  // material…毛の材質
  // positionOrigin…毛根の中心点
  // normalOrigin…毛根から毛の末端方向へ伸びるベクトル
  // localQuaternions…毛の節に付ける回転（毛根の1つ上の節から末端まで定義する）
  // r0…毛根における毛断面の半径
  // l…毛の長さ
  // n…毛断面を正何角形にするか
  // weight…毛を構成する頂点のウェイト
  // isSharp…毛の末端1/3を徐々に細らせるか
  addHair(material, positionOrigin, normalOrigin, localQuaternions, r0, l, n, weight, isSharp) {
    const quaternions = localQuaternions.reduce((arr, q) => {
      arr.push(arr[arr.length - 1].multiply(q));
      return arr;
    }, [Quaternion.fromToRotation(new Vector3(0, 1, 0), normalOrigin)]);
    const m = localQuaternions.length;
    const centers = new Array(m).fill().reduce((arr, v, i) => {
      arr.push(arr[arr.length - 1].add(quaternions[i + 1].rotate(new Vector3(0, l / m, 0))));
      return arr;
    }, [positionOrigin]);
    const positions = new Array(n * (m + 1)).fill().map((_, i) => {
      const i1 = Math.floor(i / n);
      const i2 = i % n;
      const y = i1 * (l / m);
      const r = !isSharp || y <= l * 2 / 3 ? r0 : MyMath.lerp(r0, 0, (y / l - 2 / 3) * 3);
      const theta = 2 * Math.PI / n * (i2 + 0.5 * (i1 % 2));
      return centers[i1].add(quaternions[i1].rotate(new Vector3(Math.cos(theta) * r, 0, Math.sin(theta) * r)));
    });
    const uvs = new Array(n * (m + 1)).fill().map((_, i) => {
      const i1 = Math.floor(i / n);
      const i2 = i % n;
      const y = i1 * (l / m);
      const r = !isSharp || y <= l * 2 / 3 ? r0 : MyMath.lerp(r0, 0, (y / l - 2 / 3) * 3);
      const theta = 2 * Math.PI / n * (i2 + 0.5 * (i1 % 2));
      const u = (r * theta) / (2 * Math.PI * r);
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
    const vertices = new Array(n * (m + 1)).fill().map((_, i) => {
      return this.createNode(this.constructor.Vertex).init(
        positions[i],
        normals[i],
        uvs[i],
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
          i1 * n + (i3 + 1) % n,
          i1 * n + i3,
          (i1 + 1) * n + [i3, (i3 + 1) % n][i1 % 2]
        ].map(j => vertices[j].getUUID()));
      } else {
        return this.createNode(this.constructor.Material.Face).init([
          i1 * n + i3,
          (i1 + 1) * n + [(i3 + n - 1) % n, i3][i1 % 2],
          (i1 + 1) * n + [i3, (i3 + 1) % n][i1 % 2]
        ].map(j => vertices[j].getUUID()));
      }
    }));
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
ExtendedPMX.Material.Face = class Face extends PMX.Material.Face {};
ExtendedPMX.Bone = class Bone extends PMX.Bone {};
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
