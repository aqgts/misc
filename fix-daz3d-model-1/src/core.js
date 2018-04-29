import Color from "color";
import CanvasWrapper from "../lib/aqgts-lib/src/canvas-wrapper";
import DirectedLineSegment3D from "../lib/aqgts-lib/src/directed-line-segment-3d";
import DirectedLineSegment3DUtils from "../lib/aqgts-lib/src/directed-line-segment-3d-utils";
import Easing from "../lib/aqgts-lib/src/easing";
import HalfUniverse3D from "../lib/aqgts-lib/src/half-universe-3d";
import ImageWrapper from "../lib/aqgts-lib/src/image-wrapper";
import MyMath from "../lib/aqgts-lib/src/my-math";
import Plane from "../lib/aqgts-lib/src/plane";
import Polygon from "../lib/aqgts-lib/src/polygon";
import Quaternion from "../lib/aqgts-lib/src/quaternion";
import Triangle2D from "../lib/aqgts-lib/src/triangle-2d";
import Triangle3D from "../lib/aqgts-lib/src/triangle-3d";
import ExtendedPMX from "../lib/aqgts-lib/src/extended-pmx";
import UnifiedPMX from "../lib/aqgts-lib/src/unified-pmx";
import Vector2 from "../lib/aqgts-lib/src/vector2";
import Vector3 from "../lib/aqgts-lib/src/vector3";

