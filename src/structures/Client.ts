import EventEmitter from "events";
import { ClientType } from "../../types/client";
const Native = require("../../lib/build/Release/index.node").Client;

interface DataObject {
  [key: string]: string | number;
}

class Client extends EventEmitter {
  public _client: ClientType;
  public config: { ip: string; port: number; maxPeers: number };

  constructor(ip = "127.0.0.1", port = 17091, maxPeers = 1024) {
    super();

    this._client = new Native(ip, port) as ClientType;
    this.config = {
      ip,
      port,
      maxPeers
    };
    this.init();
  }

  public on(event: "connect", listener: (netID: number) => void): this;
  public on(event: "raw", listener: (netID: number, data: Buffer) => void): this;
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

  public init() {
    this._client.create(1024);

    this.emitter(this.emit.bind(this));

    const acceptPromise = () =>
      new Promise((resolve) => setImmediate(() => resolve(this._client.service())));

    const loop = async () => {
      while (true) await acceptPromise();
    };

    loop();
  }

  public parseAction(chunk: Buffer) {
    let data: DataObject = {};
    chunk[chunk.length - 1] = 0;

    let str = chunk.toString("utf-8", 4);
    const lines = str.split("\n");

    lines.forEach((line) => {
      if (line.startsWith("|")) line = line.slice(1);
      const info = line.split("|");

      let key = info[0];
      let val = info[1];

      if (key && val) {
        if (val.endsWith("\x00")) val = val.slice(0, -1);
        data[key] = val;
      }
    });

    return data;
  }
}

export { Client };
