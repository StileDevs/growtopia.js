import { ItemsDatMeta, ItemDefinition, StringOptions } from "../../types";

class ItemsDat {
  /**
   * The key used for the XOR encryption/decryption.
   */
  public key: string = "PBG892FXX982ABC*";

  /**
   * The current position of the reader/writer.
   */
  private mempos: number = 0;

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
    "punchOptions"
  ];

  /**
   * @param data The data to encode/decode.
   */
  constructor(private data?: Buffer) {}

  /**
   * Get total byte size for writing.
   * @param items An array of items
   */
  private getWriteSize(items: ItemDefinition[]) {
    let size = 196 * items.length;
    // get sizes for the string
    for (const item of items) {
      const keys = Object.keys(item);

      for (const key of keys) {
        if (this.stringFields.includes(key) && typeof item[key] === "string") {
          // calc length
          size += item[key].length + 2;
        }
      }
    }

    return size;
  }

  /**
   * Reads a string from the items.dat file whether it be XOR encrypted or not.
   * @param opts Options for reading the string.
   */
  public readString(
    opts: StringOptions = {
      encoded: false
    }
  ): Promise<string> {
    return new Promise((resolve) => {
      const length = this.data?.readInt16LE(this.mempos) as number;
      this.mempos += 2;

      if (!opts.encoded)
        return resolve(
          this.data?.toString("utf-8", this.mempos, (this.mempos += length)) as string
        );
      else {
        const chars = [];

        for (let i = 0; i < length; i++) {
          chars.push(
            String.fromCharCode(
              this.data![this.mempos] ^ this.key.charCodeAt((opts.id! + i) % this.key.length)
            )
          );

          this.mempos++;
        }

        return resolve(chars.join(""));
      }
    });
  }

  /**
   * Writes a string to the items.dat data file, whether it be XOR encrypted or not.
   * @param str The string to insert.
   * @param id The id of the item.
   * @param encoded Wether or not to XOR encrypt the stirng.
   */
  public writeString(str: string, id: number, encoded: boolean = false): Promise<undefined> {
    return new Promise((resolve) => {
      // write the str length first
      this.data?.writeUInt16LE(str.length, this.mempos);
      this.mempos += 2;

      if (!encoded) {
        this.data?.write(str, this.mempos, "utf8");

        this.mempos += str.length;
      } else {
        const chars = [];

        for (let i = 0; i < str.length; i++)
          chars.push(str.charCodeAt(i) ^ this.key.charCodeAt((i + id) % this.key.length));

        for (const char of chars) this.data![this.mempos++] = char;
      }

      return resolve(undefined);
    });
  }

  /**
   * Creates a new items.dat file.
   * @param meta The item data to use.
   */
  public encode(meta: ItemsDatMeta): Promise<Buffer> {
    return new Promise(async (resolve) => {
      if (this.mempos !== 0) this.mempos = 0; // this must be 0

      const size = this.getWriteSize(meta.items);
      this.data = Buffer.alloc(size); // create new data

      this.data.writeUInt16LE(meta.version!, this.mempos);
      this.mempos += 2;

      this.data.writeUInt32LE(meta.items.length, this.mempos);
      this.mempos += 4;

      for (const item of meta.items) {
        this.data.writeInt32LE(item.id!, this.mempos);
        this.mempos += 4;

        this.data[this.mempos++] = item.flags!;
        this.data[this.mempos++] = item.flagsCategory!;

        this.data[this.mempos++] = item.type!;
        this.data[this.mempos++] = item.materialType!;

        await this.writeString(item.name!, item.id!, true);
        await this.writeString(item.texture!, item.id!);

        this.data.writeInt32LE(item.textureHash!, this.mempos);
        this.mempos += 4;

        this.data[this.mempos++] = item.visualEffectType!;

        // flags2
        this.data.writeInt32LE(item.flags2!, this.mempos);
        this.mempos += 4;

        this.data[this.mempos++] = item.textureX!;
        this.data[this.mempos++] = item.textureY!;
        this.data[this.mempos++] = item.storageType!;
        this.data[this.mempos++] = item.isStripeyWallpaper!;
        this.data[this.mempos++] = item.collisionType!;
        this.data[this.mempos++] = item.breakHits! * 6;

        this.data.writeInt32LE(item.resetStateAfter!, this.mempos);
        this.mempos += 4;

        this.data[this.mempos++] = item.bodyPartType!;

        this.data.writeInt16LE(item.rarity!, this.mempos);
        this.mempos += 2;

        this.data[this.mempos++] = item.maxAmount!;
        await this.writeString(item.extraFile!, item.id!);

        this.data.writeInt32LE(item.extraFileHash!, this.mempos);
        this.mempos += 4;

        this.data.writeInt32LE(item.audioVolume!, this.mempos);
        this.mempos += 4;

        await this.writeString(item.petName!, item.id!);
        await this.writeString(item.petPrefix!, item.id!);
        await this.writeString(item.petSuffix!, item.id!);
        await this.writeString(item.petAbility!, item.id!);

        this.data[this.mempos++] = item.seedBase!;
        this.data[this.mempos++] = item.seedOverlay!;
        this.data[this.mempos++] = item.treeBase!;
        this.data[this.mempos++] = item.treeLeaves!;

        this.data.writeInt32LE(item.seedColor!, this.mempos);
        this.mempos += 4;

        this.data.writeInt32LE(item.seedOverlayColor!, this.mempos);
        this.mempos += 4;

        this.data.writeInt32LE(item.ingredient!, this.mempos);
        this.mempos += 4;

        this.data.writeInt32LE(item.growTime!, this.mempos);
        this.mempos += 4;

        this.data.writeInt16LE(item.flags3!, this.mempos);
        this.mempos += 2;

        this.data.writeInt16LE(item.isRayman!, this.mempos);
        this.mempos += 2;

        await this.writeString(item.extraOptions!, item.id!);
        await this.writeString(item.texture2!, item.id!);
        await this.writeString(item.extraOptions!, item.id!);

        const extraBytesObj = item.extraBytes as any;

        if (typeof extraBytesObj === "object" && extraBytesObj?.type === "Buffer")
          item.extraBytes = Buffer.from(extraBytesObj?.data);

        if (Buffer.isBuffer(item.extraBytes))
          for (const byte of item.extraBytes) this.data[this.mempos++] = byte;

        if (meta.version! >= 11) {
          await this.writeString(item.punchOptions || "", item.id!);

          if (meta.version! >= 12) {
            this.data.writeInt32LE(item.flags4!, this.mempos);
            this.mempos += 4;

            const bodyPartObj = item.bodyPart as any;

            if (typeof bodyPartObj === "object" && bodyPartObj?.type === "Buffer")
              item.bodyPart = Buffer.from(bodyPartObj?.data);

            if (Buffer.isBuffer(item.bodyPart))
              for (const byte of item.bodyPart) this.data[this.mempos++] = byte;
          }

          if (meta.version! >= 13) {
            this.data.writeInt32LE(item.flags5!, this.mempos);
            this.mempos += 4;
          }

          if (meta.version! >= 14) this.mempos += 4;

          if (meta.version! >= 15) {
            this.mempos += 25;
            await this.writeString(item.extraTexture || "", item.id!);
          }

          if (meta.version! >= 16) {
            await this.writeString(item.itemRenderer || "", item.id!);
          }

          if (meta.version! >= 17) {
            this.data.writeInt32LE(item.extraFlags1!, this.mempos);
            this.mempos += 4;
          }

          if (meta.version! >= 18) {
            this.data.writeInt32LE(item.extraHash1!, this.mempos);
            this.mempos += 4;
          }
        }
      }

      this.mempos = 0; // reset again
      return resolve(this.data);
    });
  }

  /**
   * Decodes the items.dat
   * @returns {Promise<ItemsDatMeta>}
   */
  public decode(): Promise<ItemsDatMeta> {
    return new Promise(async (resolve) => {
      const meta: ItemsDatMeta = {
        items: []
      };

      meta.version = this.data?.readUInt16LE(this.mempos);
      this.mempos += 2;

      meta.itemCount = this.data?.readUInt32LE(this.mempos);
      this.mempos += 4;

      console.log("Decoding items.dat, version:", meta.version);

      for (let i = 0; i < meta.itemCount!; i++) {
        const item: ItemDefinition = {};

        item.id = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.flags = this.data![this.mempos++];
        item.flagsCategory = this.data![this.mempos++];

        item.type = this.data![this.mempos++];
        item.materialType = this.data![this.mempos++];

        item.name = await this.readString({ id: item.id, encoded: true });
        item.texture = await this.readString({ id: item.id });

        item.textureHash = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.visualEffectType = this.data![this.mempos++];

        // flags2
        item.flags2 = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.textureX = this.data![this.mempos++];
        item.textureY = this.data![this.mempos++];
        item.storageType = this.data![this.mempos++];
        item.isStripeyWallpaper = this.data![this.mempos++];
        item.collisionType = this.data![this.mempos++];
        item.breakHits = this.data![this.mempos++] / 6;

        item.resetStateAfter = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.bodyPartType = this.data![this.mempos++];

        item.rarity = this.data?.readInt16LE(this.mempos);
        this.mempos += 2;

        item.maxAmount = this.data![this.mempos++];
        item.extraFile = await this.readString({ id: item.id });

        item.extraFileHash = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.audioVolume = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.petName = await this.readString({ id: item.id });
        item.petPrefix = await this.readString({ id: item.id });
        item.petSuffix = await this.readString({ id: item.id });
        item.petAbility = await this.readString({ id: item.id });

        item.seedBase = this.data![this.mempos++];
        item.seedOverlay = this.data![this.mempos++];
        item.treeBase = this.data![this.mempos++];
        item.treeLeaves = this.data![this.mempos++];

        item.seedColor = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.seedOverlayColor = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.ingredient = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.growTime = this.data?.readInt32LE(this.mempos);
        this.mempos += 4;

        item.flags3 = this.data?.readInt16LE(this.mempos);
        this.mempos += 2;

        item.isRayman = this.data?.readInt16LE(this.mempos);
        this.mempos += 2;

        item.extraOptions = await this.readString({ id: item.id });
        item.texture2 = await this.readString({ id: item.id });
        item.extraOptions = await this.readString({ id: item.id });

        item.extraBytes = this.data?.slice(this.mempos, (this.mempos += 80));

        if (meta.version! >= 11) {
          item.punchOptions = await this.readString({ id: item.id });

          if (meta.version! >= 12) {
            item.flags4 = this.data?.readInt32LE(this.mempos);
            this.mempos += 4;

            item.bodyPart = this.data?.slice(this.mempos, (this.mempos += 9));
          }

          if (meta.version! >= 13) {
            item.flags5 = this.data?.readInt32LE(this.mempos);
            this.mempos += 4;
          }

          if (meta.version! >= 14) this.mempos += 4;

          if (meta.version! >= 15) {
            this.mempos += 25;
            item.extraTexture = await this.readString({ id: item.id });
          }

          if (meta.version! >= 16) {
            item.itemRenderer = await this.readString({ id: item.id });
          }

          if (meta.version! >= 17) {
            item.extraFlags1 = this.data?.readInt32LE(this.mempos);
            this.mempos += 4;
          }

          if (meta.version! >= 18) {
            item.extraHash1 = this.data?.readInt32LE(this.mempos);
            this.mempos += 4;
          }
        }

        meta.items.push(item);
      }

      this.mempos = 0;
      return resolve(meta);
    });
  }
}

export { ItemsDat };
