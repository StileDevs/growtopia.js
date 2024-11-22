const Client = (await import("./dist/structures/Client.js")).default;
const Peer = (await import("./dist/structures/Peer.js")).default;
const TankPacket = (await import("./dist/packets/TankPacket.js")).default;
const TextPacket = (await import("./dist/packets/TextPacket.js")).default;
const Variant = (await import("./dist/packets/Variant.js")).default;
const ItemsDat = (await import("./dist/utils/ItemsDat.js")).default;
const Constants = (await import("./dist/Constants.js")).default;

export * from "./native.js";

export { Client, Peer, TankPacket, TextPacket, Variant, ItemsDat, Constants };
