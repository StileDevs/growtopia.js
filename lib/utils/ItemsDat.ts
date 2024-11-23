import type { ItemDefinition, ItemsDatMeta, StringOptions } from "../../types";

export class ItemsDat {
  private mempos = 0;

  private key: string = "PBG892FXX982ABC*";
  private stringFields: string[] = [
    "name",
    "texture",
    "extraFile",
    "petName",
    "petPrefix",
    "petSuffix",
    "petAbility",
    "extraOptions",
    "texture2",
    "extraOptions2",
    "punchOptions",
    "extraTexture",
    "itemRenderer"
  ];

  public meta: ItemsDatMeta = {
    items: [],
    itemCount: 0,
    version: 0
  };
  constructor(public data: Buffer) {}

  private getWriteSize(items: ItemDefinition[]) {
    // magic num came from counting numeric size
    let size = 83 * items.length;

    for (const item of items) {
      const keys = Object.keys(item);

      for (const key of keys) {
        const strBuf = item[key] as unknown as string;
        if (this.stringFields.includes(key) && typeof strBuf === "string") {
          // calc length typeof item[key] === "string"
          size += strBuf.length + 2;
        }
        if (typeof item[key] === "object") {
          const buf = item[key] as unknown as Buffer;

          size += buf.length;
        }
      }
    }

    return size + 4 + 2;
  }

  public async decode() {
    if (this.mempos !== 0) this.mempos = 0; // this must be 0
    this.meta.version = this.readU16();
    this.meta.itemCount = this.readI32();

    for (let i = 0; i < this.meta.itemCount; i++) {
      const item: ItemDefinition = {};

      item.id = this.readI32();

      item.flags = this.readU8();
      item.flagsCategory = this.readU8();
      item.type = this.readU8();
      item.materialType = this.readU8();

      item.name = await this.readString({ id: item.id, encoded: true });
      item.texture = await this.readString({ id: item.id });

      item.textureHash = this.readI32();

      item.visualEffectType = this.readU8();

      item.flags2 = this.readI32();

      item.textureX = this.readU8();
      item.textureY = this.readU8();
      item.storageType = this.readU8();
      item.isStripeyWallpaper = this.readU8();
      item.collisionType = this.readU8();
      item.breakHits = this.readU8() / 6;

      item.resetStateAfter = this.readI32();

      item.bodyPartType = this.readU8();

      item.rarity = this.readI16();

      item.maxAmount = this.readU8();

      item.extraFile = await this.readString({ id: item.id });

      item.extraFileHash = this.readI32();
      item.audioVolume = this.readI32();

      item.petName = await this.readString({ id: item.id });
      item.petPrefix = await this.readString({ id: item.id });
      item.petSuffix = await this.readString({ id: item.id });
      item.petAbility = await this.readString({ id: item.id });

      item.seedBase = this.readU8();
      item.seedOverlay = this.readU8();
      item.treeBase = this.readU8();
      item.treeLeaves = this.readU8();

      item.seedColor = this.readI32();
      item.seedOverlayColor = this.readI32();
      item.ingredient = this.readI32();
      item.growTime = this.readI32();

      item.flags3 = this.readI16();
      item.isRayman = this.readI16();

      item.extraOptions = await this.readString({ id: item.id });
      item.texture2 = await this.readString({ id: item.id });

      item.extraOptions2 = await this.readString({ id: item.id });

      item.extraBytes = this.data.subarray(this.mempos, (this.mempos += 80));

      if (this.meta.version >= 11) {
        item.punchOptions = await this.readString({ id: item.id });

        if (this.meta.version >= 12) {
          item.flags4 = this.readI32();
          item.bodyPart = this.data.subarray(this.mempos, (this.mempos += 9));
        }
        if (this.meta.version >= 13) item.flags5 = this.readI32();
        if (this.meta.version >= 14) item.unknownInt1 = this.readI32();
        if (this.meta.version >= 15) {
          item.unknownBytes1 = this.data.subarray(this.mempos, (this.mempos += 25));

          item.extraTexture = await this.readString({ id: item.id });
        }
        if (this.meta.version >= 16) item.itemRenderer = await this.readString({ id: item.id });
        if (this.meta.version >= 17) item.extraFlags1 = this.readI32();
        if (this.meta.version >= 18) item.extraHash1 = this.readI32();
        if (this.meta.version >= 19)
          item.unknownBytes2 = this.data.subarray(this.mempos, (this.mempos += 9));
      }
      this.meta.items.push(item);
    }
    this.mempos = 0;
  }

