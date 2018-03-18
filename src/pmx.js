import uuidv4 from "uuid/v4";
import Vector3 from "./vector3";
import InternalPMX from "./internal-pmx";
import ObservableLinkedChain from "./observable-linked-chain";

const _rootNode = Symbol("rootNode");
const _parentNode = Symbol("parentNode");
const _uuid = Symbol("uuid");
const _stockedOrders = Symbol("stockedOrders");
const _uuidToNode = Symbol("uuidToNode");
const _backwardIndex = Symbol("backwardIndex");
const _addStockedOrder = Symbol("addStockedOrder");
const _registerReference = Symbol("registerReference");
const _unregisterReference = Symbol("unregisterReference");
const _overwriteReference = Symbol("overwriteReference");
const _overwriteReferenceArray = Symbol("overwriteReferenceArray");
const _overwriteNode = Symbol("overwriteNode");
const _overwriteChain = Symbol("overwriteChain");
const _toInternalPMX = Symbol("toInternalPMX");
const _fromInternalPMX = Symbol("fromInternalPMX");
const _clear = Symbol("clear");
const _cloneForRoot = Symbol("cloneForRoot");
const _value = {
  _parentNode: Symbol("_parentNode"),
  _uuid: Symbol("_uuid"),
};
class Node {
  constructor() {
    this[_value._parentNode] = null;
    this[_stockedOrders] = [];
  }
  get [_parentNode]() {
    return this[_value._parentNode];
  }
  set [_parentNode](value) {
    this[_value._parentNode] = value;
    if (value !== null) {
      const stockedOrders = this[_stockedOrders].slice();
      this[_stockedOrders].splice(0, this[_stockedOrders].length);
      const ancestorNode = value.getAncestorNode();
      for (const stockedOrder of stockedOrders) {
        ancestorNode[_addStockedOrder](stockedOrder);
      }
    }
  }
  get [_uuid]() {
    return this[_value._uuid];
  }
  set [_uuid](value) {
    if (this.hasOwnProperty(_value._uuid)) {
      const oldUUID = this[_value._uuid];
      if (oldUUID !== null) {
        this[_addStockedOrder](() => {
          delete this.getRootNode()[_uuidToNode][oldUUID];
        });
      }
    }
    this[_value._uuid] = value;
    if (value !== null) {
      this[_addStockedOrder](() => {
        this.getRootNode()[_uuidToNode][value] = this;
      });
    }
  }
  [_clear]() {
    this[_uuid] = null;
    this[_parentNode] = null;
  }
  [_addStockedOrder](stockedOrder) {
    const parentNode = this.getParentNode();
    if (parentNode === null) {
      this[_stockedOrders].push(stockedOrder);
    } else {
      parentNode[_addStockedOrder](stockedOrder);
    }
  }
  *getReferringNodes() {
    const rootNode = this.getRootNode();
    const myUUID = this.getUUID();
    if (myUUID in rootNode[_backwardIndex]) {
      for (const {uuid, propertyNames} of [...rootNode[_backwardIndex][myUUID]].map(JSON.parse)) {
        if (rootNode.hasNode(uuid)) {
          yield {node: rootNode.getNode(uuid), propertyNames};
        }
      }
    }
  }
  [_unregisterReference](innerPropertyNames) {
    if (_.has(this, innerPropertyNames)) {
      const oldUUID = _.get(this, innerPropertyNames);
      if (oldUUID !== null) {
        const uuid = this.getUUID();
        const outerPropertyNames = innerPropertyNames.map(innerPropertyName =>
          typeof(innerPropertyName) === "symbol" ? String(innerPropertyName).slice(7, -1) : innerPropertyName
        );
        this[_addStockedOrder](() => {
          const backwardIndex = this.getRootNode()[_backwardIndex];
          backwardIndex[oldUUID].delete(JSON.stringify({uuid, propertyNames: outerPropertyNames}));
          if (backwardIndex[oldUUID].size === 0) delete backwardIndex[oldUUID];
        });
      }
    }
  }
  [_registerReference](innerPropertyNames, newUUID) {
    if (newUUID !== null) {
      const uuid = this.getUUID();
      const outerPropertyNames = innerPropertyNames.map(innerPropertyName =>
        typeof(innerPropertyName) === "symbol" ? String(innerPropertyName).slice(7, -1) : innerPropertyName
      );
      this[_addStockedOrder](() => {
        const backwardIndex = this.getRootNode()[_backwardIndex];
        if (!(newUUID in backwardIndex)) backwardIndex[newUUID] = new Set();
        backwardIndex[newUUID].add(JSON.stringify({uuid, propertyNames: outerPropertyNames}));
      });
    }
  }
  [_overwriteReference](innerPropertyNames, newUUID) {
    this[_unregisterReference](innerPropertyNames);
    _.set(this, innerPropertyNames, newUUID);
    this[_registerReference](innerPropertyNames, newUUID);
  }
  [_overwriteReferenceArray](innerPropertyNames, newUUIDs) {
    if (_.has(this, innerPropertyNames)) {
      const oldUUIDs = _.get(this, innerPropertyNames);
      for (const [index, oldUUID] of oldUUIDs.entries()) {
        this[_unregisterReference]([...innerPropertyNames, index]);
      }
    }
    const thisNode = this;
    _.set(this, innerPropertyNames, new Proxy([...newUUIDs], {
      set(target, property, newUUID) {
        const intProperty = parseInt(property, 10);
        if (!Number.isNaN(intProperty)) {
          thisNode[_unregisterReference]([...innerPropertyNames, intProperty]);
        }
        target[property] = newUUID;
        if (!Number.isNaN(intProperty)) {
          thisNode[_registerReference]([...innerPropertyNames, intProperty], newUUID);
        }
        return true;
      }
    }));
    for (const [index, newUUID] of newUUIDs.entries()) {
      this[_registerReference]([...innerPropertyNames, index], newUUID);
    }
  }
  [_overwriteNode](innerPropertyNames, value) {
    if (_.has(this, innerPropertyNames)) {
      const oldNode = _.get(this, innerPropertyNames);
      if (oldNode !== null) {
        oldNode[_clear]();
      }
    }
    _.set(this, innerPropertyNames, value);
    if (value !== null) {
      value[_parentNode] = this;
    }
  }
  [_overwriteChain](innerPropertyNames, values) {
    if (_.has(this, innerPropertyNames)) {
      for (const value of _.get(this, innerPropertyNames)) {
        value[_clear]();
      }
    }
    _.set(this, innerPropertyNames, new ObservableLinkedChain(values, value => {
      value[_parentNode] = this;
    }, value => {
      value[_clear]();
    }));
    for (const value of _.get(this, innerPropertyNames)) {
      value[_parentNode] = this;
    }
  }
  getRootNode() {
    return this[_rootNode];
  }
  getAncestorNode() {
    let node;
    for (node = this; node.getParentNode() !== null; node = node.getParentNode());
    return node;
  }
  getParentNode() {
    return this[_parentNode];
  }
  getUUID() {
    return this[_uuid];
  }
  isReachableNode() {
    return this.getAncestorNode() === this.getRootNode();
  }
}

