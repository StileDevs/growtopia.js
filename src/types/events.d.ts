export interface ActionEvent {
  action: string;
  [key: string]: string;
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
