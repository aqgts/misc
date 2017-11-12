import PMX from "../lib/aqgts-lib/src/pmx";
import PMXUtils from "../lib/aqgts-lib/src/pmx-utils";
import Vector3 from "../lib/aqgts-lib/src/vector3";
import Quaternion from "../lib/aqgts-lib/src/quaternion";
import TextAreaWrapper from "../lib/aqgts-lib/src/text-area-wrapper";

export default {
  async run(n, m, maxDeg, width, height, red, green, blue, log = new TextAreaWrapper()) {
    const model = PMXUtils.createEmptyModel();
    model.model.japaneseName = "毛";
    model.model.englishName = "hair";
    model.model.japaneseComment = "ライセンス: CC0";
    model.model.englishComment = "License: CC0";

    await log.progressAsync("毛モデル作成中...", width * height);
    for (let x = 0; x < width; ++x) {
      for (let z = 0; z < height; ++z) {
        PMXUtils.addHair(model, new Vector3(
          (-3.65 * (width - 1) / 2 + 3.65 * x) * 0.08 / 1000,
          0,
          (-3.65 * (height - 1) / 2 + 3.65 * z) * 0.08 / 1000
        ), 0.00004 / 0.08, 0.10 / 0.08, n, new Array(m).fill().map(() => {
          const theta = (0.35 + Math.random() * 0.3) * Math.PI * 2;
          return Quaternion.angleAxis((0.85 + Math.random() * 0.3) * maxDeg * Math.PI / 180, new Vector3(Math.cos(theta), 0, Math.sin(theta)));
        }).reduce((arr, q) => {
          arr.push(arr[arr.length - 1].multiply(q));
          return arr;
        }, [Quaternion.identity]), new PMX.Vertex.Weight.BDEF1([{index: 0, weight: 1}]), false);
        await log.progressAsync();
      }
    }

    model.materials = [new PMX.Material("材質1", "",
      {red: red * 0.6, green: green * 0.6, blue: blue * 0.6, alpha: 1},
      {red: 1, green: 1, blue: 1, coefficient: 5},
      {red: red * 0.4, green: green * 0.4, blue: blue * 0.4},
      false, true, true, true, false,
      {red: 0, green: 0, blue: 0, alpha: 1, size: 0},
      -1, {index: -1, mode: "disabled"}, {isShared: false, index: -1},
      "", model.faces.length
    )];

    return model.write();
  }
};
