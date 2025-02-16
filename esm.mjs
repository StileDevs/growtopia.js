const Client = await import("./dist/structures/Client.js");
const Peer = await import("./dist/structures/Peer.js");
const TankPacket = await import("./dist/packets/TankPacket.js");
const TextPacket = await import("./dist/packets/TextPacket.js");
const Variant = await import("./dist/packets/Variant.js");
const ItemsDat = await import("./dist/utils/ItemsDat.js");
const Constants = await import("./dist/Constants.js");

export * from "./native.js";

export { Client, Peer, TankPacket, TextPacket, Variant, ItemsDat, Constants };
