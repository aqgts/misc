const THRESHOLD_Y = 0.02;
export default class PartitionState {
  constructor(partition, boneMatrices, bindMatrix, bindMatrixInverse, matrixWorld, time) {
    this.partition = partition;
    this.boneMatrices = boneMatrices;
    this.bindMatrix = bindMatrix;
    this.bindMatrixInverse = bindMatrixInverse;
    this.matrixWorld = matrixWorld;
    this.time = time;
  }
  globalPositions() {
    if (!("_globalPositions" in this)) {
      this._globalPositions = this.partition.vertices.map(({position, skinIndex, skinWeight}) => {
          const v = position.clone().applyMatrix4(this.bindMatrix);
          const v1 = v.clone().applyMatrix4(this.boneMatrices[skinIndex.x]).multiplyScalar(skinWeight.x);
          const v2 = v.clone().applyMatrix4(this.boneMatrices[skinIndex.y]).multiplyScalar(skinWeight.y);
          const v3 = v.clone().applyMatrix4(this.boneMatrices[skinIndex.z]).multiplyScalar(skinWeight.z);
          const v4 = v.clone().applyMatrix4(this.boneMatrices[skinIndex.w]).multiplyScalar(skinWeight.w);
          return new THREE.Vector3(...v1.add(v2).add(v3).add(v4).applyMatrix4(this.bindMatrixInverse).applyMatrix4(this.matrixWorld).toArray().slice(0, 3));
        });
    }
    return this._globalPositions;
  }
  minY() {
    if (!("_minY" in this)) {
      this._minY = this.globalPositions().reduce((min, v) => Math.min(min, v.y), Number.POSITIVE_INFINITY)
        }
    return this._minY;
  }
  lowestVertexIndex() {
    if (!("_lowestVertexIndex" in this)) {
      const minY = this.minY();
      this._lowestVertexIndex = this.globalPositions().findIndex(v => v.y === minY);
    }
    return this._lowestVertexIndex;
  }
  lowestGlobalPosition() {
    if (!("_lowestGlobalPosition" in this)) {
      this._lowestGlobalPosition = this.globalPositions()[this.lowestVertexIndex()];
    }
    return this._lowestGlobalPosition;
  }
  isOnGround() {
    if (!("_isOnGround" in this)) {
      this._isOnGround = this.minY() <= THRESHOLD_Y;
    }
    return this._isOnGround;
  }
}
