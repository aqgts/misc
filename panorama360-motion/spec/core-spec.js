import "./register-global-variables";
import Core from "../src/core";

describe("Core", () => {
  it("run", () => {
    expect(() => {
      Core.run(0, 0, 0, 30);
    }).not.toThrow();
  });
});
