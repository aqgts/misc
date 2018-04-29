import BinaryUtils from "../src/binary-utils";
import ExtendedPMX from "../src/extended-pmx";

xdescribe("ExtendedPMX", () => {
  let inputUint8Array;
  beforeAll(async () => {
    inputUint8Array = await BinaryUtils.readBinaryFromFilePathAsync("base/spec/resources/Yo_Miku_Ver1.3.0/Yo_Miku_Ver1.3.0_Normal.pmx");
  });
  it("mergeVertices", () => {
    const model = ExtendedPMX.read(inputUint8Array);
    model.mergeVertices([...model.vertices]);
    expect(model.vertices.length).toBe(1);
  });
  it("subdivideSurfaceAsync", async () => {
    const model = ExtendedPMX.read(inputUint8Array);
    await model.subdivideSurfaceAsync(1, [model.materials.find(material => material.japaneseName === "材質37")]);
  }, 60000);
});
