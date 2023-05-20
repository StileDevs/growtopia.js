/**
 * TextPacket class to create text packets such as for actions or other uses.
 */
class TextPacket {
  /**
   * Creates a new TextPacket class
   * @param type The type of the packet.
   * @param strings An array of strings to include, they will be joined by a newline character. (`\n`)
   */
  constructor(public type: number, public strings: string[]) {}

  /**
   * Creates a TextPacket class.
   * @param type The type of the packet.
   * @param strings Strings to include to the packet. They are not arrays, but instead they are arguments for the function.
   */
  public static from(type: number, ...strings: string[]) {
    return new TextPacket(type, strings);
  }

  /**
   * Creates a TextPacket class from a Buffer.
   * @param packet The buffer to convert.
   */
  public static fromBuffer(packet: Buffer) {
    if (packet.length < 4) throw new Error("Invalid packet received.");
    const type = packet.readUInt32LE();
    const str = packet.toString("utf-8", 4).slice(0, -1) ?? "";

    return new TextPacket(type, str.split("\n"));
  }

  /**
   * Parses the TextPacket and covnerts it to a buffer.
   */
  public parse() {
    const str = this.strings.join("\n");
    const buffer = Buffer.alloc(4 + str.length + 1); // + 1 for null terminator

    buffer.writeUInt32LE(this.type);
    buffer.write(str, 4);

    return buffer;
  }
}

export { TextPacket };
