#include <enet/enet.h>
#include <napi.h>
#include <string>
#include <unordered_map>

#define NAPI_CB const Napi::CallbackInfo &info

class Client : public Napi::ObjectWrap<Client>
{

public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  Client(NAPI_CB);

private:
  static Napi::FunctionReference constructor;
  Napi::Value getIP(NAPI_CB);
  Napi::Value getPort(NAPI_CB);

  void setIP(NAPI_CB, const Napi::Value &value);
  void setPort(NAPI_CB, const Napi::Value &value);
  void setEmit(NAPI_CB);
  void create(NAPI_CB);
  void start_service(NAPI_CB);
  void deInit(NAPI_CB);
  void send(NAPI_CB);
  void disconnect(NAPI_CB);
  void disconnectLater(NAPI_CB);
  void disconnectNow(NAPI_CB);
  void toggleNewPacket(NAPI_CB);

  Napi::Value connect(NAPI_CB);
  Napi::Value getPeer(NAPI_CB);

private:
  Napi::FunctionReference eventEmit;
  std::unordered_map<uint32_t, ENetPeer *> peers;
  ENetHost *client;

  bool usingNewPacket = false;
  std::string ip;
  uint16_t port;
  uint32_t netID = 0;
};