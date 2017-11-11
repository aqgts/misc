import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Vector4 from "./vector4";
import Quaternion from "./quaternion";
import FunctionLikeBezierCurve from "./function-like-bezier-curve";
import SequentialAccessBinary from "./sequential-access-binary";

export default class PMM {
  constructor(header, models, camera, lighting, unknown) {
    this.header = header;
    this.models = models;
    this.camera = camera;
    this.lighting = lighting;
    this.unknown = unknown;
  }
  clone() {
    return new this.constructor(
      this.header.clone(),
      this.models.map(model => model.clone()),
      this.camera.clone(),
      this.lighting.clone(),
      this.unknown.slice()
    );
  }
  write() {
    const io = new PMM.SequentialAccessBinary();
    io.writeNullTerminatedString("Polygon Movie maker 0002", 30);
    this.header.write(io);
    io.writeUint8(this.models.length);
    for (const model of this.models) {
      model.write(io);
    }
    this.camera.write(io);
    this.lighting.write(io);
    io.writeUint8Array(this.unknown);
    return io.toUint8Array();
  }
  static read(binary) {
    const io = new this.SequentialAccessBinary(binary);
    if (io.readNullTerminatedString(30) !== "Polygon Movie maker 0002") throw new Error("Incompatible version.");
    const header = this.Header.read(io);
    const models = new Array(io.readUint8()).fill().map(() => this.Model.read(io));
    const camera = this.Camera.read(io);
    const lighting = this.Lighting.read(io);
    const unknown = io.readUint8Array(io.view.byteLength - io.offset);
    return new this(header, models, camera, lighting, unknown);
  }
}
PMM.SequentialAccessBinary = class SequentialAccessBinary extends SequentialAccessBinary {
  readVString() {
    const byteLength = this.readUint8();
    return this.readString(byteLength, "shift_jis");
  }
  writeVString(value) {
    const byteLength = new TextEncoder("shift_jis", {NONSTANDARD_allowLegacyEncoding: true}).encode(value).length;
    this.writeUint8(byteLength);
    this.writeString(value, "shift_jis");
  }
  readNullTerminatedString(byteLength) {
    return super.readNullTerminatedString(byteLength, "shift_jis");
  }
  writeNullTerminatedString(value, byteLength) {
    super.writeNullTerminatedString(value, byteLength, "shift_jis");
  }
}
PMM.Header = class Header {
  constructor(outputWidth, outputHeight, keyFrameEditorWidth, currentAngleOfView, isEditingCamera, isOpeningCameraPane, isOpeningLightingPane, isOpeningAccessoryPane, isOpeningBonePane, isOpeningMorphPane, isOpeningSelfShadowPane, selectingModelIndex) {
    this.outputWidth = outputWidth;
    this.outputHeight = outputHeight;
    this.keyFrameEditorWidth = keyFrameEditorWidth;
    this.currentAngleOfView = currentAngleOfView;
    this.isEditingCamera = isEditingCamera;
    this.isOpeningCameraPane = isOpeningCameraPane;
    this.isOpeningLightingPane = isOpeningLightingPane;
    this.isOpeningAccessoryPane = isOpeningAccessoryPane;
    this.isOpeningBonePane = isOpeningBonePane;
    this.isOpeningMorphPane = isOpeningMorphPane;
    this.isOpeningSelfShadowPane = isOpeningSelfShadowPane;
    this.selectingModelIndex = selectingModelIndex;
  }
  clone() {
    return new this.constructor(
      this.outputWidth,
      this.outputHeight,
      this.keyFrameEditorWidth,
      this.currentAngleOfView,
      this.isEditingCamera,
      this.isOpeningCameraPane,
      this.isOpeningLightingPane,
      this.isOpeningAccessoryPane,
      this.isOpeningBonePane,
      this.isOpeningMorphPane,
      this.isOpeningSelfShadowPane,
      this.selectingModelIndex
    );
  }
  write(io) {
    io.writeInt32(this.outputWidth);
    io.writeInt32(this.outputHeight);
    io.writeInt32(this.keyFrameEditorWidth);
    io.writeFloat32(this.currentAngleOfView * 180 / Math.PI);
    io.writeUint8(this.isEditingCamera ? 1 : 0);
    io.writeUint8(this.isOpeningCameraPane ? 1 : 0);
    io.writeUint8(this.isOpeningLightingPane ? 1 : 0);
    io.writeUint8(this.isOpeningAccessoryPane ? 1 : 0);
    io.writeUint8(this.isOpeningBonePane ? 1 : 0);
    io.writeUint8(this.isOpeningMorphPane ? 1 : 0);
    io.writeUint8(this.isOpeningSelfShadowPane ? 1 : 0);
    io.writeUint8(this.selectingModelIndex);
  }
  static read(io) {
    const outputWidth = io.readInt32();
    const outputHeight = io.readInt32();
    const keyFrameEditorWidth = io.readInt32();
    const currentAngleOfView = io.readFloat32() / 180 * Math.PI;
    const isEditingCamera = io.readUint8() !== 0;
    const isOpeningCameraPane = io.readUint8() !== 0;
    const isOpeningLightingPane = io.readUint8() !== 0;
    const isOpeningAccessoryPane = io.readUint8() !== 0;
    const isOpeningBonePane = io.readUint8() !== 0;
    const isOpeningMorphPane = io.readUint8() !== 0;
    const isOpeningSelfShadowPane = io.readUint8() !== 0;
    const selectingModelIndex = io.readUint8();
    return new this(outputWidth, outputHeight, keyFrameEditorWidth, currentAngleOfView, isEditingCamera, isOpeningCameraPane, isOpeningLightingPane, isOpeningAccessoryPane, isOpeningBonePane, isOpeningMorphPane, isOpeningSelfShadowPane, selectingModelIndex);
  }
};
PMM.Model = class Model {
  constructor(header, initialBoneKeyFrames, boneKeyFrames, initialMorphKeyFrames, morphKeyFrames, initialConfigKeyFrame, configKeyFrames, currentBoneStatus, currentMorphStatus, currentIKStatus, currentAttachmentStatus, footer) {
    this.header = header;
    this.initialBoneKeyFrames = initialBoneKeyFrames;
    this.boneKeyFrames = boneKeyFrames;
    this.initialMorphKeyFrames = initialMorphKeyFrames;
    this.morphKeyFrames = morphKeyFrames;
    this.initialConfigKeyFrame = initialConfigKeyFrame;
    this.configKeyFrames = configKeyFrames;
    this.currentBoneStatus = currentBoneStatus;
    this.currentMorphStatus = currentMorphStatus;
    this.currentIKStatus = currentIKStatus;
    this.currentAttachmentStatus = currentAttachmentStatus;
    this.footer = footer;
  }
  clone() {
    return new this.constructor(
      this.header.clone(),
      this.initialBoneKeyFrames.map(initialBoneKeyFrame => initialBoneKeyFrame.clone()),
      this.boneKeyFrames.map(boneKeyFrame => boneKeyFrame.clone()),
      this.initialMorphKeyFrmaes.map(initialMorphKeyFrame => initialMorphKeyFrame.clone()),
      this.morphKeyFrames.map(morphKeyFrame => morphKeyFrame.clone()),
      this.initialConfigKeyFrame.clone(),
      this.configKeyFrames.map(configKeyFrame => configKeyFrame.clone()),
      this.currentBoneStatus.map(currentBoneState => currentBoneState.clone()),
      this.currentMorphStatus.map(currentMorphState => currentMorphState.clone()),
      this.currentIKStatus.map(currentIKState => currentIKState.clone()),
      this.currentAttachmentStatus.map(currentAttachmentState => currentAttachementState.clone()),
      this.footer.clone()
    );
  }
  write(io) {
    this.header.write(io);
    for (const initialBoneKeyFrame of this.initialBoneKeyFrames) {
      initialBoneKeyFrame.write(io);
    }
    io.writeInt32(this.boneKeyFrames.length);
    for (const boneKeyFrame of this.boneKeyFrames) {
      boneKeyFrame.write(io);
    }
    for (const initialMorphKeyFrame of this.initialMorphKeyFrames) {
      initialMorphKeyFrame.write(io);
    }
    io.writeInt32(this.morphKeyFrames.length);
    for (const morphKeyFrame of this.morphKeyFrames) {
      morphKeyFrame.write(io);
    }
    this.initialConfigKeyFrame.write(io);
    io.writeInt32(this.configKeyFrames.length);
    for (const configKeyFrame of this.configKeyFrames) {
      configKeyFrame.write(io);
    }
    for (const currentBoneState of this.currentBoneStatus) {
      currentBoneState.write(io);
    }
    for (const currentMorphState of this.currentMorphStatus) {
      currentMorphState.write(io);
    }
    for (const currentIKState of this.currentIKStatus) {
      currentIKState.write(io);
    }
    for (const currentAttachmentState of this.currentAttachmentStatus) {
      currentAttachmentState.write(io);
    }
    this.footer.write(io);
  }
  static read(io) {
    const header = this.Header.read(io);
    const initialBoneKeyFrames = new Array(header.boneNames.length).fill().map(() => this.BoneKeyFrame.read(io, true));
    const boneKeyFrames = new Array(io.readInt32()).fill().map(() => this.BoneKeyFrame.read(io, false));
    const initialMorphKeyFrames = new Array(header.morphNames.length).fill().map(() => this.MorphKeyFrame.read(io, true));
    const morphKeyFrames = new Array(io.readInt32()).fill().map(() => this.MorphKeyFrame.read(io, false));
    const initialConfigKeyFrame = this.ConfigKeyFrame.read(io, header, true);
    const configKeyFrames = new Array(io.readInt32()).fill().map(() => this.ConfigKeyFrame.read(io, header, false));
    const currentBoneStatus = new Array(header.boneNames.length).fill().map(() => this.CurrentBoneState.read(io));
    const currentMorphStatus = new Array(header.morphNames.length).fill().map(() => this.CurrentMorphState.read(io));
    const currentIKStatus = new Array(header.ikBoneIndices.length).fill().map(() => this.CurrentIKState.read(io));
    const currentAttachmentStatus = new Array(header.attachableBoneIndices.length).fill().map(() => this.CurrentAttachmentState.read(io));
    const footer = this.Footer.read(io);
    return new this(header, initialBoneKeyFrames, boneKeyFrames, initialMorphKeyFrames, morphKeyFrames, initialConfigKeyFrame, configKeyFrames, currentBoneStatus, currentMorphStatus, currentIKStatus, currentAttachmentStatus, footer);
  }
};
PMM.Model.Header = class Header {
  constructor(index, japaneseName, englishName, filePath, keyFrameEditorRowCount, boneNames, morphNames, ikBoneIndices, attachableBoneIndices, renderingOrder, isVisible, selectedBoneIndex, selectedMorphIndices, openStatusOfDisplayElementGroups, verticalScroll, lastFrameNumber) {
    this.index = index;
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.filePath = filePath;
    this.keyFrameEditorRowCount = keyFrameEditorRowCount;
    this.boneNames = boneNames;
    this.morphNames = morphNames;
    this.ikBoneIndices = ikBoneIndices;
    this.attachableBoneIndices = attachableBoneIndices;
    this.renderingOrder = renderingOrder;
    this.isVisible = isVisible;
    this.selectedBoneIndex = selectedBoneIndex;
    this.selectedMorphIndices = selectedMorphIndices;
    this.openStatusOfDisplayElementGroups = openStatusOfDisplayElementGroups;
    this.verticalScroll = verticalScroll;
    this.lastFrameNumber = lastFrameNumber;
  }
  clone() {
    return new this.constructor(
      this.index,
      this.japaneseName,
      this.englishName,
      this.filePath,
      this.keyFrameEditorRowCount,
      this.boneNames.slice(),
      this.morphNames.slice(),
      this.ikBoneIndices.slice(),
      this.attachableBoneIndices.slice(),
      this.renderingOrder,
      this.isVisible,
      this.selectedBoneIndices.slice(),
      this.openStatusOfDisplayElementGroups.slice(),
      this.verticalScroll,
      this.lastFrameNumber
    );
  }
  write(io) {
    io.writeUint8(this.index);
    io.writeVString(this.japaneseName);
    io.writeVString(this.englishName);
    io.writeNullTerminatedString(this.filePath, 256);
    io.writeUint8(this.keyFrameEditorRowCount);
    io.writeInt32(this.boneNames.length);
    for (const boneName of this.boneNames) {
      io.writeVString(boneName);
    }
    io.writeInt32(this.morphNames.length);
    for (const morphName of this.morphNames) {
      io.writeVString(morphName);
    }
    io.writeInt32(this.ikBoneIndices.length);
    io.writeInt32Array(this.ikBoneIndices);
    io.writeInt32(this.attachableBoneIndices.length);
    io.writeInt32Array(this.attachableBoneIndices);
    io.writeUint8(this.renderingOrder);
    io.writeUint8(this.isVisible ? 1 : 0);
    io.writeInt32(this.selectedBoneIndex);
    io.writeInt32Array(this.selectedMorphIndices);
    io.writeUint8(this.openStatusOfDisplayElementGroups.length);
    io.writeUint8Array(this.openStatusOfDisplayElementGroups.map(booleanValue => booleanValue ? 1 : 0));
    io.writeInt32(this.verticalScroll);
    io.writeInt32(this.lastFrameNumber);
  }
  static read(io) {
    const index = io.readUint8();
    const japaneseName = io.readVString();
    const englishName = io.readVString();
    const filePath = io.readNullTerminatedString(256);
    const keyFrameEditorRowCount = io.readUint8();
    const boneNames = new Array(io.readInt32()).fill().map(() => io.readVString());
    const morphNames = new Array(io.readInt32()).fill().map(() => io.readVString());
    const ikBoneIndices = io.readInt32Array(io.readInt32());
    const attachableBoneIndices = io.readInt32Array(io.readInt32());
    const renderingOrder = io.readUint8();
    const isVisible = io.readUint8() !== 0;
    const selectedBoneIndex = io.readInt32();
    const selectedMorphIndices = io.readInt32Array(4);
    const openStatusOfDisplayElementGroups = io.readUint8Array(io.readUint8()).map(intValue => intValue !== 0);
    const verticalScroll = io.readInt32();
    const lastFrameNumber = io.readInt32();
    return new this(index, japaneseName, englishName, filePath, keyFrameEditorRowCount, boneNames, morphNames, ikBoneIndices, attachableBoneIndices, renderingOrder, isVisible, selectedBoneIndex, selectedMorphIndices, openStatusOfDisplayElementGroups, verticalScroll, lastFrameNumber);
  }
};
PMM.Model.BoneKeyFrame = class BoneKeyFrame {
  constructor(index, frameNumber, previousIndex, nextIndex, bezierCurves, position, rotation, isSelected, disablesPhysics) {
    if (typeof(index) === "number") this.index = index;
    this.frameNumber = frameNumber;
    this.previousIndex = previousIndex;
    this.nextIndex = nextIndex;
    this.bezierCurves = bezierCurves;
    this.position = position;
    this.rotation = rotation;
    this.isSelected = isSelected;
    this.disablesPhysics = disablesPhysics;
  }
  clone() {
    return new this.constructor(
      this.index,
      this.frameNumber,
      this.previousIndex,
      this.nextIndex,
      {x: this.bezierCurves.x.clone(), y: this.bezierCurves.y.clone(), z: this.bezierCurves.z.clone(), rotation: this.bezierCurves.rotation.clone()},
      this.position.clone(),
      this.rotation.clone(),
      this.isSelected,
      this.disablesPhysics
    );
  }
  write(io) {
    if ("index" in this) io.writeInt32(this.index);
    io.writeInt32(this.frameNumber);
    io.writeInt32(this.previousIndex);
    io.writeInt32(this.nextIndex);
    io.writeUint8Array([
      this.bezierCurves.x.controlPoints[1].x, this.bezierCurves.x.controlPoints[1].y,
      this.bezierCurves.x.controlPoints[2].x, this.bezierCurves.x.controlPoints[2].y,
      this.bezierCurves.y.controlPoints[1].x, this.bezierCurves.y.controlPoints[1].y,
      this.bezierCurves.y.controlPoints[2].x, this.bezierCurves.y.controlPoints[2].y,
      this.bezierCurves.z.controlPoints[1].x, this.bezierCurves.z.controlPoints[1].y,
      this.bezierCurves.z.controlPoints[2].x, this.bezierCurves.z.controlPoints[2].y,
      this.bezierCurves.rotation.controlPoints[1].x, this.bezierCurves.rotation.controlPoints[1].y,
      this.bezierCurves.rotation.controlPoints[2].x, this.bezierCurves.rotation.controlPoints[2].y
    ].map(v => Math.round(v * 127)));
    io.writeFloat32Array(Array.from(this.position));
    io.writeFloat32Array(Array.from(this.rotation.toVector()));
    io.writeUint8(this.isSelected ? 1 : 0);
    io.writeUint8(this.disablesPhysics ? 1 : 0);
  }
  static read(io, isInitial) {
    const index = isInitial ? void(0) : io.readInt32();
    const frameNumber = io.readInt32();
    const previousIndex = io.readInt32();
    const nextIndex = io.readInt32();
    const bezierCurves = {
      x: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      y: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      z: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      rotation: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127))
    };
    const position = new Vector3(...io.readFloat32Array(3));
    const rotation = new Vector4(...io.readFloat32Array(4)).toQuaternion();
    const isSelected = io.readUint8() !== 0;
    const disablesPhysics = io.readUint8() !== 0;
    return new this(index, frameNumber, previousIndex, nextIndex, bezierCurves, position, rotation, isSelected, disablesPhysics);
  }
};
PMM.Model.MorphKeyFrame = class MorphKeyFrame {
  constructor(index, frameNumber, previousIndex, nextIndex, value, isSelected) {
    if (typeof(index) === "number") this.index = index;
    this.frameNumber = frameNumber;
    this.previousIndex = previousIndex;
    this.nextIndex = nextIndex;
    this.value = value;
    this.isSelected = isSelected;
  }
  clone() {
    return new this.constructor(
      this.index,
      this.frameNumber,
      this.previousIndex,
      this.nextIndex,
      this.value,
      this.isSelected
    );
  }
  write(io) {
    if ("index" in this) io.writeInt32(this.index);
    io.writeInt32(this.frameNumber);
    io.writeInt32(this.previousIndex);
    io.writeInt32(this.nextIndex);
    io.writeFloat32(this.value);
    io.writeUint8(this.isSelected ? 1 : 0);
  }
  static read(io, isInitial) {
    const index = isInitial ? void(0) : io.readInt32();
    const frameNumber = io.readInt32();
    const previousIndex = io.readInt32();
    const nextIndex = io.readInt32();
    const value = io.readFloat32();
    const isSelected = io.readUint8() !== 0;
    return new this(index, frameNumber, previousIndex, nextIndex, value, isSelected);
  }
};
PMM.Model.ConfigKeyFrame = class ConfigKeyFrame {
  constructor(index, frameNumber, previousIndex, nextIndex, isVisible, enableStatusOfIKBones, attachmentTargets, isSelected) {
    if (typeof(index) === "number") this.index = index;
    this.frameNumber = frameNumber;
    this.previousIndex = previousIndex;
    this.nextIndex = nextIndex;
    this.isVisible = isVisible;
    this.enableStatusOfIKBones = enableStatusOfIKBones;
    this.attachmentTargets = attachmentTargets;
    this.isSelected = isSelected;
  }
  clone() {
    return new this.constructor(
      this.index,
      this.frameNumber,
      this.previousIndex,
      this.nextIndex,
      this.isVisible,
      this.enableStatusOfIKBones.slice(),
      this.attachmentTargets.map(attachmentTarget => attachmentTarget.clone()),
      this.isSelected
    );
  }
  write(io) {
    if ("index" in this) io.writeInt32(this.index);
    io.writeInt32(this.frameNumber);
    io.writeInt32(this.previousIndex);
    io.writeInt32(this.nextIndex);
    io.writeUint8(this.isVisible ? 1 : 0);
    io.writeUint8Array(this.enableStatusOfIKBones.map(booleanValue => booleanValue ? 1 : 0));
    for (const attachmentTarget of this.attachmentTargets) {
      attachmentTarget.write(io);
    }
    io.writeUint8(this.isSelected ? 1 : 0);
  }
  static read(io, header, isInitial) {
    const index = isInitial ? void(0) : io.readInt32();
    const frameNumber = io.readInt32();
    const previousIndex = io.readInt32();
    const nextIndex = io.readInt32();
    const isVisible = io.readUint8() !== 0;
    const enableStatusOfIKBones = io.readUint8Array(header.ikBoneIndices.length).map(intValue => intValue !== 0);
    const attachmentTargets = new Array(header.attachableBoneIndices.length).fill().map(() => this.AttachmentTarget.read(io));
    const isSelected = io.readUint8() !== 0;
    return new this(index, frameNumber, previousIndex, nextIndex, isVisible, enableStatusOfIKBones, attachmentTargets, isSelected);
  }
};
PMM.Model.ConfigKeyFrame.AttachmentTarget = class AttachmentTarget {
  constructor(parentModelIndex, parentBoneIndex) {
    this.parentModelIndex = parentModelIndex;
    this.parentBoneIndex = parentBoneIndex;
  }
  clone() {
    return new this.constructor(
      this.parentModelIndex,
      this.parentBoneIndex
    );
  }
  write(io) {
    io.writeInt32(io, this.parentModelIndex);
    io.writeInt32(io, this.parentBoneIndex);
  }
  static read(io) {
    const parentModelIndex = io.readInt32();
    const parentBoneIndex = io.readInt32();
    return new this(parentModelIndex, parentBoneIndex);
  }
};
PMM.Model.CurrentBoneState = class CurrentBoneState {
  constructor(position, rotation, isUncommitted, disablesPhysics, isSelected) {
    this.position = position;
    this.rotation = rotation;
    this.isUncommitted = isUncommitted;
    this.disablesPhysics = disablesPhysics;
    this.isSelected = isSelected;
  }
  clone() {
    return new this.constructor(
      this.position.clone(),
      this.rotation.clone(),
      this.isUncommitted,
      this.disablesPhysics,
      this.isSelected
    );
  }
  write(io) {
    io.writeFloat32Array(Array.from(this.position));
    io.writeFloat32Array(Array.from(this.rotation.toVector()));
    io.writeUint8(this.isUncommitted ? 1 : 0);
    io.writeUint8(this.disablesPhysics ? 1 : 0);
    io.writeUint8(this.isSelected ? 1 : 0);
  }
  static read(io) {
    const position = new Vector3(...io.readFloat32Array(3));
    const rotation = new Vector4(...io.readFloat32Array(4)).toQuaternion();
    const isUncommitted = io.readUint8() !== 0;
    const disablesPhysics = io.readUint8() !== 0;
    const isSelected = io.readUint8() !== 0;
    return new this(position, rotation, isUncommitted, disablesPhysics, isSelected);
  }
};
PMM.Model.CurrentMorphState = class CurrentMorphState {
  constructor(value) {
    this.value = value;
  }
  clone() {
    return new this.constructor(this.value);
  }
  write(io) {
    io.writeFloat32(this.value);
  }
  static read(io) {
    const value = io.readFloat32();
    return new this(value);
  }
};
PMM.Model.CurrentIKState = class CurrentIKState {
  constructor(isEnabled) {
    this.isEnabled = isEnabled;
  }
  clone() {
    return new this.constructor(this.isEnabled);
  }
  write(io) {
    io.writeUint8(io);
  }
  static read(io) {
    const isEnabled = io.readUint8() !== 0;
    return new this(isEnabled);
  }
};
PMM.Model.CurrentAttachmentState = class CurrentAttachmentState {
  constructor(beginningFrameNumber, endFrameNumber, parentModelIndex, parentBoneIndex) {
    this.beginningFrameNumber = beginningFrameNumber;
    this.endFrameNumber = endFrameNumber;
    this.parentModelIndex = parentModelIndex;
    this.parentBoneIndex = parentBoneIndex;
  }
  clone() {
    return new this.constructor(
      this.beginningFrameNumber,
      this.endFrameNumber,
      this.parentModelIndex,
      this.parentBoneIndex
    );
  }
  write(io) {
    io.writeInt32(this.beginningFrameNumber);
    io.writeInt32(this.endFrameNumber);
    io.writeInt32(this.parentModelIndex);
    io.writeInt32(this.parentBoneIndex);
  }
  static read(io) {
    const beginningFrameNumber = io.readInt32();
    const endFrameNumber = io.readInt32();
    const parentModelIndex = io.readInt32();
    const parentBoneIndex = io.readInt32();
    return new this(beginningFrameNumber, endFrameNumber, parentModelIndex, parentBoneIndex);
  }
};
PMM.Model.Footer = class Footer {
  constructor(blend, edgeWidth, enablesSelfShadow, calculationOrder) {
    this.blend = blend;
    this.edgeWidth = edgeWidth;
    this.enablesSelfShadow = enablesSelfShadow;
    this.calculationOrder = calculationOrder;
  }
  clone() {
    return new this.constructor(
      this.blend,
      this.edgeWidth,
      this.enablesSelfShadow,
      this.calculationOrder
    );
  }
  write(io) {
    io.writeUint8(this.blend);
    io.writeFloat32(this.edgeWidth);
    io.writeUint8(this.enablesSelfShadow);
    io.writeUint8(this.calculationOrder);
  }
  static read(io) {
    const blend = io.readUint8();
    const edgeWidth = io.readFloat32();
    const enablesSelfShadow = io.readUint8();
    const calculationOrder = io.readUint8();
    return new this(blend, edgeWidth, enablesSelfShadow, calculationOrder);
  }
};
PMM.Camera = class Camera {
  constructor(initialKeyFrame, keyFrames, currentState) {
    this.initialKeyFrame = initialKeyFrame;
    this.keyFrames = keyFrames;
    this.currentState = currentState;
  }
  clone() {
    return new this.constructor(
      this.initialKeyFrame.clone(),
      this.keyFrames.map(keyFrame => keyFrame.clone()),
      this.currentState.clone()
    );
  }
  write(io) {
    this.initialKeyFrame.write(io);
    io.writeInt32(this.keyFrames.length);
    for (const keyFrame of this.keyFrames) {
      keyFrame.write(io);
    }
    this.currentState.write(io);
  }
  static read(io) {
    const initialKeyFrame = this.KeyFrame.read(io, true);
    const keyFrames = new Array(io.readInt32()).fill().map(() => this.KeyFrame.read(io, false));
    const currentState = this.CurrentState.read(io);
    return new this(initialKeyFrame, keyFrames, currentState);
  }
};
PMM.Camera.KeyFrame = class KeyFrame {
  constructor(index, frameNumber, previousIndex, nextIndex, distance, position, rotation, parentModelIndex, parentBoneIndex, bezierCurves, isPerspectiveMode, angleOfView, isSelected) {
    if (typeof(index) === "number") this.index = index;
    this.frameNumber = frameNumber;
    this.previousIndex = previousIndex;
    this.nextIndex = nextIndex;
    this.distance = distance;
    this.position = position;
    this.rotation = rotation;
    this.parentModelIndex = parentModelIndex;
    this.parentBoneIndex = parentBoneIndex;
    this.bezierCurves = bezierCurves;
    this.isPerspectiveMode = isPerspectiveMode;
    this.angleOfView = angleOfView;
    this.isSelected = isSelected;
  }
  clone() {
    return new this.constructor(
      this.index,
      this.frameNumber,
      this.previousIndex,
      this.nextIndex,
      this.distance,
      this.position.clone(),
      this.rotation.clone(),
      this.parentModelIndex,
      this.parentBoneIndex,
      {
        x: this.bezierCurves.x.clone(),
        y: this.bezierCurves.y.clone(),
        z: this.bezierCurves.z.clone(),
        rotation: this.bezierCurves.rotation.clone(),
        distance: this.bezierCurves.distance.clone(),
        angleOfView: this.bezierCurves.angleOfView.clone()
      },
      this.isPerspectiveMode,
      this.angleOfView,
      this.isSelected
    );
  }
  write(io) {
    const [yaw, pitch, roll] = this.rotation.yxzEulerAngles();
    if ("index" in this) io.writeInt32(this.index);
    io.writeInt32(this.frameNumber);
    io.writeInt32(this.previousIndex);
    io.writeInt32(this.nextIndex);
    io.writeFloat32(-this.distance);
    io.writeFloat32Array(Array.from(this.position));
    io.writeFloat32Array([-pitch, yaw, roll]);
    io.writeInt32(this.parentModelIndex);
    io.writeInt32(this.parentBoneIndex);
    io.writeUint8Array([
      this.bezierCurves.x.controlPoints[1].x, this.bezierCurves.x.controlPoints[1].y,
      this.bezierCurves.x.controlPoints[2].x, this.bezierCurves.x.controlPoints[2].y,
      this.bezierCurves.y.controlPoints[1].x, this.bezierCurves.y.controlPoints[1].y,
      this.bezierCurves.y.controlPoints[2].x, this.bezierCurves.y.controlPoints[2].y,
      this.bezierCurves.z.controlPoints[1].x, this.bezierCurves.z.controlPoints[1].y,
      this.bezierCurves.z.controlPoints[2].x, this.bezierCurves.z.controlPoints[2].y,
      this.bezierCurves.rotation.controlPoints[1].x, this.bezierCurves.rotation.controlPoints[1].y,
      this.bezierCurves.rotation.controlPoints[2].x, this.bezierCurves.rotation.controlPoints[2].y,
      this.bezierCurves.distance.controlPoints[1].x, this.bezierCurves.distance.controlPoints[1].y,
      this.bezierCurves.distance.controlPoints[2].x, this.bezierCurves.distance.controlPoints[2].y,
      this.bezierCurves.angleOfView.controlPoints[1].x, this.bezierCurves.angleOfView.controlPoints[1].y,
      this.bezierCurves.angleOfView.controlPoints[2].x, this.bezierCurves.angleOfView.controlPoints[2].y
    ].map(v => Math.round(v * 127)));
    io.writeUint8(this.isPerspectiveMode ? 1 : 0);
    io.writeInt32(Math.round(this.angleOfView * 180 / Math.PI));
    io.writeUint8(this.isSelected ? 1 : 0);
  }
  static read(io, isInitial) {
    const index = isInitial ? void(0) : io.readInt32();
    const frameNumber = io.readInt32();
    const previousIndex = io.readInt32();
    const nextIndex = io.readInt32();
    const distance = -io.readFloat32();
    const position = new Vector3(...io.readFloat32Array(3));
    const [pitch, yaw, roll] = io.readFloat32Array(3);
    const rotation = Quaternion.yxzEuler(yaw, -pitch, roll);
    const parentModelIndex = io.readInt32();
    const parentBoneIndex = io.readInt32();
    const bezierCurves = {
      x: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      y: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      z: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      rotation: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      distance: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127)),
      angleOfView: new FunctionLikeBezierCurve(new Vector2(io.readUint8() / 127, io.readUint8() / 127), new Vector2(io.readUint8() / 127, io.readUint8() / 127))
    };
    const isPerspectiveMode = io.readUint8() !== 0;
    const angleOfView = io.readInt32() / 180 * Math.PI;
    const isSelected = io.readUint8() !== 0;
    return new this(index, frameNumber, previousIndex, nextIndex, distance, position, rotation, parentModelIndex, parentBoneIndex, bezierCurves, isPerspectiveMode, angleOfView, isSelected);
  }
};
PMM.Camera.CurrentState = class CurrentState {
  constructor(position, viewPosition, rotation, isPerspectiveMode) {
    this.position = position;
    this.viewPosition = viewPosition;
    this.rotation = rotation;
    this.isPerspectiveMode = isPerspectiveMode;
  }
  clone() {
    return new this.constructor(
      this.position.clone(),
      this.viewPosition.clone(),
      this.rotation.clone(),
      this.isPerspectiveMode
    );
  }
  write(io) {
    const [yaw, pitch, roll] = this.rotation.yxzEulerAngles();
    io.writeFloat32Array(Array.from(this.position));
    io.writeFloat32Array(Array.from(this.viewPosition));
    io.writeFloat32Array([-pitch, yaw, roll]);
    io.writeUint8(this.isPerspectiveMode ? 1 : 0);
  }
  static read(io) {
    const position = new Vector3(...io.readFloat32Array(3));
    const viewPosition = new Vector3(...io.readFloat32Array(3));
    const [pitch, yaw, roll] = io.readFloat32Array(3);
    const rotation = Quaternion.yxzEuler(yaw, -pitch, roll);
    const isPerspectiveMode = io.readUint8() !== 0;
    return new this(position, viewPosition, rotation, isPerspectiveMode);
  }
};
PMM.Lighting = class Lighting {
  constructor(initialKeyFrame, keyFrames, currentState) {
    this.initialKeyFrame = initialKeyFrame;
    this.keyFrames = keyFrames;
    this.currentState = currentState;
  }
  clone() {
    return new this.constructor(
      this.initialKeyFrame.clone(),
      this.keyFrames.map(keyFrame => keyFrame.clone()),
      this.currentState.clone()
    );
  }
  write(io) {
    this.initialKeyFrame.write(io);
    io.writeInt32(this.keyFrames.length);
    for (const keyFrame of this.keyFrames) {
      keyFrame.write(io);
    }
    this.currentState.write(io);
  }
  static read(io) {
    const initialKeyFrame = this.KeyFrame.read(io, true);
    const keyFrames = new Array(io.readInt32()).fill().map(() => this.KeyFrame.read(io, false));
    const currentState = this.CurrentState.read(io);
    return new this(initialKeyFrame, keyFrames, currentState);
  }
};
PMM.Lighting.KeyFrame = class KeyFrame {
  constructor(index, frameNumber, previousIndex, nextIndex, color, direction, isSelected) {
    if (typeof(index) === "number") this.index = index;
    this.frameNumber = frameNumber;
    this.previousIndex = previousIndex;
    this.nextIndex = nextIndex;
    this.color = color;
    this.direction = direction;
    this.isSelected = isSelected;
  }
  clone() {
    return new this.constructor(
      this.index,
      this.frameNumber,
      this.previousIndex,
      this.nextIndex,
      {red: this.color.red, green: this.color.green, blue: this.color.blue},
      this.direction.clone(),
      this.isSelected
    );
  }
  write(io) {
    if ("index" in this) io.writeInt32(this.index);
    io.writeInt32(this.frameNumber);
    io.writeInt32(this.previousIndex);
    io.writeInt32(this.nextIndex);
    io.writeFloat32Array([this.color.red, this.color.green, this.color.blue]);
    io.writeFloat32Array(this.direction.toArray());
    io.writeUint8(this.isSelected ? 1 : 0);
  }
  static read(io, isInitial) {
    const index = isInitial ? void(0) : io.readInt32();
    const frameNumber = io.readInt32();
    const previousIndex = io.readInt32();
    const nextIndex = io.readInt32();
    const color = {red: io.readFloat32(), green: io.readFloat32(), blue: io.readFloat32()};
    const direction = new Vector3(...io.readFloat32Array(3));
    const isSelected = io.readUint8() !== 0;
    return new this(index, frameNumber, previousIndex, nextIndex, color, direction, isSelected);
  }
};
PMM.Lighting.CurrentState = class CurrentState {
  constructor(color, direction) {
    this.color = color;
    this.direction = direction;
  }
  clone() {
    return new this.constructor(
      {red: this.color.red, green: this.color.green, blue: this.color.blue},
      this.direction.clone()
    );
  }
  write(io) {
    io.writeFloat32Array([this.color.red, this.color.green, this.color.blue]);
    io.writeFloat32Array(this.direction.toArray());
  }
  static read(io) {
    const color = {red: io.readFloat32(), green: io.readFloat32(), blue: io.readFloat32()};
    const direction = new Vector3(...io.readFloat32Array(3));
    return new this(color, direction);
  }
};
