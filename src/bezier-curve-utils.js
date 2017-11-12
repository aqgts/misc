import BezierCurve from "./bezier-curve";

export default {
  // http://sach1o.blog80.fc2.com/blog-entry-72.html
  fromPoints(points) {
    const n = points.length - 1;
    if (n < 2) throw new Error("points.length must be greater than 2.");
    const Vector = points[0].constructor;
    const d = points[0].length;
    const matrix = new Array(n * 2 * d).fill().map(() => new Array(n * 2 * d).fill(0));
    const vector = new Array(n * 2 * d);
    for (let i = 1; i < n; i++) {
      for (let j = 0; j < d; j++) {
        matrix[(i - 1) * 2 * d + j][(i - 1) * 2 * d + d + j] = 1;
        matrix[(i - 1) * 2 * d + j][i * 2 * d + j] = 1;
        vector[(i - 1) * 2 * d + j] = 2 * points[i][j];
        matrix[(i - 1) * 2 * d + d + j][(i - 1) * 2 * d + j] = 1;
        matrix[(i - 1) * 2 * d + d + j][(i - 1) * 2 * d + d + j] = -2;
        matrix[(i - 1) * 2 * d + d + j][i * 2 * d + j] = 2;
        matrix[(i - 1) * 2 * d + d + j][i * 2 * d + d + j] = -1;
        vector[(i - 1) * 2 * d + d + j] = 0;
      }
    }
    for (let j = 0; j < d; j++) {
      matrix[(n - 1) * 2 * d + j][2 * d + j] = 2;
      matrix[(n - 1) * 2 * d + j][2 * d + d + j] = -1;
      vector[(n - 1) * 2 * d + j] = points[1][j];
      matrix[(n - 1) * 2 * d + d + j][(n - 1) * 2 * d + j] = -1;
      matrix[(n - 1) * 2 * d + d + j][(n - 1) * 2 * d + d + j] = 2;
      vector[(n - 1) * 2 * d + d + j] = points[n][j];
    }
    const solution = math.lusolve(matrix, vector);
    return _.range(n).map(i => new BezierCurve(
      points[i],
      new Vector(..._.range(d).map(j => solution[i * 2 * d + j][0])),
      new Vector(..._.range(d).map(j => solution[i * 2 * d + d + j][0])),
      points[i + 1]
    ));
  }
};
