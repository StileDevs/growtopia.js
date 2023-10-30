export interface StringOptions {
  id?: number;
  encoded?: boolean;
}

export interface ItemDefinition {
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
}

export interface ItemsDatMeta {
  version?: number;
  itemCount?: number;

  items: ItemDefinition[];
}
