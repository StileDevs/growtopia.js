#include <enet/enet.h>
#include <client_peer.h>

ClientPeer::ClientPeer(NAPI_CB) : Napi::ObjectWrap<ClientPeer>(info), peer(nullptr) {}

Napi::Value ClientPeer::GetRTT(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->roundTripTime);
}

Napi::Value ClientPeer::GetState(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->state);
}

Napi::Value ClientPeer::GetChannelCount(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->channelCount);
}

Napi::Value ClientPeer::GetConnectID(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->connectID);
}

Napi::Value ClientPeer::GetIncomingBandwidth(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->incomingBandwidth);
}

Napi::Value ClientPeer::GetOutgoingBandwidth(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->outgoingBandwidth);
}

Napi::Value ClientPeer::GetPacketsLost(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->packetsLost);
}

Napi::Value ClientPeer::GetPacketsSent(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->packetsSent);
}

Napi::Value ClientPeer::GetPacketLoss(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->packetLoss);
}

Napi::Value ClientPeer::GetTotalWaitingData(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, peer->totalWaitingData);
}

Napi::Value ClientPeer::GetAddress(NAPI_CB)
{
  Napi::Env env = info.Env();

  Napi::Object obj = Napi::Object::New(env);

  char ipStr[INET_ADDRSTRLEN];
  if (inet_ntop(AF_INET, &(peer->address.host), ipStr, INET_ADDRSTRLEN) == NULL)
  {
    Napi::Error::New(env, "Failed to convert IP address").ThrowAsJavaScriptException();
    return env.Null();
  }

  obj.Set("address", Napi::String::New(env, ipStr));
  obj.Set("port", Napi::Number::New(env, peer->address.port));
  return obj;
}

Napi::Object ClientPeer::Init(Napi::Env env, Napi::Object exports)
{

  // clang-format off
  Napi::Function func = DefineClass(env, "Peer", {
    InstanceMethod("getRTT", &ClientPeer::GetRTT),
    InstanceMethod("getState", &ClientPeer::GetState),
    InstanceMethod("getChannelCount", &ClientPeer::GetChannelCount),
    InstanceMethod("getConnectID", &ClientPeer::GetConnectID),
    InstanceMethod("getIncomingBandwidth", &ClientPeer::GetIncomingBandwidth),
    InstanceMethod("getOutgoingBandwidth", &ClientPeer::GetOutgoingBandwidth),
    InstanceMethod("getPacketsLost", &ClientPeer::GetPacketsLost),
    InstanceMethod("getPacketsSent", &ClientPeer::GetPacketsSent),
    InstanceMethod("getPacketLoss", &ClientPeer::GetPacketLoss),
    InstanceMethod("getTotalWaitingData", &ClientPeer::GetTotalWaitingData),
    InstanceMethod("getAddress", &ClientPeer::GetAddress)
  });
  // clang-format on

  Napi::FunctionReference *constructor = new Napi::FunctionReference();
  *constructor = Napi::Persistent(func);
  exports.Set("Peer", func);
  env.SetInstanceData(constructor);

  return exports;
}