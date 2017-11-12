import PMX from "../lib/aqgts-lib/src/pmx";
import PMXUtils from "../lib/aqgts-lib/src/pmx-utils";
import Triangle3D from "../lib/aqgts-lib/src/triangle-3d";
import DirectedLineSegment3D from "../lib/aqgts-lib/src/directed-line-segment-3d";
import DirectedLineSegment3DUtils from "../lib/aqgts-lib/src/directed-line-segment-3d-utils";
import Vector3 from "../lib/aqgts-lib/src/vector3";
import Quaternion from "../lib/aqgts-lib/src/quaternion";
import Plane from "../lib/aqgts-lib/src/plane";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";

export default {
  async run(modelBinary, log = new TextAreaWrapper()) {
    const model =  PMX.read(modelBinary);
    const metaMaterials = PMXUtils.calcMetaMaterials(model);
    const eyelashesMetaMaterial = metaMaterials.find(metaMaterial => metaMaterial.material.japaneseName === "Eyelashes");
    const faceMetaMaterial = metaMaterials.find(metaMaterial => metaMaterial.material.japaneseName === "Face");
    const lineSegmentMap = new Map();
    await log.progressAsync("共通部分計算中...", eyelashesMetaMaterial.faces.length * faceMetaMaterial.faces.length);
    for (const face1 of eyelashesMetaMaterial.faces) {
      const triangle1 = new Triangle3D(...face1.vertexIndices.map(vertexIndex => model.vertices[vertexIndex].position));
      for (const face2 of faceMetaMaterial.faces) {
        const triangle2 = new Triangle3D(...face2.vertexIndices.map(vertexIndex => model.vertices[vertexIndex].position));
        const intersections = triangle1.intersection(triangle2);
        if (intersections.length === 1 && intersections[0] instanceof DirectedLineSegment3D) {
          lineSegmentMap.set(intersections[0], [face1, face2]);
        }
        await log.progressAsync();
      }
    }

    const curves = DirectedLineSegment3DUtils.connect(Array.from(lineSegmentMap.keys())).curves.map(curve => Math.abs(curve[0].p1.x) < Math.abs(curve[curve.length - 1].p2.x) ? curve : curve.reverse());
    const vertexCurves = curves.map(curve => {
      const faces = curve.map(lineSegment => lineSegmentMap.get(lineSegment).map(face => face.vertexIndices.map(vertexIndex => model.vertices[vertexIndex])));
      const vertices = _.flatMap(curve, (lineSegment, lineSegmentIndex) =>
        [lineSegment.p1, lineSegment.p2].map(point =>
          faces[lineSegmentIndex].map(face => {
            const triangle = new Triangle3D(...face.map(vertex => vertex.position));
            const blendRates = triangle.blendRates(point);
            return PMXUtils.createCombinedVertex(_.zip(face, blendRates).map(([vertex, blendRate]) => ({vertex, blendRate})));
          })
        )
      );
      const combinedVertices = [vertices[0]].concat(
        _.range(1, vertices.length - 1, 2).map(i1 => _.range(2).map(j => PMXUtils.createCombinedVertex([{vertex: vertices[i1][j], blendRate: 0.5}, {vertex: vertices[i1 + 1][j], blendRate: 0.5}]))),
        [vertices[vertices.length - 1]]
      );
      return _.range(curve.length).map(i => ({
        length: combinedVertices[i + 1][0].position.subtract(combinedVertices[i][0].position).norm(),
        eyelashes: {
          face: faces[i][0],
          vertex1: combinedVertices[i][0],
          vertex2: combinedVertices[i + 1][0]
        },
        face: {
          face: faces[i][1],
          vertex1: combinedVertices[i][1],
          vertex2: combinedVertices[i + 1][1]
        }
      })).reduce((arr, {length, eyelashes, face}) => {
        arr.push({
          offset: arr.length > 0 ? arr[arr.length - 1].offset + arr[arr.length - 1].length : 0,
          length, eyelashes, face
        });
        return arr;
      }, []);
    });

    const originalFaceCount = model.faces.length;
    await log.progressAsync("睫毛作成中...", (() => {
      let loopCount = 0;
      for (const vertexCurve of vertexCurves) {
        const totalLength = vertexCurve[vertexCurve.length - 1].offset + vertexCurve[vertexCurve.length - 1].length;
        for (let currentOffset = 0; currentOffset < totalLength; currentOffset += 0.00038 / 0.08) {
          loopCount++;
        }
      }
      return loopCount;
    })());
    for (const vertexCurve of vertexCurves) {
      const totalLength = vertexCurve[vertexCurve.length - 1].offset + vertexCurve[vertexCurve.length - 1].length;
      for (let currentOffset = 0; currentOffset < totalLength; currentOffset += 0.00038 / 0.08) {
        const {offset, length, eyelashes, face} = _(vertexCurve).filter(({offset}) => offset <= currentOffset).last();
        const t = (currentOffset - offset) / length;
        const eyelashesVertex = PMXUtils.createCombinedVertex([{vertex: eyelashes.vertex1, blendRate: 1 - t}, {vertex: eyelashes.vertex2, blendRate: t}]);
        const faceVertex = PMXUtils.createCombinedVertex([{vertex: face.vertex1, blendRate: 1 - t}, {vertex: face.vertex2, blendRate: t}]);
        const positionOrigin = eyelashesVertex.position;
        const [intersection] = Plane.through(positionOrigin, positionOrigin.add(eyelashesVertex.normal), positionOrigin.add(faceVertex.normal)).intersection(Plane.through(...eyelashes.face.map(vertex => vertex.position)));
        const quaternionOrigin = Quaternion.fromToRotation(new Vector3(0, 1, 0), intersection.d.z < 0 ? intersection.d : intersection.d.negate());
        PMXUtils.addHair(model, positionOrigin, 0.00004 / 0.08, 0.0068 / 0.08, 5, new Array(4).fill(quaternionOrigin), eyelashesVertex.weight, true);
        await log.progressAsync();
      }
    }
/*
    model.materials.push(new PMX.Material("Eyelashes", "",
      {red: 0.21176470588 * 0.6, green: 0.55294117647 * 0.6, blue: 0.76078431372 * 0.6, alpha: 1},
      {red: 1, green: 1, blue: 1, coefficient: 5},
      {red: 0.21176470588 * 0.4, green: 0.55294117647 * 0.4, blue: 0.76078431372 * 0.4},
      false, true, true, true, false,
      {red: 0, green: 0, blue: 0, alpha: 1, size: 0},
      -1, {index: -1, mode: "disabled"}, {isShared: false, index: -1},
      "", model.faces.length - originalFaceCount
    ));
*/
    model.materials.push(new PMX.Material("Eyelashes", "",
      {red: 0 * 0.6, green: 0 * 0.6, blue: 0 * 0.6, alpha: 1},
      {red: 1, green: 1, blue: 1, coefficient: 5},
      {red: 0 * 0.4, green: 0 * 0.4, blue: 0 * 0.4},
      false, true, true, true, false,
      {red: 0, green: 0, blue: 0, alpha: 1, size: 0},
      -1, {index: -1, mode: "disabled"}, {isShared: false, index: -1},
      "", model.faces.length - originalFaceCount
    ));
    model.faces = _(PMXUtils.calcMetaMaterials(model)).filter(metaMaterial => metaMaterial.material !== eyelashesMetaMaterial.material).flatMap(metaMaterial => metaMaterial.faces).value();
    eyelashesMetaMaterial.material.faceCount = 0;

    return model.write();
  }
};
