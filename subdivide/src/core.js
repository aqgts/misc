import PMX from "../lib/aqgts-lib/src/pmx";
import PMXUtils from "../lib/aqgts-lib/src/pmx-utils";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";

export default {
  async run(modelBinary, loopCount, targetMaterialIndices, log = new TextAreaWrapper()) {
    await log.appendAsync("モデル読込中...");
    const model = PMX.read(modelBinary);

    await log.appendAsync(`頂点数: ${model.vertices.length}, 面数: ${model.faces.length}`);
    await log.appendAsync("Catmull-Clark subdivision中...");
    await PMXUtils.subdivideSurfaceAsync(model, loopCount, targetMaterialIndices, log);
    await log.appendAsync(`頂点数: ${model.vertices.length}, 面数: ${model.faces.length}`);

    await log.appendAsync("モデル出力中...");
    return model.write();
  }
};
