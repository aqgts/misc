import "./lodash-extension";
import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Vector4 from "./vector4";
import Quaternion from "./quaternion";
import SequentialAccessBinary from "./sequential-access-binary";

export default class PMX {
  constructor(header, model, vertices, faces, textures, materials, bones, morphs, displayElementGroups, rigidBodies, joints) {
    this.header = header;
    this.model = model;
    this.vertices = vertices;
    this.faces = faces;
    this.textures = textures;
    this.materials = materials;
    this.bones = bones;
    this.morphs = morphs;
    this.displayElementGroups = displayElementGroups;
    this.rigidBodies = rigidBodies;
    this.joints = joints;
  }
  clone() {
    return new this.constructor(
      this.header.clone(),
      this.model.clone(),
      this.vertices.map(vertex => vertex.clone()),
      this.faces.map(face => face.clone()),
      this.textures.map(texture => texture.clone()),
      this.materials.map(material => material.clone()),
      this.bones.map(bone => bone.clone()),
      this.morphs.map(morph => morph.clone()),
      this.displayElementGroups.map(displayElementGroup => displayElementGroup.clone()),
      this.rigidBodies.map(rigidBody => rigidBody.clone()),
      this.joints.map(joint => joint.clone())
    );
  }
  establishConsistency() {
    // 重いのでスキップ
    /*
    const extraUVCount = this.vertices.map(vertex => vertex.extraUVs.length).reduce(Math.max, 0)
    this.vertices.forEach(vertex => {
      _.range(vertex.extraUVs.length, extraUVCount).forEach(() => {
        vertex.extraUVs.push(new Vector4(0, 0, 0, 0));
      });
    });
    this.header.extraUVCount = extraUVCount;
    */
    this.header.vertexIndexSize = this.vertices.length <= 255 ? 1 : this.vertices.length <= 65535 ? 2 : 4;
    this.header.textureIndexSize = this.textures.length <= 127 ? 1 : this.textures.length <= 32767 ? 2 : 4;
    this.header.materialIndexSize = this.materials.length <= 127 ? 1 : this.materials.length <= 32767 ? 2 : 4;
    this.header.boneIndexSize = this.bones.length <= 127 ? 1 : this.bones.length <= 32767 ? 2 : 4;
    this.header.morphIndexSize = this.morphs.length <= 127 ? 1 : this.morphs.length <= 32767 ? 2 : 4;
    this.header.rigidBodyIndexSize = this.rigidBodies.length <= 127 ? 1 : this.rigidBodies.length <= 32767 ? 2 : 4;
  }
  write() {
    this.establishConsistency();
    const io = new PMX.SequentialAccessBinary(new SequentialAccessBinary(), this.header);
    io.writeString("PMX ", "utf-8");
    io.writeFloat32(2.0);
    this.header.write(io);
    this.model.write(io);
    io.writeInt32(this.vertices.length);
    this.vertices.forEach(vertex => {
      vertex.write(io);
    });
    io.writeInt32(this.faces.length * 3);
    this.faces.forEach(face => {
      face.write(io);
    });
    io.writeInt32(this.textures.length);
    this.textures.forEach(texture => {
      texture.write(io);
    });
    io.writeInt32(this.materials.length);
    this.materials.forEach(material => {
      material.write(io);
    });
    io.writeInt32(this.bones.length);
    this.bones.forEach(bone => {
      bone.write(io);
    });
    io.writeInt32(this.morphs.length);
    this.morphs.forEach(morph => {
      morph.write(io);
    });
    io.writeInt32(this.displayElementGroups.length);
    this.displayElementGroups.forEach(displayElementGroup => {
      displayElementGroup.write(io);
    });
    io.writeInt32(this.rigidBodies.length);
    this.rigidBodies.forEach(rigidBody => {
      rigidBody.write(io);
    });
    io.writeInt32(this.joints.length);
    this.joints.forEach(joint => {
      joint.write(io);
    });
    return io.toUint8Array();
  }
  static read(binary) {
    let io = new SequentialAccessBinary(binary);
    if (io.readString(4, "utf-8") != "PMX ") throw new Error("Not PMX.");
    if (io.readFloat32() != 2.0) throw new Error("Incompatible version.");
    const header = this.Header.read(io);
    io = new this.SequentialAccessBinary(io, header);
    const model = this.Model.read(io);
    const vertices = new Array(io.readInt32()).fill().map(() => this.Vertex.read(io));
    const faces = new Array(io.readInt32() / 3).fill().map(() => this.Face.read(io));
    const textures = new Array(io.readInt32()).fill().map(() => this.Texture.read(io));
    const materials = new Array(io.readInt32()).fill().map(() => this.Material.read(io));
    const bones = new Array(io.readInt32()).fill().map(() => this.Bone.read(io));
    const morphs = new Array(io.readInt32()).fill().map(() => this.Morph.read(io));
    const displayElementGroups = new Array(io.readInt32()).fill().map(() => this.DisplayElementGroup.read(io));
    const rigidBodies = new Array(io.readInt32()).fill().map(() => this.RigidBody.read(io));
    const joints = new Array(io.readInt32()).fill().map(() => this.Joint.read(io));
    return new this(header, model, vertices, faces, textures, materials, bones, morphs, displayElementGroups, rigidBodies, joints);
  }
}
PMX.Header = class Header {
  constructor(encoding, extraUVCount, vertexIndexSize, textureIndexSize, materialIndexSize, boneIndexSize, morphIndexSize, rigidBodyIndexSize) {
    this.encoding = encoding;
    this.extraUVCount = extraUVCount;
    this.vertexIndexSize = vertexIndexSize;
    this.textureIndexSize = textureIndexSize;
    this.materialIndexSize = materialIndexSize;
    this.boneIndexSize = boneIndexSize;
    this.morphIndexSize = morphIndexSize;
    this.rigidBodyIndexSize = rigidBodyIndexSize;
  }
  clone() {
    return new this.constructor(
      this.encoding,
      this.extraUVCount,
      this.vertexIndexSize,
      this.textureIndexSize,
      this.materialIndexSize,
      this.boneIndexSize,
      this.morphIndexSize,
      this.rigidBodyIndexSize
    );
  }
  write(io) {
    io.writeUint8(8);
    io.writeUint8({"utf-16le": 0, "utf-8": 1}[this.encoding]);
    io.writeUint8(this.extraUVCount);
    io.writeUint8(this.vertexIndexSize);
    io.writeUint8(this.textureIndexSize);
    io.writeUint8(this.materialIndexSize);
    io.writeUint8(this.boneIndexSize);
    io.writeUint8(this.morphIndexSize);
    io.writeUint8(this.rigidBodyIndexSize);
  }
  static read(io) {
    if (io.readUint8() != 8) throw new Error("Invalid header size.");
    const encoding = ["utf-16le", "utf-8"][io.readUint8()];
    const extraUVCount = io.readUint8();
    const vertexIndexSize = io.readUint8();
    const textureIndexSize = io.readUint8();
    const materialIndexSize = io.readUint8();
    const boneIndexSize = io.readUint8();
    const morphIndexSize = io.readUint8();
    const rigidBodyIndexSize = io.readUint8();
    return new this(encoding, extraUVCount, vertexIndexSize, textureIndexSize, materialIndexSize, boneIndexSize, morphIndexSize, rigidBodyIndexSize);
  }
};
PMX.SequentialAccessBinary = class SequentialAccessBinary extends SequentialAccessBinary {
  constructor(sequentialAccessBinary, header) {
    super();
    this.view = sequentialAccessBinary.view;
    this.offset = sequentialAccessBinary.offset;
    this.header = header;
  }
  readTextBuffer() {
    const byteLength = this.readInt32();
    return this.readString(byteLength, this.header.encoding);
  }
  writeTextBuffer(value) {
    const byteLength = new TextEncoder(this.header.encoding, {NONSTANDARD_allowLegacyEncoding: true}).encode(value).length;
    this.writeInt32(byteLength);
    this.writeString(value, this.header.encoding);
  }
  readExtraUVs() {
    return new Array(this.header.extraUVCount).fill().map(() => new Vector4(...this.readFloat32Array(4)));
  }
  writeExtraUVs(values) {
    values.forEach(value => {
      this.writeFloat32Array(Array.from(value));
    });
  }
  readVertexIndex() {
    return this[{1: "readUint8", 2: "readUint16", 4: "readInt32"}[this.header.vertexIndexSize]]();
  }
  writeVertexIndex(value) {
    this[{1: "writeUint8", 2: "writeUint16", 4: "writeInt32"}[this.header.vertexIndexSize]](value);
  }
  readTextureIndex() {
    return this["readInt" + (8 * this.header.textureIndexSize)]();
  }
  writeTextureIndex(value) {
    return this["writeInt" + (8 * this.header.textureIndexSize)](value);
  }
  readMaterialIndex() {
    return this["readInt" + (8 * this.header.materialIndexSize)]();
  }
  writeMaterialIndex(value) {
    return this["writeInt" + (8 * this.header.materialIndexSize)](value);
  }
  readBoneIndex() {
    return this["readInt" + (8 * this.header.boneIndexSize)]();
  }
  writeBoneIndex(value) {
    return this["writeInt" + (8 * this.header.boneIndexSize)](value);
  }
  readMorphIndex() {
    return this["readInt" + (8 * this.header.morphIndexSize)]();
  }
  writeMorphIndex(value) {
    return this["writeInt" + (8 * this.header.morphIndexSize)](value);
  }
  readRigidBodyIndex() {
    return this["readInt" + (8 * this.header.rigidBodyIndexSize)]();
  }
  writeRigidBodyIndex(value) {
    return this["writeInt" + (8 * this.header.rigidBodyIndexSize)](value);
  }
};
PMX.Model = class Model {
  constructor(japaneseName, englishName, japaneseComment, englishComment) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.japaneseComment = japaneseComment;
    this.englishComment= englishComment;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      this.japaneseComment,
      this.englishComment
    );
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeTextBuffer(this.japaneseComment);
    io.writeTextBuffer(this.englishComment);
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const japaneseComment = io.readTextBuffer();
    const englishComment = io.readTextBuffer();
    return new this(japaneseName, englishName, japaneseComment, englishComment);
  }
};
PMX.Vertex = class Vertex {
  constructor(position, normal, uv, extraUVs, weight, edgeSizeRate) {
    this.position = position;
    this.normal = normal;
    this.uv = uv;
    this.extraUVs = extraUVs;
    this.weight = weight;
    this.edgeSizeRate = edgeSizeRate;
  }
  clone() {
    return new this.constructor(
      this.position.clone(),
      this.normal.clone(),
      this.uv.clone(),
      this.extraUVs.map(extraUV => extraUV.clone()),
      this.weight.clone(),
      this.edgeSizeRate
    );
  }
  write(io) {
    io.writeFloat32Array(Array.from(this.position));
    io.writeFloat32Array(Array.from(this.normal));
    io.writeFloat32Array(Array.from(this.uv));
    io.writeExtraUVs(this.extraUVs);
    io.writeUint8(new Map([
      [this.constructor.Weight.BDEF1, 0],
      [this.constructor.Weight.BDEF2, 1],
      [this.constructor.Weight.BDEF4, 2],
      [this.constructor.Weight.SDEF, 3]
    ]).get(this.weight.constructor));
    this.weight.write(io);
    io.writeFloat32(this.edgeSizeRate);
  }
  static read(io) {
    const position = new Vector3(...io.readFloat32Array(3));
    const normal = new Vector3(...io.readFloat32Array(3));
    const uv = new Vector2(...io.readFloat32Array(2));
    const extraUVs = io.readExtraUVs();
    const weight = [this.Weight.BDEF1, this.Weight.BDEF2, this.Weight.BDEF4, this.Weight.SDEF][io.readUint8()].read(io);
    const edgeSizeRate = io.readFloat32();
    return new this(position, normal, uv, extraUVs, weight, edgeSizeRate);
  }
}
PMX.Vertex.Weight = {
  BDEF1: class BDEF1 {
    constructor(bones) {
      this.bones = bones;
    }
    clone() {
      return new this.constructor(this.bones.map(({index, weight}) => ({index, weight})));
    }
    write(io) {
      io.writeBoneIndex(this.bones[0].index);
    }
    static read(io) {
      const index = io.readBoneIndex();
      return new this([{index: index, weight: 1}]);
    }
  },
  BDEF2: class BDEF2 {
    constructor(bones) {
      this.bones = bones;
    }
    clone() {
      return new this.constructor(this.bones.map(({index, weight}) => ({index, weight})));
    }
    write(io) {
      this.bones.forEach(bone => {
        io.writeBoneIndex(bone.index);
      });
      io.writeFloat32(this.bones[0].weight);
    }
    static read(io) {
      const indices = new Array(2).fill().map(() => io.readBoneIndex());
      const weight = io.readFloat32();
      return new this([{index: indices[0], weight: weight}, {index: indices[1], weight: 1 - weight}]);
    }
  },
  BDEF4: class BDEF4 {
    constructor(bones) {
      this.bones = bones;
    }
    clone() {
      return new this.constructor(this.bones.map(({index, weight}) => ({index, weight})));
    }
    write(io) {
      this.bones.forEach(bone => {
        io.writeBoneIndex(bone.index);
      });
      this.bones.forEach(bone => {
        io.writeFloat32(bone.weight);
      });
    }
    static read(io) {
      const indices = new Array(4).fill().map(() => io.readBoneIndex());
      const weights = new Array(4).fill().map(() => io.readFloat32());
      return new this(_.range(4).map(i => ({index: indices[i], weight: weights[i]})));
    }
  },
  SDEF: class SDEF {
    constructor(bones, c, r0, r1) {
      this.bones = bones;
      this.c = c;
      this.r0 = r0;
      this.r1 = r1;
    }
    clone() {
      return new this.constructor(
        this.bones.map(({index, weight}) => ({index, weight})),
        this.c.clone(),
        this.r0.clone(),
        this.r1.clone()
      );
    }
    write(io) {
      this.bones.forEach(bone => {
        io.writeBoneIndex(bone.index);
      });
      io.writeFloat32(this.bones[0].weight);
      io.writeFloat32Array(Array.from(this.c));
      io.writeFloat32Array(Array.from(this.r0));
      io.writeFloat32Array(Array.from(this.r1));
    }
    static read(io) {
      const indices = new Array(2).fill().map(() => io.readBoneIndex());
      const weight = io.readFloat32();
      const c = new Vector3(...io.readFloat32Array(3));
      const r0 = new Vector3(...io.readFloat32Array(3));
      const r1 = new Vector3(...io.readFloat32Array(3));
      return new this([{index: indices[0], weight: weight}, {index: indices[1], weight: 1 - weight}], c, r0, r1);
    }
  }
};
PMX.Face = class Face {
  constructor(vertexIndices) {
    this.vertexIndices = vertexIndices;
  }
  clone() {
    return new this.constructor(this.vertexIndices.slice());
  }
  write(io) {
    this.vertexIndices.forEach(vertexIndex => {
      io.writeVertexIndex(vertexIndex);
    });
  }
  static read(io) {
    const vertexIndices = new Array(3).fill().map(() => io.readVertexIndex());
    return new this(vertexIndices);
  }
};
PMX.Texture = class Texture {
  constructor(filePath) {
    this.filePath = filePath;
  }
  clone() {
    return new this.constructor(this.filePath);
  }
  write(io) {
    io.writeTextBuffer(this.filePath);
  }
  static read(io) {
    const filePath = io.readTextBuffer();
    return new this(filePath);
  }
};
PMX.Material = class Material {
  constructor(japaneseName, englishName, diffuse, specular, ambient, isDoubleSided, rendersGroundShadow, makesSelfShadow, rendersSelfShadow, rendersEdge, edge, textureIndex, sphereTexture, toonTexture, memo, faceCount) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.diffuse = diffuse;
    this.specular = specular;
    this.ambient = ambient;
    this.isDoubleSided = isDoubleSided;
    this.rendersGroundShadow = rendersGroundShadow;
    this.makesSelfShadow = makesSelfShadow;
    this.rendersSelfShadow = rendersSelfShadow;
    this.rendersEdge = rendersEdge;
    this.edge = edge;
    this.textureIndex = textureIndex;
    this.sphereTexture = sphereTexture;
    this.toonTexture = toonTexture;
    this.memo = memo;
    this.faceCount = faceCount;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      {red: this.diffuse.red, green: this.diffuse.green, blue: this.diffuse.blue, alpha: this.diffuse.alpha},
      {red: this.specular.red, green: this.specular.green, blue: this.specular.blue, coefficient: this.specular.coefficient},
      {red: this.ambient.red, green: this.ambient.green, blue: this.ambient.blue},
      this.isDoubleSided,
      this.rendersGroundShadow,
      this.makesSelfShadow,
      this.rendersSelfShadow,
      this.rendersEdge,
      {red: this.edge.red, green: this.edge.green, blue: this.edge.blue, alpha: this.edge.alpha, size: this.edge.size},
      this.textureIndex,
      {index: this.sphereTexture.index, mode: this.sphereTexture.mode},
      {isShared: this.toonTexture.isShared, index: this.toonTexture.index},
      this.memo,
      this.faceCount
    );
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeFloat32Array([this.diffuse.red, this.diffuse.green, this.diffuse.blue, this.diffuse.alpha]);
    io.writeFloat32Array([this.specular.red, this.specular.green, this.specular.blue, this.specular.coefficient]);
    io.writeFloat32Array([this.ambient.red, this.ambient.green, this.ambient.blue]);
    io.writeUint8(
      (this.isDoubleSided ? 0x01 : 0x00) |
      (this.rendersGroundShadow ? 0x02 : 0x00) |
      (this.makesSelfShadow ? 0x04 : 0x00) |
      (this.rendersSelfShadow ? 0x08 : 0x00) |
      (this.rendersEdge ? 0x10 : 0x00)
    );
    io.writeFloat32Array([this.edge.red, this.edge.green, this.edge.blue, this.edge.alpha, this.edge.size]);
    io.writeTextureIndex(this.textureIndex);
    io.writeTextureIndex(this.sphereTexture.index);
    io.writeUint8({disabled: 0, multiply: 1, add: 2, subTexture: 3}[this.sphereTexture.mode]);
    io.writeUint8(this.toonTexture.isShared ? 1 : 0);
    if (this.toonTexture.isShared) {
      io.writeUint8(this.toonTexture.index);
    } else {
      io.writeTextureIndex(this.toonTexture.index);
    }
    io.writeTextBuffer(this.memo);
    io.writeInt32(this.faceCount * 3);
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const diffuse = {
      red: io.readFloat32(),
      green: io.readFloat32(),
      blue: io.readFloat32(),
      alpha: io.readFloat32()
    };
    const specular = {
      red: io.readFloat32(),
      green: io.readFloat32(),
      blue: io.readFloat32(),
      coefficient: io.readFloat32()
    };
    const ambient = {
      red: io.readFloat32(),
      green: io.readFloat32(),
      blue: io.readFloat32()
    };
    const bitFlag = io.readUint8();
    const isDoubleSided = (bitFlag & 0x01) == 0x01;
    const rendersGroundShadow = (bitFlag & 0x02) == 0x02;
    const makesSelfShadow = (bitFlag & 0x04) == 0x04;
    const rendersSelfShadow = (bitFlag & 0x08) == 0x08;
    const rendersEdge = (bitFlag & 0x10) == 0x10;
    const edge = {
      red: io.readFloat32(),
      green: io.readFloat32(),
      blue: io.readFloat32(),
      alpha: io.readFloat32(),
      size: io.readFloat32()
    };
    const textureIndex = io.readTextureIndex();
    const sphereTexture = {
      index: io.readTextureIndex(),
      mode: ["disabled", "multiply", "add", "subTexture"][io.readUint8()]
    };
    const toonTextureShared = io.readUint8() === 1;
    const toonTexture = {
      isShared: toonTextureShared,
      index: toonTextureShared ? io.readUint8() : io.readTextureIndex()
    };
    const memo = io.readTextBuffer();
    const faceCount = io.readInt32() / 3;
    return new this(japaneseName, englishName, diffuse, specular, ambient, isDoubleSided, rendersGroundShadow, makesSelfShadow, rendersSelfShadow, rendersEdge, edge, textureIndex, sphereTexture, toonTexture, memo, faceCount);
  }
};
PMX.Bone = class Bone {
  constructor(japaneseName, englishName, position, parentIndex, deformationOrder, connection, isRotatable, isMovable, isVisible, isControllable, ikInfo, localAdditionMode, additionalRotation, additionalDisplacement, fixedAxis, localAxis, deformsAfterPhysics, keyValue) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.position = position;
    this.parentIndex = parentIndex;
    this.deformationOrder = deformationOrder;
    this.connection = connection;
    this.isRotatable = isRotatable;
    this.isMovable = isMovable;
    this.isVisible = isVisible;
    this.isControllable = isControllable;
    this.ikInfo = ikInfo;
    this.localAdditionMode = localAdditionMode;
    this.additionalRotation = additionalRotation;
    this.additionalDisplacement = additionalDisplacement;
    this.fixedAxis = fixedAxis;
    this.localAxis = localAxis;
    this.deformsAfterPhysics = deformsAfterPhysics;
    this.keyValue = keyValue;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      this.position.clone(),
      this.parentIndex,
      this.deformationOrder,
      this.connection instanceof Vector3 ? this.connection.clone() : this.connection,
      this.isRotatable,
      this.isMovable,
      this.isVisible,
      this.isControllable,
      this.isIK() ? this.ikInfo.clone() : null,
      this.localAdditionMode,
      this.addsRotation() ? {parentIndex: this.additionalRotation.parentIndex, rate: this.additionalRotation.rate} : null,
      this.addsDisplacement() ? {parentIndex: this.additionalDisplacement.parentIndex, rate: this.additionalDisplacement.rate} : null,
      this.fixesAxis() ? this.fixedAxis.clone() : null,
      this.hasLocalAxis() ? {x: this.localAxis.x.clone(), z: this.localAxis.z.clone()} : null,
      this.deformsAfterPhysics,
      this.deformsUsingExternalParent() ? this.keyValue : null
    );
  }
  isIK() {
    return this.ikInfo !== null;
  }
  addsRotation() {
    return this.additionalRotation !== null;
  }
  addsDisplacement() {
    return this.additionalDisplacement !== null;
  }
  fixesAxis() {
    return this.fixedAxis !== null;
  }
  hasLocalAxis() {
    return this.localAxis !== null;
  }
  deformsUsingExternalParent() {
    return this.keyValue !== null;
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeFloat32Array(Array.from(this.position));
    io.writeBoneIndex(this.parentIndex);
    io.writeInt32(this.deformationOrder);
    io.writeUint8(
      (this.connection instanceof Vector3 ? 0x00 : 0x01) |
      (this.isRotatable ? 0x02 : 0x00) |
      (this.isMovable ? 0x04 : 0x00) |
      (this.isVisible ? 0x08 : 0x00) |
      (this.isControllable ? 0x10 : 0x00) |
      (this.isIK() ? 0x20 : 0x00) |
      (this.localAdditionMode * 0x80)
    );
    io.writeUint8(
      (this.addsRotation() ? 0x01 : 0x00) |
      (this.addsDisplacement() ? 0x02 : 0x00) |
      (this.fixesAxis() ? 0x04 : 0x00) |
      (this.hasLocalAxis() ? 0x08 : 0x00) |
      (this.deformsAfterPhysics ? 0x10 : 0x00) |
      (this.deformsUsingExternalParent() ? 0x20 : 0x00)
    );
    if (this.connection instanceof Vector3) {
      io.writeFloat32Array(Array.from(this.connection));
    } else {
      io.writeBoneIndex(this.connection);
    }
    if (this.addsRotation()) {
      io.writeBoneIndex(this.additionalRotation.parentIndex);
      io.writeFloat32(this.additionalRotation.rate);
    }
    if (!this.addsRotation() && this.addsDisplacement()) {
      io.writeBoneIndex(this.additionalDisplacement.parentIndex);
      io.writeFloat32(this.additionalDisplacement.rate);
    }
    if (this.fixesAxis()) {
      io.writeFloat32Array(Array.from(this.fixedAxis));
    }
    if (this.hasLocalAxis()) {
      io.writeFloat32Array(Array.from(this.localAxis.x));
      io.writeFloat32Array(Array.from(this.localAxis.z));
    }
    if (this.deformsUsingExternalParent()) {
      io.writeInt32(this.keyValue);
    }
    if (this.isIK()) {
      this.ikInfo.write(io);
    }
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const position = new Vector3(...io.readFloat32Array(3));
    const parentIndex = io.readBoneIndex();
    const deformationOrder = io.readInt32();
    const bitFlags = io.readUint8Array(2);
    const connection = (bitFlags[0] & 0x01) == 0x00 ? new Vector3(...io.readFloat32Array(3)) : io.readBoneIndex();
    const isRotatable = (bitFlags[0] & 0x02) == 0x02;
    const isMovable = (bitFlags[0] & 0x04) == 0x04;
    const isVisible = (bitFlags[0] & 0x08) == 0x08;
    const isControllable = (bitFlags[0] & 0x10) == 0x10;
    const isIK = (bitFlags[0] & 0x20) == 0x20;
    const localAdditionMode = (bitFlags[0] & 0x80) / 0x80;
    const addsRotation = (bitFlags[1] & 0x01) == 0x01;
    const addsDisplacement = (bitFlags[1] & 0x02) == 0x02;
    const fixesAxis = (bitFlags[1] & 0x04) == 0x04;
    const hasLocalAxis = (bitFlags[1] & 0x08) == 0x08;
    const deformsAfterPhysics = (bitFlags[1] & 0x10) == 0x10;
    const deformsUsingExternalParent = (bitFlags[1] & 0x20) == 0x20;
    const addition = addsRotation || addsDisplacement ? {
      parentIndex: io.readBoneIndex(),
      rate: io.readFloat32()
    } : null;
    const additionalRotation = addsRotation ? addition : null;
    const additionalDisplacement = addsDisplacement ? addition : null;
    const fixedAxis = fixesAxis ? new Vector3(...io.readFloat32Array(3)) : null;
    const localAxis = hasLocalAxis ? {
      x: new Vector3(...io.readFloat32Array(3)),
      z: new Vector3(...io.readFloat32Array(3))
    } : null;
    const keyValue = deformsUsingExternalParent ? io.readInt32() : null;
    const ikInfo = isIK ? this.IKInfo.read(io) : null;
    return new this(japaneseName, englishName, position, parentIndex, deformationOrder, connection, isRotatable, isMovable, isVisible, isControllable, ikInfo, localAdditionMode, additionalRotation, additionalDisplacement, fixedAxis, localAxis, deformsAfterPhysics, keyValue);
  }
};
PMX.Bone.IKInfo = class IKInfo {
  constructor(targetIndex, loopCount, angleLimit, links) {
    this.targetIndex = targetIndex;
    this.loopCount = loopCount;
    this.angleLimit = angleLimit;
    this.links = links;
  }
  clone() {
    return new this.constructor(
      this.targetIndex,
      this.loopCount,
      this.angleLimit,
      this.links.map(link => link.clone())
    );
  }
  write(io) {
    io.writeBoneIndex(this.targetIndex);
    io.writeInt32(this.loopCount);
    io.writeFloat32(this.angleLimit);
    io.writeInt32(this.links.length);
    this.links.forEach(link => {
      link.write(io);
    });
  }
  static read(io) {
    const targetIndex = io.readBoneIndex();
    const loopCount = io.readInt32();
    const angleLimit = io.readFloat32();
    const links = new Array(io.readInt32()).fill().map(() => this.Link.read(io));
    return new this(targetIndex, loopCount, angleLimit, links);
  }
};
PMX.Bone.IKInfo.Link = class Link {
  constructor(boneIndex, lowerLimit, upperLimit) {
    this.boneIndex = boneIndex;
    this.lowerLimit = lowerLimit;
    this.upperLimit = upperLimit;
  }
  clone() {
    return new this.constructor(
      this.boneIndex,
      this.hasLimit() ? this.lowerLimit.clone() : null,
      this.hasLimit() ? this.upperLimit.clone() : null
    );
  }
  hasLimit() {
    return this.lowerLimit !== null && this.upperLimit !== null;
  }
  write(io) {
    io.writeBoneIndex(this.boneIndex);
    io.writeUint8(this.hasLimit() ? 1 : 0);
    if (this.hasLimit()) {
      io.writeFloat32Array(Array.from(this.lowerLimit));
      io.writeFloat32Array(Array.from(this.upperLimit));
    }
  }
  static read(io) {
    const boneIndex = io.readBoneIndex();
    const hasLimit = io.readUint8() === 1;
    const lowerLimit = hasLimit ? new Vector3(...io.readFloat32Array(3)) : null;
    const upperLimit = hasLimit ? new Vector3(...io.readFloat32Array(3)) : null;
    return new this(boneIndex, lowerLimit, upperLimit);
  }
};
PMX.Morph = class Morph {
  constructor(japaneseName, englishName, panel, type, offsets) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.panel = panel;
    this.type = type;
    this.offsets = offsets;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      this.panel,
      this.type,
      this.offsets.map(offset => offset.clone())
    );
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeUint8({reserved: 0, eyebrows: 1, eyes: 2, mouth: 3, others: 4}[this.panel]);
    io.writeUint8({group: 0, vertex: 1, bone: 2, uv: 3, extraUV1: 4, extraUV2: 5, extraUV3: 6, extraUV4: 7, material: 8}[this.type]);
    io.writeInt32(this.offsets.length);
    this.offsets.forEach(offset => {
      offset.write(io);
    });
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const panel = ["reserved", "eyebrows", "eyes", "mouth", "others"][io.readUint8()];
    const rawType = io.readUint8();
    const type = ["group", "vertex", "bone", "uv", "extraUV1", "extraUV2", "extraUV3", "extraUV4", "material"][rawType];
    const offsets = new Array(io.readInt32()).fill().map(() => [
      this.Offset.Group,
      this.Offset.Vertex,
      this.Offset.Bone,
      this.Offset.UV,
      this.Offset.UV,
      this.Offset.UV,
      this.Offset.UV,
      this.Offset.UV,
      this.Offset.Material
    ][rawType].read(io));
    return new this(japaneseName, englishName, panel, type, offsets);
  }
};
PMX.Morph.Offset = {
  Group: class Group {
    constructor(morphIndex, rate) {
      this.morphIndex = morphIndex;
      this.rate = rate;
    }
    clone() {
      return new this.constructor(
        this.morphIndex,
        this.rate
      );
    }
    write(io) {
      io.writeMorphIndex(this.morphIndex);
      io.writeFloat32(this.rate);
    }
    static read(io) {
      const morphIndex = io.readMorphIndex();
      const rate = io.readFloat32();
      return new this(morphIndex, rate);
    }
  },
  Vertex: class Vertex {
    constructor(vertexIndex, displacement) {
      this.vertexIndex = vertexIndex;
      this.displacement = displacement;
    }
    clone() {
      return new this.constructor(
        this.vertexIndex,
        this.displacement.clone()
      );
    }
    write(io) {
      io.writeVertexIndex(this.vertexIndex);
      io.writeFloat32Array(Array.from(this.displacement));
    }
    static read(io) {
      const vertexIndex = io.readVertexIndex();
      const displacement = new Vector3(...io.readFloat32Array(3));
      return new this(vertexIndex, displacement);
    }
  },
  Bone: class Bone {
    constructor(boneIndex, displacement, rotation) {
      this.boneIndex = boneIndex;
      this.displacement = displacement;
      this.rotation = rotation;
    }
    clone() {
      return new this.constructor(
        this.boneIndex,
        this.displacement.clone(),
        this.rotation.clone()
      );
    }
    write(io) {
      io.writeBoneIndex(this.boneIndex);
      io.writeFloat32Array(Array.from(this.displacement));
      io.writeFloat32Array(Array.from(this.rotation.toVector()));
    }
    static read(io) {
      const boneIndex = io.readBoneIndex();
      const displacement = new Vector3(...io.readFloat32Array(3));
      const rotation = new Vector4(...io.readFloat32Array(4)).toQuaternion();
      return new this(boneIndex, displacement, rotation);
    }
  },
  UV: class Vertex {
    constructor(vertexIndex, displacement) {
      this.vertexIndex = vertexIndex;
      this.displacement = displacement;
    }
    clone() {
      return new this.constructor(
        this.vertexIndex,
        this.displacement.clone()
      );
    }
    write(io) {
      io.writeVertexIndex(this.vertexIndex);
      io.writeFloat32Array(Array.from(this.displacement));
    }
    static read(io) {
      const vertexIndex = io.readVertexIndex();
      const displacement = new Vector4(...io.readFloat32Array(4));
      return new this(vertexIndex, displacement);
    }
  },
  Material: class Material {
    constructor(materialIndex, mode, diffuse, specular, ambient, edge, textureCoefficient, sphereTextureCoefficient, toonTextureCoefficient) {
      this.materialIndex = materialIndex;
      this.mode = mode;
      this.diffuse = diffuse;
      this.specular = specular;
      this.ambient = ambient;
      this.edge = edge;
      this.textureCoefficient = textureCoefficient;
      this.sphereTextureCoefficient = sphereTextureCoefficient;
      this.toonTextureCoefficient = toonTextureCoefficient;
    }
    clone() {
      return new this.constructor(
        this.materialIndex,
        this.mode,
        {red: this.diffuse.red, green: this.diffuse.green, blue: this.diffuse.blue, alpha: this.diffuse.alpha},
        {red: this.specular.red, green: this.specular.green, blue: this.specular.blue, coefficient: this.specular.coefficient},
        {red: this.ambient.red, green: this.ambient.green, blue: this.ambient.blue},
        {red: this.edge.red, green: this.edge.green, blue: this.edge.blue, alpha: this.edge.alpha, size: this.edge.size},
        {red: this.textureCoefficient.red, green: this.textureCoefficient.green, blue: this.textureCoefficient.blue, alpha: this.textureCoefficient.alpha},
        {red: this.sphereTextureCoefficient.red, green: this.sphereTextureCoefficient.green, blue: this.sphereTextureCoefficient.blue, alpha: this.sphereTextureCoefficient.alpha},
        {red: this.toonTextureCoefficient.red, green: this.toonTextureCoefficient.green, blue: this.toonTextureCoefficient.blue, alpha: this.toonTextureCoefficient.alpha}
      );
    }
    write(io) {
      io.writeMaterialIndex(this.materialIndex);
      io.writeUint8({multiply: 0, add: 1}[this.mode]);
      io.writeFloat32Array([this.diffuse.red, this.diffuse.green, this.diffuse.blue, this.diffuse.alpha]);
      io.writeFloat32Array([this.specular.red, this.specular.green, this.specular.blue, this.specular.coefficient]);
      io.writeFloat32Array([this.ambient.red, this.ambient.green, this.ambient.blue]);
      io.writeFloat32Array([this.edge.red, this.edge.green, this.edge.blue, this.edge.alpha, this.edge.size]);
      io.writeFloat32Array([
        this.textureCoefficient.red,
        this.textureCoefficient.green,
        this.textureCoefficient.blue,
        this.textureCoefficient.alpha
      ]);
      io.writeFloat32Array([
        this.sphereTextureCoefficient.red,
        this.sphereTextureCoefficient.green,
        this.sphereTextureCoefficient.blue,
        this.sphereTextureCoefficient.alpha
      ]);
      io.writeFloat32Array([
        this.toonTextureCoefficient.red,
        this.toonTextureCoefficient.green,
        this.toonTextureCoefficient.blue,
        this.toonTextureCoefficient.alpha
      ]);
    }
    static read(io) {
      const materialIndex = io.readMaterialIndex();
      const mode = ["multiply", "add"][io.readUint8()];
      const diffuse = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32()
      };
      const specular = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        coefficient: io.readFloat32()
      };
      const ambient = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32()
      };
      const edge = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32(),
        size: io.readFloat32()
      };
      const textureCoefficient = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32()
      };
      const sphereTextureCoefficient = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32()
      };
      const toonTextureCoefficient = {
        red: io.readFloat32(),
        green: io.readFloat32(),
        blue: io.readFloat32(),
        alpha: io.readFloat32()
      };
      return new this(materialIndex, mode, diffuse, specular, ambient, edge, textureCoefficient, sphereTextureCoefficient, toonTextureCoefficient);
    }
  }
};
PMX.DisplayElementGroup = class DisplayElementGroup {
  constructor(japaneseName, englishName, isSpecial, elements) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.isSpecial = isSpecial;
    this.elements = elements;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      this.isSpecial,
      this.elements.map(element => element.clone())
    );
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeUint8(this.isSpecial ? 1 : 0);
    io.writeInt32(this.elements.length);
    this.elements.forEach(element => {
      element.write(io);
    });
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const isSpecial = io.readUint8() === 1;
    const elements = new Array(io.readInt32()).fill().map(() => this.DisplayElement.read(io));
    return new this(japaneseName, englishName, isSpecial, elements);
  }
};
PMX.DisplayElementGroup.DisplayElement = class DisplayElement {
  constructor(type, index) {
    this.type = type;
    this.index = index;
  }
  clone() {
    return new this.constructor(
      this.type,
      this.index
    );
  }
  write(io) {
    io.writeUint8({bone: 0, morph: 1}[this.type]);
    io[{bone: "writeBoneIndex", morph: "writeMorphIndex"}[this.type]](this.index);
  }
  static read(io) {
    const type = ["bone", "morph"][io.readUint8()];
    const index = io[{bone: "readBoneIndex", morph: "readMorphIndex"}[type]]();
    return new this(type, index);
  }
};
PMX.RigidBody = class RigidBody {
  constructor(japaneseName, englishName, parentBoneIndex, group, nonCollisionGroupFlag, shape, size, position, rotation, mass, dampingParameterInMoving, dampingParameterInRotating, resilience, friction, physicsMode) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.parentBoneIndex = parentBoneIndex;
    this.group = group;
    this.nonCollisionGroupFlag = nonCollisionGroupFlag;
    this.shape = shape;
    this.size = size;
    this.position = position;
    this.rotation = rotation;
    this.mass = mass;
    this.dampingParameterInMoving = dampingParameterInMoving;
    this.dampingParameterInRotating = dampingParameterInRotating;
    this.resilience = resilience;
    this.friction = friction;
    this.physicsMode = physicsMode;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      this.parentBoneIndex,
      this.group,
      this.nonCollisionGroupFlag,
      this.shape,
      this.size.clone(),
      this.position.clone(),
      this.rotation.clone(),
      this.mass,
      this.dampingParameterInMoving,
      this.dampingParameterInRotating,
      this.resilience,
      this.friction,
      this.physicsMode
    );
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeBoneIndex(this.parentBoneIndex);
    io.writeUint8(this.group);
    io.writeUint16(this.nonCollisionGroupFlag);
    io.writeUint8({sphere: 0, cuboid: 1, capsule: 2}[this.shape]);
    io.writeFloat32Array(this.size.toArray());
    io.writeFloat32Array(this.position.toArray());
    const [yaw, pitch, roll] = this.rotation.yxzEulerAngles();
    io.writeFloat32Array([-pitch, yaw, roll]);
    io.writeFloat32(this.mass);
    io.writeFloat32(this.dampingParameterInMoving);
    io.writeFloat32(this.dampingParameterInRotating);
    io.writeFloat32(this.resilience);
    io.writeFloat32(this.friction);
    io.writeUint8({static: 0, dynamic: 1, dynamicWithBone: 2}[this.physicsMode]);
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const parentBoneIndex = io.readBoneIndex();
    const group = io.readUint8();
    const nonCollisionGroupFlag = io.readUint16();
    const shape = ["sphere", "cuboid", "capsule"][io.readUint8()];
    const size = new Vector3(...io.readFloat32Array(3));
    const position = new Vector3(...io.readFloat32Array(3));
    const [pitch, yaw, roll] = io.readFloat32Array(3);
    const rotation = Quaternion.yxzEuler(yaw, -pitch, roll);
    const mass = io.readFloat32();
    const dampingParameterInMoving = io.readFloat32();
    const dampingParameterInRotating = io.readFloat32();
    const resilience = io.readFloat32();
    const friction = io.readFloat32();
    const physicsMode = ["static", "dynamic", "dynamicWithBone"][io.readUint8()];
    return new this(japaneseName, englishName, parentBoneIndex, group, nonCollisionGroupFlag, shape, size, position, rotation, mass, dampingParameterInMoving, dampingParameterInRotating, resilience, friction, physicsMode);
  }
};
PMX.Joint = class Joint {
  constructor(japaneseName, englishName, concreteJoint) {
    this.japaneseName = japaneseName;
    this.englishName = englishName;
    this.concreteJoint = concreteJoint;
  }
  clone() {
    return new this.constructor(
      this.japaneseName,
      this.englishName,
      this.concreteJoint.clone()
    );
  }
  write(io) {
    io.writeTextBuffer(this.japaneseName);
    io.writeTextBuffer(this.englishName);
    io.writeUint8(new Map([
      [this.constructor.ConcreteJoint.Spring6DOF, 0]
    ]).get(this.concreteJoint.constructor));
    this.concreteJoint.write(io);
  }
  static read(io) {
    const japaneseName = io.readTextBuffer();
    const englishName = io.readTextBuffer();
    const concreteJoint = [this.ConcreteJoint.Spring6DOF][io.readUint8()].read(io);
    return new this(japaneseName, englishName, concreteJoint);
  }
};
PMX.Joint.ConcreteJoint = {
  Spring6DOF: class Spring6DOF {
    constructor(parentRigidBodyAIndex, parentRigidBodyBIndex, position, rotation, lowerLimitInMoving, upperLimitInMoving, lowerLimitInRotating, upperLimitInRotating, springConstantInMoving, springConstantInRotating) {
      this.parentRigidBodyAIndex = parentRigidBodyAIndex;
      this.parentRigidBodyBIndex = parentRigidBodyBIndex;
      this.position = position;
      this.rotation = rotation;
      this.lowerLimitInMoving = lowerLimitInMoving;
      this.upperLimitInMoving = upperLimitInMoving;
      this.lowerLimitInRotating = lowerLimitInRotating;
      this.upperLimitInRotating = upperLimitInRotating;
      this.springConstantInMoving = springConstantInMoving;
      this.springConstantInRotating = springConstantInRotating;
    }
    clone() {
      return new this.constructor(
        this.parentRigidBodyAIndex,
        this.parentRigidBodyBIndex,
        this.position.clone(),
        this.rotation.clone(),
        this.lowerLimitInMoving.clone(),
        this.upperLimitInMoving.clone(),
        this.lowerLimitInRotating.clone(),
        this.upperLimitInRotating.clone(),
        this.springConstantInMoving.clone(),
        this.springConstantInRotating.clone()
      );
    }
    write(io) {
      function writeQuaternion(quaternion) {
        const [yaw, pitch, roll] = quaternion.yxzEulerAngles();
        io.writeFloat32Array([-pitch, yaw, roll]);
      }
      io.writeRigidBodyIndex(this.parentRigidBodyAIndex);
      io.writeRigidBodyIndex(this.parentRigidBodyBIndex);
      io.writeFloat32Array(this.position.toArray());
      writeQuaternion(this.rotation);
      io.writeFloat32Array(this.lowerLimitInMoving.toArray());
      io.writeFloat32Array(this.upperLimitInMoving.toArray());
      writeQuaternion(this.lowerLimitInRotating);
      writeQuaternion(this.upperLimitInRotating);
      io.writeFloat32Array(this.springConstantInMoving.toArray());
      writeQuaternion(this.springConstantInRotating);
    }
    static read(io) {
      function readQuaternion() {
        const [pitch, yaw, roll] = io.readFloat32Array(3);
        return Quaternion.yxzEuler(yaw, -pitch, roll);
      }
      const parentRigidBodyAIndex = io.readRigidBodyIndex();
      const parentRigidBodyBIndex = io.readRigidBodyIndex();
      const position = new Vector3(...io.readFloat32Array(3));
      const rotation = readQuaternion();
      const lowerLimitInMoving = new Vector3(...io.readFloat32Array(3));
      const upperLimitInMoving = new Vector3(...io.readFloat32Array(3));
      const lowerLimitInRotating = readQuaternion();
      const upperLimitInRotating = readQuaternion();
      const springConstantInMoving = new Vector3(...io.readFloat32Array(3));
      const springConstantInRotating = readQuaternion();
      return new this(parentRigidBodyAIndex, parentRigidBodyBIndex, position, rotation, lowerLimitInMoving, upperLimitInMoving, lowerLimitInRotating, upperLimitInRotating, springConstantInMoving, springConstantInRotating);
    }
  }
};