  public async encode() {
    if (this.mempos !== 0) this.mempos = 0; // this must be 0
    const size = this.getWriteSize(this.meta.items);

    this.data = Buffer.alloc(size);
    this.writeI16(this.meta.version!);
    this.writeI32(this.meta.items.length);

    for (const item of this.meta.items) {
      this.writeI32(item.id!);

      this.writeU8(item.flags!);
      this.writeU8(item.flagsCategory!);
      this.writeU8(item.type!);
      this.writeU8(item.materialType!);

      await this.writeString(item.name!, item.id!, true);
      await this.writeString(item.texture!, item.id!);

      this.writeI32(item.textureHash!);

      this.writeU8(item.visualEffectType!);

      this.writeI32(item.flags2!);

      this.writeU8(item.textureX!);
      this.writeU8(item.textureY!);
      this.writeU8(item.storageType!);
      this.writeU8(item.isStripeyWallpaper!);
      this.writeU8(item.collisionType!);
      this.writeU8(item.breakHits! * 6);

      this.writeI32(item.resetStateAfter!);

      this.writeU8(item.bodyPartType!);

      this.writeI16(item.rarity!);

      this.writeU8(item.maxAmount!);

      await this.writeString(item.extraFile!, item.id!);

      this.writeI32(item.extraFileHash!);
      this.writeI32(item.audioVolume!);

      await this.writeString(item.petName!, item.id!);
      await this.writeString(item.petPrefix!, item.id!);
      await this.writeString(item.petSuffix!, item.id!);
      await this.writeString(item.petAbility!, item.id!);

      this.writeU8(item.seedBase!);
      this.writeU8(item.seedOverlay!);
      this.writeU8(item.treeBase!);
      this.writeU8(item.treeLeaves!);

      this.writeI32(item.seedColor!);
      this.writeI32(item.seedOverlayColor!);
      this.writeI32(item.ingredient!);
      this.writeI32(item.growTime!);

      this.writeI16(item.flags3!);
      this.writeI16(item.isRayman!);

      await this.writeString(item.extraOptions!, item.id!);
      await this.writeString(item.texture2!, item.id!);
      await this.writeString(item.extraOptions2!, item.id!);

      if (Buffer.isBuffer(item.extraBytes)) for (const byte of item.extraBytes) this.writeU8(byte);

      if (this.meta.version! >= 11) {
        await this.writeString(item.punchOptions || "", item.id!);

        if (this.meta.version! >= 12) {
          this.writeI32(item.flags4!);

          if (Buffer.isBuffer(item.bodyPart)) for (const byte of item.bodyPart) this.writeU8(byte);
        }
        if (this.meta.version! >= 13) this.writeI32(item.flags5!);
        if (this.meta.version! >= 14) this.writeI32(item.unknownInt1!);
        if (this.meta.version! >= 15) {
          if (Buffer.isBuffer(item.unknownBytes1))
            for (const byte of item.unknownBytes1) this.writeU8(byte);

          await this.writeString(item.extraTexture || "", item.id!);
        }

        if (this.meta.version! >= 16) {
          await this.writeString(item.itemRenderer || "", item.id!);
        }
        if (this.meta.version! >= 17) this.writeI32(item.extraFlags1!);
        if (this.meta.version! >= 18) this.writeI32(item.extraHash1!);
        if (this.meta.version! >= 19) {
          if (Buffer.isBuffer(item.unknownBytes2))
            for (const byte of item.unknownBytes2) this.writeU8(byte);
        }
      }
    }
    this.mempos = 0;
  }

  private readU8() {
    const val = this.data.readUInt8(this.mempos);
    this.mempos += 1;
    return val;
  }
  private readU16() {
    const val = this.data.readUInt16LE(this.mempos);
    this.mempos += 2;
    return val;
  }
  private readU32() {
    const val = this.data.readUInt32LE(this.mempos);
    this.mempos += 4;
    return val;
  }
  private writeU8(value: number) {
    const val = this.data.writeUInt8(value, this.mempos);
    this.mempos += 1;
    return val;
  }
  private writeU16(value: number) {
    const val = this.data.writeUInt16LE(value, this.mempos);
    this.mempos += 2;
    return val;
  }
  private writeU32(value: number) {
    const val = this.data.writeUInt32LE(value, this.mempos);
    this.mempos += 4;
    return val;
  }

  private readI8() {
    const val = this.data.readInt8(this.mempos);
    this.mempos += 1;
    return val;
  }
  private readI16() {
    const val = this.data.readInt16LE(this.mempos);
    this.mempos += 2;
    return val;
  }
  private readI32() {
    const val = this.data.readInt32LE(this.mempos);
    this.mempos += 4;
    return val;
  }
  private writeI8(value: number) {
    const val = this.data.writeInt8(value, this.mempos);
    this.mempos += 1;
    return val;
  }
  private writeI16(value: number) {
    const val = this.data.writeInt16LE(value, this.mempos);
    this.mempos += 2;
    return val;
  }
  private writeI32(value: number) {
    const val = this.data.writeInt32LE(value, this.mempos);
    this.mempos += 4;
    return val;
  }

  private async readString(
    opts: StringOptions = {
      encoded: false
    }
  ): Promise<string> {
    const len = this.data.readInt16LE(this.mempos);
    this.mempos += 2;

    if (!opts.encoded)
      return this.data.toString("utf-8", this.mempos, (this.mempos += len)) as string;
    else {
      const chars = [];
      for (let i = 0; i < len; i++) {
        chars.push(
          String.fromCharCode(
            this.data[this.mempos] ^ this.key.charCodeAt((opts.id! + i) % this.key.length)
          )
        );
        this.mempos++;
      }

      const str = chars.join("");
      return str;
    }
  }

  private writeString(str: string, id: number, encoded: boolean = false): Promise<void> {
    return new Promise((resolve) => {
      // write the str length first

      this.data.writeUInt16LE(str.length, this.mempos);
      this.mempos += 2;

      if (!encoded) {
        if (str.length) this.data.fill(str, this.mempos);

        this.mempos += str.length;
      } else {
        const chars = [];

        for (let i = 0; i < str.length; i++)
          chars.push(str.charCodeAt(i) ^ this.key.charCodeAt((i + id) % this.key.length));

        for (const char of chars) this.data[this.mempos++] = char;
      }

      return resolve();
    });
  }
}
