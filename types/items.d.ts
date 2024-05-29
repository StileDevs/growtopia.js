export interface StringOptions {
  id?: number;
  encoded?: boolean;
}

export interface ItemDefinition {
  [key: string]: string;
  id?: number;
  flags?: number;
  flagsCategory?: number;
  type?: number;
  materialType?: number;
  name?: ExtendString;
  texture?: ExtendString;
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
  extraFile?: ExtendString;
  extraFileHash?: number;
  audioVolume?: number;
  petName?: ExtendString;
  petPrefix?: ExtendString;
  petSuffix?: ExtendString;
  petAbility?: ExtendString;
  seedBase?: number;
  seedOverlay?: number;
  treeBase?: number;
  treeLeaves?: number;
  seedColor?: number;
  seedOverlayColor?: number;
  isMultiFace?: number;
  isRayman?: number;
  extraOptions?: ExtendString;
  texture2?: ExtendString;
  extraOptions2?: ExtendString;
  punchOptions?: ExtendString;

  extraBytes?: Buffer;

  // new options
  ingredient?: number;
  flags3?: number;
  flags4?: number;
  bodyPart?: Buffer;
  flags5?: number;
  extraTexture?: ExtendString;
  itemRenderer?: ExtendString;
  unknownInt1?: number; // NOTE: not sure what this does
  unknownBytes1?: Buffer;
  extraFlags1?: number; // NOTE: not sure what this does
  extraHash1?: number; // NOTE: not sure what this does
}

export interface ExtendString {
  value: string;
  raw: Buffer;
}

export interface ItemsDatMeta {
  version?: number;
  itemCount?: number;

  items: ItemDefinition[];
}
