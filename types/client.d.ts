import { NativePeerMethod } from "./peer";

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
  /**
   * Return [ENetPeerState](http://enet.bespin.org/enet_8h.html#a058bc368c507eb86cb47f3946f38d558) enum value
   */
  connect: (ipAddress: string, port: number, peerID: number) => boolean;
  getPeer: (peerID: number) => NativePeerMethod;
}

export interface ClientOptions {
  /** Built-in https web server */
  enet?: ENetServerOptions;
}

export interface ENetServerOptions {
  ip?: string;
  port?: number;
  maxPeers?: number;
  useNewPacket?: {
    asClient?: boolean;
  };
}

export interface Caching {
  players?: Map<number, number>;
}
