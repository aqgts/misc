import "./register-global-variables";
import Polygon from "../src/polygon";
import Vector2 from "../src/vector2";

describe("Polygon", () => {
  it("union", () => {
    const polygon1 = new Polygon(
      new Vector2(0, 1),
      new Vector2(3, 4),
      new Vector2(4, 4),
      new Vector2(4, 3),
      new Vector2(1, 0),
      new Vector2(0, 0)
    );
    const polygon2 = new Polygon(
      new Vector2(0, 2),
      new Vector2(3, 3),
      new Vector2(4, 2),
      new Vector2(2, 2),
      new Vector2(2, 0)
    );
    const expectedUnions = [
      new Polygon(
        new Vector2(0, 1),
        new Vector2(0.5, 1.5),
        new Vector2(0, 2),
        new Vector2(1.5, 2.5),
        new Vector2(3, 4),
        new Vector2(4, 4),
        new Vector2(4, 3),
        new Vector2(3.5, 2.5),
        new Vector2(4, 2),
        new Vector2(3, 2),
        new Vector2(2, 1),
        new Vector2(2, 0),
        new Vector2(1.5, 0.5),
        new Vector2(1, 0),
        new Vector2(0, 0)
      )
    ];
    const actualUnions = polygon1.union(polygon2).sort((x, y) => x.points.length - y.points.length);
    expect(actualUnions.length).toBe(expectedUnions.length);
    if (actualUnions.length === expectedUnions.length) {
      expect(_.zip(actualUnions, expectedUnions).every(([actual, expected]) => actual.equals(expected))).toBe(true);
    }
  });
  it("intersection", () => {
    const polygon1 = new Polygon(
      new Vector2(0, 1),
      new Vector2(3, 4),
      new Vector2(4, 4),
      new Vector2(4, 3),
      new Vector2(1, 0),
      new Vector2(0, 0)
    );
    const polygon2 = new Polygon(
      new Vector2(0, 2),
      new Vector2(3, 3),
      new Vector2(4, 2),
      new Vector2(2, 2),
      new Vector2(2, 0)
    );
    const expectedIntersections = [
      new Polygon(
        new Vector2(0.5, 1.5),
        new Vector2(1.5, 2.5),
        new Vector2(3, 3),
        new Vector2(3.5, 2.5),
        new Vector2(3, 2),
        new Vector2(2, 2),
        new Vector2(2, 1),
        new Vector2(1.5, 0.5)
      )
    ];
    const actualIntersections = polygon1.intersection(polygon2).sort((x, y) => x.points.length - y.points.length);
    expect(actualIntersections.length).toBe(expectedIntersections.length);
    if (actualIntersections.length === expectedIntersections.length) {
      expect(_.zip(actualIntersections, expectedIntersections).every(([actual, expected]) => actual.equals(expected))).toBe(true);
    }
  });
  it("subtract", () => {
    const polygon1 = new Polygon(
      new Vector2(0, 1),
      new Vector2(3, 4),
      new Vector2(4, 4),
      new Vector2(4, 3),
      new Vector2(1, 0),
      new Vector2(0, 0)
    );
    const polygon2 = new Polygon(
      new Vector2(0, 2),
      new Vector2(3, 3),
      new Vector2(4, 2),
      new Vector2(2, 2),
      new Vector2(2, 0)
    );
    const expectedDifferences = [
      new Polygon(
        new Vector2(2, 1),
        new Vector2(2, 2),
        new Vector2(3, 2)
      ),
      new Polygon(
        new Vector2(0, 1),
        new Vector2(0.5, 1.5),
        new Vector2(1.5, 0.5),
        new Vector2(1, 0),
        new Vector2(0, 0)
      ),
      new Polygon(
        new Vector2(3, 4),
        new Vector2(4, 4),
        new Vector2(4, 3),
        new Vector2(3.5, 2.5),
        new Vector2(3, 3),
        new Vector2(1.5, 2.5)
      )
    ];
    const actualDifferences = polygon1.subtract(polygon2).sort((x, y) => x.points.length - y.points.length);
    expect(actualDifferences.length).toBe(expectedDifferences.length);
    if (actualDifferences.length === expectedDifferences.length) {
      expect(_.zip(actualDifferences, expectedDifferences).every(([actual, expected]) => actual.equals(expected))).toBe(true);
    }
  });
});
