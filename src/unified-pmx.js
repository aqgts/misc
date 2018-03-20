import path from "path";
import PMX from "./pmx";
import ExtendedPMX from "./extended-pmx";
import BinaryUtils from "./binary-utils";
import ImageWrapper from "./image-wrapper";

// TODO: TGAのサポートが不完全
export default class UnifiedPMX {
  constructor(model, textureMap) {
    this.model = model;
    this.model.unifiedPMX = this;
    this.textureMap = textureMap;
  }
  createThreeMeshAsync() {
    return new Promise((resolve, reject) => {
      const datauriMap = new Map([...this.textureMap].map(([filePath, imageWrapper]) => [filePath, imageWrapper.canvas.toDataURL()]));
      const manager = new THREE.LoadingManager();
      manager.setURLModifier(filePath => {
        if (filePath.startsWith("data:")) {
          return filePath;
        } else if (datauriMap.has(filePath)) {
          return datauriMap.get(filePath);
        } else {
          throw new Error(`Unknown texture path: ${filePath}`);
        }
      });
      const loader = new THREE.MMDLoader(manager);
      resolve(loader.createModel(this.model.write().buffer, "pmx", "", xhr => {
        if (xhr.lengthComputable) {
          const percentComplete = xhr.loaded / xhr.total * 100;
          console.log(`${Math.round(percentComplete, 2)}% downloaded`);
        }
      }, reject));
    });
  }
  async exportToZipAsync(pmxFileName) {
    const encoder = new TextEncoder("shift_jis", {NONSTANDARD_allowLegacyEncoding: true});
    const zip = new JSZip();
    for (const texture of this.model.textures) {
      const filePath = texture.filePath.split(/[\/\\]/);
      filePath.slice(0, -1).reduce((z, name) => z.folder(name), zip).file(
        filePath[filePath.length - 1],
        await texture.getImage().exportToBinaryAsync(path.extname(texture.filePath))
      );
    }
    zip.file(pmxFileName, this.model.write());
    return await zip.generateAsync({
      type: "uint8array",
      encodeFileName: fileName => encoder.encode(fileName),
    });
  }
  static createEmptyModel() {
    return new this(this.Model.createEmptyModel(), new Map());
  }
  static async importAsync(arg, entryPoint) {
    if (typeof(arg) === "string") {
      const model = await this.Model.importAsync(arg);
      const textureMap = new Map(await Promise.all(model.textures.map(async ({filePath}) => {
        const url = new URL(filePath, new URL(arg, location.href).href).href;
        const imageWrapper = await ImageWrapper.importAsync(url);
        return [filePath, imageWrapper];
      })));
      return new this(model, textureMap);
    } else if (arg instanceof Map) {
      const model = await this.Model.importAsync(entryPoint.reduce((map, name) => map.get(name), arg));
      const textureMap = new Map(await Promise.all(model.textures.map(async ({filePath}) => {
        const file = entryPoint.slice(0, -1).concat(filePath.split(/[\/\\]/)).reduce((map, name) => map.get(name), arg);
        const imageWrapper = await ImageWrapper.importAsync(file);
        return [filePath, imageWrapper];
      })));
      return new this(model, textureMap);
    } else if (arg.isDirectory) {
      return await this.importAsync(await BinaryUtils.createFileHierarchyFromDirectoryEntryAsync(arg), entryPoint);
    } else {
      throw new TypeError("Unknown argument type");
    }
  }
  static async getEntryPoints(arg) {
    if (arg instanceof Map) {
      const entryPoints = [];
      const path = [];
      (function recur(map) {
        for (const [name, fileOrDirectory] of map) {
          if (fileOrDirectory instanceof Map) {
            path.push(name);
            recur(fileOrDirectory);
            path.pop();
          } else {
            if (path.extname(name) === ".pmx") {
              entryPoints.push(path.concat(name));
            }
          }
        }
      })(arg);
      return entryPoints;
    } else if (arg.isDirectory) {
      return await this.getEntryPoints(await BinaryUtils.createFileHierarchyFromDirectoryEntryAsync(arg));
    } else {
      throw new TypeError("Unknown argument type");
    }
  }
}
UnifiedPMX.Model = class Model extends ExtendedPMX {};
UnifiedPMX.Model.Header = class Header extends ExtendedPMX.Header {};
UnifiedPMX.Model.Info = class Info extends ExtendedPMX.Info {};
UnifiedPMX.Model.Vertex = class Vertex extends ExtendedPMX.Vertex {};
UnifiedPMX.Model.Vertex.Weight = {
  BDEF1: class BDEF1 extends ExtendedPMX.Vertex.Weight.BDEF1 {},
  BDEF2: class BDEF2 extends ExtendedPMX.Vertex.Weight.BDEF2 {},
  BDEF4: class BDEF4 extends ExtendedPMX.Vertex.Weight.BDEF4 {},
  SDEF: class SDEF extends ExtendedPMX.Vertex.Weight.SDEF {},
  Bone: class Bone extends ExtendedPMX.Vertex.Weight.Bone {},
};
UnifiedPMX.Model.Vertex.Weight.BDEF1.Bone = UnifiedPMX.Model.Vertex.Weight.Bone;
UnifiedPMX.Model.Vertex.Weight.BDEF2.Bone = UnifiedPMX.Model.Vertex.Weight.Bone;
UnifiedPMX.Model.Vertex.Weight.BDEF4.Bone = UnifiedPMX.Model.Vertex.Weight.Bone;
UnifiedPMX.Model.Vertex.Weight.SDEF.Bone = UnifiedPMX.Model.Vertex.Weight.Bone;
UnifiedPMX.Model.Texture = class Texture extends ExtendedPMX.Texture {
  getImage() {
    return this.getRootNode().unifiedPMX.textureMap.get(this.filePath);
  }
};
UnifiedPMX.Model.Material = class Material extends ExtendedPMX.Material {};
UnifiedPMX.Model.Material.SphereTexture = class SphereTexture extends ExtendedPMX.Material.SphereTexture {};
UnifiedPMX.Model.Material.ToonTexture = class ToonTexture extends ExtendedPMX.Material.ToonTexture {};
UnifiedPMX.Model.Material.Face = class Face extends ExtendedPMX.Material.Face {};
UnifiedPMX.Model.Bone = class Bone extends ExtendedPMX.Bone {};
UnifiedPMX.Model.Bone.IKInfo = class IKInfo extends ExtendedPMX.Bone.IKInfo {};
UnifiedPMX.Model.Bone.IKInfo.Link = class Link extends ExtendedPMX.Bone.IKInfo.Link {};
UnifiedPMX.Model.Bone.Addition = class Addition extends ExtendedPMX.Bone.Addition {};
UnifiedPMX.Model.Morph = class Morph extends ExtendedPMX.Morph {};
UnifiedPMX.Model.Morph.Offset = {
  Group: class Group extends ExtendedPMX.Morph.Offset.Group {},
  Vertex: class Vertex extends ExtendedPMX.Morph.Offset.Vertex {},
  Bone: class Bone extends ExtendedPMX.Morph.Offset.Bone {},
  UV: class UV extends ExtendedPMX.Morph.Offset.UV {},
  Material: class Material extends ExtendedPMX.Morph.Offset.Material {},
};
UnifiedPMX.Model.DisplayElementGroup = class DisplayElementGroup extends ExtendedPMX.DisplayElementGroup {};
UnifiedPMX.Model.DisplayElementGroup.DisplayElement = class DisplayElement extends ExtendedPMX.DisplayElementGroup.DisplayElement {};
UnifiedPMX.Model.RigidBody = class RigidBody extends ExtendedPMX.RigidBody {};
UnifiedPMX.Model.Joint = class Joint extends ExtendedPMX.Joint {};
UnifiedPMX.Model.Joint.ConcreteJoint = {
  Spring6DOF: class Spring6DOF extends ExtendedPMX.Joint.ConcreteJoint.Spring6DOF {},
};
