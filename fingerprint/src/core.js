import PMX from "../lib/aqgts-lib/src/pmx";
import PMXUtils from "../lib/aqgts-lib/src/pmx-utils";
import ImageWrapper from "../lib/aqgts-lib/src/image-wrapper";
import Vector3 from "../lib/aqgts-lib/src/vector3";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";

export default {
  async run(modelBinary, heightmapBinary, loopCount, targetMaterialIndex, log = new TextAreaWrapper()) {
    await log.appendAsync("モデル読込中...");
    const model = PMX.read(modelBinary);
    const targetVertexIndexSet = new Set(_.flatMap(PMXUtils.calcMetaMaterials(model)[targetMaterialIndex].faces, "vertexIndices"));
    await log.appendAsync("heightmap読込中...");
    const heightmap = new ImageWrapper(heightmapBinary);

    await log.appendAsync(`頂点数: ${model.vertices.length}, 面数: ${model.faces.length}`);
    await PMXUtils.subdivideSurfaceAsync(model, loopCount, [targetMaterialIndex], log);
    await log.appendAsync(`頂点数: ${model.vertices.length}, 面数: ${model.faces.length}`);

    await log.appendAsync("メッシュ計算中...");
    const meshInfo = new PMXUtils.MeshInfo(model);

    await log.progressAsync("height加算中...", targetVertexIndexSet.size);
    const STRENGTH = 0.0001 / 0.08 * 100 * 25;
    for (const vertexIndex of targetVertexIndexSet) {
      const vertex = model.vertices[vertexIndex];
      const heights = meshInfo.getVerticesFrom(vertexIndex, true).map(vertexSharingVertexKey => heightmap.getColorByUV(vertexSharingVertexKey.uv.x, vertexSharingVertexKey.uv.y).red);
      const avg = heights.reduce(_.add, 0) / heights.length;
      vertex.position = vertex.position.add(vertex.normal.multiply((avg - 0.4) * STRENGTH));
      await log.progressAsync();
    }

    await log.progressAsync("法線計算中...", targetVertexIndexSet.size);
    for (const vertexIndex of targetVertexIndexSet) {
      model.vertices[vertexIndex].normal = meshInfo.getFacesFrom(vertexIndex, true).map(face =>
        Plane.through(...face.vertexIndices.map(vi => model.vertices[vi].position)).normal()
      ).reduce((sum, normal) => sum.add(normal), Vector3.zero).normalize();
      await log.progressAsync();
    }

    await log.appendAsync("モデル出力中...");
    return model.write();
  }
};
