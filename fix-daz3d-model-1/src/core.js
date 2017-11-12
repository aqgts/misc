import PMX from "../lib/aqgts-lib/src/pmx";
import Vector3 from "../lib/aqgts-lib/src/vector3";
import Quaternion from "../lib/aqgts-lib/src/quaternion";

export default {
  run(modelBinary, isHuman) {
    const model = PMX.read(modelBinary);
    for (const bone of model.bones) {
      bone.position = Quaternion.fromToRotation(new Vector3(0, 0, 1), new Vector3(0, 1, 0)).rotate(bone.position).divide(100);
    }

    if (isHuman) {
      const nameMap = new Map([
        ["Genesis3Female", "全ての親"],
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
      const boneIndexMap = new Map(model.bones.map((bone, i) => [bone.japaneseName, i]));
      for (const bone of model.bones) {
        if (nameMap.has(bone.japaneseName)) {
          bone.englishName = bone.japaneseName;
          bone.japaneseName = nameMap.get(bone.japaneseName);
        }
      }
      model.displayElementGroups.push(
        new PMX.DisplayElementGroup("Root", "Root", true, [
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("Genesis3Female")),
        ]),
        new PMX.DisplayElementGroup("表情", "Exp", true, []),
        new PMX.DisplayElementGroup("体（上）", "Body[u]", false, [
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("abdomenUpper")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("neckLower")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("head")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lEye")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rEye")),
        ]),
        new PMX.DisplayElementGroup("腕", "Arms", false, [
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lShldrBend")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lShldrTwist")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lForearmBend")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lForearmTwist")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lHand")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rShldrBend")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rShldrTwist")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rForearmBend")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rForearmTwist")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rHand")),
        ]),
        new PMX.DisplayElementGroup("指", "Fingers", false, [
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lThumb1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lThumb2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lThumb3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lIndex1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lIndex2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lIndex3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lMid1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lMid2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lMid3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lRing1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lRing2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lRing3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lPinky1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lPinky2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lPinky3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rThumb1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rThumb2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rThumb3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rIndex1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rIndex2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rIndex3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rMid1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rMid2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rMid3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rRing1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rRing2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rRing3")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rPinky1")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rPinky2")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rPinky3")),
        ]),
        new PMX.DisplayElementGroup("体（下）", "Body[l]", false, [
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("pelvis")),
        ]),
        new PMX.DisplayElementGroup("足", "Legs", false, [
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lThighBend")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lShin")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("lFoot")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rThighBend")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rShin")),
          new PMX.DisplayElementGroup.DisplayElement("bone", boneIndexMap.get("rFoot")),
        ]),
        new PMX.DisplayElementGroup("その他", "Others", false, Array.from(boneIndexMap).filter(([boneName, i]) => !nameMap.has(boneName)).map(([boneName, i]) =>
          new PMX.DisplayElementGroup.DisplayElement("bone", i)
        ))
      );
    } else {
      model.displayElementGroups.push(
        new PMX.DisplayElementGroup("Root", "Root", true, [
          new PMX.DisplayElementGroup.DisplayElement("bone", 0),
        ]),
        new PMX.DisplayElementGroup("表情", "Exp", true, []),
      );
    }
    return model.write();
  }
};
