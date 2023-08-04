export interface ClientType {
  ip: string;
  port: number;
  setEmit: (emit: (...args: any[]) => void) => void;
  create: (maxPeers: number, isClient: boolean) => void;
  service: () => void;
  deInit: () => void;
  send: (peerID: number, count: number, packets: Buffer[]) => void;
  disconnect: (peerID: number) => void;
  disconnectLater: (peerID: number) => void;
  disconnectNow: (peerID: number) => void;
  toggleNewPacket: () => void;
  getPeerRTT: (peerID: number) => number;
  /**
   * Return [ENetPeerState](http://enet.bespin.org/enet_8h.html#a058bc368c507eb86cb47f3946f38d558) enum value
   */
  getPeerState: (peerID: number) => number;
  connect: (ipAddress: string, port: number, peerID: number) => boolean;
}

export interface ClientOptions {
  /** Built-in https web server */
  https?: {
    ip?: string;
    port?: number;
    enable?: boolean;
    type2?: boolean;
  };
  enet?: {
    ip?: string;
    port?: number;
    maxPeers?: number;
    useNewPacket?: {
      asClient?: boolean;
    };
  };
}
