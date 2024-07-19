export interface NativePeerMethod {
  getRTT: () => number;
  getState: () => number;
  getChannelCount: () => number;
  getConnectID: () => number;
  getIncomingBandwidth: () => unknown;
  getOutgoingBandwidth: () => number;
  getPacketsLost: () => number;
  getPacketsSent: () => number;
  getTotalWaitingData: () => number;
  getAddress: () => NativePeerAddress;
}

export interface NativePeerAddress {
  address: string;
  host: number;
}

export interface PeerData {
  netID: number;
  enet: NativePeerMethod;
}
