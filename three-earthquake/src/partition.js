import PartitionState from "./partition-state";

export default class Partition {
  constructor(vertices) {
    this.vertices = vertices;
    this.states = [];
  }
  addState(boneMatrices, bindMatrix, bindMatrixInverse, matrixWorld, time) {
    this.states.unshift(new PartitionState(this, boneMatrices, bindMatrix, bindMatrixInverse, matrixWorld, time));
    this.states.splice(2);
  }
  currentState() {
    return this.states[0];
  }
  previousState() {
    return this.states[1];
  }
  hasCurrentState() {
    return this.states.length >= 1;
  }
  hasPreviousState() {
    return this.states.length >= 2;
  }
  isOnGroundCurrently() {
    if (!this.hasCurrentState()) return void(0);
    return this.currentState().isOnGround();
  }
  isOnGroundPreviously() {
    if (!this.hasPreviousState()) return void(0);
    return this.previousState().isOnGround();
  }
  velocity(vertexIndex) {
    if (!this.hasPreviousState()) return void(0);
    const currentState = this.currentState();
    const previousState = this.previousState();
    return currentState.lowestGlobalPosition().clone().sub(previousState.lowestGlobalPosition()).divideScalar(currentState.time - previousState.time);
  }
  velocityOfCurrentlyLowestVertex() {
    if (!this.hasCurrentState()) return void(0);
    return this.velocity(this.currentState().lowestVertexIndex());
  }
  currentMinY() {
    if (!this.hasCurrentState()) return void(0);
    return this.currentState().minY();
  }
}
