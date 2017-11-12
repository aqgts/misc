import PMX from "../lib/aqgts-lib/src/pmx";
import PMXUtils from "../lib/aqgts-lib/src/pmx-utils";
import Vector2 from "../lib/aqgts-lib/src/vector2";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";

export default {
  async run(modelBinary, log = new TextAreaWrapper()) {
    const model = PMX.read(modelBinary);
    const torsos = PMXUtils.calcMetaMaterials(model).filter(({material}) => material.japaneseName.match(/^Torso/));
    const baseTorso = torsos[0];

    await log.appendAsync("UV座標正規化中...");
    for (const vertex of _(torsos).flatMap(torso => torso.faces).flatMap(face => face.vertexIndices).uniq().map(i => model.vertices[i]).value()) {
      vertex.uv = new Vector2(vertex.uv.x % 1, vertex.uv.y % 1);
    }

    for (const torso of torsos.slice(1)) {
      await log.appendAsync("近接頂点検索中...");
      const baseTorsoVertexIndices = _(baseTorso.faces).flatMap(face => face.vertexIndices).uniq().value();
      const torsoVertexIndices = _(torso.faces).flatMap(face => face.vertexIndices).uniq().value();
      const vertexIndexPairs = _(baseTorsoVertexIndices).flatMap(
        baseTorsoVertexIndex => torsoVertexIndices.map(
          torsoVertexIndex => [baseTorsoVertexIndex, torsoVertexIndex]
        )
      ).filter(
        ([baseTorsoVertexIndex, torsoVertexIndex]) => {
          const baseTorsoVertex = model.vertices[baseTorsoVertexIndex];
          const torsoVertex = model.vertices[torsoVertexIndex];
          return baseTorsoVertex.position.subtract(torsoVertex.position).squaredNorm() <= Math.pow(0.001, 2) &&
            baseTorsoVertex.uv.subtract(torsoVertex.uv).squaredNorm() <= Math.pow(0.001, 2);
        }
      ).value();

      await log.progressAsync("近接頂点結合中...", vertexIndexPairs.length);
      for (let i = 0; i < vertexIndexPairs.length; i++) {
        PMXUtils.mergeVertices(model, {vertexIndex: vertexIndexPairs[i][0], blendRate: 0.5}, [{vertexIndex: vertexIndexPairs[i][1], blendRate: 0.5}]);
        for (let j = i + 1; j < vertexIndexPairs.length; j++) {
          if (vertexIndexPairs[j][0] > vertexIndexPairs[i][1]) vertexIndexPairs[j][0]--;
          if (vertexIndexPairs[j][1] > vertexIndexPairs[i][1]) vertexIndexPairs[j][1]--;
        }
        await log.progressAsync();
      }
    }

    baseTorso.material.faceCount = torsos.reduce((sum, torso) => sum + torso.material.faceCount, 0);
    for (const torso of torsos.slice(1)) {
      torso.material.faceCount = 0;
    }

    return model.write();
  }
};