Object.assign(_value, {
  header: Symbol("header"),
  info: Symbol("info"),
  vertices: Symbol("vertices"),
  textures: Symbol("textures"),
  materials: Symbol("materials"),
  bones: Symbol("bones"),
  morphs: Symbol("morphs"),
  displayElementGroups: Symbol("displayElementGroups"),
  rigidBodies: Symbol("rigidBodies"),
  joints: Symbol("joints"),
});
export default class PMX extends Node {
  init(
    header,
    info,
    vertices,
    textures,
    materials,
    bones,
    morphs,
    displayElementGroups,
    rigidBodies,
    joints,
  ) {
    return Object.assign(this, {
      header,
      info,
      vertices,
      textures,
      materials,
      bones,
      morphs,
      displayElementGroups,
      rigidBodies,
      joints,
    });
  }
  get header() {
    return this[_value.header];
  }
  set header(value) {
    this[_overwriteNode]([_value.header], value);
  }
  get info() {
    return this[_value.info];
  }
  set info(value) {
    this[_overwriteNode]([_value.info], value);
  }
  get vertices() {
    return this[_value.vertices];
  }
  set vertices(value) {
    this[_overwriteChain]([_value.vertices], value);
  }
  get textures() {
    return this[_value.textures];
  }
  set textures(value) {
    this[_overwriteChain]([_value.textures], value);
  }
  get materials() {
    return this[_value.materials];
  }
  set materials(value) {
    this[_overwriteChain]([_value.materials], value);
  }
  get bones() {
    return this[_value.bones];
  }
  set bones(value) {
    this[_overwriteChain]([_value.bones], value);
  }
  get morphs() {
    return this[_value.morphs];
  }
  set morphs(value) {
    this[_overwriteChain]([_value.morphs], value);
  }
  get displayElementGroups() {
    return this[_value.displayElementGroups];
  }
  set displayElementGroups(value) {
    this[_overwriteChain]([_value.displayElementGroups], value);
  }
  get rigidBodies() {
    return this[_value.rigidBodies];
  }
  set rigidBodies(value) {
    this[_overwriteChain]([_value.rigidBodies], value);
  }
  get joints() {
    return this[_value.joints];
  }
  set joints(value) {
    this[_overwriteChain]([_value.joints], value);
  }
  [_addStockedOrder](stockedOrder) {
    stockedOrder();
  }
  hasNode(uuid) {
    return uuid in this[_uuidToNode];
  }
  getNode(uuid) {
    if (uuid === null) return null;
    if (!this.hasNode(uuid)) throw new Error("uuid not found");
    return this[_uuidToNode][uuid];
  }
  createNode(klass) {
    return Object.assign(new klass(), {
      [_rootNode]: this,
    }, {
      [_uuid]: uuidv4(),
    });
  }
  clone() {
    const rootNode = new this.constructor();
    return Object.assign(rootNode, {
      [_rootNode]: rootNode,
      [_uuidToNode]: Object.create(null),
      [_backwardIndex]: Object.create(null),
    }, {
      [_uuid]: uuidv4(),
    }).init(
      this.header[_cloneForRoot](rootNode),
      this.info[_cloneForRoot](rootNode),
      this.vertices.map(vertex => vertex[_cloneForRoot](rootNode)),
      this.textures.map(texture => texture[_cloneForRoot](rootNode)),
      this.materials.map(material => material[_cloneForRoot](rootNode)),
      this.bones.map(bone => bone[_cloneForRoot](rootNode)),
      this.morphs.map(morph => morph[_cloneForRoot](rootNode)),
      this.displayElementGroups.map(displayElementGroup => displayElementGroup[_cloneForRoot](rootNode)),
      this.rigidBodies.map(rigidBody => rigidBody[_cloneForRoot](rootNode)),
      this.joints.map(joint => joint[_cloneForRoot](rootNode)),
    );
  }
  clear() {
    this.header = null;
    this.info = null;
    this.vertices = [];
    this.textures = [];
    this.materials = [];
    this.bones = [];
    this.morphs = [];
    this.displayElementGroups = [];
    this.rigidBodies = [];
    this.joints = [];
    super[_clear]();
  }
  [_toInternalPMX]() {
    const uuidToIndex = [].concat(
      ...["vertices", "textures", "materials", "bones", "morphs", "rigidBodies"].map(property => this[property].map((node, i) => ([node.getUUID(), i])))
    ).reduce((obj, [key, value]) => Object.assign(obj, {[key]: value}), Object.create(null));
    const utils = {
      getIndex(uuid) {
        if (uuid === null) return -1;
        return uuidToIndex[uuid];
      },
    };
    return new InternalPMX(
      this.header[_toInternalPMX]({utils}),
      this.info[_toInternalPMX]({utils}),
      this.vertices.map(vertex => vertex[_toInternalPMX]({utils})),
      [].concat(...this.materials.map(material => material.faces.map(face => face[_toInternalPMX]({utils})))),
      this.textures.map(texture => texture[_toInternalPMX]({utils})),
      this.materials.map(material => material[_toInternalPMX]({utils})),
      this.bones.map(bone => bone[_toInternalPMX]({utils})),
      this.morphs.map(morph => morph[_toInternalPMX]({utils})),
      this.displayElementGroups.map(displayElementGroup => displayElementGroup[_toInternalPMX]({utils})),
      this.rigidBodies.map(rigidBody => rigidBody[_toInternalPMX]({utils})),
      this.joints.map(joint => joint[_toInternalPMX]({utils})),
    );
  }
  write() {
    return this[_toInternalPMX]().write();
  }
  static [_fromInternalPMX](element) {
    const currentNode = new this();
    const indexToUUID = {
      vertices: new Array(element.vertices.length).fill().map(() => uuidv4()),
      textures: new Array(element.textures.length).fill().map(() => uuidv4()),
      materials: new Array(element.materials.length).fill().map(() => uuidv4()),
      bones: new Array(element.bones.length).fill().map(() => uuidv4()),
      morphs: new Array(element.morphs.length).fill().map(() => uuidv4()),
      rigidBodies: new Array(element.rigidBodies.length).fill().map(() => uuidv4()),
    };
    const backwardIndex = Object.create(null);
    const uuidToNode = Object.create(null);
    const utils = {
      rootNode: currentNode,
      getReferredUUID(kind, index) {
        return index >= 0 ? indexToUUID[kind][index] : null;
      },
    };
    Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
      [_uuidToNode]: uuidToNode,
      [_backwardIndex]: backwardIndex,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      this.Header[_fromInternalPMX]({
        element: element.header,
        utils
      }),
      this.Info[_fromInternalPMX]({
        element: element.info,
        utils,
      }),
      element.vertices.map((vertex, i) => this.Vertex[_fromInternalPMX]({
        element: vertex,
        uuid: indexToUUID.vertices[i],
        utils,
      })),
      element.textures.map((texture, i) => this.Texture[_fromInternalPMX]({
        element: texture,
        uuid: indexToUUID.textures[i],
        utils,
      })),
      element.materials.map((material, i) => {
        const faceStartIndex = element.materials.slice(0, i).map(m => m.faceCount).reduce((sum, faceCount) => sum + faceCount, 0);
        const faceEndIndex = faceStartIndex + material.faceCount;
        return this.Material[_fromInternalPMX]({
          element: material,
          faceElements: element.faces.slice(faceStartIndex, faceEndIndex),
          uuid: indexToUUID.materials[i],
          utils,
        });
      }),
      element.bones.map((bone, i) => this.Bone[_fromInternalPMX]({
        element: bone,
        uuid: indexToUUID.bones[i],
        utils,
      })),
      element.morphs.map((morph, i) => this.Morph[_fromInternalPMX]({
        element: morph,
        uuid: indexToUUID.morphs[i],
        utils,
      })),
      element.displayElementGroups.map(elementGroup => this.DisplayElementGroup[_fromInternalPMX]({
        element: elementGroup,
        utils,
      })),
      element.rigidBodies.map((rigidBody, i) => this.RigidBody[_fromInternalPMX]({
        element: rigidBody,
        uuid: indexToUUID.rigidBodies[i],
        utils,
      })),
      element.joints.map(joint => this.Joint[_fromInternalPMX]({
        element: joint,
        utils,
      })),
    );
    return currentNode;
  }
  static read(binary) {
    return this[_fromInternalPMX](InternalPMX.read(binary));
  }
}
_value.Header = {
  extraUVCount: Symbol("extraUVCount"),
};
PMX.Header = class Header extends Node {
  init(
    encoding,
    extraUVCount,
  ) {
    return Object.assign(this, {
      encoding,
      extraUVCount,
    });
  }
  get extraUVCount() {
    return this[_value.Header.extraUVCount];
  }
  set extraUVCount(newValue) {
    if (this.hasOwnProperty(_value.Header.extraUVCount)) {
      const oldValue = this[_value.Header.extraUVCount];
      if (oldValue < newValue) {
        for (const vertex of this.getRootNode().vertices) {
          vertex.extraUVs.push(...new Array(newValue - oldValue).fill(Vector4.zero));
        }
      } else if (newValue < oldValue) {
        for (const vertex of this.getRootNode().vertices) {
          vertex.extraUVs.splice(newValue - oldValue);
        }
      }
    }
    this[_value.Header.extraUVCount] = newValue;
  }
  get vertexIndexSize() {
    const rootNode = this.getRootNode();
    return rootNode.vertices.length <= 255 ? 1 : rootNode.vertices.length <= 65535 ? 2 : 4;
  }
  get textureIndexSize() {
    const rootNode = this.getRootNode();
    return rootNode.textures.length <= 127 ? 1 : rootNode.textures.length <= 32767 ? 2 : 4;
  }
  get materialIndexSize() {
    const rootNode = this.getRootNode();
    return rootNode.materials.length <= 127 ? 1 : rootNode.materials.length <= 32767 ? 2 : 4;
  }
  get boneIndexSize() {
    const rootNode = this.getRootNode();
    return rootNode.bones.length <= 127 ? 1 : rootNode.bones.length <= 32767 ? 2 : 4;
  }
  get morphIndexSize() {
    const rootNode = this.getRootNode();
    return rootNode.morphs.length <= 127 ? 1 : rootNode.morphs.length <= 32767 ? 2 : 4;
  }
  get rigidBodyIndexSize() {
    const rootNode = this.getRootNode();
    return rootNode.rigidBodies.length <= 127 ? 1 : rootNode.rigidBodies.length <= 32767 ? 2 : 4;
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.encoding,
      this.extraUVCount,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.encoding,
      this.extraUVCount,
    );
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Header(
      this.encoding,
      this.extraUVCount,
      this.vertexIndexSize,
      this.textureIndexSize,
      this.materialIndexSize,
      this.boneIndexSize,
      this.morphIndexSize,
      this.rigidBodyIndexSize,
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.encoding,
      element.extraUVCount,
    );
  }
};
_value.Info = {};
PMX.Info = class Info extends Node {
  init(
    japaneseName,
    englishName,
    japaneseComment,
    englishComment,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      japaneseComment,
      englishComment,
    });
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      this.japaneseComment,
      this.englishComment,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      this.japaneseComment,
      this.englishComment,
    );
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Info(
      this.japaneseName,
      this.englishName,
      this.japaneseComment,
      this.englishComment,
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.japaneseName,
      element.englishName,
      element.japaneseComment,
      element.englishComment,
    );
  }
};
_value.Vertex = {
  weight: Symbol("weight"),
};
PMX.Vertex = class Vertex extends Node {
  init(
    position,
    normal,
    uv,
    extraUVs,
    weight,
    edgeSizeRate,
  ) {
    return Object.assign(this, {
      position,
      normal,
      uv,
      extraUVs,
      weight,
      edgeSizeRate,
    });
  }
  get weight() {
    return this[_value.Vertex.weight];
  }
  set weight(value) {
    this[_overwriteNode]([_value.Vertex.weight], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.position,
      this.normal,
      this.uv,
      this.extraUVs.slice(),
      this.weight[_cloneForRoot](rootNode),
      this.edgeSizeRate,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.position,
      this.normal,
      this.uv,
      this.extraUVs.slice(),
      this.weight.clone(),
      this.edgeSizeRate,
    );
  }
  [_clear]() {
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Material.Face && propertyNames[0] === "vertexUUIDs") {
        node.getParentNode().faces.delete(node);
      } else if (node instanceof PMX.Morph.Offset.Vertex && propertyNames[0] === "vertexUUID") {
        node.getParentNode().offsets.delete(node);
      } else if (node instanceof PMX.Morph.Offset.UV && propertyNames[0] === "vertexUUID") {
        node.getParentNode().offsets.delete(node);
      }
    }
    this.weight = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Vertex(
      this.position,
      this.normal,
      this.uv,
      this.extraUVs.slice(),
      this.weight[_toInternalPMX]({utils}),
      this.edgeSizeRate,
    );
  }
  static [_fromInternalPMX]({element, uuid, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuid,
    }).init(
      element.position,
      element.normal,
      element.uv,
      element.extraUVs.slice(),
      this.Weight[element.weight.constructor.name][_fromInternalPMX]({
        element: element.weight,
        utils,
      }),
      element.edgeSizeRate,
    );
  }
};
_value.Vertex.Weight = {
  BDEF1: {
    bones: Symbol("bones"),
  },
  BDEF2: {
    bones: Symbol("bones"),
  },
  BDEF4: {
    bones: Symbol("bones"),
  },
  SDEF: {
    bones: Symbol("bones"),
  },
  Bone: {
    uuid: Symbol("uuid"),
  },
};
PMX.Vertex.Weight = {
  BDEF1: class BDEF1 extends Node {
    init(
      bones,
    ) {
      return Object.assign(this, {
        bones,
      });
    }
    get bones() {
      return this[_value.Vertex.Weight.BDEF1.bones];
    }
    set bones(value) {
      this[_overwriteChain]([_value.Vertex.Weight.BDEF1.bones], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.bones.map(bone => bone[_cloneForRoot](rootNode)),
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.bones.map(bone => bone.clone()),
      );
    }
    [_clear]() {
      this.bones = [];
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Vertex.Weight.BDEF1(
        this.bones.map(bone => bone[_toInternalPMX]({utils})),
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        element.bones.map(bone => this.Bone[_fromInternalPMX]({
          element: bone,
          utils,
        })),
      );
    }
  },
  BDEF2: class BDEF2 extends Node {
    init(
      bones,
    ) {
      return Object.assign(this, {
        bones,
      });
    }
    get bones() {
      return this[_value.Vertex.Weight.BDEF2.bones];
    }
    set bones(value) {
      this[_overwriteChain]([_value.Vertex.Weight.BDEF2.bones], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.bones.map(bone => bone[_cloneForRoot](rootNode)),
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.bones.map(bone => bone.clone()),
      );
    }
    [_clear]() {
      this.bones = [];
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Vertex.Weight.BDEF2(
        this.bones.map(bone => bone[_toInternalPMX]({utils})),
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        element.bones.map(bone => this.Bone[_fromInternalPMX]({
          element: bone,
          utils,
        })),
      );
    }
  },
  BDEF4: class BDEF4 extends Node {
    init(
      bones,
    ) {
      return Object.assign(this, {
        bones,
      });
    }
    get bones() {
      return this[_value.Vertex.Weight.BDEF4.bones];
    }
    set bones(value) {
      this[_overwriteChain]([_value.Vertex.Weight.BDEF4.bones], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.bones.map(bone => bone[_cloneForRoot](rootNode)),
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.bones.map(bone => bone.clone()),
      );
    }
    [_clear]() {
      this.bones = [];
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Vertex.Weight.BDEF4(
        this.bones.map(bone => bone[_toInternalPMX]({utils})),
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        element.bones.map(bone => this.Bone[_fromInternalPMX]({
          element: bone,
          utils,
        })),
      );
    }
  },
  SDEF: class SDEF extends Node {
    init(
      bones,
      c,
      r0,
      r1,
    ) {
      return Object.assign(this, {
        bones,
        c,
        r0,
        r1,
      });
    }
    get bones() {
      return this[_value.Vertex.Weight.SDEF.bones];
    }
    set bones(value) {
      this[_overwriteChain]([_value.Vertex.Weight.SDEF.bones], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.bones.map(bone => bone[_cloneForRoot](rootNode)),
        this.c,
        this.r0,
        this.r1,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.bones.map(bone => bone.clone()),
        this.c,
        this.r0,
        this.r1,
      );
    }
    [_clear]() {
      this.bones = [];
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Vertex.Weight.SDEF(
        this.bones.map(bone => bone[_toInternalPMX]({utils})),
        this.c,
        this.r0,
        this.r1,
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        element.bones.map(bone => this.Bone[_fromInternalPMX]({
          element: bone,
          utils,
        })),
        element.c,
        element.r0,
        element.r1,
      );
    }
  },
  Bone: class Bone extends Node {
    init(
      uuid,
      weight,
    ) {
      return Object.assign(this, {
        uuid,
        weight,
      });
    }
    getNode() {
      return this.getRootNode().getNode(this.uuid);
    }
    get uuid() {
      return this[_value.Vertex.Weight.Bone.uuid];
    }
    set uuid(value) {
      this[_overwriteReference]([_value.Vertex.Weight.Bone.uuid], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.uuid,
        this.weight,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.uuid,
        this.weight,
      );
    }
    [_clear]() {
      this.uuid = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return {
        index: utils.getIndex(this.uuid),
        weight: this.weight,
      };
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        utils.getReferredUUID("bones", element.index),
        element.weight,
      );
    }
  },
};
PMX.Vertex.Weight.BDEF1.Bone = PMX.Vertex.Weight.Bone;
PMX.Vertex.Weight.BDEF2.Bone = PMX.Vertex.Weight.Bone;
PMX.Vertex.Weight.BDEF4.Bone = PMX.Vertex.Weight.Bone;
PMX.Vertex.Weight.SDEF.Bone = PMX.Vertex.Weight.Bone;
_value.Texture = {};
PMX.Texture = class Texture extends Node {
  init(
    filePath,
  ) {
    return Object.assign(this, {
      filePath,
    });
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.filePath,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.filePath,
    );
  }
  [_clear]() {
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Material && propertyNames[0] === "textureUUID") {
        node.textureUUID = null;
      } else if (node instanceof PMX.Material.SphereTexture && propertyNames[0] === "uuid") {
        node.uuid = null;
        node.mode = "disabled";
      } else if (node instanceof PMX.Material.ToonTexture && propertyNames[0] === "uuid") {
        node.uuid = null;
      }
    }
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Texture(
      this.filePath,
    );
  }
  static [_fromInternalPMX]({element, uuid, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuid,
    }).init(
      element.filePath,
    );
  }
};
_value.Material = {
  textureUUID: Symbol("textureUUID"),
  sphereTexture: Symbol("sphereTexture"),
  toonTexture: Symbol("toonTexture"),
  faces: Symbol("faces"),
};
PMX.Material = class Material extends Node {
  init(
    japaneseName,
    englishName,
    diffuse,
    specular,
    ambient,
    isDoubleSided,
    rendersGroundShadow,
    makesSelfShadow,
    rendersSelfShadow,
    rendersEdge,
    edge,
    textureUUID,
    sphereTexture,
    toonTexture,
    memo,
    faces,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      diffuse,
      specular,
      ambient,
      isDoubleSided,
      rendersGroundShadow,
      makesSelfShadow,
      rendersSelfShadow,
      rendersEdge,
      edge,
      textureUUID,
      sphereTexture,
      toonTexture,
      memo,
      faces,
    });
  }
  getTextureNode() {
    return this.getRootNode().getNode(this.textureUUID);
  }
  get textureUUID() {
    return this[_value.Material.textureUUID];
  }
  set textureUUID(value) {
    this[_overwriteReference]([_value.Material.textureUUID], value);
  }
  get sphereTexture() {
    return this[_value.Material.sphereTexture];
  }
  set sphereTexture(value) {
    this[_overwriteNode]([_value.Material.sphereTexture], value);
  }
  get toonTexture() {
    return this[_value.Material.toonTexture];
  }
  set toonTexture(value) {
    this[_overwriteNode]([_value.Material.toonTexture], value);
  }
  get faces() {
    return this[_value.Material.faces];
  }
  set faces(value) {
    this[_overwriteChain]([_value.Material.faces], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      Object.assign({}, this.diffuse),
      Object.assign({}, this.specular),
      Object.assign({}, this.ambient),
      this.isDoubleSided,
      this.rendersGroundShadow,
      this.makesSelfShadow,
      this.rendersSelfShadow,
      this.rendersEdge,
      Object.assign({}, this.edge),
      this.textureUUID,
      this.sphereTexture[_cloneForRoot](rootNode),
      this.toonTexture[_cloneForRoot](rootNode),
      this.memo,
      this.faces.map(face => face[_cloneForRoot](rootNode)),
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      Object.assign({}, this.diffuse),
      Object.assign({}, this.specular),
      Object.assign({}, this.ambient),
      this.isDoubleSided,
      this.rendersGroundShadow,
      this.makesSelfShadow,
      this.rendersSelfShadow,
      this.rendersEdge,
      Object.assign({}, this.edge),
      this.textureUUID,
      this.sphereTexture.clone(),
      this.toonTexture.clone(),
      this.memo,
      this.faces.map(face => face.clone()),
    );
  }
  [_clear]() {
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Morph.Offset.Material && propertyNames[0] === "materialUUID") {
        node.getParentNode().offsets.delete(node);
      }
    }
    this.textureUUID = null;
    this.sphereTexture = null;
    this.toonTexture = null;
    this.faces = [];
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Material(
      this.japaneseName,
      this.englishName,
      Object.assign({}, this.diffuse),
      Object.assign({}, this.specular),
      Object.assign({}, this.ambient),
      this.isDoubleSided,
      this.rendersGroundShadow,
      this.makesSelfShadow,
      this.rendersSelfShadow,
      this.rendersEdge,
      Object.assign({}, this.edge),
      utils.getIndex(this.textureUUID),
      this.sphereTexture[_toInternalPMX]({utils}),
      this.toonTexture[_toInternalPMX]({utils}),
      this.memo,
      this.faces.length,
    );
  }
  static [_fromInternalPMX]({element, faceElements, uuid, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuid,
    }).init(
      element.japaneseName,
      element.englishName,
      Object.assign({}, element.diffuse),
      Object.assign({}, element.specular),
      Object.assign({}, element.ambient),
      element.isDoubleSided,
      element.rendersGroundShadow,
      element.makesSelfShadow,
      element.rendersSelfShadow,
      element.rendersEdge,
      Object.assign({}, element.edge),
      utils.getReferredUUID("textures", element.textureIndex),
      this.SphereTexture[_fromInternalPMX]({
        element: element.sphereTexture,
        utils,
      }),
      this.ToonTexture[_fromInternalPMX]({
        element: element.toonTexture,
        utils,
      }),
      element.memo,
      faceElements.map(faceElement => this.Face[_fromInternalPMX]({
        element: faceElement,
        utils,
      })),
    );
  }
};
_value.Material.SphereTexture = {
  uuid: Symbol("uuid"),
};
PMX.Material.SphereTexture = class SphereTexture extends Node {
  init(
    uuid,
    mode,
  ) {
    return Object.assign(this, {
      uuid,
      mode,
    });
  }
  getNode() {
    return this.getNodeFromUUID(this.uuid);
  }
  get uuid() {
    return this[_value.Material.SphereTexture.uuid];
  }
  set uuid(value) {
    this[_overwriteReference]([_value.Material.SphereTexture.uuid], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.uuid,
      this.mode,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.uuid,
      this.mode,
    );
  }
  [_clear]() {
    this.uuid = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return {
      index: utils.getIndex(this.uuid),
      mode: this.mode,
    };
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      utils.getReferredUUID("textures", element.index),
      element.mode,
    );
  }
};
_value.Material.ToonTexture = {
  uuid: Symbol("uuid"),
};
PMX.Material.ToonTexture = class ToonTexture extends Node {
  init(
    isShared,
    indexOrUUID,
  ) {
    return Object.assign(this, isShared ? {
      isShared,
      index: indexOrUUID,
    } : {
      isShared,
      uuid: indexOrUUID,
    });
  }
  getNode() {
    if (this.isShared) throw new Error("Call from invalid state");
    return this.getRootNode().getNode(this.uuid);
  }
  get uuid() {
    return this[_value.Material.ToonTexture.uuid];
  }
  set uuid(value) {
    this[_overwriteReference]([_value.Material.ToonTexture.uuid], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.isShared,
      this.isShared ? this.index : this.uuid,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.isShared,
      this.isShared ? this.index : this.uuid,
    );
  }
  [_clear]() {
    if (!this.isShared) this.uuid = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return {
      isShared: this.isShared,
      index: this.isShared ? this.index : utils.getIndex(this.uuid),
    };
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.isShared,
      element.isShared ? element.index : utils.getReferredUUID("textures", element.index),
    );
  }
};
_value.Material.Face = {
  vertexUUIDs: Symbol("vertexUUIDs"),
};
PMX.Material.Face = class Face extends Node {
  init(
    vertexUUIDs,
  ) {
    return Object.assign(this, {
      vertexUUIDs,
    });
  }
  get vertexUUIDs() {
    return this[_value.Material.Face.vertexUUIDs];
  }
  set vertexUUIDs(newUUIDs) {
    this[_overwriteReferenceArray]([_value.Material.Face.vertexUUIDs], newUUIDs);
  }
  getVertexNodes() {
    return this.vertexUUIDs.map(uuid => this.getRootNode().getNode(uuid));
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.vertexUUIDs.slice(),
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.vertexUUIDs.slice(),
    );
  }
  [_clear]() {
    this.vertexUUIDs = [];
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Face(
      this.vertexUUIDs.map(uuid => utils.getIndex(uuid)),
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.vertexIndices.map(vertexIndex => utils.getReferredUUID("vertices", vertexIndex)),
    );
  }
};
_value.Bone = {
  parentBoneUUID: Symbol("parentBoneUUID"),
  connectionUUID: Symbol("connectionUUID"),
  ikInfo: Symbol("ikInfo"),
  addition: Symbol("addition"),
};
PMX.Bone = class Bone extends Node {
  init(
    japaneseName,
    englishName,
    position,
    parentBoneUUID,
    deformationOrder,
    connectionOrConnectionUUID,
    isRotatable,
    isMovable,
    isVisible,
    isControllable,
    ikInfo,
    localAdditionMode,
    addsRotation,
    addsDisplacement,
    addition,
    fixedAxis,
    localAxis,
    deformsAfterPhysics,
    keyValue,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      position,
      parentBoneUUID,
      deformationOrder,
      isRotatable,
      isMovable,
      isVisible,
      isControllable,
      ikInfo,
      localAdditionMode,
      addsRotation,
      addsDisplacement,
      addition,
      fixedAxis,
      localAxis,
      deformsAfterPhysics,
      keyValue,
    }, connectionOrConnectionUUID instanceof Vector3 ? {
      connectionType: "position",
      connection: connectionOrConnectionUUID,
    } : {
      connectionType: "bone",
      connectionUUID: connectionOrConnectionUUID,
    });
  }
  getParentBoneNode() {
    return this.getRootNode().getNode(this.parentBoneUUID);
  }
  get parentBoneUUID() {
    return this[_value.Bone.parentBoneUUID];
  }
  set parentBoneUUID(value) {
    this[_overwriteReference]([_value.Bone.parentBoneUUID], value);
  }
  getConnectionNode() {
    if (this.connectionType !== "bone") throw new Error("Call from invalid state");
    return this.getRootNode().getNode(this.connectionUUID);
  }
  get connectionUUID() {
    return this[_value.Bone.connectionUUID];
  }
  set connectionUUID(value) {
    this[_overwriteReference]([_value.Bone.connectionUUID], value);
  }
  get ikInfo() {
    return this[_value.Bone.ikInfo];
  }
  set ikInfo(value) {
    this[_overwriteNode]([_value.Bone.ikInfo], value);
  }
  get addition() {
    return this[_value.Bone.addition];
  }
  set addition(value) {
    this[_overwriteNode]([_value.Bone.addition], value);
  }
  isIK() {
    return this.ikInfo !== null;
  }
  hasAddition() {
    return this.addsRotation || this.addsDisplacement;
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
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      this.position,
      this.parentBoneUUID,
      this.deformationOrder,
      this.connectionType === "position" ? this.connection : this.connectionUUID,
      this.isRotatable,
      this.isMovable,
      this.isVisible,
      this.isControllable,
      this.isIK() ? this.ikInfo[_cloneForRoot](rootNode) : null,
      this.localAdditionMode,
      this.addsRotation,
      this.addsDisplacement,
      this.hasAddition() ? this.addition[_cloneForRoot](rootNode) : null,
      this.fixesAxis() ? this.fixedAxis : null,
      this.hasLocalAxis() ? Object.assign({}, this.localAxis) : null,
      this.deformsAfterPhysics,
      this.deformsUsingExternalParent() ? this.keyValue : null,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      this.position,
      this.parentBoneUUID,
      this.deformationOrder,
      this.connectionType === "position" ? this.connection : this.connectionUUID,
      this.isRotatable,
      this.isMovable,
      this.isVisible,
      this.isControllable,
      this.isIK() ? this.ikInfo.clone() : null,
      this.localAdditionMode,
      this.addsRotation,
      this.addsDisplacement,
      this.hasAddition() ? this.addition.clone() : null,
      this.fixesAxis() ? this.fixedAxis : null,
      this.hasLocalAxis() ? Object.assign({}, this.localAxis) : null,
      this.deformsAfterPhysics,
      this.deformsUsingExternalParent() ? this.keyValue : null,
    );
  }
  [_clear]() {
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Vertex.Weight.Bone && propertyNames[0] === "uuid") {
        const rootNode = node.getRootNode();
        const vertex = node.getParentNode().getParentNode();
        const dummyUUID = rootNode.vertices.head().getUUID();
        const activeBoneNodes = vertex.weight.bones.filter(({uuid, weight}) => uuid !== node.uuid && weight > 0);
        const activeWeightSum = activeBoneUUIDs.map(({weight}) => weight).reduce((x, y) => x + y, 0);
        const newBoneNodeObjects = activeBoneNodes.map(({uuid, weight}) => rootNode.createNode(PMX.Vertex.Weight.Bone).init(uuid, weight / activeWeightSum));
        if (vertex.weight instanceof PMX.Vertex.Weight.SDEF) {
          while (newBoneNodeObjects.length < 2) {
            newBoneNodeObjects.push(rootNode.createNode(PMX.Vertex.Weight.Bone).init(dummyUUID, 0));
          }
          vertex.weight = rootNode.createNode(PMX.Vertex.Weight.SDEF).init(newBoneNodeObjects, node.c, node.r0, node.r1);
        } else {
          if (newBoneNodeObjects.length === 0 || newBoneNodeObjects.length === 3) {
            newBoneNodeObjects.push(rootNode.createNode(PMX.Vertex.Weight.Bone).init(dummyUUID, 0));
          }
          switch (newBoneNodeObjects.length) {
          case 1:
            vertex.weight = rootNode.createNode(PMX.Vertex.Weight.BDEF1).init(newBoneNodeObjects);
            break;
          case 2:
            vertex.weight = rootNode.createNode(PMX.Vertex.Weight.BDEF2).init(newBoneNodeObjects);
            break;
          case 4:
            vertex.weight = rootNode.createNode(PMX.Vertex.Weight.BDEF4).init(newBoneNodeObjects);
            break;
          }
        }
      } else if (node instanceof PMX.Bone && propertyNames[0] === "parentBoneUUID") {
        node.getParentNode().bones.delete(node);
      } else if (node instanceof PMX.Bone && propertyNames[0] === "connectionUUID") {
        node.connectionUUID = null;
      } else if (node instanceof PMX.Bone.Addition && propertyNames[0] === "parentBoneUUID") {
        const bone = node.getParentNode();
        bone.addition = null;
        bone.addsRotation = false;
        bone.addsDisplacement = false;
      } else if (node instanceof PMX.Bone.IKInfo && propertyNames[0] === "targetUUID") {
        node.getParentNode().ikInfo = null;
      } else if (node instanceof PMX.Bone.IKInfo.Link && propertyNames[0] === "boneUUID") {
        node.getParentNode().links.delete(node);
      } else if (node instanceof PMX.Morph.Offset.Bone && propertyNames[0] === "boneUUID") {
        node.getParentNode().offsets.delete(node);
      } else if (node instanceof PMX.DisplayElementGroup.DisplayElement && propertyNames[0] === "boneUUID") {
        node.getParentNode().elements.delete(node);
      } else if (node instanceof PMX.RigidBody && propertyNames[0] === "parentBoneUUID") {
        node.getParentNode().rigidBodies.delete(node);
      }
    }
    this.parentBoneUUID = null;
    if (this.connectionType === "bone") this.connectionUUID = null;
    if (this.isIK()) this.ikInfo = null;
    if (this.hasAddition()) this.addition = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Bone(
      this.japaneseName,
      this.englishName,
      this.position,
      utils.getIndex(this.parentBoneUUID),
      this.deformationOrder,
      this.connectionType === "position" ? this.connection : utils.getIndex(this.connectionUUID),
      this.isRotatable,
      this.isMovable,
      this.isVisible,
      this.isControllable,
      this.isIK() ? this.ikInfo[_toInternalPMX]({utils}) : null,
      this.localAdditionMode,
      this.addsRotation,
      this.addsDisplacement,
      this.hasAddition() ? this.addition[_toInternalPMX]({utils}) : null,
      this.fixesAxis() ? this.fixedAxis : null,
      this.hasLocalAxis() ? Object.assign({}, this.localAxis) : null,
      this.deformsAfterPhysics,
      this.deformsUsingExternalParent() ? this.keyValue : null,
    );
  }
  static [_fromInternalPMX]({element, uuid, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuid,
    }).init(
      element.japaneseName,
      element.englishName,
      element.position,
      utils.getReferredUUID("bones", element.parentIndex),
      element.deformationOrder,
      element.connection instanceof Vector3 ? element.connection : utils.getReferredUUID("bones", element.connection),
      element.isRotatable,
      element.isMovable,
      element.isVisible,
      element.isControllable,
      element.isIK() ? this.IKInfo[_fromInternalPMX]({
        element: element.ikInfo,
        utils,
      }) : null,
      element.localAdditionMode,
      element.addsRotation,
      element.addsDisplacement,
      element.hasAddition() ? this.Addition[_fromInternalPMX]({
        element: element.addition,
        utils,
      }) : null,
      element.fixesAxis() ? element.fixedAxis : null,
      element.hasLocalAxis() ? Object.assign({}, element.localAxis) : null,
      element.deformsAfterPhysics,
      element.deformsUsingExternalParent() ? element.keyValue : null,
    );
  }
};
_value.Bone.IKInfo = {
  targetUUID: Symbol("targetUUID"),
  links: Symbol("links"),
};
PMX.Bone.IKInfo = class IKInfo extends Node {
  init(
    targetUUID,
    loopCount,
    angleLimit,
    links,
  ) {
    return Object.assign(this, {
      targetUUID,
      loopCount,
      angleLimit,
      links,
    });
  }
  getTargetNode() {
    return this.getRootNode().getNode(this.targetUUID);
  }
  get targetUUID() {
    return this[_value.Bone.IKInfo.targetUUID];
  }
  set targetUUID(value) {
    this[_overwriteReference]([_value.Bone.IKInfo.targetUUID], value);
  }
  get links() {
    return this[_value.Bone.IKInfo.links];
  }
  set links(value) {
    this[_overwriteChain]([_value.Bone.IKInfo.links], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.targetUUID,
      this.loopCount,
      this.angleLimit,
      this.links.map(link => link[_cloneForRoot](rootNode)),
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.targetUUID,
      this.loopCount,
      this.angleLimit,
      this.links.map(link => link.clone()),
    );
  }
  [_clear]() {
    this.targetUUID = null;
    this.links = [];
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Bone.IKInfo(
      utils.getIndex(this.targetUUID),
      this.loopCount,
      this.angleLimit,
      this.links.map(link => link[_toInternalPMX]({utils})),
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      utils.getReferredUUID("bones", element.targetIndex),
      element.loopCount,
      element.angleLimit,
      element.links.map(link => this.Link[_fromInternalPMX]({
        element: link,
        utils,
      })),
    );
  }
};
_value.Bone.IKInfo.Link = {
  boneUUID: Symbol("boneUUID"),
};
PMX.Bone.IKInfo.Link = class Link extends Node {
  init(
    boneUUID,
    lowerLimit,
    upperLimit,
  ) {
    return Object.assign(this, {
      boneUUID,
      lowerLimit,
      upperLimit,
    });
  }
  getBoneNode() {
    return this.getRootNode().getNode(this.boneUUID);
  }
  get boneUUID() {
    return this[_value.Bone.IKInfo.Link.boneUUID];
  }
  set boneUUID(value) {
    this[_overwriteReference]([_value.Bone.IKInfo.Link.boneUUID], value);
  }
  hasLimit() {
    return this.lowerLimit !== null && this.upperLimit !== null;
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.boneUUID,
      this.hasLimit() ? this.lowerLimit : null,
      this.hasLimit() ? this.upperLimit : null,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.boneUUID,
      this.hasLimit() ? this.lowerLimit : null,
      this.hasLimit() ? this.upperLimit : null,
    );
  }
  [_clear]() {
    this.boneUUID = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Bone.IKInfo.Link(
      utils.getIndex(this.boneUUID),
      this.hasLimit() ? this.lowerLimit : null,
      this.hasLimit() ? this.upperLimit : null,
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      utils.getReferredUUID("bones", element.boneIndex),
      element.hasLimit() ? element.lowerLimit : null,
      element.hasLimit() ? element.upperLimit : null,
    );
  }
};
_value.Bone.Addition = {
  parentBoneUUID: Symbol("parentBoneUUID"),
};
PMX.Bone.Addition = class Addition extends Node {
  init(
    parentBoneUUID,
    rate,
  ) {
    return Object.assign(this, {
      parentBoneUUID,
      rate,
    });
  }
  getParentBoneNode() {
    return this.getRootNode().getNode(this.parentBoneUUID);
  }
  get parentBoneUUID() {
    return this[_value.Bone.Addition.parentBoneUUID];
  }
  set parentBoneUUID(value) {
    this[_overwriteReference]([_value.Bone.Addition.parentBoneUUID], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.parentBoneUUID,
      this.rate,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.parentBoneUUID,
      this.rate,
    );
  }
  [_clear]() {
    this.parentBoneUUID = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return {
      parentIndex: utils.getIndex(this.parentBoneUUID),
      rate: this.rate,
    };
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      utils.getReferredUUID("bones", element.parentIndex),
      element.rate,
    );
  }
};
_value.Morph = {
  offsets: Symbol("offsets"),
};
PMX.Morph = class Morph extends Node {
  init(
    japaneseName,
    englishName,
    panel,
    type,
    offsets,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      panel,
      type,
      offsets,
    });
  }
  get offsets() {
    return this[_value.Morph.offsets];
  }
  set offsets(value) {
    this[_overwriteChain]([_value.Morph.offsets], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      this.panel,
      this.type,
      this.offsets.map(offset => offset[_cloneForRoot](rootNode)),
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      this.panel,
      this.type,
      this.offsets.map(offset => offset.clone()),
    );
  }
  [_clear]() {
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Morph.Offset.Group && propertyNames[0] === "morphUUID") {
        node.getParentNode().offsets.delete(node);
      } else if (node instanceof PMX.DisplayElementGroup.DisplayElement && propertyNames[0] === "morphUUID") {
        node.getParentNode().elements.delete(node);
      }
    }
    this.offsets = [];
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Morph(
      this.japaneseName,
      this.englishName,
      this.panel,
      this.type,
      this.offsets.map(offset => offset[_toInternalPMX]({utils})),
    );
  }
  static [_fromInternalPMX]({element, uuid, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuid,
    }).init(
      element.japaneseName,
      element.englishName,
      element.panel,
      element.type,
      element.offsets.map(offset => this.Offset[offset.constructor.name][_fromInternalPMX]({
        element: offset,
        utils,
      })),
    );
  }
};
_value.Morph.Offset = {
  Group: {
    morphUUID: Symbol("morphUUID"),
  },
  Vertex: {
    vertexUUID: Symbol("vertexUUID"),
  },
  Bone: {
    boneUUID: Symbol("boneUUID"),
  },
  UV: {
    vertexUUID: Symbol("vertexUUID"),
  },
  Material: {
    materialUUID: Symbol("materialUUID"),
  },
};
PMX.Morph.Offset = {
  Group: class Group extends Node {
    init(
      morphUUID,
      rate,
    ) {
      return Object.assign(this, {
        morphUUID,
        rate,
      });
    }
    getMorphNode() {
      return this.getRootNode().getNode(this.morphUUID);
    }
    get morphUUID() {
      return this[_value.Morph.Offset.Group.morphUUID];
    }
    set morphUUID(value) {
      this[_overwriteReference]([_value.Morph.Offset.Group.morphUUID], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.morphUUID,
        this.rate,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.morphUUID,
        this.rate,
      );
    }
    [_clear]() {
      this.morphUUID = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Morph.Offset.Group(
        utils.getIndex(this.morphUUID),
        this.rate,
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        utils.getReferredUUID("morphs", element.morphIndex),
        element.rate,
      );
    }
  },
  Vertex: class Vertex extends Node {
    init(
      vertexUUID,
      displacement,
    ) {
      return Object.assign(this, {
        vertexUUID,
        displacement,
      });
    }
    getVertexNode() {
      return this.getRootNode().getNode(this.vertexUUID);
    }
    get vertexUUID() {
      return this[_value.Morph.Offset.Vertex.vertexUUID];
    }
    set vertexUUID(value) {
      this[_overwriteReference]([_value.Morph.Offset.Vertex.vertexUUID], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.vertexUUID,
        this.displacement,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.vertexUUID,
        this.displacement,
      );
    }
    [_clear]() {
      this.vertexUUID = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Morph.Offset.Vertex(
        utils.getIndex(this.vertexUUID),
        this.displacement,
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        utils.getReferredUUID("vertices", element.vertexIndex),
        element.displacement,
      );
    }
  },
  Bone: class Bone extends Node {
    init(
      boneUUID,
      displacement,
      rotation,
    ) {
      return Object.assign(ths, {
        boneUUID,
        displacement,
        rotation,
      });
    }
    getBoneNode() {
      return this.getRootNode().getNode(this.boneUUID);
    }
    get boneUUID() {
      return this[_value.Morph.Offset.Bone.boneUUID];
    }
    set boneUUID(value) {
      this[_overwriteReference]([_value.Morph.Offset.Bone.boneUUID], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.boneUUID,
        this.displacement,
        this.rotation,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.boneUUID,
        this.displacement,
        this.rotation,
      );
    }
    [_clear]() {
      this.boneUUID = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Morph.Offset.Bone(
        utils.getIndex(this.boneUUID),
        this.displacement,
        this.rotation,
      );
    }
    static [_fromInternalPMX]({elemenutils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuid,
      }).init(
        utils.getReferredUUID("bones", element.boneIndex),
        element.displacement,
        element.rotation,
      );
    }
  },
  UV: class UV extends Node {
    init(
      vertexUUID,
      displacement,
    ) {
      return Object.assign(this, {
        vertexUUID,
        displacement,
      });
    }
    getVertexNode() {
      return this.getRootNode().getNode(this.vertexUUID);
    }
    get vertexUUID() {
      return this[_value.Morph.Offset.UV.vertexUUID];
    }
    set vertexUUID(value) {
      this[_overwriteReference]([_value.Morph.Offset.UV.vertexUUID], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.vertexUUID,
        this.displacement,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.vertexUUID,
        this.displacement,
      );
    }
    [_clear]() {
      this.vertexUUID = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Morph.Offset.UV(
        utils.getIndex(this.vertexUUID),
        this.displacement,
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuid,
      }).init(
        utils.getReferredUUID("vertices", element.vertexIndex),
        element.displacement,
      );
    }
  },
  Material: class Material extends Node {
    init(
      materialUUID,
      mode,
      diffuse,
      specular,
      ambient,
      edge,
      textureCoefficient,
      sphereTextureCoefficient,
      toonTextureCoefficient,
    ) {
      return Object.assign(this, {
        materialUUID,
        mode,
        diffuse,
        specular,
        ambient,
        edge,
        textureCoefficient,
        sphereTextureCoefficient,
        toonTextureCoefficient,
      });
    }
    getMaterialNode() {
      return this.getRootNode().getNode(this.materialUUID);
    }
    get materialUUID() {
      return this[_value.Morph.Offset.Material.materialUUID];
    }
    set materialUUID(value) {
      this[_overwriteReference]([_value.Morph.Offset.Material.materialUUID], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.materialUUID,
        this.mode,
        Object.assign({}, this.diffuse),
        Object.assign({}, this.specular),
        Object.assign({}, this.ambient),
        Object.assign({}, this.edge),
        Object.assign({}, this.textureCoefficient),
        Object.assign({}, this.sphereTextureCoefficient),
        Object.assign({}, this.toonTextureCoefficient),
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.materialUUID,
        this.mode,
        Object.assign({}, this.diffuse),
        Object.assign({}, this.specular),
        Object.assign({}, this.ambient),
        Object.assign({}, this.edge),
        Object.assign({}, this.textureCoefficient),
        Object.assign({}, this.sphereTextureCoefficient),
        Object.assign({}, this.toonTextureCoefficient),
      );
    }
    [_clear]() {
      this.materialUUID = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Morph.Offset.Material(
        utils.getIndex(this.materialUUID),
        this.mode,
        Object.assign({}, this.diffuse),
        Object.assign({}, this.specular),
        Object.assign({}, this.ambient),
        Object.assign({}, this.edge),
        Object.assign({}, this.textureCoefficient),
        Object.assign({}, this.sphereTextureCoefficient),
        Object.assign({}, this.toonTextureCoefficient),
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuid,
      }).init(
        utils.getReferredUUID("materials", element.materialIndex),
        element.mode,
        Object.assign({}, element.diffuse),
        Object.assign({}, element.specular),
        Object.assign({}, element.ambient),
        Object.assign({}, element.edge),
        Object.assign({}, element.textureCoefficient),
        Object.assign({}, element.sphereTextureCoefficient),
        Object.assign({}, element.toonTextureCoefficient),
      );
    }
  },
};
_value.DisplayElementGroup = {
  elements: Symbol("element"),
};
PMX.DisplayElementGroup = class DisplayElementGroup extends Node {
  init(
    japaneseName,
    englishName,
    isSpecial,
    elements,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      isSpecial,
      elements,
    });
  }
  get elements() {
    return this[_value.DisplayElementGroup.elements];
  }
  set elements(value) {
    this[_overwriteChain]([_value.DisplayElementGroup.elements], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      this.isSpecial,
      this.elements.map(element => element[_cloneForRoot](rootNode)),
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      this.isSpecial,
      this.elements.map(element => element.clone()),
    );
  }
  [_clear]() {
    this.elements = [];
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.DisplayElementGroup(
      this.japaneseName,
      this.englishName,
      this.isSpecial,
      this.elements.map(element => element[_toInternalPMX]({utils})),
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.japaneseName,
      element.englishName,
      element.isSpecial,
      element.elements.map(displayElement => this.DisplayElement[_fromInternalPMX]({
        element: displayElement,
        utils,
      })),
    );
  }
};
_value.DisplayElementGroup.DisplayElement = {
  boneUUID: Symbol("boneUUID"),
  morphUUID: Symbol("morphUUID"),
};
PMX.DisplayElementGroup.DisplayElement = class DisplayElement extends Node {
  init(
    type,
    boneUUIDOrMorphUUID,
  ) {
    return Object.assign(this, type === "bone" ? {
      type: "bone",
      boneUUID: boneUUIDOrMorphUUID,
    } : {
      type: "morph",
      morphUUID: boneUUIDOrMorphUUID,
    });
  }
  getBoneNode() {
    if (this.type !== "bone") throw new Error("Call from invalid state");
    return this.getRootNode().getNode(this.boneUUID);
  }
  get boneUUID() {
    return this[_value.DisplayElementGroup.DisplayElement.boneUUID];
  }
  set boneUUID(value) {
    this[_overwriteReference]([_value.DisplayElementGroup.DisplayElement.boneUUID], value);
  }
  getMorphNode() {
    if (this.type !== "morph") throw new Error("Call from invalid state");
    return this.getRootNode().getNode(this.morphUUID);
  }
  get morphUUID() {
    return this[_value.DisplayElementGroup.DisplayElement.morphUUID];
  }
  set morphUUID(value) {
    this[_overwriteReference]([_value.DisplayElementGroup.DisplayElement.morphUUID], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.type,
      this.type === "bone" ? this.boneUUID : this.morphUUID,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.type,
      this.type === "bone" ? this.boneUUID : this.morphUUID,
    );
  }
  [_clear]() {
    if (this.type === "bone") {
      this.boneUUID = null;
    } else {
      this.morphUUID = null;
    }
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.DisplayElementGroup.DisplayElement(
      this.type,
      this.type === "bone" ? utils.getIndex(this.boneUUID) : utils.getIndex(this.morphUUID),
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.type,
      utils.getReferredUUID("bones", element.index),
    );
  }
};
_value.RigidBody = {
  parentBoneUUID: Symbol("parentBoneUUID"),
};
PMX.RigidBody = class RigidBody extends Node {
  init(
    japaneseName,
    englishName,
    parentBoneUUID,
    group,
    nonCollisionGroupFlag,
    shape,
    size,
    position,
    rotation,
    mass,
    dampingParameterInMoving,
    dampingParameterInRotating,
    resilience,
    friction,
    physicsMode,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      parentBoneUUID,
      group,
      nonCollisionGroupFlag,
      shape,
      size,
      position,
      rotation,
      mass,
      dampingParameterInMoving,
      dampingParameterInRotating,
      resilience,
      friction,
      physicsMode,
    });
  }
  getParentBoneNode() {
    return this.getRootNode().getNode(this.parentBoneUUID);
  }
  get parentBoneUUID() {
    return this[_value.RigidBody.parentBoneUUID];
  }
  set parentBoneUUID(value) {
    this[_overwriteReference]([_value.RigidBody.parentBoneUUID], value);
  }
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      this.parentBoneUUID,
      this.group,
      this.nonCollisionGroupFlag,
      this.shape,
      this.size,
      this.position,
      this.rotation,
      this.mass,
      this.dampingParameterInMoving,
      this.dampingParameterInRotating,
      this.resilience,
      this.friction,
      this.physicsMode,
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      this.parentBoneUUID,
      this.group,
      this.nonCollisionGroupFlag,
      this.shape,
      this.size,
      this.position,
      this.rotation,
      this.mass,
      this.dampingParameterInMoving,
      this.dampingParameterInRotating,
      this.resilience,
      this.friction,
      this.physicsMode,
    );
  }
  [_clear]() {
    for (const {node, propertyNames} of this.getReferringNodes()) {
      if (node instanceof PMX.Joint.ConcreteJoint.Spring6DOF && propertyNames[0] === "parentRigidBodyAUUID") {
        node.getParentNode().getParentNode().joints.delete(node);
      } else if (node instanceof PMX.Joint.ConcreteJoint.Spring6DOF && propertyNames[0] === "parentRigidBodyBUUID") {
        node.getParentNode().getParentNode().joints.delete(node);
      }
    }
    this.parentBoneUUID = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.RigidBody(
      this.japaneseName,
      this.englishName,
      utils.getIndex(this.parentBoneUUID),
      this.group,
      this.nonCollisionGroupFlag,
      this.shape,
      this.size,
      this.position,
      this.rotation,
      this.mass,
      this.dampingParameterInMoving,
      this.dampingParameterInRotating,
      this.resilience,
      this.friction,
      this.physicsMode,
    );
  }
  static [_fromInternalPMX]({element, uuid, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuid,
    }).init(
      element.japaneseName,
      element.englishName,
      utils.getReferredUUID("bones", element.parentBoneIndex),
      element.group,
      element.nonCollisionGroupFlag,
      element.shape,
      element.size,
      element.position,
      element.rotation,
      element.mass,
      element.dampingParameterInMoving,
      element.dampingParameterInRotating,
      element.resilience,
      element.friction,
      element.physicsMode,
    );
  }
};
_value.Joint = {
  concreteJoint: Symbol("concreteJoint"),
};
PMX.Joint = class Joint extends Node {
  init(
    japaneseName,
    englishName,
    concreteJoint,
  ) {
    return Object.assign(this, {
      japaneseName,
      englishName,
      concreteJoint,
    });
  }
  get concreteJoint() {
    return this[_value.Joint.concreteJoint];
  }
  set concreteJoint(value) {
    this[_overwriteNode]([_value.Joint.concreteJoint], value);
  } 
  [_cloneForRoot](rootNode) {
    return Object.assign(new this.constructor(), {
      [_rootNode]: rootNode,
    }, {
      [_uuid]: this.getUUID(),
    }).init(
      this.japaneseName,
      this.englishName,
      this.concreteJoint[_cloneForRoot](rootNode),
    );
  }
  clone() {
    return this.getRootNode().createNode(this.constructor).init(
      this.japaneseName,
      this.englishName,
      this.concreteJoint.clone(),
    );
  }
  [_clear]() {
    this.concreteJoint = null;
    super[_clear]();
  }
  [_toInternalPMX]({utils}) {
    return new InternalPMX.Joint(
      this.japaneseName,
      this.englishName,
      this.concreteJoint[_toInternalPMX]({utils}),
    );
  }
  static [_fromInternalPMX]({element, utils}) {
    const currentNode = new this();
    return Object.assign(currentNode, {
      [_rootNode]: utils.rootNode,
    }, {
      [_uuid]: uuidv4(),
    }).init(
      element.japaneseName,
      element.englishName,
      this.ConcreteJoint[element.concreteJoint.constructor.name][_fromInternalPMX]({
        element: element.concreteJoint,
        utils,
      }),
    );
  }
};
_value.Joint.ConcreteJoint = {
  Spring6DOF: {
    parentRigidBodyAUUID: Symbol("parentRigidBodyAUUID"),
    parentRigidBodyBUUID: Symbol("parentRigidBodyBUUID"),
  },
};
PMX.Joint.ConcreteJoint = {
  Spring6DOF: class Spring6DOF extends Node {
    init(
      parentRigidBodyAUUID,
      parentRigidBodyBUUID,
      position,
      rotation,
      lowerLimitInMoving,
      upperLimitInMoving,
      lowerLimitInRotating,
      upperLimitInRotating,
      springConstantInMoving,
      springConstantInRotating,
    ) {
      return Object.assign(this, {
        parentRigidBodyAUUID,
        parentRigidBodyBUUID,
        position,
        rotation,
        lowerLimitInMoving,
        upperLimitInMoving,
        lowerLimitInRotating,
        upperLimitInRotating,
        springConstantInMoving,
        springConstantInRotating,
      });
    }
    getParentRigidBodyANode() {
      return this.getRootNode().getNode(this.parentRigidBodyAUUID);
    }
    get parentRigidBodyAUUID() {
      return this[_value.Joint.ConcreteJoint.Spring6DOF.parentRigidBodyAUUID];
    }
    set parentRigidBodyAUUID(value) {
      this[_overwriteReference]([_value.Joint.ConcreteJoint.Spring6DOF.parentRigidBodyAUUID], value);
    }
    getParentRigidBodyBNode() {
      return this.getRootNode().getNode(this.parentRigidBodyBUUID);
    }
    get parentRigidBodyBUUID() {
      return this[_value.Joint.ConcreteJoint.Spring6DOF.parentRigidBodyBUUID];
    }
    set parentRigidBodyBUUID(value) {
      this[_overwriteReference]([_value.Joint.ConcreteJoint.Spring6DOF.parentRigidBodyBUUID], value);
    }
    [_cloneForRoot](rootNode) {
      return Object.assign(new this.constructor(), {
        [_rootNode]: rootNode,
      }, {
        [_uuid]: this.getUUID(),
      }).init(
        this.parentRigidBodyAUUID,
        this.parentRigidBodyBUUID,
        this.position,
        this.rotation,
        this.lowerLimitInMoving,
        this.upperLimitInMoving,
        this.lowerLimitInRotating,
        this.upperLimitInRotating,
        this.springConstantInMoving,
        this.springConstantInRotating,
      );
    }
    clone() {
      return this.getRootNode().createNode(this.constructor).init(
        this.parentRigidBodyAUUID,
        this.parentRigidBodyBUUID,
        this.position,
        this.rotation,
        this.lowerLimitInMoving,
        this.upperLimitInMoving,
        this.lowerLimitInRotating,
        this.upperLimitInRotating,
        this.springConstantInMoving,
        this.springConstantInRotating,
      );
    }
    [_clear]() {
      this.parentRigidBodyAUUID = null;
      this.parentRigidBodyBUUID = null;
      super[_clear]();
    }
    [_toInternalPMX]({utils}) {
      return new InternalPMX.Joint.ConcreteJoint.Spring6DOF(
        utils.getIndex(this.parentRigidBodyAUUID),
        utils.getIndex(this.parentRigidBodyBUUID),
        this.position,
        this.rotation,
        this.lowerLimitInMoving,
        this.upperLimitInMoving,
        this.lowerLimitInRotating,
        this.upperLimitInRotating,
        this.springConstantInMoving,
        this.springConstantInRotating,
      );
    }
    static [_fromInternalPMX]({element, utils}) {
      const currentNode = new this();
      return Object.assign(currentNode, {
        [_rootNode]: utils.rootNode,
      }, {
        [_uuid]: uuidv4(),
      }).init(
        utils.getReferredUUID("rigidBodies", element.parentRigidBodyAIndex),
        utils.getReferredUUID("rigidBodies", element.parentRigidBodyBIndex),
        element.position,
        element.rotation,
        element.lowerLimitInMoving,
        element.upperLimitInMoving,
        element.lowerLimitInRotating,
        element.upperLimitInRotating,
        element.springConstantInMoving,
        element.springConstantInRotating,
      );
    }
  },
};
