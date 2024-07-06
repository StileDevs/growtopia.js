#include <napi.h>
#include <enet/enet.h>

#ifdef _WIN32
// Windows specific headers and code
#include <winsock2.h>
#include <ws2tcpip.h> // for InetNtop
#else
// Unix-like specific headers and code
#include <arpa/inet.h>
#endif

#define NAPI_CB const Napi::CallbackInfo &info

class ClientPeer : public Napi::ObjectWrap<ClientPeer>
{
public:
  static Napi::Object Init(Napi::Env env, Napi::Object exports);
  ClientPeer(NAPI_CB);

  void SetENetPeer(ENetPeer *peer) { this->peer = peer; }

private:
  Napi::Value GetRTT(NAPI_CB);
  Napi::Value GetState(NAPI_CB);
  Napi::Value GetChannelCount(NAPI_CB);
  Napi::Value GetConnectID(NAPI_CB);
  Napi::Value GetData(NAPI_CB);
  Napi::Value GetIncomingBandwidth(NAPI_CB);
  Napi::Value GetOutgoingBandwidth(NAPI_CB);
  Napi::Value GetPacketsLost(NAPI_CB);
  Napi::Value GetPacketsSent(NAPI_CB);
  Napi::Value GetPacketLoss(NAPI_CB);
  Napi::Value GetTotalWaitingData(NAPI_CB);
  Napi::Value GetAddress(NAPI_CB);

  ENetPeer *peer;
};