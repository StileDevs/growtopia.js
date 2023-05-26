import EventEmitter from "eventemitter3";
import { ClientOptions, ClientType } from "../../types/client";
import { PacketTypes } from "../util/Constants";
import { parseAction } from "../util/Utils";
import { Peer } from "./Peer";
import { ActionEvent, LoginInfo } from "../../types";
import { TankPacket } from "../packets/TankPacket";
import { WebServer } from "./WebServer";
const Native = require("../../lib/build/Release/index.node").Client;

class Client extends EventEmitter {
  public _client: ClientType;
  public config: { ip: string; port: number };

  constructor(ip = "127.0.0.1", port = 17091, public options: ClientOptions) {
    super();

    this._client = new Native(ip, port) as ClientType;
    this.config = {
      ip,
      port
    };
    this.options = Object.assign({ https: false }, options);
  }

  public on(event: "connect", listener: (netID: number) => void): this;
  public on(event: "raw", listener: (netID: number, data: Buffer) => void): this;
  public on<T>(event: "action", listener: (peer: Peer<T>, data: ActionEvent) => void): this;
  public on<T>(event: "tank", listener: (peer: Peer<T>, data: TankPacket) => void): this;
  public on<T>(event: "auth", listener: (peer: Peer<T>, data: LoginInfo) => void): this;
  public on(event: "ready", listener: () => void): this;
  public on(event: "error", listener: (error: Error, data?: Buffer) => void): this;
  public on(event: "disconnect", listener: (netID: number) => void): this;
  public on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  public send(id: number, count: number, packets: Buffer[]) {
    return this._client.send(id, count, packets);
  }

  private emitter(emit: (...args: any[]) => void) {
    return this._client.setEmit(emit);
  }

  public listen(maxPeers: number) {
    try {
      this._client.create(maxPeers);

      this.emitter(this.emit.bind(this));

      const acceptPromise = () =>
        new Promise((resolve) => setImmediate(() => resolve(this._client.service())));

      const loop = async () => {
        while (true) await acceptPromise();
      };

      loop();
      this.emit("ready");
      this.startWeb();
      this.handleEvent();
    } catch {
      this.emit("error", new Error("Failed to initialize ENet server"));
    }
  }

  private startWeb() {
    if (this.options.https) {
      WebServer(this.config.ip, this.config.port);
    }
  }

  private handleEvent() {
    this.on("raw", (netID, data) => {
      const type = data.readInt32LE();
      const peer = new Peer(this, netID);

      console.log({ type });
      switch (type) {
        case PacketTypes.STR: {
          const parsed = parseAction(data);
          this.emit("auth", peer, parsed);
          break;
        }

        case PacketTypes.ACTION: {
          const parsed = parseAction(data);
          this.emit("action", peer, parsed);
          break;
        }

        case PacketTypes.TANK: {
          if (data.length < 60) {
            this.emit("error", new Error("Received invalid tank packet"), data);
            return peer.disconnect();
          }

          const tank = TankPacket.fromBuffer(data);

          this.emit("tank", peer, tank);
          break;
        }

        default: {
          this.emit("error", new Error(`Got unknown packet type of ${type}`), data);
          break;
        }
      }
    });
  }
}

export { Client };
