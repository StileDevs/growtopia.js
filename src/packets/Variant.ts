import { TankPacket } from "./TankPacket";

// Types
import { VariantArg, VariantArray, VariantOptions } from "../../types/packets";
import { VariantTypes } from "../util/Constants";

/**
 * Represents the Variant class.
 */
class Variant {
  public index: number = 0;

  /**
   * Creates a new instance of the Variant class.
   * @param options The options for the variant.
   * @param args The arguments of the Variant.
   */
  constructor(public options: VariantOptions = {}, public args: VariantArg[]) {}

  /**
   * Creates a new Variant class.
   * @param opts The options for the variant.
   * @param args The arguments of the Variant.
   */
  public static from(opts?: VariantOptions | VariantArg, ...args: VariantArg[]) {
    if (typeof opts === "string" || typeof opts === "number" || Array.isArray(opts)) {
      args.unshift(opts);
      opts = { netID: -1, delay: 0 };
    }

    return new Variant(opts as VariantOptions, args);
  }

  public static toArray(data: Buffer): VariantArray[] {
    let arr: VariantArray[] = [];

    let pos = 60;
    const count = data.readUint8(60);
    pos += 1;

    for (let i = 1; i <= count; i++) {
      const index = data.readUint8(pos);
      pos += 1;

      const type = data.readUint8(pos);
      const typeName = VariantTypes[type];

      pos += 1;

      switch (type) {
        case VariantTypes.STRING: {
          const strLength = data.readUint32LE(pos);
          pos += 4;

          const value = data.subarray(pos, pos + strLength).toString();
          pos += strLength;

          arr.push({ index, type, typeName, value });
          break;
        }
        case VariantTypes.UNSIGNED_INT: {
          const value = data.readUint32LE(pos);
          pos += 4;

          arr.push({ index, type, typeName, value });

          break;
        }
        case VariantTypes.SIGNED_INT: {
          const value = data.readInt32LE(pos);
          pos += 4;

          arr.push({ index, type, typeName, value });
          break;
        }
        case VariantTypes.FLOAT_1: {
          const value = [data.readFloatLE(pos)];

          pos += 4;
          arr.push({ index, type, typeName, value });
          break;
        }
        case VariantTypes.FLOAT_2: {
          let value = [];

          for (let i = 1; i <= 2; i++) {
            value.push(data.readFloatLE(pos));
            pos += 4;
          }
          arr.push({ index, type, typeName, value });
          break;
        }
        case VariantTypes.FLOAT_3: {
          let value = [];

          for (let i = 1; i <= 3; i++) {
            value.push(data.readFloatLE(pos));
            pos += 4;
          }
          arr.push({ index, type, typeName, value });
          break;
        }
      }
    }
    return arr;
  }

  /**
   * Parses the data of the Variant and returns a TankPacket from it.
   */
  public parse() {
    let buf = [this.args.length];

    this.args.forEach((arg) => {
      buf.push(this.index++);

      switch (typeof arg) {
        case "string": {
          buf.push(VariantTypes.STRING);

          const bytes = new Uint32Array(1);
          bytes[0] = arg.length;

          const uint8_buf = new Uint8ClampedArray(bytes.buffer);
          const text_buf = new TextEncoder().encode(arg);

          buf = [...buf, ...uint8_buf, ...text_buf];
          break;
        }

        case "number": {
          let bytes;

          if (arg < 0) {
            bytes = new Int32Array(1);
            buf.push(VariantTypes.SIGNED_INT);
          } else {
            bytes = new Uint32Array(1);
            buf.push(VariantTypes.UNSIGNED_INT);
          }

          bytes[0] = arg;

          const uint8_buf = new Uint8ClampedArray(bytes.buffer);
          buf = [...buf, ...uint8_buf];
          break;
        }

        case "object": {
          if (!Array.isArray(arg)) return;

          const type = VariantTypes[`FLOAT_${arg.length}` as "FLOAT_1" | "FLOAT_2"];
          if (!type) return;

          buf.push(type);

          arg.forEach((float) => {
            const bytes = new Float32Array(1);
            bytes[0] = float;

            const uint8_buf = new Uint8ClampedArray(bytes.buffer);
            buf = [...buf, ...uint8_buf];
          });
          break;
        }
      }
    });

    return TankPacket.from({
      type: 0x1,
      netID: this.options.netID ?? -1,
      info: this.options.delay ?? 0,
      data: () => Buffer.from(buf)
    });
  }
}

export { Variant };
