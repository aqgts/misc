import PMX from "../lib/aqgts-lib/src/pmx";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";

export default {
  async run(modelBinary, log = new TextAreaWrapper()) {
    const model = PMX.read(modelBinary);
    const boneIndexSet = new Set();
    for (const vertex of model.vertices) {
      for (const bone of vertex.weight.bones) {
        if (bone.weight > 0) boneIndexSet.add(bone.index);
      }
    }
    for (const originalBoneIndex of new Set(boneIndexSet)) {
      for (let boneIndex = originalBoneIndex; boneIndex >= 0; boneIndex = model.bones[boneIndex].parentIndex) {
        boneIndexSet.add(boneIndex);
      }
    }
    for (const boneIndex of _.difference(_.range(0, model.bones.length), Array.from(boneIndexSet))) {
      await log.appendAsync(`${boneIndex}: ${model.bones[boneIndex].japaneseName}`);
    }
  }
};
