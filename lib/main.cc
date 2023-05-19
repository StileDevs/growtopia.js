#include <client.h>

Napi::Object init(Napi::Env env, Napi::Object exports)
{
  return Client::Init(env, exports);
}

NODE_API_MODULE(GROWTOPIAJS, init);