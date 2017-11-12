import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Vector4 from "./vector4";
import DirectedLineSegment2D from "./directed-line-segment-2d";
import Line3D from "./line-3d";
import Polygon from "./polygon";
import Plane from "./plane";
import MyMath from "./my-math";
import PMX from "./pmx";
import TextAreaWrapper from "./text-area-wrapper";

const PMXUtils = {
  createEmptyModel() {
    return PMX.read(new Uint8Array([
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
  },
  // Y=thresholdYをrotationA回転してdisplacementA移動した平面と、modelをrotationB回転してdisplacementB移動した多面体が作る断面
  crossSection(thresholdY, rotationA, displacementA, model, rotationB, displacementB) {
    const protoCurvePartMap = _.flatMap(model.faces, face => {
      const points = face.vertexIndices.map(
        i => rotationA.inverse().rotate(rotationB.rotate(model.vertices[i].position).add(displacementB).subtract(displacementA))
      );
      const overPoints = points.filter(point => point.y >= thresholdY);
      const underPoints = points.filter(point => point.y < thresholdY);
      if (overPoints.length === 3 || underPoints.length === 3) return [];
      const centerPoint = overPoints.length === 1 ? overPoints[0] : underPoints[0];
      while (points[0] !== centerPoint) {
        points.unshift(points.pop());
      }
      const newPoints = [points[1], points[2]].map(point => {
        const t = (thresholdY - centerPoint.y) / (point.y - centerPoint.y);
        return Vector3.lerp(centerPoint, point, t);
      });
      if (newPoints[0].equals(newPoints[1])) return [];
      return [overPoints.length === 1
        ? new DirectedLineSegment2D(new Vector2(newPoints[1].x, newPoints[1].z), new Vector2(newPoints[0].x, newPoints[0].z))
        : new DirectedLineSegment2D(new Vector2(newPoints[0].x, newPoints[0].z), new Vector2(newPoints[1].x, newPoints[1].z))];
    }).map(lineSegment => [Array.from(lineSegment.p1).map(v => Math.fround(v)).toString(), [lineSegment]]);
    const curvePartMap = new Map(protoCurvePartMap);
    if (curvePartMap.size < protoCurvePartMap.length) throw new Error("Duplicate vertices were found.");

    const polygons = [];
    const curves = [];
    Array.from(curvePartMap.keys()).forEach(startKey => {
      if (!curvePartMap.has(startKey)) return;
      let nextKey;
      while (curvePartMap.has(nextKey = Array.from(_(curvePartMap.get(startKey)).last().p2).map(v => Math.fround(v)).toString()) && nextKey !== startKey) {
        curvePartMap.set(startKey, curvePartMap.get(startKey).concat(curvePartMap.get(nextKey)));
        curvePartMap.delete(nextKey);
      }
      if (nextKey === startKey && curvePartMap.get(startKey).length >= 3) {
        polygons.push(new Polygon(...curvePartMap.get(startKey).map(lineSegment => lineSegment.p1)));
      } else {
        curves.push(curvePartMap.get(startKey));
      }
      curvePartMap.delete(startKey);
    });

    return {polygons: polygons, curves: curves};
  },
  subtract(model, face, subtrahendPolygon) {
    function makeVertexObject(toStringArray, toVertexArray) {
      switch (toVertexArray.length) {
        case 1: {
          const [i] = toVertexArray;
          const vertex = model.vertices[i];
          return {
            vertexIndices: [i],
            toString() { return toStringArray.join(","); },
            toVertex() { return vertex; }
          };
        }
        case 3: {
          const [i1, i2, t] = toVertexArray;
          const vertices = [model.vertices[i1], model.vertices[i2]];
          return {
            vertexIndices: [i1, i2],
            t: t,
            toString() { return toStringArray.join(","); },
            toVertex() {
              if (vertices.some(vertex => vertex.weight instanceof PMX.Vertex.Weight.SDEF)) {
                throw new Error(`Combining vertices (${i1} and ${i2}) failed: SDEF not supported.`);
              }
              const vertexIndexSet = new Set(_(vertices).flatMap(vertex => vertex.weight.bones).value().map(bone => bone.index));
              if (!new Set([1, 2, 4]).has(vertexIndexSet.size)) {
                throw new Error(`Combining vertices (${i1} and ${i2}) failed: combining needs BDEF${vertexIndexSet.size}.`);
              }
              let weightMap = new Map(Array.from(vertexIndexSet).map(i => [i, 0]));
              weightMap = vertices[0].weight.bones.reduce(
                (map, bone) => map.set(bone.index, map.get(bone.index) + bone.weight * (1 - t)),
                weightMap
              );
              weightMap = vertices[1].weight.bones.reduce(
                (map, bone) => map.set(bone.index, map.get(bone.index) + bone.weight * t),
                weightMap
              );
              const weight = new PMX.Vertex.Weight[`BDEF${vertexIndexSet.size}`](
                Array.from(weightMap).map(([index, weight]) => ({index: index, weight: weight}))
              );
              return new PMX.Vertex(
                Vector3.lerp(vertices[0].position, vertices[1].position, t),
                Vector3.lerp(vertices[0].normal, vertices[1].normal, t).normalize(),
                Vector2.lerp(vertices[0].uv, vertices[1].uv, t),
                _.zip(vertices[0].extraUVs, vertices[1].extraUVs).map(([uv0, uv1]) => Vector2.lerp(uv0, uv1, t)),
                weight,
                MyMath.lerp(vertices[0].edgeSizeRate, vertices[1].edgeSizeRate, t)
              );
            }
          };
        }
        case 5: {
          const [i1, i2, i3, t1, t2] = toVertexArray;
          const vertices = [model.vertices[i1], model.vertices[i2], model.vertices[i3]];
          return {
            vertexIndices: [i1, i2, i3],
            t1: t1,
            t2: t2,
            toString() { return toStringArray.join(","); },
            toVertex() {
              if (vertices.some(vertex => vertex.weight instanceof PMX.Vertex.Weight.SDEF)) {
                throw new Error(`Combining vertices (${i1}, ${i2} and ${i3}) failed: SDEF not supported.`);
              }
              const vertexIndexSet = new Set(_(vertices).flatMap(vertex => vertex.weight.bones).value().map(bone => bone.index));
              if (!new Set([1, 2, 4]).has(vertexIndexSet.size)) {
                throw new Error(`Combining vertices (${i1}, ${i2} and ${i3}) failed: combining needs BDEF${vertexIndexSet.size}.`);
              }
              let weightMap = new Map(Array.from(vertexIndexSet).map(i => [i, 0]));
              weightMap = vertices[0].weight.bones.reduce(
                (map, bone) => map.set(bone.index, map.get(bone.index) + bone.weight * (1 - t1 - t2)),
                weightMap
              );
              weightMap = vertices[1].weight.bones.reduce(
                (map, bone) => map.set(bone.index, map.get(bone.index) + bone.weight * t1),
                weightMap
              );
              weightMap = vertices[2].weight.bones.reduce(
                (map, bone) => map.set(bone.index, map.get(bone.index) + bone.weight * t2),
                weightMap
              );
              const weight = new PMX.Vertex.Weight[`BDEF${vertexIndexSet.size}`](
                Array.from(weightMap).map(([index, weight]) => ({index: index, weight: weight}))
              );
              function slerp(s1, s2, s3, t1, t2) {
                return s1 + (s2 - s1) * t1 + (s3 - s1) * t2;
              }
              function vlerp(v1, v2, v3, t1, t2) {
                return v1.add(v2.subtract(v1).multiply(t1)).add(v3.subtract(v1).multiply(t2));
              }
              return new PMX.Vertex(
                vlerp(vertices[0].position, vertices[1].position, vertices[2].position, t1, t2),
                vlerp(vertices[0].normal, vertices[1].normal, vertices[2].normal, t1, t2).normalize(),
                vlerp(vertices[0].uv, vertices[1].uv, vertices[2].uv, t1, t2),
                _.zip(vertices[0].extraUVs, vertices[1].extraUVs, vertices[2].extraUVs).map(([uv0, uv1, uv2]) => vlerp(uv0, uv1, uv2, t1, t2)),
                weight,
                slerp(vertices[0].edgeSizeRate, vertices[1].edgeSizeRate, vertices[2].edgeSizeRate, t1, t2)
              );
            }
          };
        }
      }
    }
    function helper1(vertexIndices, points, p) {
      // vertexIndicesはソート済み、pointsもvertexIndicesでソート済み、pointsは3点全て異なる点
      const [t1, t2] = p.equals(points[0]) ? [0, 0]
        : p.equals(points[1]) ? [1, 0]
        : p.equals(points[2]) ? [0, 1]
        : [
          ((p.x - points[0].x) * (points[0].y - points[2].y) - (points[0].x - points[2].x) * (p.y - points[0].y)) /
            ((points[0].x - points[2].x) * (points[0].y - points[1].y) - (points[0].x - points[1].x) * (points[0].y - points[2].y)),
          (points[0].x * p.y - points[0].x * points[1].y - points[1].x * p.y - p.x * points[0].y + points[1].x * points[0].y + p.x * points[1].y) /
            (points[1].x * points[0].y - points[2].x * points[0].y - points[0].x * points[1].y + points[2].x * points[1].y + points[0].x * points[2].y - points[1].x * points[2].y)
        ];
      const [t1Float32, t2Float32] = [t1, t2].map(t => Math.fround(t));
      if (t1Float32 === 0 && t2Float32 === 0) {
        return makeVertexObject([vertexIndices[0]], [vertexIndices[0]]);
      }
      if (t1Float32 === 1 && t2Float32 === 0) {
        return makeVertexObject([vertexIndices[1]], [vertexIndices[1]]);
      }
      if (t1Float32 === 0 && t2Float32 === 1) {
        return makeVertexObject([vertexIndices[2]], [vertexIndices[2]]);
      }
      if (t2Float32 === 0) {
        return makeVertexObject([vertexIndices[0], vertexIndices[1], t1Float32], [vertexIndices[0], vertexIndices[1], t1]);
      }
      if (t1Float32 === 0) {
        return makeVertexObject([vertexIndices[0], vertexIndices[2], t2Float32], [vertexIndices[0], vertexIndices[2], t2]);
      }
      if (Math.fround(t1 + t2) === 1) {
        return makeVertexObject([vertexIndices[1], vertexIndices[2], t2Float32], [vertexIndices[1], vertexIndices[2], t2]);
      }
      return makeVertexObject(
        [vertexIndices[0], vertexIndices[1], vertexIndices[2], t1Float32, t2Float32],
        [vertexIndices[0], vertexIndices[1], vertexIndices[2], t1, t2]
      );
    }
    function helper2(vertexIndices, reverseOffset, d) {
      const dFloat32 = Math.fround(d);
      const rd = 1 - d;
      const rdFloat32 = Math.fround(1 - d);
      const i0 = vertexIndices[(0 + reverseOffset) % 3];
      const i1 = vertexIndices[(1 + reverseOffset) % 3];
      const i2 = vertexIndices[(2 + reverseOffset) % 3];
      if (dFloat32 === 0) {
        return [makeVertexObject([i0], [i0])];
      } else if (dFloat32 === 1) {
        return [makeVertexObject([i1], [i1]), makeVertexObject([i2], [i2])];
      } else {
        return [
          i0 < i1 ? makeVertexObject([i0, i1, dFloat32], [i0, i1, d]) : makeVertexObject([i1, i0, rdFloat32], [i1, i0, rd]),
          i0 < i2 ? makeVertexObject([i0, i2, dFloat32], [i0, i2, d]) : makeVertexObject([i2, i0, rdFloat32], [i2, i0, rd])
        ];
      }
    }
    function algorithm1(projectedPoints) {
      const sortedVertexIndices = Array.from(face.vertexIndices).sort((x, y) => x - y);
      const sortedPoints = sortedVertexIndices.map(i => new Vector2(model.vertices[i].position.x, model.vertices[i].position.z));
      const originalProjection = new Polygon(...projectedPoints);
      const projection = originalProjection.isClockwise() ? originalProjection : originalProjection.reverse();
      const differenceTriangles = _(projection.subtract(subtrahendPolygon)).flatMap(
        differencePolygon => differencePolygon.triangulate()
      ).value().map(
        triangle => originalProjection.isClockwise() ? triangle : triangle.reverse()
      );
      return differenceTriangles.map(
        triangle => triangle.points.map(point => helper1(sortedVertexIndices, sortedPoints, point))
      );
    }
    function algorithm2(projectedPoints) {
      const sortedVertexIndices = Array.from(face.vertexIndices).sort((x, y) => x - y);
      const sortedPoints = _(face.vertexIndices)
        .zip([0, 1, 2])
        .sortBy(([vertexIndex, i]) => vertexIndex)
        .value()
        .map(([vertexIndex, i]) => [new Vector2(0, 0), new Vector2(1, 0), new Vector2(0, 1)][i]);
      return _(new DirectedLineSegment2D(
        ..._(projectedPoints).zip(projectedPoints.slice(1).concat([projectedPoints[0]])).maxBy(([p1, p2]) => p2.subtract(p1).squaredNorm())
      ).subtract(subtrahendPolygon)).flatMap(lineSegment => {
        const tuples = _([lineSegment.p1, lineSegment.p2]).flatMap((p, j) =>
          [0, 1, 2].filter(i => p.equals(projectedPoints[i]))
            .map(i => [[0, 0, 0, j], [1, 0, 1, j], [0, 1, 2, j]][i])
            .concat(
              _.zip([0, 1, 2], [1, 2, 0])
                .filter(([i1, i2]) => !p.equals(projectedPoints[i1]) && !p.equals(projectedPoints[i2]))
                .map(([i1, i2]) => [i1, i2, projectedPoints[i2].subtract(projectedPoints[i1])])
                .filter(([i1, i2, v]) => v.squaredNorm() > 0)
                .map(([i1, i2, v]) => [i1, i2, p.subtract(projectedPoints[i1]).innerProduct(v) / v.squaredNorm()])
                .filter(([i1, i2, t]) => 0 < t && t < 1)
                .map(([i1, i2, t]) => [[t, 0, t, j], [1 - t, t, 1 + t, j], [0, 1 - t, 2 + t, j]][i1])
            )
        ).sortBy(([,,s,]) => s).value();
        const tuplePair = _.zip(tuples, tuples.slice(1).concat([tuples[0]]))
          .filter(([[,,,j1], [,,,j2]]) => j1 !== j2)
          .find(([[,,s1,], [,,s2,]]) => ((Number.isInteger(s1) ? s1 + 1 : Math.ceil(s1)) - (Number.isInteger(s2) ? s2 - 1 : Math.floor(s2))) % 3 === 0);
        if (typeof(tuplePair) !== "undefined") {
          const [[,,s1,], [,,,]] = tuplePair;
          tuples.push([[0, 0, 0, null], [1, 0, 1, null], [0, 1, 2, null]][(Number.isInteger(s1) ? s1 + 1 : Math.ceil(s1)) % 3]);
          tuples.sort(([,,s1,], [,,s2,]) => s1 - s2);
        }
        return new Polygon(...tuples.map(([t1, t2, s, j]) => new Vector2(t1, t2))).triangulate();
      }).value().map(triangle => triangle.points.map(point => helper1(sortedVertexIndices, sortedPoints, point)));
    }
    function algorithm3(projectedPoints, reverseOffset) {
      const projection = new DirectedLineSegment2D(projectedPoints[0], projectedPoints[1]);
      return _(projection.subtract(subtrahendPolygon)).flatMap(lineSegment => {
        const d1 = lineSegment.p1.subtract(projection.p1).innerProduct(projection.toVector()) / projection.toVector().squaredNorm();
        const d2 = lineSegment.p2.subtract(projection.p1).innerProduct(projection.toVector()) / projection.toVector().squaredNorm();
        const vertexObjects1 = helper2(face.vertexIndices, reverseOffset, d1);
        const vertexObjects2 = helper2(face.vertexIndices, reverseOffset, d2);
        if (vertexObjects1.length === 1) {
          return [[vertexObjects1[0], vertexObjects2[0], vertexObjects2[1]]];
        } else {
          return [
            [vertexObjects1[1], vertexObjects1[0], vertexObjects2[0]],
            [vertexObjects1[1], vertexObjects2[0], vertexObjects2[1]]
          ];
        }
      }).value();
    }
    function algorithm4(projectedPoint) {
      return subtrahendPolygon.contains(projectedPoint) ? [] : [face.vertexIndices.map(i => makeVertexObject([i], [i]))];
    }
    switch (new Set(face.vertexIndices.map(i => model.vertices[i].position.toString())).size) {
      case 3: {
        const projectedPoints = face.vertexIndices.map(i => new Vector2(model.vertices[i].position.x, model.vertices[i].position.z));
        if (!Line3D.through(
          model.vertices[face.vertexIndices[0]].position,
          model.vertices[face.vertexIndices[1]].position
        ).contains(
          model.vertices[face.vertexIndices[2]].position
        )) {
          if (model.vertices[face.vertexIndices[1]].position.subtract(model.vertices[face.vertexIndices[0]].position).crossProduct(
            model.vertices[face.vertexIndices[2]].position.subtract(model.vertices[face.vertexIndices[0]].position)
          ).y !== 0) {
            return algorithm1(projectedPoints);
          } else {
            return algorithm2(projectedPoints);
          }
        } else {
          if (new Set(projectedPoints.map(p => p.toString())).size > 1) {
            return algorithm2(projectedPoints);
          } else {
            return algorithm4(projectedPoints[0]);
          }
        }
      }
      case 2: {
        const points = face.vertexIndices.map(i => model.vertices[i].position);
        let reverseOffset = 3;
        while (!points[1].equals(points[2])) {
          points.push(points.shift());
          --reverseOffset;
        }
        const projectedPoints = points.slice(0, 2).map(p => new Vector2(p.x, p.z));
        if (!projectedPoints[0].equals(projectedPoints[1])) {
          return algorithm3(projectedPoints, reverseOffset);
        } else {
          return algorithm4(projectedPoints[0]);
        }
      }
      case 1: {
        const point = model.vertices[face.vertexIndices[0]].position;
        const projectedPoint = new Vector2(point.x, point.z);
        return algorithm4(projectedPoint);
      }
    }
  },
  calcMetaMaterials(model) {
    return model.materials.reduce((array, material, i) => {
      const firstFaceIndex = array.length === 0 ? 0 : _(_(array).last().faceIndices).last() + 1;
      const faceIndices = _.range(firstFaceIndex, firstFaceIndex + material.faceCount);
      array.push({
        material: material,
        materialIndex: i,
        faceIndices: faceIndices,
        faces: faceIndices.map(i => model.faces[i])
      });
      return array;
    }, []);
  },
  VirtualVertex: class VirtualVertex {
    constructor(model, metaVertexIndices) {
      this.model = model;
      this.metaVertexIndices = _.sortBy(metaVertexIndices, ({vertexIndex}) => vertexIndex);
      this._isMaterialized = false;
    }
    toString() {
      return this.metaVertexIndices.map(({vertexIndex, blendRate}) => `${vertexIndex}:${Math.fround(blendRate)}`).join(",");
    }
    toVertex() {
      return PMXUtils.createCombinedVertex(this.metaVertexIndices.map(({vertexIndex, blendRate}) => ({vertex: model.vertices[vertexIndex], blendRate})));
    }
    materialize() {
      if (this._isMaterialized) throw new Error("Already materialized.");

      this._materializedVertexIndex = this.model.vertices.length;
      this.model.vertices.push(this.toVertex());

      const targetMorphTypeSet = new Set(["vertex", "uv", "extraUV1", "extraUV2", "extraUV3", "extraUV4"]);
      const vertexIndexToBlendRate = new Map(this.metaVertexIndices.map(({vertexIndex, blendRate}) => [vertexIndex, blendRate]));
      for (const morph of this.model.morphs.filter(morph => targetMorphTypeSet.has(morph.type))) {
        const offsets = morph.offsets.filter(offset => vertexIndexToBlendRate.has(offset.vertexIndex));
        if (offsets.length === 0) continue;
        const newDisplacement = offsets.map(({vertexIndex, displacement}) => displacement.multiply(vertexIndexToBlendRate.get(vertexIndex))).reduce((sum, v) => sum.add(v), (morph.type === "vertex" ? Vector3 : Vector4).zero);
        morph.offsets.push(new (morph.type === "vertex" ? PMX.Morph.Offset.Vertex : PMX.Morph.Offset.UV)(this._materializedVertexIndex, newDisplacement));
      }

      this._isMaterialized = true;
    }
    isMaterialized() {
      return this._isMaterialized;
    }
    getMaterializedVertexIndex() {
      return this._isMaterialized ? this._materializedVertexIndex : null;
    }
    getMaterializedVertex() {
      return this._isMaterialized ? this.model.vertices[this._materializedVertexIndex] : null;
    }
  },
  createCombinedVertex(metaVertices) {
    const vertices = metaVertices.map(({vertex}) => vertex);
    if (vertices.some(vertex => vertex.weight instanceof PMX.Vertex.Weight.SDEF)) {
      throw new Error("Combining vertices failed: SDEF not supported.");
    }
    const boneIndexSet = new Set(_(vertices).flatMap(vertex => vertex.weight.bones).filter(bone => bone.weight > 0).map(bone => bone.index).value());
    let weightMap = new Map(Array.from(boneIndexSet).map(i => [i, 0]));
    for (const {vertex, blendRate} of metaVertices) {
      weightMap = vertex.weight.bones.filter(bone => bone.weight > 0).reduce(
        (map, bone) => map.set(bone.index, map.get(bone.index) + bone.weight * blendRate),
        weightMap
      );
    }
    if (boneIndexSet.size > 4) {
      const rawWeightMap = _.sortBy(Array.from(weightMap), ([index, weight]) => weight).reverse().slice(0, 4);
      const sum = rawWeightMap.map(([index, weight]) => weight).reduce(_.add, 0);
      weightMap = new Map(rawWeightMap.map(([index, weight]) => [index, weight / sum]));
    }
    let weight;
    switch (weightMap.size) {
    case 1:
    case 2:
    case 4:
      weight = new PMX.Vertex.Weight[`BDEF${weightMap.size}`](
        Array.from(weightMap).map(([index, weight]) => ({index: index, weight: weight}))
      );
      break;
    case 3:
      let dummyBoneIndex;
      if (!weightMap.has(0)) {
        dummyBoneIndex = 0;
      } else if (!weightMap.has(1)) {
        dummyBoneIndex = 1;
      } else if (!weightMap.has(2)) {
        dummyBoneIndex = 2;
      } else {
        dummyBoneIndex = 3;
      }
      weight = new PMX.Vertex.Weight.BDEF4(
        Array.from(weightMap).map(([index, weight]) => ({index: index, weight: weight})).concat([{index: dummyBoneIndex, weight: 0}])
      );
      break;
    }
    function slerp(scalars, blendRates) {
      return _.zip(scalars, blendRates).map(([scalar, blendRate]) => scalar * blendRate).reduce(_.add);
    }
    function vlerp(vectors, blendRates) {
      return _.zip(vectors, blendRates).map(([vector, blendRate]) => vector.multiply(blendRate)).reduce((sum, v) => sum.add(v));
    }
    const blendRates = metaVertices.map(({blendRate}) => blendRate);
    return new PMX.Vertex(
      vlerp(vertices.map(vertex => vertex.position), blendRates),
      vlerp(vertices.map(vertex => vertex.normal), blendRates).normalize(),
      vlerp(vertices.map(vertex => vertex.uv), blendRates),
      _.zip(...vertices.map(vertex => vertex.extraUVs)).map(uvs => vlerp(uvs, blendRates)),
      weight,
      slerp(vertices.map(vertex => vertex.edgeSizeRate), blendRates)
    );
  },
  mergeVertices(model, metaBaseVertexIndex, metaVertexIndices) {
    metaBaseVertexIndex = Object.assign({}, metaBaseVertexIndex);
    metaVertexIndices = metaVertexIndices.map(metaVertexIndex => Object.assign({}, metaVertexIndex));

    model.vertices[metaBaseVertexIndex.vertexIndex] = this.createCombinedVertex([metaBaseVertexIndex].concat(metaVertexIndices).map(({vertexIndex, blendRate}) => ({vertex: model.vertices[vertexIndex], blendRate})));

    const targetMorphTypes = new Set(["vertex", "uv", "extraUV1", "extraUV2", "extraUV3", "extraUV4"]);
    const vertexInFaceMap = new Map(new Array(model.vertices.length).fill().map((_, i) => [i, []]));
    for (const face of model.faces) {
      for (let i = 0; i < face.vertexIndices.length; i++) {
        vertexInFaceMap.get(face.vertexIndices[i]).push({face: face, order: i});
      }
    }
    const offsetMap = new Map(new Array(model.vertices.length).fill().map((_, i) => [i, []]));
    for (const morph of model.morphs.filter(morph => targetMorphTypes.has(morph.type))) {
      for (const offset of morph.offsets) {
        offsetMap.get(offset.vertexIndex).push(offset);
      }
    }
    function overwriteVertexIndex(from, to) {
      for (const {face, order} of vertexInFaceMap.get(from)) {
        face.vertexIndices[order] = to;
      }
      for (const offset of offsetMap.get(from)) {
        offset.vertexIndex = to;
      }
    }

    for (let i = 0; i < metaVertexIndices.length; i++) {
      overwriteVertexIndex(metaVertexIndices[i].vertexIndex, metaBaseVertexIndex.vertexIndex);
      for (let j = metaVertexIndices[i].vertexIndex; j < model.vertices.length - 1; j++) {
        overwriteVertexIndex(j + 1, j);
      }
      if (metaBaseVertexIndex.vertexIndex > metaVertexIndices[i].vertexIndex) {
        metaBaseVertexIndex.vertexIndex--;
      }
      for (let j = i + 1; j < metaVertexIndices.length; j++) {
        if (metaVertexIndices[j].vertexIndex > metaVertexIndices[i].vertexIndex) {
          metaVertexIndices[j].vertexIndex--;
        }
      }
      model.vertices.splice(metaVertexIndices[i].vertexIndex, 1);
    }
  },
  // originalModelは3つ以上の面が共有する辺を持たない
  // loopCount > 0
  // 法線未考慮
  async subdivideSurfaceAsync(originalModel, loopCount, targetMaterialIndices, logger = new TextAreaWrapper(document.createElement("textarea"))) {
    const core = async (model, allFaces) => {
      await logger.appendAsync("結果格納領域作成中...");
      const newModel = PMX.read(model.write());
      const newAllFaces = allFaces.map(faces => faces.slice());
      for (const materialIndex of targetMaterialIndices) {
        newAllFaces[materialIndex] = [];
      }

      await logger.appendAsync("ハイポリ化対象頂点算出中...");
      const targetVertexIndexSet = new Set(_(targetMaterialIndices).flatMap(targetMaterialIndex => allFaces[targetMaterialIndex]).flatten().value())

      await logger.progressAsync("重複頂点算出中...", model.vertices.length);
      function vertexIndexToVertexKey(vertexIndex) {
        const vertex = model.vertices[vertexIndex];
        return JSON.stringify(Array.from(vertex.position).concat(Array.from(vertex.normal)).map(Math.fround));
      }
      const vertexIndexToVertexIndicesSharingVertexKey = await (async () => {
        const vertexKeyToVertexIndices = new Map();
        for (const vertexIndex of _.range(model.vertices.length)) {
          if (targetVertexIndexSet.has(vertexIndex)) {
            const vertexKey = vertexIndexToVertexKey(vertexIndex);
            if (!vertexKeyToVertexIndices.has(vertexKey)) vertexKeyToVertexIndices.set(vertexKey, []);
            vertexKeyToVertexIndices.get(vertexKey).push(vertexIndex);
          }
          await logger.progressAsync();
        }
        return vertexIndex => vertexKeyToVertexIndices.get(vertexIndexToVertexKey(vertexIndex));
      })();
      function edgeToEdgesSharingVertexKeyPair(edge) {
        return _(vertexIndexToVertexIndicesSharingVertexKey(edge[0]))
          .flatMap(vertexIndex => vertexIndexToEdges.get(vertexIndex))
          .filter(([vertexIndex1, vertexIndex2]) =>
            (vertexIndexToVertexKey(vertexIndex1) === vertexIndexToVertexKey(edge[0]) && vertexIndexToVertexKey(vertexIndex2) === vertexIndexToVertexKey(edge[1])) ||
            (vertexIndexToVertexKey(vertexIndex2) === vertexIndexToVertexKey(edge[0]) && vertexIndexToVertexKey(vertexIndex1) === vertexIndexToVertexKey(edge[1]))
          )
          .value();
      }

      await logger.progressAsync("face point作成中...", targetMaterialIndices.map(targetMaterialIndex => allFaces[targetMaterialIndex].length).reduce(_.add, 0));
      const vertexIndexToFaces = new Map(Array.from(targetVertexIndexSet).map(vertexIndex => [vertexIndex, []]));
      const vertexIndexToEdges = new Map(Array.from(targetVertexIndexSet).map(vertexIndex => [vertexIndex, new Set()]));
      const edgeToFaces = new Map();
      const faceToFacePointIndex = new Map();
      const edgeToEdgePointIndex = new Map();
      for (const face of _.flatMap(targetMaterialIndices, targetMaterialIndex => allFaces[targetMaterialIndex])) {
        for (const vertexIndex of face) {
          vertexIndexToFaces.get(vertexIndex).push(face);
        }
        for (const edge of _.zip(face, face.slice(1).concat(face.slice(0, 1))).map(pair => _.sortBy(pair, _.identity))) {
          const edgeJSON = JSON.stringify(edge);
          for (const vertexIndex of edge) {
            vertexIndexToEdges.get(vertexIndex).add(edgeJSON);
          }
          if (!edgeToFaces.has(edgeJSON)) edgeToFaces.set(edgeJSON, []);
          edgeToFaces.get(edgeJSON).push(face);
        }
        newModel.vertices.push(this.createCombinedVertex(face.map(vertexIndex => ({vertex: model.vertices[vertexIndex], blendRate: 1 / face.length}))));
        faceToFacePointIndex.set(face, newModel.vertices.length - 1);
        await logger.progressAsync();
      }

      await logger.progressAsync("頂点->エッジインデックス作成中...", vertexIndexToEdges.size);
      for (const [vertexIndex, edgeJSONSet] of vertexIndexToEdges) {
        vertexIndexToEdges.set(vertexIndex, Array.from(edgeJSONSet).map(JSON.parse));
        await logger.progressAsync();
      }

      await logger.progressAsync("edge point作成中...", edgeToFaces.size);
      function vertexIndexToFacesSharingVertexKey(vertexIndex) {
        return _(vertexIndexToVertexIndicesSharingVertexKey(vertexIndex))
          .flatMap(vertexIndexSharingVertexKey => vertexIndexToFaces.get(vertexIndexSharingVertexKey))
          .value();
      }
      function vertexIndexToEdgesSharingVertexKey(vertexIndex) {
        return _(vertexIndexToVertexIndicesSharingVertexKey(vertexIndex))
          .flatMap(vertexIndexSharingVertexKey => vertexIndexToEdges.get(vertexIndexSharingVertexKey))
          .value();
      }
      function edgeToFacesSharingVertexKeyPair(edge) {
        return _(edgeToEdgesSharingVertexKeyPair(edge))
         .flatMap(edgeSharingVertexKeyPair => edgeToFaces.get(JSON.stringify(edgeSharingVertexKeyPair)))
         .value();
      }
      for (const edgeJSON of edgeToFaces.keys()) {
        const edge = JSON.parse(edgeJSON);
        const faces = edgeToFacesSharingVertexKeyPair(edge);
        switch (faces.length) {
        case 1:
          newModel.vertices.push(this.createCombinedVertex(edge.map(vertexIndex => ({vertex: newModel.vertices[vertexIndex], blendRate: 1 / 2}))));
          break;
        case 2:
          const edgePoint = this.createCombinedVertex(faces.map(face => faceToFacePointIndex.get(face)).concat(edge).map(vertexIndex => ({vertex: newModel.vertices[vertexIndex], blendRate: 1 / 4})));
          edgePoint.uv = model.vertices[edge[0]].uv.add(model.vertices[edge[1]].uv).divide(2);
          newModel.vertices.push(edgePoint);
          break;
        default:
          throw new Error(`An edge shared by more than two faces has been found: ${edgeJSON} is shared by ${faces.length} faces`);
        }
        edgeToEdgePointIndex.set(edgeJSON, newModel.vertices.length - 1);
        await logger.progressAsync();
      }

      await logger.progressAsync("新規面作成中...", targetMaterialIndices.map(targetMaterialIndex => allFaces[targetMaterialIndex].length).reduce(_.add, 0));
      for (const materialIndex of targetMaterialIndices) {
        for (const face of allFaces[materialIndex]) {
          const centerPointIndex = faceToFacePointIndex.get(face);
          const edgePointIndices = _.zip(face, face.slice(1).concat(face.slice(0, 1))).map(pair => edgeToEdgePointIndex.get(JSON.stringify(_.sortBy(pair, _.identity))));
          for (let i = 0; i < face.length; i++) {
            newAllFaces[materialIndex].push([face[i], edgePointIndices[i], centerPointIndex, edgePointIndices[(i - 1 + edgePointIndices.length) % edgePointIndices.length]]);
          }
          await logger.progressAsync();
        }
      }

      await logger.progressAsync("original point移動中...", targetVertexIndexSet.size);
      function avg(vectors) {
        return vectors.reduce((sum, v) => sum.add(v), new Vector3(0, 0, 0)).divide(vectors.length);
      }
      for (const originalVertexIndex of targetVertexIndexSet) {
        const originalVertex = model.vertices[originalVertexIndex];
        const pairs = vertexIndexToEdgesSharingVertexKey(originalVertexIndex).map(edge => ({edge, faces: edgeToFacesSharingVertexKeyPair(edge)}));
        if (pairs.some(({edge, faces}) => faces.length === 1)) {
          newModel.vertices[originalVertexIndex].position = avg(
            _(pairs)
              .filter(({edge, faces}) => faces.length === 1)
              .flatMap(({edge, faces}) => edge)
              .map(vertexIndex => newModel.vertices[vertexIndex].position)
              .concat(new Array(2).fill(originalVertex.position))
              .value()
          );
        } else {
          const F = avg(vertexIndexToFacesSharingVertexKey(originalVertexIndex).map(face => newModel.vertices[faceToFacePointIndex.get(face)].position));
          const R = avg(
            _(pairs)
              .groupBy(({edge, faces}) => JSON.stringify(_.sortBy(faces, face => JSON.stringify(face))))
              .flatMap(pairsSharingFaces => pairsSharingFaces[0].edge)
              .map(vertexIndex => model.vertices[vertexIndex].position)
              .value()
          );
          const P = originalVertex.position;
          const n = vertexIndexToFacesSharingVertexKey(originalVertexIndex).length;
          newModel.vertices[originalVertexIndex].position = F.add(R.multiply(2)).add(P.multiply(n - 3)).divide(n);
        }
        await logger.progressAsync();
      }
      return [newModel, newAllFaces];
    };

    let model = PMX.read(originalModel.write());
    let allFaces = this.calcMetaMaterials(model).map(metaMaterial => metaMaterial.faces.map(face => face.vertexIndices));
    model.faces = [];
    for (let i = 0; i < loopCount; i++) {
      await logger.appendAsync(`${i + 1}/${loopCount}ループ目:`);
      [model, allFaces] = await core(model, allFaces);
    }

    originalModel.vertices = model.vertices;
    originalModel.faces = _.flatMap(allFaces, (faces, materialIndex) => {
      if (targetMaterialIndices.includes(materialIndex)) {
        return _(faces).flatMap(([a, b, c, d]) => [[a, b, d], [b, c, d]]).map(vertexIndices => new PMX.Face(vertexIndices)).value();
      } else {
        return faces.map(vertexIndices => new PMX.Face(vertexIndices));
      }
    });
    for (const materialIndex of targetMaterialIndices) {
      originalModel.materials[materialIndex].faceCount = allFaces[materialIndex].length * 2;
    }
    await logger.appendAsync("Catmull-Clark subdivision完了");
  },
  MeshInfo: class MeshInfo {
    constructor(model) {
      this._model = PMX.read(model.write());
      this._vertexKeyToVertexIndices = new Map();
      this._vertexIndexToFaceIndices = new Map(this._model.vertices.map((vertex, vertexIndex) => [vertexIndex, []]));
      this._vertexIndexToEdges = new Map(this._model.vertices.map((vertex, vertexIndex) => [vertexIndex, new Set()]));
      this._edgeToFaceIndices = new Map();

      for (const vertexIndex of _.range(this._model.vertices.length)) {
        const vertexKey = this.getVertexKeyFrom(vertexIndex);
        if (!this._vertexKeyToVertexIndices.has(vertexKey)) this._vertexKeyToVertexIndices.set(vertexKey, []);
        this._vertexKeyToVertexIndices.get(vertexKey).push(vertexIndex);
      }

      for (const faceIndex of _.range(this._model.faces.length)) {
        const face = this._model.faces[faceIndex];
        for (const vertexIndex of face.vertexIndices) {
          this._vertexIndexToFaceIndices.get(vertexIndex).push(faceIndex);
        }
        for (const edge of _.zip(face.vertexIndices, face.vertexIndices.slice(1).concat(face.vertexIndices.slice(0, 1))).map(pair => _.sortBy(pair, _.identity))) {
          const edgeJSON = JSON.stringify(edge);
          for (const vertexIndex of edge) {
            this._vertexIndexToEdges.get(vertexIndex).add(edgeJSON);
          }
          if (!this._edgeToFaceIndices.has(edgeJSON)) this._edgeToFaceIndices.set(edgeJSON, []);
          this._edgeToFaceIndices.get(edgeJSON).push(faceIndex);
        }
      }
      this._vertexIndexToEdges = new Map(Array.from(this._vertexIndexToEdges).map(([vertexIndex, edgeJSONSet]) => [vertexIndex, Array.from(edgeJSONSet).map(JSON.parse)]));
    }
    getVertexKeyFrom(arg) {
      if (typeof(arg) === "number") arg = this._model.vertices[arg];
      return JSON.stringify(Array.from(arg.position).concat(Array.from(arg.normal)).map(Math.fround));
    }
    getVertexIndicesFrom(arg, sharesVertexKey) {
      if (sharesVertexKey) {
        return this._vertexKeyToVertexIndices.get(this.getVertexKeyFrom(arg));
      } else {
        throw new Error("Unknown context");
      }
    }
    getVerticesFrom(arg, sharesVertexKey) {
      return this.getVertexIndicesFrom(arg, sharesVertexKey).map(vertexIndex => this._model.vertices[vertexIndex]);
    }
    getEdgesFrom(arg, sharesVertexKey) {
      if (typeof(arg) === "number") {
        if (sharesVertexKey) {
          return _(this.getVertexIndicesFrom(arg, true))
            .flatMap(vertexIndex => this.getEdgesFrom(vertexIndex, false))
            .value();
        } else {
          return this._vertexIndexToEdges.get(arg);
        }
      } else if (arg instanceof Array) {
        if (sharesVertexKey) {
          return _(this.getVertexIndicesFrom(arg[0], true))
            .flatMap(vertexIndex => this.getEdgesFrom(vertexIndex, false))
            .filter(([vertexIndex1, vertexIndex2]) =>
              (this.getVertexKeyFrom(vertexIndex1) === this.getVertexKeyFrom(arg[0]) && this.getVertexKeyFrom(vertexIndex2) === this.getVertexKeyFrom(arg[1])) ||
              (this.getVertexKeyFrom(vertexIndex2) === this.getVertexKeyFrom(arg[0]) && this.getVertexKeyFrom(vertexIndex1) === this.getVertexKeyFrom(arg[1]))
            )
            .value();
        } else {
          throw new Error("Unknown context");
        }
      } else {
        throw new Error("Unknown context");
      }
    }
    getFaceIndicesFrom(arg, sharesVertexKey) {
      if (typeof(arg) === "number") {
        if (sharesVertexKey) {
          return _(this.getVertexIndicesFrom(arg, true))
            .flatMap(vertexIndex => this.getFaceIndicesFrom(vertexIndex, false))
            .value();
        } else {
          return this._vertexIndexToFaceIndices.get(arg);
        }
      } else if (arg instanceof Array) {
        if (sharesVertexKey) {
          return _(this.getEdgesFrom(arg, true))
            .flatMap(edge => this.getFaceIndicesFrom(edge, false))
            .value();
        } else {
          return this._edgeToFaceIndices.get(JSON.stringify(arg));
        }
      } else {
        throw new Error("Unknown context");
      }
    }
    getFacesFrom(arg, sharesVertexKey) {
      return this.getFaceIndicesFrom(arg, sharesVertexKey).map(faceIndex => this._model.faces[faceIndex]);
    }
  },
  addHair(model, positionOrigin, r0, l, n, quaternions, weight, isSharp) {
    const m = quaternions.length - 1;
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
    const vertexIndexOrigin = model.vertices.length;
    model.vertices.push(...new Array(n * (m + 1)).fill().map((_, i) => {
      return new PMX.Vertex(
        positions[i],
        normals[i],
        new Vector2(0, 0),
        [],
        weight,
        0
      );
    }));
    model.faces.push(...new Array(isSharp ? 2 * n * (m - 1) + n : 2 * n * m).fill().map((_, i) => {
      const i1 = Math.floor(i / (2 * n));
      const i2 = Math.floor(i % (2 * n) / n);
      const i3 = i % n;
      if (isSharp ? (i1 < m && i2 === 0) || i1 === m : i2 === 0) {
        return new PMX.Face([
          i1 * n + (i3 + 1) % n,
          i1 * n + i3,
          (i1 + 1) * n + [i3, (i3 + 1) % n][i1 % 2]
        ].map(j => vertexIndexOrigin + j));
      } else {
        return new PMX.Face([
          i1 * n + i3,
          (i1 + 1) * n + [(i3 + n - 1) % n, i3][i1 % 2],
          (i1 + 1) * n + [i3, (i3 + 1) % n][i1 % 2]
        ].map(j => vertexIndexOrigin + j));
      }
    }));
  }
};
export default PMXUtils;
