import getSymbolProperty from "./helpers/get-symbol-property";
import BinaryUtils from "../src/binary-utils";
import PMX from "../src/pmx";

xdescribe("PMX", () => {
  let inputUint8Array;
  beforeAll(async () => {
    inputUint8Array = await BinaryUtils.readBinaryFromFilePathAsync("base/spec/resources/Yo_Miku_Ver1.3.0/Yo_Miku_Ver1.3.0_Normal.pmx");
  });
  it("read/write", () => {
    const model = PMX.read(inputUint8Array);
    const outputUint8Array = model.write();
    expect(outputUint8Array).toEqual(inputUint8Array);
  });
  it("clear", () => {
    const model = PMX.read(inputUint8Array);
    const _uuidToNode = getSymbolProperty(model, "uuidToNode");
    const _backwardIndex = getSymbolProperty(model, "backwardIndex");
    model.clear();
    expect(model[_uuidToNode]).toEqual(Object.create(null));
    expect(model[_backwardIndex]).toEqual(Object.create(null));
  });
  it("clone", () => {
    const model = PMX.read(inputUint8Array);
    const clone = model.clone();
    const _uuidToNode = getSymbolProperty(model, "uuidToNode");
    const _backwardIndex = getSymbolProperty(model, "backwardIndex");
    expect(Object.keys(clone[_uuidToNode]).length).toBeGreaterThan(1);
    expect(Object.keys(clone[_uuidToNode]).length).toBe(Object.keys(model[_uuidToNode]).length);
    expect(Object.keys(clone[_backwardIndex]).length).toBeGreaterThan(0);
    expect(Object.keys(clone[_backwardIndex]).length).toBe(Object.keys(model[_backwardIndex]).length);
  });
});