export default {
  async transformSimplyAsync(model, log) {
    await log.appendAsync("ボーン位置修正中...");
    for (const bone of model.bones) {
      bone.position = Quaternion.fromToRotation(new Vector3(0, 0, 1), new Vector3(0, 1, 0)).rotate(bone.position).divide(100);
    }

    await log.appendAsync("スケール変更中...");
    model.changeScale(10);

    if (model.bones.length === 0) {
      await log.appendAsync("全ての親追加中...");
      model.addMasterBone();
    }

    if (model.displayElementGroups.length === 0) {
      await log.appendAsync("ボーンを表示枠に登録中...");
      model.displayElementGroups.push(
        model.createNode(ExtendedPMX.DisplayElementGroup).init("Root", "Root", true, [
          model.createNode(ExtendedPMX.DisplayElementGroup.DisplayElement).init("bone", model.bones.head().getUUID()),
        ]),
        model.createNode(ExtendedPMX.DisplayElementGroup).init("表情", "Exp", true, []),
      );
    }

    return model;
  },
  async firmUpAsync(model, log) {
    const upperY = 10.1;
    const lowerY = 7.25;
    const lowerScale = 0.7;
    await log.progressAsync("頂点整形中...", model.vertices.length);
    for (const vertex of model.vertices) {
      if (lowerY <= vertex.position.y && vertex.position.y <= upperY) {
        const t = (vertex.position.y - upperY) / (lowerY - upperY);
        const scale = MyMath.lerp(lowerScale, 1, t);
        vertex.position = new Vector3(vertex.position.x * scale, vertex.position.y, vertex.position.z * scale);
      }
      await log.progressAsync();
    }
  },
  async scatterAsync(model, spaceSize, n, [minScale, maxScale], log) {
    const stones = _.zip([...model.materials], [...model.bones]).map(([material, bone]) => {
      const vertices = [...new Set(_.flatMap([...material.faces], face => face.getVertexNodes()))];
      const uuidToIndex = new Map(vertices.map((vertex, i) => [vertex.getUUID(), i]));
      const faces = material.faces.map(face => face.vertexUUIDs.map(uuid => uuidToIndex.get(uuid)));
      return {
        vertices: vertices.map(vertex => ({
          position: vertex.position.subtract(bone.position),
          normal: vertex.normal,
          uv: vertex.uv,
        })),
        faces
      };
    });
    const weight = model.createNode(ExtendedPMX.Vertex.Weight.BDEF1).init([
      model.createNode(ExtendedPMX.Vertex.Weight.Bone).init(model.bones.head(), 1)
    ]);
    model.vertices.clear();
    await log.progressAsync("岩作成中...", n);
    for (let i = 0; i < n; i++) {
      const logMinScale = Math.log(minScale);
      const logMaxScale = Math.log(maxScale);
      const scale = Math.exp(logMinScale + Math.random() * (logMaxScale - logMinScale));
      const origin = new Vector3((Math.random() - 0.5) * spaceSize, (Math.random() - 0.5) * spaceSize, (Math.random() - 0.5) * spaceSize);
      const rotation = Quaternion.random();
      const stone = stones[Math.floor(Math.random() * stones.length)];
      const vertices = stone.vertices.map(vertex => model.createNode(ExtendedPMX.Vertex).init(
        rotation.rotate(vertex.position.multiply(scale)).add(origin),
        rotation.rotate(vertex.normal),
        vertex.uv,
        [],
        weight.clone(),
        0
      ));
      for (const vertex of vertices) {
        model.vertices.push(vertex);
      }
      const faces = stone.faces.map(indices => model.createNode(ExtendedPMX.Material.Face).init(indices.map(index => vertices[index].getUUID())))
      for (const face of faces) {
        model.materials.head().faces.push(face);
      }
      await log.progressAsync();
    }
    for (const material of [...model.materials].slice(1)) {
      model.materials.delete(material);
    }
    for (const bone of [...model.bones].slice(1)) {
      model.bones.delete(bone);
    }
    return model;
  },
  async transformAsync(unifiedModel, log) {
    await log.appendAsync("改名中...");
    unifiedModel.model.info.japaneseName = "素体ちゃん1号";
    unifiedModel.model.info.englishName = "Body-chan No.1";

    await log.appendAsync("ボーン位置修正中...");
    for (const bone of unifiedModel.model.bones) {
      bone.position = Quaternion.fromToRotation(new Vector3(0, 0, 1), new Vector3(0, 1, 0)).rotate(bone.position).divide(100);
    }

    await log.appendAsync("スケール変更中...");
    unifiedModel.model.changeScale(10);

    await log.appendAsync("ボーン名変更中...");
    const boneNameMap = new Map([
      ["hip", "センター"],
      ["abdomenUpper", "上半身"],
      ["neckLower", "首"],
      ["head", "頭"],
      ["lEye", "左目"],
      ["rEye", "右目"],
      ["lShldrBend", "左腕"],
      ["lShldrTwist", "左腕捩"],
      ["lForearmBend", "左ひじ"],
      ["lForearmTwist", "左手捩"],
      ["lHand", "左手首"],
      ["rShldrBend", "右腕"],
      ["rShldrTwist", "右腕捩"],
      ["rForearmBend", "右ひじ"],
      ["rForearmTwist", "右手捩"],
      ["rHand", "右手首"],
      ["lThumb1", "左親指０"],
      ["lThumb2", "左親指１"],
      ["lThumb3", "左親指２"],
      ["lIndex1", "左人指１"],
      ["lIndex2", "左人指２"],
      ["lIndex3", "左人指３"],
      ["lMid1", "左中指１"],
      ["lMid2", "左中指２"],
      ["lMid3", "左中指３"],
      ["lRing1", "左薬指１"],
      ["lRing2", "左薬指２"],
      ["lRing3", "左薬指３"],
      ["lPinky1", "左小指１"],
      ["lPinky2", "左小指２"],
      ["lPinky3", "左小指３"],
      ["rThumb1", "右親指０"],
      ["rThumb2", "右親指１"],
      ["rThumb3", "右親指２"],
      ["rIndex1", "右人指１"],
      ["rIndex2", "右人指２"],
      ["rIndex3", "右人指３"],
      ["rMid1", "右中指１"],
      ["rMid2", "右中指２"],
      ["rMid3", "右中指３"],
      ["rRing1", "右薬指１"],
      ["rRing2", "右薬指２"],
      ["rRing3", "右薬指３"],
      ["rPinky1", "右小指１"],
      ["rPinky2", "右小指２"],
      ["rPinky3", "右小指３"],
      ["pelvis", "下半身"],
      ["lThighBend", "左足"],
      ["lShin", "左ひざ"],
      ["lFoot", "左足首"],
      ["rThighBend", "右足"],
      ["rShin", "右ひざ"],
      ["rFoot", "右足首"],
    ]);
    const boneUUIDMap = new Map(unifiedModel.model.bones.map(bone => [bone.japaneseName, bone.getUUID()]));
    for (const bone of unifiedModel.model.bones) {
      if (boneNameMap.has(bone.japaneseName)) {
        bone.englishName = bone.japaneseName;
        bone.japaneseName = boneNameMap.get(bone.japaneseName);
      }
    }

    await log.appendAsync("ボーンを表示枠に登録中...");
    unifiedModel.model.displayElementGroups.push(
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("Root", "Root", true, [
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("hip")),
      ]),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("表情", "Exp", true, []),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("ＩＫ", "IK", false, []),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("体（上）", "Body[u]", false, [
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("abdomenUpper")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("neckLower")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("head")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lEye")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rEye")),
      ]),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("腕", "Arms", false, [
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lShldrBend")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lShldrTwist")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lForearmBend")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lForearmTwist")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lHand")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rShldrBend")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rShldrTwist")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rForearmBend")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rForearmTwist")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rHand")),
      ]),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("指", "Fingers", false, [
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lThumb1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lThumb2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lThumb3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lIndex1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lIndex2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lIndex3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lMid1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lMid2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lMid3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lRing1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lRing2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lRing3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lPinky1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lPinky2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lPinky3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rThumb1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rThumb2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rThumb3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rIndex1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rIndex2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rIndex3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rMid1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rMid2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rMid3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rRing1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rRing2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rRing3")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rPinky1")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rPinky2")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rPinky3")),
      ]),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("体（下）", "Body[l]", false, [
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("pelvis")),
      ]),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init("足", "Legs", false, [
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lThighBend")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lShin")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("lFoot")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rThighBend")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rShin")),
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", boneUUIDMap.get("rFoot")),
      ]),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init(
        "その他",
        "Others",
        false,
        [...boneUUIDMap]
          .filter(([boneName, i]) => !boneNameMap.has(boneName))
          .map(([boneName, uuid]) => unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", uuid))
      ),
    );

    await log.appendAsync("不要マテリアル削除中...");
    for (const material of [...unifiedModel.model.materials]) {
      switch (material.japaneseName) {
      case "Anus.001":
      case "Labia Minora.001":
      case "Torso":
      case "Torso.004":
      case "Vagina&Rectum.001":
        unifiedModel.model.materials.delete(material);
        break;
      }
    }

    await log.appendAsync("マテリアル名変更中...");
    {
      const torso = unifiedModel.model.materials.find(material => material.japaneseName === "Torso.003");
      const torso1 = unifiedModel.model.materials.find(material => material.japaneseName === "Torso.001");
      const torso2 = unifiedModel.model.materials.find(material => material.japaneseName === "Torso.002");
      torso.japaneseName = "Torso";
      torso1.japaneseName = "Torso.001";
      torso2.japaneseName = "Torso.002";
    }

    await log.appendAsync("不要モーフ削除中...");
    for (const morph of [...unifiedModel.model.morphs]) {
      if (morph.japaneseName.startsWith("Genesis3Female__eCTRL")) {
        morph.japaneseName = morph.japaneseName.replace(/^Genesis3Female__eCTRL/, "");
      } else {
        unifiedModel.model.morphs.delete(morph);
      }
    }

    await log.appendAsync("モーフのパネル変更中...");
    for (const morph of unifiedModel.model.morphs) {
      if (morph.japaneseName.startsWith("v") || morph.japaneseName.startsWith("Mouth")) {
        morph.panel = "mouth";
      } else if (morph.japaneseName.startsWith("Eye")) {
        morph.panel = "eyes";
      }
    }

    await log.appendAsync("モーフ改名中...");
    const morphNameMap = new Map([
      ["EyesClosed", "まばたき"],
      ["EyesClosedL", "まばたき左"],
      ["EyesClosedR", "まばたき右"],
      ["vAA", "あ"],
      ["vIY", "い"],
      ["vUW", "う"],
      ["vEE", "え"],
      ["vT", "お"],
      ["vM", "ん"],
    ]);
    for (const morph of unifiedModel.model.morphs) {
      if (morphNameMap.has(morph.japaneseName)) {
        morph.englishName = morph.japaneseName;
        morph.japaneseName = morphNameMap.get(morph.japaneseName);
      }      
    }

    await log.appendAsync("モーフを表示枠に登録中...");
    const exp = unifiedModel.model.displayElementGroups.find(displayElementGroup => displayElementGroup.japaneseName === "表情");    
    for (const morph of [...unifiedModel.model.morphs.sortBy(morph => morph.japaneseName)]) {
      exp.elements.push(
        unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("morph", morph.getUUID()),
      );
    }

    await log.appendAsync("マテリアル編集中...");
    unifiedModel.model.materials.delete(unifiedModel.model.materials.find(material => material.japaneseName === "Cornea"));
    unifiedModel.model.materials.delete(unifiedModel.model.materials.find(material => material.japaneseName === "EyeMoisture"));
    unifiedModel.model.materials.move(unifiedModel.model.materials.find(material => material.japaneseName === "EyeSocket"), Infinity);
    unifiedModel.model.materials.move(unifiedModel.model.materials.find(material => material.japaneseName === "Eyelashes"), Infinity);

    await log.appendAsync("足IK追加中...");
    const leftAnkle = unifiedModel.model.bones.find(bone => bone.japaneseName === "左足首");
    const leftKnee = unifiedModel.model.bones.find(bone => bone.japaneseName === "左ひざ");
    const leftThighTwist = unifiedModel.model.bones.find(bone => bone.japaneseName === "lThighTwist");
    const leftFoot = unifiedModel.model.bones.find(bone => bone.japaneseName === "左足");
    const leftIK = leftAnkle.clone();
    leftIK.japaneseName = "左足ＩＫ";
    leftIK.englishName = "leg IK_L";
    leftIK.parentBoneUUID = null; 
    leftIK.ikInfo = unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo).init(leftAnkle.getUUID(), 40, 2, [
      unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo.Link).init(leftKnee.getUUID(), new Vector3(-Math.PI, 0, 0), new Vector3(-Math.PI / 360, 0, 0)),
      unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo.Link).init(leftThighTwist.getUUID(), Vector3.zero, Vector3.zero),
      unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo.Link).init(leftFoot.getUUID(), null, null),
    ]);
    unifiedModel.model.bones.splice(leftAnkle, -0, leftIK);
    const rightAnkle = unifiedModel.model.bones.find(bone => bone.japaneseName === "右足首");
    const rightKnee = unifiedModel.model.bones.find(bone => bone.japaneseName === "右ひざ");
    const rightThighTwist = unifiedModel.model.bones.find(bone => bone.japaneseName === "rThighTwist");
    const rightFoot = unifiedModel.model.bones.find(bone => bone.japaneseName === "右足");
    const rightIK = rightAnkle.clone();
    rightIK.japaneseName = "右足ＩＫ";
    rightIK.englishName = "leg IK_R";
    rightIK.parentBoneUUID = null;
    rightIK.ikInfo = unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo).init(rightAnkle.getUUID(), 40, 2, [
      unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo.Link).init(rightKnee.getUUID(), new Vector3(-Math.PI, 0, 0), new Vector3(-Math.PI / 360, 0, 0)),
      unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo.Link).init(rightThighTwist.getUUID(), Vector3.zero, Vector3.zero),
      unifiedModel.model.createNode(UnifiedPMX.Model.Bone.IKInfo.Link).init(rightFoot.getUUID(), null, null),
    ]);
    unifiedModel.model.bones.splice(rightAnkle, -0, rightIK);
    unifiedModel.model.displayElementGroups.find(displayElementGroup => displayElementGroup.japaneseName === "ＩＫ").elements.push(
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", leftIK.getUUID()),
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", rightIK.getUUID()),
    );

    await log.appendAsync("全ての親追加中...");
    unifiedModel.model.addMasterBone();

    await this.makeFeetDirtyAsync(
      unifiedModel.model.materials.find(material => material.japaneseName === "Legs"),
      [0.08, 0.064],
      await ImageWrapper.importAsync("resources/RyZeGUF_legsB_1003.jpg"),
      [64, 108],
      Color.rgb(96, 0, 0),
      log
    );

    await unifiedModel.model.subdivideSurfaceAsync(1, [...unifiedModel.model.materials.filter(material => material.japaneseName !== "Eyelashes")], log);

    const footHeightmap = await this.generateFootHeightmapAsync(
      unifiedModel.model.materials.find(material => material.japaneseName === "Legs"),
      0.08,
      640,
      log
    );

    await this.generateEyelashesAsync(
      unifiedModel,
      Color.rgb(54, 141, 194),
      log
    );

    await log.appendAsync("不要マテリアル削除中...");
    unifiedModel.model.materials.delete(unifiedModel.model.materials.find(material => material.japaneseName === "Eyelashes"));
    unifiedModel.model.materials.delete(unifiedModel.model.materials.find(material => material.japaneseName === "EyeSocket"));

    await log.appendAsync("単独頂点削除中...");
    unifiedModel.model.removeOrphanVertices();

    await log.appendAsync("スケール変更中...");
    unifiedModel.model.changeScale(1000);

    return {unifiedModel, footHeightmap};
  },
  async makeFeetDirtyAsync(footMaterial, [thresholdY, dirtyY], footBumpMap, [thresholdR, dirtyR], color, log = new TextAreaWrapper()) {
    const footImage = footMaterial.getTextureNode().getImage();
    const targetFootFaces = footMaterial.faces.filter(face => face.getVertexNodes().some(vertex => vertex.position.y <= thresholdY));
    await log.progressAsync("インデックス作成中...", targetFootFaces.length);
    const xyToFace = new Array(footImage.getCanvas().width).fill().map(() => new Array(footImage.getCanvas().height).fill(null));
    for (const face of targetFootFaces) {
      const xyTriangle = new Triangle2D(...face.getVertexNodes().map(
        vertex => new Vector2(vertex.uv.x * footImage.getCanvas().width - 0.5, vertex.uv.y * footImage.getCanvas().height - 0.5)
      ));
      const minX = Math.min(...xyTriangle.points.map(v => v.x));
      const maxX = Math.max(...xyTriangle.points.map(v => v.x));
      const minY = Math.min(...xyTriangle.points.map(v => v.y));
      const maxY = Math.max(...xyTriangle.points.map(v => v.y));
      for (let x = Math.max(0, Math.floor(minX)); x <= Math.min(Math.ceil(maxX), footImage.getCanvas().width); x++) {
        for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(Math.ceil(maxY), footImage.getCanvas().height); y++) {
          if (xyTriangle.contains(new Vector2(x, y))) xyToFace[x][y] = face;
        }
      }
      await log.progressAsync();
    }

    await log.progressAsync("プリレンダ中...", footImage.getCanvas().width);
    const xyToAlpha = new Array(footImage.getCanvas().width).fill().map(() => new Array(footImage.getCanvas().height).fill(null));
    for (let x = 0; x < footImage.getCanvas().width; x++) {
      for (let y = 0; y < footImage.getCanvas().height; y++) {
        if (xyToFace[x][y] === null) continue;
        const face = xyToFace[x][y];
        const uvTriangle = new Triangle2D(...face.getVertexNodes().map(vertex => vertex.uv));
        const uv = new Vector2((x + 0.5) / footImage.getCanvas().width, (y + 0.5) / footImage.getCanvas().height);
        const blendRates = uvTriangle.blendRates(uv);
        const xyzTriangle = new Triangle3D(...face.getVertexNodes().map(vertex => vertex.position));
        const globalPosition = _.zip(xyzTriangle.points, blendRates).map(([position, blendRate]) => position.multiply(blendRate)).reduce((sum, v) => sum.add(v), Vector3.zero);
        const bumpColor = footBumpMap.getPixel(x, y);
        xyToAlpha[x][y] = 0.8 * _.clamp((globalPosition.y - thresholdY) / (dirtyY - thresholdY), 0, 1) * _.clamp((bumpColor.red() - thresholdR) / (dirtyR - thresholdR), 0, 1);
      }
      await log.progressAsync();
    }

    await log.progressAsync("足のテクスチャ画像編集中...", footImage.getCanvas().width);
    for (let x = 0; x < footImage.getCanvas().width; x++) {
      for (let y = 0; y < footImage.getCanvas().height; y++) {
        let alpha = xyToAlpha[x][y];
        if (alpha === null) {
          const alphas = MyMath.cartesianProduct(_.rangeClosed(x - 1, x + 1), _.rangeClosed(y - 1, y + 1))
            .filter(([x2, y2]) => 0 <= x2 && x2 < footImage.getCanvas().width && 0 <= y2 && y2 < footImage.getCanvas().height)
            .map(([x2, y2]) => xyToAlpha[x2][y2])
            .filter(alpha2 => alpha2 !== null);
          if (alphas.length === 0) continue;
          alpha = alphas.reduce((sum, alpha2) => sum + alpha2, 0) / alphas.length;
        }
        footImage.updateCanvas((canvas, context) => {
          context.fillStyle = color.alpha(alpha).string();
          context.fillRect(x, y, 1, 1);
        });
      }
      await log.progressAsync();
    }
  },
  async generateFootHeightmapAsync(footMaterial, thresholdY, canvasSize, log = new TextAreaWrapper()) {
    await log.appendAsync("足のポリゴン作成中...");
    const halfUniverse = new HalfUniverse3D(new Plane(0, 1, 0, -thresholdY), new Vector3(0, -1, 0));
    const targetTriangles = _([...footMaterial.faces])
      .map(face => new Triangle3D(...face.getVertexNodes().map(vertex => vertex.position)))
      .filter(triangle => triangle.points[0].x < 0 && triangle.normal().y < 0)
      .map(triangle => triangle.subtract(halfUniverse))
      .filter(diff => diff.length > 0)
      .flatMap(([diff]) => diff.triangulate())
      .value();
    const footHeightmap = (canvas => {
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      return new ImageWrapper(canvas);
    })(document.createElement("canvas"));
    const {realToPixel, pixelToReal} = (() => {
      const minX = Math.min(..._(targetTriangles).flatMap(triangle => triangle.points).map(point => point.x).value());
      const maxX = Math.max(..._(targetTriangles).flatMap(triangle => triangle.points).map(point => point.x).value());
      const minY = Math.min(..._(targetTriangles).flatMap(triangle => triangle.points).map(point => point.y).value());
      const maxY = Math.max(..._(targetTriangles).flatMap(triangle => triangle.points).map(point => point.y).value());
      const minZ = Math.min(..._(targetTriangles).flatMap(triangle => triangle.points).map(point => point.z).value());
      const maxZ = Math.max(..._(targetTriangles).flatMap(triangle => triangle.points).map(point => point.z).value());
      const [fixedMinX, fixedMaxX, fixedMinZ, fixedMaxZ] = (() => {
        if (maxX - minX > maxZ - minZ) {
          return [minX, maxX, (minZ + maxZ) / 2 - (maxX - minX) / 2, (minZ + maxZ) / 2 + (maxX - minX) / 2];
        } else {
          return [(minX + maxX) / 2 - (maxZ - minZ) / 2, (minX + maxX) / 2 + (maxZ - minZ) / 2, minZ, maxZ];
        }
      })();
      return {
        realToPixel: {
          x: x => (x - fixedMinX) / (fixedMaxX - fixedMinX) * canvasSize - 0.5,
          y: y => (y - maxY) / (minY - maxY) * 255,
          z: z => (z - fixedMinZ) / (fixedMaxZ - fixedMinZ) * canvasSize - 0.5,
        },
        pixelToReal: {
          x: x => MyMath.lerp(fixedMinX, fixedMaxX, (x + 0.5) / canvasSize),
          y: y => MyMath.lerp(fixedMinZ, fixedMaxZ, (y + 0.5) / canvasSize),
          r: r => MyMath.lerp(maxY, minY, r / 255),
        },
      };
    })();

    await log.progressAsync("インデックス作成中...", targetTriangles.length);
    const xyToTriangle = new Array(canvasSize).fill().map(() => new Array(canvasSize).fill(null));
    for (const triangle of targetTriangles) {
      const pixelTriangle = new Triangle2D(...triangle.points.map(
        point => new Vector2(realToPixel.x(point.x), realToPixel.z(point.z))
      ));
      const minX = Math.min(...pixelTriangle.points.map(v => v.x));
      const maxX = Math.max(...pixelTriangle.points.map(v => v.x));
      const minY = Math.min(...pixelTriangle.points.map(v => v.y));
      const maxY = Math.max(...pixelTriangle.points.map(v => v.y));
      for (let x = Math.max(0, Math.floor(minX)); x <= Math.min(Math.ceil(maxX), canvasSize - 1); x++) {
        for (let y = Math.max(0, Math.floor(minY)); y <= Math.min(Math.ceil(maxY), canvasSize - 1); y++) {
          if (pixelTriangle.contains(new Vector2(x, y))) xyToTriangle[x][y] = triangle;
        }
      }
      await log.progressAsync();
    }

    await log.progressAsync("足のheightmap作成中...", canvasSize);
    for (let x = 0; x < canvasSize; x++) {
      for (let y = 0; y < canvasSize; y++) {
        if (xyToTriangle[x][y] === null) {
          footHeightmap.setPixel(x, y, Color.rgb(0, 0, 0));
          continue;
        }
        const triangle = xyToTriangle[x][y];
        const plane = triangle.plane();
        const r = realToPixel.y(-(plane.a * pixelToReal.x(x) + plane.c * pixelToReal.y(y) + plane.d) / plane.b);
        footHeightmap.setPixel(x, y, Color.rgb(r, r, r));
      }
      await log.progressAsync();
    }

    return footHeightmap;
  },
  async generateEyelashesAsync(unifiedModel, eyelashColor, log = new TextAreaWrapper()) {
    await log.appendAsync("睫毛テクスチャ作成中...");
    const hairMaterial = unifiedModel.addHairMaterial(eyelashColor);

    const eyelashesMaterial = unifiedModel.model.materials.find(material => material.japaneseName === "Eyelashes");
    const faceMaterial = unifiedModel.model.materials.find(material => material.japaneseName === "Face");
    const lineSegmentMap = new Map();
    await log.progressAsync("睫毛と顔の共通部分計算中...", eyelashesMaterial.faces.length * faceMaterial.faces.length);
    for (const face1 of eyelashesMaterial.faces) {
      const triangle1 = new Triangle3D(...face1.getVertexNodes().map(vertex => vertex.position));
      for (const face2 of faceMaterial.faces) {
        const triangle2 = new Triangle3D(...face2.getVertexNodes().map(vertex => vertex.position));
        const intersections = triangle1.intersection(triangle2);
        if (intersections.length === 1 && intersections[0] instanceof DirectedLineSegment3D) {
          lineSegmentMap.set(intersections[0], [face1, face2]);
        }
        await log.progressAsync();
      }
    }

    const curves = DirectedLineSegment3DUtils.connect([...lineSegmentMap.keys()]).curves
      .map(curve => Math.abs(curve[0].p1.x) < Math.abs(curve[curve.length - 1].p2.x) ? curve : curve.reverse());
    const vertexCurves = curves.map(curve => {
      const faces = curve.map(lineSegment => lineSegmentMap.get(lineSegment));
      const vertices = _.flatMap(curve, (lineSegment, lineSegmentIndex) =>
        [lineSegment.p1, lineSegment.p2].map(point =>
          faces[lineSegmentIndex].map(face => {
            const triangle = new Triangle3D(...face.getVertexNodes().map(vertex => vertex.position));
            const blendRates = triangle.blendRates(point);
            return unifiedModel.model.materializeVirtualVertex(_.zip(face.getVertexNodes(), blendRates));
          })
        )
      );
      const combinedVertices = [vertices[0]].concat(
        _.range(1, vertices.length - 1, 2).map(i1 => _.range(2).map(j => unifiedModel.model.mergeVertices([vertices[i1][j], vertices[i1 + 1][j]]))),
        [vertices[vertices.length - 1]]
      );
      return {
        vertexCurve: _.range(curve.length).map(i => ({
          length: combinedVertices[i + 1][0].position.subtract(combinedVertices[i][0].position).norm(),
          eyelashes: {
            face: faces[i][0],
            vertex1: combinedVertices[i][0],
            vertex2: combinedVertices[i + 1][0]
          },
          face: {
            face: faces[i][1],
            vertex1: combinedVertices[i][1],
            vertex2: combinedVertices[i + 1][1]
          }
        })).reduce((arr, {length, eyelashes, face}) => {
          arr.push({
            offset: arr.length > 0 ? arr[arr.length - 1].offset + arr[arr.length - 1].length : 0,
            length, eyelashes, face
          });
          return arr;
        }, []),
        avgPosition: combinedVertices.map(([eyelashesVertex]) => eyelashesVertex.position).reduce((sum, v) => sum.add(v), Vector3.zero).divide(combinedVertices.length),
      };
    });
    for (const group of _(vertexCurves).groupBy(({avgPosition}) => avgPosition.x > 0).map(_.identity).value()) {
      const sortedGroup1 = _(group)
        .sortBy(({vertexCurve}) => vertexCurve[vertexCurve.length - 1].offset + vertexCurve[vertexCurve.length - 1].length)
        .value();
      const sortedGroup2 = _(sortedGroup1)
        .slice(-4)
        .sortBy(({avgPosition}) => avgPosition.y)
        .value();
      for (const element of sortedGroup1.slice(0, -4)) {
        element.order = null;
      }
      sortedGroup2[0].order = 0;
      sortedGroup2[1].order = 1;
      sortedGroup2[2].order = 2;
      sortedGroup2[3].order = 3;
    }

    await log.progressAsync("睫毛作成中...", (() => {
      let loopCount = 0;
      for (const {vertexCurve, order} of vertexCurves) {
        if (order === null) continue;
        const totalLength = vertexCurve[vertexCurve.length - 1].offset + vertexCurve[vertexCurve.length - 1].length;
        for (let currentOffset = order % 2 === 0 ? 0 : 0.00038 / 0.08 / 2; currentOffset < totalLength; currentOffset += 0.00038 / 0.08) {
          loopCount++;
        }
      }
      return loopCount;
    })());
    for (const {vertexCurve, order} of vertexCurves) {
      if (order === null) continue;
      const totalLength = vertexCurve[vertexCurve.length - 1].offset + vertexCurve[vertexCurve.length - 1].length;
      const f = p => (p <= 0.7 ? MyMath.lerp(0.25, 1, Easing.easeOutCubic(p, 0, 1, 0.6)) : MyMath.lerp(1, 0.25, Easing.easeInCubic(p - 0.6, 0, 1, 0.4))) * (order < 2 ? 0.3 : 1);
      for (let currentOffset = order % 2 === 0 ? 0 : 0.00038 / 0.08 / 2; currentOffset < totalLength; currentOffset += 0.00038 / 0.08) {
        const {offset, length, eyelashes, face} = _(vertexCurve).filter(({offset}) => offset <= currentOffset).last();
        const t = (currentOffset - offset) / length;
        const eyelashesVertex = unifiedModel.model.createVirtualVertex([[eyelashes.vertex1, 1 - t], [eyelashes.vertex2, t]]).toVertex();
        const faceVertex = unifiedModel.model.materializeVirtualVertex([[face.vertex1, 1 - t], [face.vertex2, t]]);
        const positionOrigin = faceVertex.position;
        const [intersection] = Plane.through(positionOrigin, positionOrigin.add(eyelashesVertex.normal), positionOrigin.add(faceVertex.normal))
          .intersection(Plane.through(...eyelashes.face.getVertexNodes().map(vertex => vertex.position)));

        const targetVertices = eyelashes.face.getVertexNodes().concat(face.face.getVertexNodes()).concat(faceVertex);
        const vertexAndMorphToPosition = unifiedModel.model.createVertexMorphDictionary(targetVertices);
        const morphInfo = new Map([...vertexAndMorphToPosition(faceVertex).keys()].map(morph => {
          const oldEyelashesPositions = eyelashes.face.getVertexNodes().map(vertex => vertex.position);
          const newEyelashesPositions = eyelashes.face.getVertexNodes().map(vertex => vertexAndMorphToPosition(vertex, morph));
          const oldFacePositions = face.face.getVertexNodes().map(vertex => vertex.position);
          const newFacePositions = face.face.getVertexNodes().map(vertex => vertexAndMorphToPosition(vertex, morph));
          const eyelashesQuaternion = Quaternion.fromToRotation(Plane.through(...oldEyelashesPositions).normal(), Plane.through(...newEyelashesPositions).normal());
          const faceQuaternion = Quaternion.fromToRotation(Plane.through(...oldFacePositions).normal(), Plane.through(...newFacePositions).normal());
          const newEyelashesVertexNormal = eyelashesQuaternion.rotate(eyelashesVertex.normal);
          const newFaceVertexNormal = faceQuaternion.rotate(faceVertex.normal);
          const newPositionOrigin = vertexAndMorphToPosition(faceVertex, morph);
          const [newIntersection] = Plane.through(newPositionOrigin, newPositionOrigin.add(newEyelashesVertexNormal), newPositionOrigin.add(newFaceVertexNormal))
            .intersection(Plane.through(...newEyelashesPositions));
          return [morph, {positionOrigin: newPositionOrigin, normalOrigin: newIntersection.d.z < 0 ? newIntersection.d : newIntersection.d.negate()}];
        }));

        unifiedModel.model.addHair(
          hairMaterial,
          positionOrigin,
          intersection.d.z < 0 ? intersection.d : intersection.d.negate(),
          new Array(4).fill(Quaternion.angleAxis(order < 2 ? -Math.PI / 12 : Math.PI / 12, new Vector3(1, 0, 0))),
          0.00004 / 0.08,
          0.0068 / 0.08 * f(currentOffset / totalLength),
          5,
          faceVertex.weight.clone(),
          true,
          morphInfo,
        );
        
        await log.progressAsync();
      }
    }
  },
  async createHairsAsync(hairColor, width, height, log = new TextAreaWrapper()) {
    const unifiedModel = UnifiedPMX.createEmptyModel();
    unifiedModel.model.info.japaneseName = "毛";
    unifiedModel.model.info.englishName = "hairs";
    unifiedModel.model.info.japaneseComment = "ライセンス: CC0";
    unifiedModel.model.info.englishComment = "License: CC0";
    const material = unifiedModel.addHairMaterial(hairColor);
    const weight = unifiedModel.model.createNode(UnifiedPMX.Model.Vertex.Weight.BDEF1).init([
      unifiedModel.model.createNode(UnifiedPMX.Model.Vertex.Weight.Bone).init(unifiedModel.model.bones.head(), 1)
    ]);
    await log.progressAsync("毛作成中...", width * height);
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < height; z++) {
        unifiedModel.model.addHair(material, new Vector3(
          (-3.65 * (width - 1) / 2 + 3.65 * x) * 0.08 / 1000,
          0,
          (-3.65 * (height - 1) / 2 + 3.65 * z) * 0.08 / 1000
        ), new Vector3(0, 1, 0), new Array(10).fill().map(() => {
          const theta = (0.35 + Math.random() * 0.3) * Math.PI * 2;
          return Quaternion.angleAxis((0.85 + Math.random() * 0.3) * 3 * Math.PI / 180, new Vector3(Math.cos(theta), 0, Math.sin(theta)));
        }), 0.00004 / 0.08, 0.10 / 0.08, 4, weight, false, new Map());
        await log.progressAsync();
      }
    }

    await log.appendAsync("スケール変更中...");
    unifiedModel.model.changeScale(1000);    

    return unifiedModel;
  },
  async createHairAsync(hairColor, log = new TextAreaWrapper()) {
    const unifiedModel = UnifiedPMX.createEmptyModel();
    unifiedModel.model.info.japaneseName = "毛";
    unifiedModel.model.info.englishName = "hair";
    unifiedModel.model.info.japaneseComment = "ライセンス: CC0";
    unifiedModel.model.info.englishComment = "License: CC0";
    const material = unifiedModel.addHairMaterial(hairColor);
    for (let i = 0; i < 100; i++) {
      const bone = unifiedModel.model.createNode(UnifiedPMX.Model.Bone).init(
        `ボーン${i + 1}`,
        `bone ${i + 1}`,
        new Vector3(0, 0.10 / 0.08 / 100 * (i + 1), 0),
        unifiedModel.model.bones.tail().getUUID(),
        0,
        Vector3.zero,
        true,
        false,
        true,
        true,
        null,
        0,
        false,
        false,
        null,
        null,
        null,
        false,
        null
      );
      unifiedModel.model.bones.push(bone);
    }
    const weights = [].concat(...unifiedModel.model.bones.map(bone => new Array(6).fill().map(() => unifiedModel.model.createNode(UnifiedPMX.Model.Vertex.Weight.BDEF1).init([
      unifiedModel.model.createNode(UnifiedPMX.Model.Vertex.Weight.Bone).init(bone.getUUID(), 1)
    ]))));
    unifiedModel.model.addHair(material, Vector3.zero, new Vector3(0, 1, 0), new Array(100).fill(Quaternion.identity), 0.00004 / 0.08, 0.10 / 0.08, 5, weights[0], false, new Map());
    unifiedModel.model.vertices.forEach((vertex, i) => {
      if (i >= 6) vertex.weight = weights[i];
    });
    unifiedModel.model.displayElementGroups.push(
      unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup).init(
        "ボーン",
        "Bones",
        false,
        unifiedModel.model.bones.slice(unifiedModel.model.bones.head(), false, Infinity)
          .map(bone => unifiedModel.model.createNode(UnifiedPMX.Model.DisplayElementGroup.DisplayElement).init("bone", bone.getUUID()))
      )
    );

    unifiedModel.model.changeScale(100);

    return unifiedModel;
  },
  async renderAsync(container, unifiedModel) {
    while (container.childElementCount > 0) {
      container.removeChild(container.firstChild);
    }

    const width = 640;
    const height = 480;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.z = 30;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.add(new THREE.AmbientLight(0x666666));
    scene.add((() => {
      const directionalLight = new THREE.DirectionalLight(0x887766);
      directionalLight.position.set(-1, 1, 1).normalize();
      return directionalLight;
    })());

    const effect = (() => {
      const renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(width, height);
      container.appendChild(renderer.domElement);
      return new THREE.OutlineEffect(renderer);
    })();

    const helper = new THREE.MMDHelper();
    {
      const mesh = await unifiedModel.createThreeMeshAsync();
      mesh.position.y = -10;
      scene.add(mesh);
      helper.add(mesh);
      helper.setAnimation(mesh);
      helper.setPhysics(mesh);
      helper.unifyAnimationDuration({afterglow: 2.0});
    }

    const clock = new THREE.Clock();

    (function animate() {
      setTimeout(animate, 1000);
      helper.animate(clock.getDelta());
      effect.render(scene, camera);
    })();
  },
  async brushUpFingerprintAsync(image, thresholdDistance, log) {
    class Pixel {
      constructor(position) {
        this.position = position;
        this.links = [];
      }
      distance() {
        return Math.sqrt(this.squaredDistance());
      }
      squaredDistance() {
        return this.links.length > 0 ? this.links[0].squaredDistance() : Infinity;
      }
      createLink(origin) {
        return new Link(this, origin);
      }
      registerAsOrigin() {
        this.links = [this.createLink(this)];
      }
      addLink(neighborhood, difference) {
        const currentSquaredDistance = this.squaredDistance();
        if (currentSquaredDistance === 0) return;

        const origins = neighborhood.links.map(link => ({origin: link.origin, squaredDistance: this.position.subtract(link.origin.position).squaredNorm()}));
        const minSquaredDistance = Math.min(...origins.map(({squaredDistance}) => squaredDistance));
        const nearestOrigins = origins.filter(({squaredDistance}) => squaredDistance === minSquaredDistance).map(({origin}) => origin);
        if (minSquaredDistance < currentSquaredDistance) {
          this.links = nearestOrigins.map(origin => this.createLink(origin));
        } else if (minSquaredDistance === currentSquaredDistance) {
          this.links = [...new Set(this.links.map(link => link.origin).concat(nearestOrigins))].map(origin => this.createLink(origin));
        }
      }
    }
    class Link {
      constructor(pixel, origin) {
        this.pixel = pixel;
        this.origin = origin;
      }
      difference() {
        return this.pixel.position.subtract(this.origin.position);
      }
      distance() {
        return Math.sqrt(this.squaredDistance());
      }
      squaredDistance() {
        return this.difference().squaredNorm();
      }
    }

    async function createPixels(phase) {
      await log.appendAsync("データ準備中...");
      const data = new Array(image.getWidth()).fill().map((_, x) => new Array(image.getHeight()).fill().map((_, y) => new Pixel(new Vector2(x, y))));
      for (let x = 0; x < image.getWidth(); x++) {
        for (let y = 0; y < image.getHeight(); y++) {
          if (image.getPixel(x, y).red() === {canyon: 255, ridge: 0}[phase]) {
            data[x][y].registerAsOrigin();
          }
        }
      }

      let leftPixels = _.flatten(data);
      while (leftPixels.length > 0) {
        const minSquaredDistance = leftPixels.map(pixel => pixel.squaredDistance()).reduce((min, d2) => Math.min(min, d2), Infinity);
        if (phase === "canyon" && minSquaredDistance > thresholdDistance ** 2) break;
        if (phase === "canyon") {
          await log.appendAsync(`d^2 = ${minSquaredDistance} 処理中...`);
        } else if (phase === "ridge") {
          await log.appendAsync(`d^2 = ${minSquaredDistance} 処理中...（残ピクセル数: ${leftPixels.length}）`);
        }
        for (const neighborhood of leftPixels.filter(pixel => pixel.squaredDistance() === minSquaredDistance)) {
          for (const difference of [new Vector2(-1, 0), new Vector2(1, 0), new Vector2(0, -1), new Vector2(0, 1)]) {
            const {x, y} = neighborhood.position.add(difference);
            if (0 <= x && x < image.getWidth() && 0 <= y && y < image.getHeight()) {
              data[x][y].addLink(neighborhood, difference);
            }
          }
        }
        leftPixels = leftPixels.filter(pixel => pixel.squaredDistance() > minSquaredDistance);
      }

      return _.flatten(data);
    }

    const canyonPixels = await createPixels("canyon");
    const ridgePixelsWithDistances = (await createPixels("ridge")).map(pixel => ({pixel, distance: pixel.distance()}));

    await log.progressAsync("描画処理（第一段階）中...", image.getWidth() * image.getHeight());
    for (const pixel of canyonPixels) {
      const distance = pixel.distance();
      if (distance > 0) {
        const height = MyMath.lerp(191, 0, _.clamp(distance / thresholdDistance, 0, 1));
        image.setPixel(pixel.position.x, pixel.position.y, Color.rgb(height, height, height));
      }
      await log.progressAsync();
    }

    await log.progressAsync("描画処理（第二段階）中...", image.getWidth() * image.getHeight());
    const maxDistance = ridgePixelsWithDistances.map(({distance}) => distance).reduce((max, d) => Math.max(max, d), -Infinity);
    for (const {pixel, distance} of ridgePixelsWithDistances) {
      if (distance > 0) {
        const height = MyMath.lerp(191, 255, _.clamp(distance / maxDistance, 0, 1));
        image.setPixel(pixel.position.x, pixel.position.y, Color.rgb(height, height, height));
      }
      await log.progressAsync();
    }

    return image;
  },
  async tmpAsync(model, heightmap, log) {
    await model.subdivideSurfaceAsync(5, [...model.materials], log);
    await log.appendAsync("メッシュ情報取得中...");
    const meshInfo = model.createMeshInfo();
    await log.progressAsync("UV補正中...", model.vertices.length);
    for (const vertex of model.vertices) {
      vertex.normal = meshInfo.getFacesFrom(vertex, true)
        .map(face => Plane.through(...face.getVertexNodes().map(vertex => vertex.position)).normal())
        .reduce((sum, v) => sum.add(v), Vector3.zero)
        .normalize();
      await log.progressAsync();
    }
    await log.progressAsync("頂点移動中...", model.vertices.length);
    for (const vertex of model.vertices) {
      const height = heightmap.getColorByUV(vertex.uv.x, vertex.uv.y).red();
      vertex.position = vertex.position.add(vertex.normal.multiply(1000 * (0.0001 / 0.08) * (height / 255 - 0.5)));
      await log.progressAsync();
    }
    await log.progressAsync("UV補正中...", model.vertices.length);
    for (const vertex of model.vertices) {
      vertex.normal = meshInfo.getFacesFrom(vertex, true)
        .map(face => Plane.through(...face.getVertexNodes().map(vertex => vertex.position)).normal())
        .reduce((sum, v) => sum.add(v), Vector3.zero)
        .normalize();
      await log.progressAsync();
    }
    model.changeScale(100);
  },
};
