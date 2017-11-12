import "./register-global-variables";
import Core from "../src/core";

describe("Core", () => {
  it("run", () => {
    let value, flag = false;
    runs(async () => {
      value = await Core.run(5, 10, 3, 5, 3, 0.21176470588, 0.55294117647, 0.76078431372);
      flag = true;
    });
    waitsFor(() => flag, "", 500);
    runs(() => {
      expect(value).toEqual(jasmine.any(Uint8Array));
    });
  });
});
