use core::str;
use napi::bindgen_prelude::Undefined;
use napi::{CallContext, Env, JsFunction, Ref};
use rusty_enet as enet;
use std::env;
use std::str::FromStr;
use std::time::Duration;
use std::{net::SocketAddr, net::UdpSocket};

#[napi(js_name = "Host")]
pub struct Host {
  host: enet::Host<UdpSocket>,
  emitter: Option<Ref<JsFunction>>,
}

#[napi]
impl Host {
  #[napi(constructor)]
  pub fn new(env: Env, ip: String, port: u16) -> Self {
    let host_addr: String = format!("{ip}:{port}");
    Host {
      host: enet::Host::new(
        UdpSocket::bind(SocketAddr::from_str(&host_addr).unwrap()).unwrap(),
        enet::HostSettings {
          peer_limit: 1024,
          channel_limit: 2,
          compressor: Some(Box::new(enet::RangeCoder::new())),
          checksum: Some(Box::new(enet::crc32)),
          using_new_packet: false,
          ..Default::default()
        },
      )
      .unwrap(),
      emitter: None,
    }
  }

  #[napi(getter)]
  pub fn ip_address(&self) -> String {
    return self.host.socket().local_addr().unwrap().ip().to_string();
  }

  #[napi(getter)]
  pub fn port(&self) -> u16 {
    return self.host.socket().local_addr().unwrap().port();
  }

  #[napi]
  pub fn set_emit(&mut self, env: Env, func: JsFunction) -> Undefined {
    let emit = Some(env.create_reference(func).unwrap());
    self.emitter = emit;
  }

  #[napi]
  pub fn service(&self, env: Env) -> Undefined {
    if let Some(ref emitter_ref) = &self.emitter {
      // Assuming we call the JS function here with no arguments
      emitter_ref.call(None, &[0]);
    }
    // loop {
    //   while let Some(event) = self.host.service().unwrap() {
    //     match event {
    //       enet::Event::Connect { peer, .. } => {
    //         println!("Peer {} connected", peer.id().0);
    //       }
    //       enet::Event::Disconnect { peer, .. } => {
    //         println!("Peer {} disconnected", peer.id().0);
    //       }
    //       enet::Event::Receive {
    //         peer,
    //         channel_id,
    //         packet,
    //       } => {
    //         if let Ok(message) = str::from_utf8(packet.data()) {
    //           println!("Received packet: {:?}", message);
    //         }
    //         _ = peer.send(channel_id, &packet);
    //       }
    //     }
    //   }
    //   std::thread::sleep(Duration::from_millis(10));
    // }
  }
}
