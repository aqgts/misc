import Cuboid from "./cuboid";
import DirectedLineSegment2D from "./directed-line-segment-2d";
import DirectedLineSegment3D from "./directed-line-segment-3d";
import Line2D from "./line-2d";
import Matrix from "./matrix";
import Plane from "./plane";
import Triangle2D from "./triangle-2d";
import Vector2 from "./vector2";
import Vector3 from "./vector3";

export default class Triangle3D {
  constructor(...points) {
    if (points.length !== 3 || !points.every(point => point instanceof Vector3)) throw new Error("points must be an array of three Vector3 elements.");
    this.points = points;
    const minX = Math.min(...points.map(point => point.x));
    const maxX = Math.max(...points.map(point => point.x));
    const minY = Math.min(...points.map(point => point.y));
    const maxY = Math.max(...points.map(point => point.y));
    const minZ = Math.min(...points.map(point => point.z));
    const maxZ = Math.max(...points.map(point => point.z));
    this._outline = new Cuboid(minX, minY, minZ, maxX - minX, maxY - minY, maxZ - minZ);
  }
  clone() {
    return new this.constructor(...this.points.map(point => point.clone()));
  }
  centerOfGravity() {
    return this.points[0].add(this.points[1]).add(this.points[2]).divide(3);
  }
  area() {
    const a = this.points[1].subtract(this.points[0]).norm();
    const b = this.points[2].subtract(this.points[1]).norm();
    const c = this.points[0].subtract(this.points[2]).norm();
    const s = (a + b + c) / 2;
    return Math.sqrt(s * (s - a) * (s - b) * (s - c));
  }
  intersection(other) {
    if (other instanceof Triangle3D) {
      if (!this._outline.intersects(other._outline)) return [];
      const matrix = Matrix.fromColumnVectors(
        this.points[1].subtract(this.points[0]),
        this.points[2].subtract(this.points[0]),
        this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0]))
      );
      const invMatrix = matrix.inverse();
      const xyzToUvw = xyz => invMatrix.multiply(xyz.subtract(this.points[0]));
      const uvwToXyz = uvw => matrix.multiply(uvw).add(this.points[0]);
      const points = other.points.map(xyzToUvw);
      const thisUvw = new Triangle2D(new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 0));
      if (points.every(point => point.z === 0)) {
        const otherUvw = new Triangle2D(...points.map(point => new Vector2(point.x, point.y)));
        // thisUvw.intersection(otherUvw) を uvwToXyz にかける
        throw new Error("Currently not implemented");
      }
      const overPoints = points.filter(point => point.z >= 0);
      const underPoints = points.filter(point => point.z < 0);
      if (overPoints.length === 3 || underPoints.length === 3) return [];
      const centerPoint = overPoints.length === 1 ? overPoints[0] : underPoints[0];
      while (points[0] !== centerPoint) {
        points.unshift(points.pop());
      }
      const newPoints = [points[1], points[2]].map(point => {
        const t = (0 - centerPoint.z) / (point.z - centerPoint.z);
        return Vector3.lerp(centerPoint, point, t);
      });
      if (newPoints[0].equals(newPoints[1])) return thisUvw.contains(new Vector2(newPoints[0].x, newPoints[0].y)) ? [uvwToXyz(newPoints[0])] : [];
      const intersectionsUvw = thisUvw.intersection(
        overPoints.length === 1
          ? new DirectedLineSegment2D(new Vector2(newPoints[1].x, newPoints[1].y), new Vector2(newPoints[0].x, newPoints[0].y))
          : new DirectedLineSegment2D(new Vector2(newPoints[0].x, newPoints[0].y), new Vector2(newPoints[1].x, newPoints[1].y))
      );
      if (intersectionsUvw.length === 0) {
        return [];
      } else if (intersectionsUvw[0] instanceof Vector2) {
        return [uvwToXyz(new Vector3(intersectionsUvw[0].x, intersectionsUvw[0].y, 0))];
      } else if (intersectionsUvw[0] instanceof DirectedLineSegment2D) {
        return [new DirectedLineSegment3D(uvwToXyz(new Vector3(intersectionsUvw[0].p1.x, intersectionsUvw[0].p1.y, 0)), uvwToXyz(new Vector3(intersectionsUvw[0].p2.x, intersectionsUvw[0].p2.y, 0)))];
      }
    } else if (other instanceof Plane) {
      const a = new Vector3(other.a, other.b, other.c).innerProduct(this.points[1].subtract(this.points[0]));
      const b = new Vector3(other.a, other.b, other.c).innerProduct(this.points[2].subtract(this.points[0]));
      if (a === 0 && b === 0) return this;
      const intersections = new Triangle2D(new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 0)).intersection(new Line2D(a, b, other.d));
      if (intersections.length === 0) return [];
      const matrix = Matrix.fromColumnVectors(
        this.points[1].subtract(this.points[0]),
        this.points[2].subtract(this.points[0])
      );
      const uvToXyz = uv => matrix.multiply(uv).add(this.points[0]);
      if (intersections[0] instanceof Vector2) return [uvToXyz(intersections[0])];
      return [new DirectedLineSegment3D(uvToXyz(intersections[0].p1), uvToXyz(intersections[0].p2))];
    } else {
      throw new Error("Unknown type");
    }
  }
  blendRates(p) { // pがthisと同一平面上にあることが前提
    const uvw = Matrix.fromColumnVectors(
      this.points[1].subtract(this.points[0]),
      this.points[2].subtract(this.points[0]),
      this.points[1].subtract(this.points[0]).crossProduct(this.points[2].subtract(this.points[0]))
    ).inverse().multiply(p.subtract(this.points[0]));
    return [1 - uvw.x - uvw.y, uvw.x, uvw.y];
  }
}
