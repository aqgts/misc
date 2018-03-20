import Triangle3D from "../src/triangle-3d";
import Vector3 from "../src/vector3";
import DirectedLineSegment3D from "../src/directed-line-segment-3d";

describe("Triangle3D", () => {
  it("intersection", () => {
    const triangle1 = new Triangle3D(
      new Vector3(2, 0, 0),
      new Vector3(-2, -1, 0),
      new Vector3(-2, 1, 0)
    );
    const triangle2 = new Triangle3D(
      new Vector3(0, 0 ,-1),
      new Vector3(2, 0, 1),
      new Vector3(-2, 0, 1)
    );
    const expectedIntersections = [
      new DirectedLineSegment3D(
        new Vector3(1, 0, 0),
        new Vector3(-1, 0, 0)
      )
    ];
    const actualIntersections = triangle1.intersection(triangle2);
    expect(actualIntersections.length).toBe(expectedIntersections.length);
    if (actualIntersections.length === expectedIntersections.length) {
      expect(_.zip(actualIntersections, expectedIntersections).every(([actual, expected]) => actual.equals(expected) || actual.equals(expected.reverse()))).toBe(true);
    }
  });
});
