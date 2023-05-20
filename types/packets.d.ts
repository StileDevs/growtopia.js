import { TankPacket } from "../src/packets/TankPacket";
import { TextPacket } from "../src/packets/TextPacket";
import { Variant } from "../src/packets/Variant";

/**
 * Represents the data needed for the TankPacket.
 */
export interface Tank {
  packetType?: number;
  type?: number;
  punchID?: number;
  buildRange?: number;
  punchRange?: number;
  netID?: number;
  targetNetID?: number;
  state?: number;
  info?: number;
  xPos?: number;
  yPos?: number;
  xSpeed?: number;
  ySpeed?: number;
  xPunch?: number;
  yPunch?: number;
  data?: () => Buffer;
}

/**
 * The argument type for the variant.
 */
export type VariantArg = string | number[] | number;

/**
 * Options for the Variant Packet
 */
export interface VariantOptions {
  /**
   * The netID of the variant.
   */
  netID?: number;

  /**
   * They delay (in ms) on when the client will execute the packet.
   */
  delay?: number;
}

/**
 * Represents the available type of Objects that are sendable to peers.
 */
export type Sendable = Buffer | TextPacket | TankPacket | Variant;
