import type { TankPacket } from "../lib/packets/TankPacket";
import type { TextPacket } from "../lib/packets/TextPacket";
import type { Variant } from "../lib/packets/Variant";

export interface StringOptions {
  id?: number;
  encoded?: boolean;
}

export interface ItemDefinition {
  [key: string]: any;
  id?: number;
  flags?: number;
  flagsCategory?: number;
  type?: number;
  materialType?: number;
  name?: string;
  texture?: string;
  textureHash?: number;
  visualEffectType?: number;
  flags2?: number;
  textureX?: number;
  textureY?: number;
  storageType?: number;
  isStripeyWallpaper?: number;
  collisionType?: number;
  breakHits?: number;
  resetStateAfter?: number;
  bodyPartType?: number;
  blockType?: number;
  growTime?: number;
  rarity?: number;
  maxAmount?: number;
  extraFile?: string;
  extraFileHash?: number;
  audioVolume?: number;
  petName?: string;
  petPrefix?: string;
  petSuffix?: string;
  petAbility?: string;
  seedBase?: number;
  seedOverlay?: number;
  treeBase?: number;
  treeLeaves?: number;
  seedColor?: number;
  seedOverlayColor?: number;
  isMultiFace?: number;
  isRayman?: number;
  extraOptions?: string;
  texture2?: string;
  extraOptions2?: string;
  punchOptions?: string;

  extraBytes?: Buffer;

  // new options
  ingredient?: number;
  flags3?: number;
  flags4?: number;
  bodyPart?: Buffer;
  flags5?: number;
  extraTexture?: string;
  itemRenderer?: string;
  unknownInt1?: number; // NOTE: not sure what this does
  unknownBytes1?: Buffer; // NOTE: not sure what this does
  extraFlags1?: number; // NOTE: not sure what this does
  extraHash1?: number; // NOTE: not sure what this does
  unknownBytes2?: Buffer; // NOTE: not sure what this does
  unknownShort1?: number; // NOTE: not sure what this does
}

export interface ItemsDatMeta {
  version?: number;
  itemCount?: number;

  items: ItemDefinition[];
}

export interface LoginInfo {
  requestedName?: string;
  tankIDName?: string;
  tankIDPass?: string;
  f?: string;
  protocol?: string;
  game_version?: string;
  fz?: string;
  lmode?: string;
  cbits?: string;
  player_age?: string;
  GDPR?: string;
  category?: string;
  totalPlaytime?: string;
  klv?: string;
  gid?: string;
  hash2?: string;
  meta?: string;
  fhash?: string;
  rid?: string;
  platformID?: string;
  deviceVersion?: string;
  country?: string;
  hash?: string;
  mac?: string;
  user?: string;
  token?: string;
  UUIDToken?: string;
  wk?: string;
  zf?: string;
  aid?: string;
  tr?: string;
  vid?: string;
  ProductId?: string;
  doorID?: string;
}

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

export interface VariantTypeBase {
  index: number;
  type: number;
  typeName: string;
}

export interface VariantTypeNumber extends VariantTypeBase {
  value: number;
}

export interface VariantTypeFloat extends VariantTypeBase {
  value: number[];
}

export interface VariantTypeString extends VariantTypeBase {
  value: string;
}

export type VariantArray = VariantTypeString | VariantTypeNumber | VariantTypeFloat;

export interface NativePeerData {
  ip: string;
  port: number;
  rtt: number;
}

export interface PeerData {
  netID: number;
  channelID: number;
}

export interface ClientOptions {
  enet?: ENetServerOptions;
}

export interface ENetServerOptions {
  ip?: string;
  port?: number;
  maxPeers?: number;
  useNewPacket?: {
    asClient?: boolean;
  };
  channelLimit?: number;
}

export interface Caching {
  players?: Map<number, number>;
}
