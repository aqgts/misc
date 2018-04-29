import path from "path";
import Color from "color";
import PMX from "./pmx";
import ExtendedPMX from "./extended-pmx";
import BinaryUtils from "./binary-utils";
import MyMath from "./my-math";
import ImageWrapper from "./image-wrapper";
import TextAreaWrapper from "./text-area-wrapper";
import Vector2 from "./vector2";
import Vector3 from "./vector3";
import Triangle2D from "./triangle-2d";
import Triangle3D from "./triangle-3d";

// TODO: TGAのサポートが不完全
export default class UnifiedPMX {
  constructor(model, textureMap) {
    this.model = model;
    this.model.unifiedPMX = this;
    this.textureMap = textureMap;
  }
  clone() {
    return new this.constructor(
      this.model.clone(),
      new Map([...this.textureMap].map(([filePath, imageWrapper]) => [filePath, imageWrapper.clone()]))
    );
  }
  async createThreeMeshAsync() {
    const datauriMap = new Map(await Promise.all([...this.textureMap].map(async ([filePath, imageWrapper]) => {
      const mimeType = BinaryUtils.getMIMEType(filePath);
      const blob = await new Promise((resolve, reject) => {
        imageWrapper.getCanvas().toBlob(resolve, mimeType);
      });
      return [filePath, URL.createObjectURL(blob)];
    })));
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
    return loader.createModel(this.model.write().buffer, "pmx", "", xhr => {
      if (xhr.lengthComputable) {
        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log(`${Math.round(percentComplete, 2)}% downloaded`);
      }
    }, error => {
      console.warn(error.toString());
    });
  }
  addHairMaterial(color) {
    const filePath = "hair_surface.png";
    this.textureMap.set(filePath, (() => {
      function createLine(y) {
        const line = new Array(256);
        line[0] = 0;
        for (let x = 1; x < 256; x++) {
          const upRate = ((power, coefficient) => {
            const absPower = Math.abs(power);
            if (power > 0) {
              return absPower + (1 - absPower) * coefficient;
            } else if (power < 0) {
              return (1 - absPower) * coefficient;
            } else {
              return 0.5;
            }
          })(-line[x - 1] / (256 - x), 0.5 * (1 - (line[x - 1] / 7) ** 3));
          const diff = Math.random() < upRate ? +1 : -1;
          line[x] = line[x - 1] + diff;
        }
        const shift = Math.floor(Math.random() * 256);
        for (let x = 0; x < shift; x++) {
          line.unshift(line.pop());
        }
        return line;
      }
      const lines = [];
      for (let y = 0; y < 256; y += 16) {
        lines.push(createLine(y).map(diff => (y + diff + 256) % 256));
      }
      const verticalLines = new Array(256).fill().map(() => []);
      for (let x = 0; x < 256; x++) {
        for (let i = 0; i < lines.length; i++) {
          verticalLines[x].push(lines[i][x]);
        }
      }
      const pixels = new Array(256).fill().map(() => new Array(256));
      for (let x = 0; x < 256; x++) {
        for (let i = 0; i < lines.length; i++) {
          pixels[verticalLines[x][i]][x] = Color.rgb(0, 0, 0);
          const n = (verticalLines[x][(i + 1) % lines.length] - verticalLines[x][i] + 256) % 256
          for (let j = 1; j < n; j++) {
            const y = (verticalLines[x][i] + j) % 256;
            const lerp = 0.5 * (1 - Math.min(j, 5) / 5);
            pixels[y][x] = Color.rgb(MyMath.lerp(color.red(), 255, lerp), MyMath.lerp(color.green(), 255, lerp), MyMath.lerp(color.blue(), 255, lerp));
          }
        }
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      for (let y = 0; y < 256; y++) {
        for (let x = 0; x < 256; x++) {
          context.fillStyle = pixels[y][x].string();
          context.fillRect(x, y, 1, 1);
        }
      }
      const imageWrapper = new ImageWrapper(canvas);
      imageWrapper.applyGaussianBlur(0.5);
      return imageWrapper;
    })());
    let texture = this.model.textures.find(t => t.filePath === filePath);
    if (texture === undefined) {
      texture = this.model.createNode(this.model.constructor.Texture).init(filePath);
      this.model.textures.push(texture);
    }
    const material = this.model.createNode(this.model.constructor.Material).init(
      "毛", "hair",
      {red: 1, green: 1, blue: 1, alpha: 1},
      {red: 0, green: 0, blue: 0, coefficient: 5},
      {red: 0.5, green: 0.5, blue: 0.5},
      false, true, true, true, false,
      {red: 0, green: 0, blue: 0, alpha: 1, size: 0},
      texture.getUUID(),
      this.model.createNode(this.model.constructor.Material.SphereTexture).init(null, "disabled"),
      this.model.createNode(this.model.constructor.Material.ToonTexture).init(false, null),
      "", []
    );
    this.model.materials.push(material);
    return material;
  }
  removeOrphanTextures() {
    this.model.removeOrphanTextures();
    const activeFilePathSet = new Set(this.model.textures.map(texture => texture.filePath));
    for (const filePath of [...this.textureMap.keys()].filter(filePath => !activeFilePathSet.has(filePath))) {
      this.textureMap.delete(filePath);
    }
  }
  async exportToZipAsync(pmxFileName) {
    const zip = new JSZip();
    for (const [filePath, imageWrapper] of this.textureMap) {
      const filePathElements = filePath.split(/[\/\\]/);
      filePathElements.slice(0, -1).reduce((z, name) => z.folder(name), zip).file(
        filePathElements[filePathElements.length - 1],
        await imageWrapper.exportToBinaryAsync(path.extname(filePath))
      );
    }
    zip.file(pmxFileName, this.model.write());
    return zip;
  }
  async exportToBinaryAsync(pmxFileName) {
    const encoder = new TextEncoder("shift_jis", {NONSTANDARD_allowLegacyEncoding: true});
    const zip = await this.exportToZipAsync(pmxFileName);
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
