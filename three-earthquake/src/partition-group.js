export default class PartitionGroup {
  constructor(partitions, coefficientOfBigImpact, coefficientOfSmallImpact) {
    this.partitions = partitions;
    this.coefficientOfBigImpact = coefficientOfBigImpact;
    this.coefficientOfSmallImpact = coefficientOfSmallImpact;
  }
  addState(boneMatrices, bindMatrix, bindMatrixInverse, matrixWorld, time) {
    for (const partition of this.partitions) {
      partition.addState(boneMatrices, bindMatrix, bindMatrixInverse, matrixWorld, time);
    }
  }
  impactingPartitions() {
    return this.partitions.filter(partition => partition.isOnGroundPreviously() === false && partition.isOnGroundCurrently() === true);
  }
  impactState() {
    if (this.partitions.every(partition => partition.isOnGroundPreviously() === false) && this.partitions.some(partition => partition.isOnGroundCurrently() === true)) {
      return "bigImpact";
    } else if ((() => {
          const notImpactingPartitions = this.partitions.filter(partition => !(partition.isOnGroundPreviously() === false && partition.isOnGroundCurrently() === true));
          if (notImpactingPartitions.length === this.partitions.length) return false;
          return notImpactingPartitions.every(partition => partition.isOnGroundCurrently() === true);
        })()) {
      return "smallImpact";
    } else {
      return "noImpact";
    }
  }
  currentMinY() {
    return this.partitions.reduce((min, partition) => Math.min(min, partition.currentMinY()), Number.POSITIVE_INFINITY);
  }
  currentlyLowestPartition() {
    const minY = this.currentMinY();
    return this.partitions.find(partition => partition.currentMinY() === minY);
  }
  powerFromGround() {
    switch (this.impactState()) {
    case "bigImpact":
      return this.currentlyLowestPartition().velocityOfCurrentlyLowestVertex().length() * this.coefficientOfBigImpact;
    case "smallImpact":
      return this.impactingPartitions().map(partition => partition.velocityOfCurrentlyLowestVertex().length() * this.coefficientOfSmallImpact).reduce((x, y) => x + y, 0);
    case "noImpact":
      return 0;
    }
  }
  soundEffect(targetScene, targetListener, targetBuffer) {
    let position;
    switch (this.impactState()) {
    case "bigImpact":
      position = this.currentlyLowestPartition().currentState().lowestGlobalPosition();
      break;
    case "smallImpact":
      position = this.impactingPartitions()[0].currentState().lowestGlobalPosition();
      break;
    case "noImpact":
      position = null;
      break;
    }

    if (position === null) return;

    const soundObj = new THREE.Object3D();
    soundObj.position.set(position.x, position.y, position.z);
    const sound = new THREE.PositionalAudio(targetListener);
    const power = this.powerFromGround();
    sound.autoplay = true;
    sound.setRefDistance(1);
    sound.setRolloffFactor(0.01);
    sound.setVolume(power);
    soundObj.add(sound);
    targetScene.add(soundObj);

/*
    const pitchShift = PitchShift(targetListener.context);
    pitchShift.transpose = -12;
    // pitchShift.wet.value = 1
    //pitchShift.dry.value = 0.5
    sound.setFilter(pitchShift);
*/

    sound.setBuffer(targetBuffer);
  }
}
