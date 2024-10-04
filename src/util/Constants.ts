/**
 * Types for each Argument.
 */
enum VariantTypes {
  NONE,
  FLOAT_1,
  STRING,
  FLOAT_2,
  FLOAT_3,
  UNSIGNED_INT,
  SIGNED_INT = 0x9
}

/**
 * Growtopia Packet Types
 */
enum PacketTypes {
  UNK,
  HELLO,
  STR,
  ACTION,
  TANK,
  ERROR,
  TRACK,
  CLIENT_LOG_REQ,
  CLIENT_LOG_RES
}

export default {
  VariantTypes,
  PacketTypes
};
