#include <client.h>

Napi::FunctionReference Client::constructor;

template <typename T>
void _finalizer(Napi::Env env, T *data)
{
  delete[] data;
}

Client::Client(NAPI_CB) : Napi::ObjectWrap<Client>(info)
{
  Napi::Env env = info.Env();

  this->ip = info[0].As<Napi::String>().Utf8Value();
  this->port = info[1].As<Napi::Number>().Uint32Value();
}

void Client::setIP(NAPI_CB, const Napi::Value &value)
{
  std::string ipArg = info[0].As<Napi::String>().Utf8Value();
  this->ip = ipArg;
}

Napi::Value Client::getIP(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::String::New(env, this->ip);
}

void Client::setPort(NAPI_CB, const Napi::Value &value)
{
  uint32_t _port = info[0].As<Napi::Number>().Uint32Value();
  this->port = _port;
}

Napi::Value Client::getPort(NAPI_CB)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, this->port);
}

void Client::setEmit(NAPI_CB)
{
  this->eventEmit = Napi::Persistent(info[0].As<Napi::Function>());
}

void Client::create(NAPI_CB)
{
  Napi::Env env = info.Env();

  uint32_t maxPeers = info[0].As<Napi::Number>().Uint32Value();

  if (enet_initialize() != 0)
    return Napi::Error::New(env, "ENet failed to initialize").ThrowAsJavaScriptException();

  ENetAddress address;
  address.host = ENET_HOST_ANY;
  address.port = this->port;

  this->client = enet_host_create(&address, maxPeers, 2, 0, 0);

  this->client->checksum = enet_crc32;
  this->client->usingNewPacket = usingNewPacket;

  enet_host_compress_with_range_coder(this->client);
}

void Client::start_service(NAPI_CB)
{
  Napi::Env env = info.Env();

  if (!this->eventEmit)
    return Napi::Error::New(env, "Missing emitter function.").ThrowAsJavaScriptException();

  ENetEvent event;

  if (enet_host_service(this->client, &event, 1) > 0)
  {
    switch (event.type)
    {
    case ENET_EVENT_TYPE_CONNECT:
    {
      uint32_t lastNetID = this->netID++;

      event.peer->data = new unsigned char[sizeof(unsigned int)];
      memcpy(event.peer->data, &lastNetID, sizeof(unsigned int));

      this->peers[lastNetID] = event.peer;

      this->eventEmit.Call({Napi::String::New(env, "connect"), Napi::Number::New(env, lastNetID)});
      break;
    }
    case ENET_EVENT_TYPE_RECEIVE:
    {
      unsigned char *packet = new unsigned char[event.packet->dataLength];
      memcpy(packet, event.packet->data, event.packet->dataLength);

      // clang-format off
      this->eventEmit.Call({
        Napi::String::New(env, "raw"),
        Napi::Number::New(env, *reinterpret_cast<unsigned int *>(event.peer->data)),
        Napi::Buffer<unsigned char>::New(env, packet, event.packet->dataLength, _finalizer<unsigned char>)
      });
      // clang-format on

      enet_packet_destroy(event.packet);

      break;
    }
    case ENET_EVENT_TYPE_DISCONNECT:
    {
      uint32_t userNetID = *reinterpret_cast<unsigned int *>(event.peer->data);
      ENetPeer *peer = peers[userNetID];

      if (!peer)
      {
        delete[] event.peer->data;
        return;
      }

      // clang-format off
      this->eventEmit.Call({
        Napi::String::New(env, "disconnect"),
        Napi::Number::New(env, *reinterpret_cast<unsigned int *>(peer->data))
      });
      // clang-format on

      peers.erase(userNetID);
      delete[] event.peer->data;
      break;
    }
    }
  }
}

void Client::deInit(NAPI_CB)
{
  enet_deinitialize();
}

void Client::send(NAPI_CB)
{
  Napi::Env env = info.Env();

  uint32_t peerID = info[0].As<Napi::Number>().Uint32Value();
  uint32_t count = info[1].As<Napi::Number>().Uint32Value();
  Napi::Object arr = info[2].As<Napi::Object>();

  ENetPeer *peer = this->peers[peerID];
  if (!peer || peer->state != ENET_PEER_STATE_CONNECTED)
    return;

  for (unsigned int i = 0; i < count; ++i)
  {
    auto buffer = arr.Get(i).As<Napi::Buffer<unsigned char>>();
    // clang-format off
    ENetPacket *packet = enet_packet_create(buffer.Data(), buffer.Length(), ENET_PACKET_FLAG_RELIABLE);
    // clang-format on

    enet_peer_send(peer, 0, packet);
  }
}

void Client::disconnect(NAPI_CB)
{
  uint32_t peerID = info[0].As<Napi::Number>().Uint32Value();

  ENetPeer *peer = this->peers[peerID];
  enet_peer_disconnect(peer, 0);
}

void Client::disconnectLater(NAPI_CB)
{
  uint32_t peerID = info[0].As<Napi::Number>().Uint32Value();

  ENetPeer *peer = this->peers[peerID];
  enet_peer_disconnect_later(peer, 0);
}

void Client::disconnectNow(NAPI_CB)
{
  uint32_t peerID = info[0].As<Napi::Number>().Uint32Value();

  ENetPeer *peer = this->peers[peerID];
  enet_peer_disconnect_now(peer, 0);
}

void Client::toggleNewPacket(NAPI_CB)
{
  this->usingNewPacket = !this->usingNewPacket;
}

Napi::Value Client::getPeerPing(NAPI_CB)
{
  Napi::Env env = info.Env();

  uint32_t peerID = info[0].As<Napi::Number>().Uint32Value();

  ENetPeer *peer = this->peers[peerID];

  return Napi::Number::New(env, peer->roundTripTime);
}

Napi::Value Client::connect(NAPI_CB)
{
  Napi::Env env = info.Env();

  std::string ipAddress = info[0].As<Napi::String>().Utf8Value();
  uint32_t port = info[1].As<Napi::Number>().Uint32Value();
  uint32_t peerID = info[2].As<Napi::Number>().Uint32Value();

  ENetPeer *peer = this->peers[peerID];

  ENetAddress address;
  enet_address_set_host(&address, ipAddress.c_str());
  address.port = port;

  peer = enet_host_connect(this->client, &address, 2, 0);
  if (!peer)
  {
    return Napi::Boolean::New(env, false);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Object Client::Init(Napi::Env env, Napi::Object exports)
{
  // clang-format off
  Napi::Function func = DefineClass(env, "Client", {
    InstanceAccessor<&Client::getPort, &Client::setPort>("port"),
    InstanceAccessor<&Client::getIP, &Client::setIP>("ip"),
    InstanceMethod<&Client::setEmit>("setEmit"),
    InstanceMethod<&Client::create>("create"),
    InstanceMethod<&Client::start_service>("service"),
    InstanceMethod<&Client::deInit>("deInit"),
    InstanceMethod<&Client::send>("send"),
    InstanceMethod<&Client::disconnect>("disconnect"),
    InstanceMethod<&Client::disconnectLater>("disconnectLater"),
    InstanceMethod<&Client::disconnectNow>("disconnectNow"),
    InstanceMethod<&Client::toggleNewPacket>("toggleNewPacket"),
    InstanceMethod<&Client::getPeerPing>("getPeerPing"),
    InstanceMethod<&Client::connect>("connect")
  });
  // clang-format on

  constructor = Napi::Persistent(func);
  constructor.SuppressDestruct();

  exports["Client"] = func;
  return exports;
}
