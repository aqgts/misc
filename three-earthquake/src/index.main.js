import "babel-polyfill";
import PartitionGroup from "./partition-group";
import Partition from "./partition";
import EarthquakeBuilder from "../lib/aqgts-lib/src/earthquake-builder";

(async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.y = 0.2;
  camera.position.z = 10;
  camera.lookAt(0, 10, 0);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  const scene = new THREE.Scene();
//  scene.background = new THREE.Color(0xffffff);
  scene.background = new THREE.Color(0x000000);

  {
/*
    const ambient = new THREE.AmbientLight(0x333333);
    scene.add( ambient );

    const directionalLight = new THREE.DirectionalLight(0x887766);
    directionalLight.position.set( -1, 1, 1 ).normalize();
    scene.add( directionalLight );
*/

    const spotLight = new THREE.SpotLight(0x887766, 6.0, 20, Math.PI / 4, 0.2);
    spotLight.position.set(0, 0, 10);
    spotLight.target.position.set(0, 14, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);
  }

  const effect = (() => {
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    return new THREE.OutlineEffect(renderer);
  })();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    effect.setSize(window.innerWidth, window.innerHeight);
  }, false);

  const clock = new THREE.Clock();
  let ready = false;
  (function animate() {
    requestAnimationFrame( animate );

    if (ready) {
      animateAfterLoading();
    }

    effect.render( scene, camera );
  })();

  const helper = new THREE.MMDHelper();

  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log(`${Math.round(percentComplete, 2)}% downloaded`);
    }
  }

  const buffer = await new Promise((resolve, reject) => {
    new THREE.AudioLoader().load("resources/monster-footstep1.mp3", resolve, onProgress, reject);
  });

  const loader = new THREE.MMDLoader();

  const mesh = await new Promise((resolve, reject) => {
    loader.load("https://threejs.org/examples/models/mmd/miku/miku_v2.pmd", ["https://threejs.org/examples/models/mmd/vmds/wavefile_v2.vmd"], resolve, onProgress, reject);
  });
  helper.add(mesh);
  helper.setAnimation(mesh);
  helper.setPhysics(mesh);

  {
    const [loadedAudio, loadedListener] = await new Promise((resolve, reject) => {
      loader.loadAudio("https://threejs.org/examples/models/mmd/audios/wavefile_short.mp3", (a, l) => {resolve([a, l]);}, onProgress, reject);
    });
    loadedListener.position.z = 1;
    helper.setAudio(loadedAudio, loadedListener, {delayTime: 160 * 1 / 30});
    helper.unifyAnimationDuration();
    scene.add(loadedAudio);
    scene.add(loadedListener);
    scene.add(mesh);

    /*
    const bass = helper.audioManager.audio.context.createBiquadFilter();
    bass.type = "lowshelf";
    bass.frequency.value = 500;
    bass.gain.value = 10;
    const middle = helper.audioManager.audio.context.createBiquadFilter();
    middle.type = "peaking";
    middle.frequency.value = 1000;
    middle.Q.value = Math.SQRT1_2;
    middle.gain.value = -10;
    const treble = helper.audioManager.audio.context.createBiquadFilter();
    treble.type = "highshelf";
    treble.frequency.value = 2000;
    treble.gain.value = -20;
    helper.audioManager.audio.setFilters([bass, middle, treble]);
    */
  }

  const partitionGroups = (() => {
    const targetStart = mesh.geometry.groups[0].start;
    const targetEnd = targetStart + mesh.geometry.groups[0].count;
    const targetVertexIndexSet = new Set(mesh.geometry.index.array.slice(targetStart, targetEnd));
    const positions = new Array(mesh.geometry.attributes.position.array.length / 3).fill().map((_, i) => new THREE.Vector4(...mesh.geometry.attributes.position.array.slice(i * 3, (i + 1) * 3), 1));
    const skinIndices = new Array(mesh.geometry.attributes.skinIndex.array.length / 4).fill().map((_, i) => new THREE.Vector4(...mesh.geometry.attributes.skinIndex.array.slice(i * 4, (i + 1) * 4)));
    const skinWeights = new Array(mesh.geometry.attributes.skinWeight.array.length / 4).fill().map((_, i) => new THREE.Vector4(...mesh.geometry.attributes.skinWeight.array.slice(i * 4, (i + 1) * 4)));
    const verticesTmp = new Array(positions.length).fill().map((_, i) => ({position: positions[i], skinIndex: skinIndices[i], skinWeight: skinWeights[i]})).filter((_, i) => targetVertexIndexSet.has(i));
    return [
      new PartitionGroup([
        new Partition(verticesTmp.filter(({position, skinIndex, skinWeight}, i) => position.x < 0 && position.y < 3 && position.z >= 0.5)),
        new Partition(verticesTmp.filter(({position, skinIndex, skinWeight}, i) => position.x < 0 && position.y < 3 && position.z < 0.5))
      ], 0.03, 0.01),
      new PartitionGroup([
        new Partition(verticesTmp.filter(({position, skinIndex, skinWeight}, i) => position.x > 0 && position.y < 3 && position.z >= 0.5)),
        new Partition(verticesTmp.filter(({position, skinIndex, skinWeight}, i) => position.x > 0 && position.y < 3 && position.z < 0.5))
      ], 0.03, 0.01)
    ];
  })();

  ready = true;

  const powers = [];
  function animateAfterLoading() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    helper.animate(dt);

    const boneMatrices = new Array(mesh.skeleton.bones.length).fill().map((_, i) => {const matrix = new THREE.Matrix4(); matrix.fromArray(mesh.skeleton.boneMatrices.slice(i * 16, (i + 1) * 16)); return matrix;});
    const bindMatrix = mesh.bindMatrix;
    const bindMatrixInverse = mesh.bindMatrixInverse;
    const matrixWorld = mesh.matrixWorld;
    for (const partitionGroup of partitionGroups) {
      partitionGroup.addState(boneMatrices, bindMatrix, bindMatrixInverse, matrixWorld, t);
    }
    const power = partitionGroups.map(partitionGroup => partitionGroup.powerFromGround()).reduce((x, y) => x + y, 0);
    if (power > 0) {
      powers.push({power, time: t});

      for (const partitionGroup of partitionGroups) {
        partitionGroup.soundEffect(scene, listener, buffer);
      }
    }

    const earthquake = EarthquakeBuilder.create(powers.map(({power, time}) => ({amplitude: power, offset: time})), 0.2, 0.15);
    camera.position.x = earthquake.x.displacement(t);
    camera.position.y = earthquake.y.displacement(t);
    camera.position.z = earthquake.z.displacement(t) + 10;
  }
})();
