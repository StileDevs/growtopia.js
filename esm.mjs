const Client = (await import("./dist/structures/Client.js")).Client;
const Peer = (await import("./dist/structures/Peer.js")).Peer;
const TankPacket = (await import("./dist/packets/TankPacket.js")).TankPacket;
const TextPacket = (await import("./dist/packets/TextPacket.js")).TextPacket;
const Variant = (await import("./dist/packets/Variant.js")).Variant;
const ItemsDat = (await import("./dist/utils/ItemsDat.js")).ItemsDat;
const Constants = await import("./dist/Constants.js");

export * from "./native.js";

export { Client, Peer, TankPacket, TextPacket, Variant, ItemsDat, Constants };
