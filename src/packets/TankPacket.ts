import type { Tank } from "../../types";

const TANK_HEADER_SIZE = 60;

/**
 * Represent a TankPacket.
 */
export class TankPacket {
  /**
   * Creates a new instance of the TankPacket class.
   * @param data The tankpacket header and data.
   */
  constructor(public data?: Tank) {}

  /**
   * Creates a new instance of the TankPacket class.
   * @param data TankPacket header and data.
   */
  public static from(data: Tank) {
    return new TankPacket(data);
  }

  /**
   * Converts a buffer to a tank packet.
   * @param buf The buffer to convert.
   */
  public static fromBuffer(buf: Buffer) {
    const data: Tank = {
      packetType: buf.readUint32LE(0),
      type: buf.readUInt8(4),
      punchID: buf.readUInt8(5),
      buildRange: buf.readUInt8(6),
      punchRange: buf.readUInt8(7),
      netID: buf.readInt32LE(8),
      targetNetID: buf.readInt32LE(12),
      state: buf.readUInt32LE(16),
      info: buf.readInt32LE(24),
      xPos: buf.readFloatLE(28),
      yPos: buf.readFloatLE(32),
      xSpeed: buf.readFloatLE(36),
      ySpeed: buf.readFloatLE(40),
      xPunch: buf.readInt32LE(48),
      yPunch: buf.readInt32LE(52)
    };

    const dataLength = buf.readUInt32LE(56);
    if (dataLength > 0) data.data = () => buf.slice(60, 60 + dataLength);

    return new TankPacket(data);
  }

  /**
   * Converts the TankPacket class to a Buffer
   */
  public parse() {
    if (!this.data) return;
    let buf = Buffer.alloc(TANK_HEADER_SIZE);

    buf.writeUInt32LE(0x4); // packetType
    buf.writeUint8(this.data.type ?? 0, 4);
    buf.writeUint8(this.data.punchID ?? 0, 5);
    buf.writeUint8(this.data.buildRange ?? 0, 6);
    buf.writeUint8(this.data.punchRange ?? 0, 7);
    buf.writeInt32LE(this.data.netID ?? 0, 8);
    buf.writeInt32LE(this.data.targetNetID ?? 0, 12);
    buf.writeUInt32LE(this.data.state ?? 0x8, 16);
    buf.writeInt32LE(this.data.info ?? 0, 24);
    buf.writeFloatLE(this.data.xPos ?? 0, 28);
    buf.writeFloatLE(this.data.yPos ?? 0, 32);
    buf.writeFloatLE(this.data.xSpeed ?? 0, 36);
    buf.writeFloatLE(this.data.ySpeed ?? 0, 40);
    buf.writeInt32LE(this.data.xPunch ?? 0, 48);
    buf.writeInt32LE(this.data.yPunch ?? 0, 52);

    if (typeof this.data.data === "function") {
      const extra = this.data.data();
      if (!Buffer.isBuffer(extra)) return;

      buf.writeUInt32LE(extra.length, 56);
      buf = Buffer.concat([buf, extra]);
    }

    return buf;
  }
}
