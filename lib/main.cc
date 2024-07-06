#include <client.h>
#include <client_peer.h>

Napi::Object init(Napi::Env env, Napi::Object exports)
{
  ClientPeer::Init(env, exports);
  return Client::Init(env, exports);
}

NODE_API_MODULE(GROWTOPIAJS, init);