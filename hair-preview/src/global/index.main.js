import "babel-polyfill";
import Vector3 from "../../lib/aqgts-lib/src/vector3";
import Quaternion from "../../lib/aqgts-lib/src/quaternion";
import BinaryUtils from "../../lib/aqgts-lib/src/binary-utils";
import ImageWrapper from "../../lib/aqgts-lib/src/image-wrapper";
import UnifiedPMX from "../../lib/aqgts-lib/src/unified-pmx";
import TextAreaWrapper from "../../lib/aqgts-lib/src/text-area-wrapper";

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
  camera.position.z = 30;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffe4b5);

  {
    const ambient = new THREE.AmbientLight(0x666666);
    scene.add( ambient );

    const directionalLight = new THREE.DirectionalLight(0x887766);
    directionalLight.position.set( -1, 1, 1 ).normalize();
    scene.add( directionalLight );
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

  const helper = new THREE.MMDHelper();

  const unifiedModel = await UnifiedPMX.importAsync("resources/hair.pmx");
  async function applyToThreeJS() {
    while (helper.meshes.length > 0) {
      scene.remove(helper.meshes.pop());
    }

    const mesh = await unifiedModel.createThreeMeshAsync();
    mesh.position.y = -10;
    scene.add(mesh);
    helper.add(mesh);
    helper.setAnimation(mesh);
    helper.setPhysics(mesh);
    helper.unifyAnimationDuration({afterglow: 2.0});
  }
  await applyToThreeJS();

  async function applyToUnifiedModel(file) {
    const hairMaterial = unifiedModel.model.materials.head();
    if (hairMaterial.textureUUID === null) {
      unifiedModel.model.textures.push(unifiedModel.model.createNode(UnifiedPMX.Model.Texture).init(""));
      hairMaterial.textureUUID = unifiedModel.model.textures.head().getUUID();
      hairMaterial.diffuse.red = 1;
      hairMaterial.diffuse.green = 1;
      hairMaterial.diffuse.blue = 1;
      hairMaterial.ambient.red = 0.8;
      hairMaterial.ambient.green = 0.8;
      hairMaterial.ambient.blue = 0.8;
    }
    const hairTexture = hairMaterial.getTextureNode();
    hairTexture.filePath = file.name;

    unifiedModel.textureMap.clear();
    unifiedModel.textureMap.set(file.name, await ImageWrapper.importAsync(file));
  }

  document.documentElement.addEventListener("dragover", event => {
    event.preventDefault();
  }, false);
  document.documentElement.addEventListener("drop", async event => {
    event.preventDefault();
    if (event.dataTransfer.files.length !== 1) return;
    await applyToUnifiedModel(event.dataTransfer.files[0]);
    await applyToThreeJS();
  }, false);
  document.querySelector("input[type='file']").addEventListener("change", async event => {
    if (event.target.files.length !== 1) return;
    await applyToUnifiedModel(event.target.files[0]);
    await applyToThreeJS();
  });
  document.querySelector("input[type='button']").addEventListener("click", async event => {
    BinaryUtils.saveBinaryAsFile(await unifiedModel.exportToZipAsync("output.pmx"), "output.zip");
  });

/*
  global.unifiedModel = UnifiedPMX.createEmptyModel();
  unifiedModel.model.info.japaneseName = "陰毛";
  unifiedModel.model.info.englishName = "pubic hair";
  unifiedModel.model.info.japaneseComment = "ライセンス: CC0";
  unifiedModel.model.info.englishComment = "License: CC0";
  const material = unifiedModel.model.addHairMaterial(0.21176470588, 0.55294117647, 0.76078431372);
  const weight = unifiedModel.model.createNode(UnifiedPMX.Model.Vertex.Weight.BDEF1).init([
    unifiedModel.model.createNode(UnifiedPMX.Model.Vertex.Weight.Bone).init(unifiedModel.model.bones.head(), 1)
  ])
  // 31, 61
  for (let x = 0; x < 7; x++) {
    for (let z = 0; z < 31; z++) {
      unifiedModel.model.addHair(material, new Vector3(
        (-10 * (7 - 1) / 2 + 10 * x) * 0.08 / 1000,
        0,
        (-10 * (31 - 1) / 2 + 10 * z) * 0.08 / 1000
      ), new Vector3(0, 1, 0), new Array(20).fill().map(() => {
        const theta = Math.random() * Math.PI * 2;
        return Quaternion.angleAxis(Math.random() * 45 * Math.PI / 180, new Vector3(Math.cos(theta), 0, Math.sin(theta)));
      }), 0.00004, 0.04, 5, weight, true);
    }
  }
  BinaryUtils.saveBinaryAsFile(await unifiedModel.exportToZipAsync("output.pmx"), "output.zip");
*/

  (function animate() {
    // requestAnimationFrame(animate);
    setTimeout(animate, 1000);
    helper.animate(clock.getDelta());
    effect.render(scene, camera);
  })();
});
