import "./register-global-variables";
import Plane from "../src/plane";
import Vector3 from "../src/vector3";
import Line3D from "../src/line-3d";

describe("Plane", () => {
  it("through", () => {
    const expectedPlane = new Plane(0, 1, 0, 0);
    const actualPlane = Plane.through(new Vector3(0, 0, 0), new Vector3(0, 0, 1), new Vector3(1, 0, 0));
    expect(actualPlane.equals(expectedPlane)).toBe(true);
  });
  it("intersection", () => {
    const plane1 = new Plane(0, 1, 0, 0);
    const plane2 = new Plane(0, 0, 1, 0);
    const expectedIntersections = [
      new Line3D(new Vector3(0, 0, 0), new Vector3(1, 0, 0))
    ];
    const actualIntersections = plane1.intersection(plane2);
    expect(actualIntersections.length).toBe(expectedIntersections.length);
    if (actualIntersections.length === expectedIntersections.length) {
      expect(_.zip(actualIntersections, expectedIntersections).every(([actual, expected]) => actual.equals(expected))).toBe(true);
    }
  });
});
