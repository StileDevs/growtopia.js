use core::str;
use napi::{bindgen_prelude::*, Ref};
use napi::{Env, JsFunction};
use rusty_enet as enet;
use std::str::FromStr;
use std::time::Duration;
use std::{net::SocketAddr, net::UdpSocket};

#[napi(js_name = "Host")]
pub struct Host {
  host: enet::Host<UdpSocket>,
  emitter: Option<Ref<()>>,
}

#[napi]
impl Host {
  #[napi(constructor)]
  pub fn new(ip: String, port: u16) -> Self {
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
  pub fn set_emitter(&mut self, env: Env, emitter: JsFunction) -> Result<()> {
    self.emitter = Some(env.create_reference(emitter).unwrap());
    Ok(())
  }

  #[napi]
  pub fn service(&mut self, env: Env) -> Result<()> {
    if let Some(ref emitter) = self.emitter {
      let callback: JsFunction = env.get_reference_value_unchecked(emitter)?;

      match self.host.service() {
        Ok(Some(event)) => match event {
          enet::Event::Connect { peer, .. } => {
            let args = vec![
              env.create_string("connect")?.into_unknown(),
              env.create_uint32(peer.id().0 as u32)?.into_unknown(),
            ];
            callback.call(None, &args)?;
          }
          enet::Event::Disconnect { peer, .. } => {
            let args = vec![
              env.create_string("disconnect")?.into_unknown(),
              env.create_uint32(peer.id().0 as u32)?.into_unknown(),
            ];
            callback.call(None, &args)?;
          }
          enet::Event::Receive { peer, packet, .. } => {
            let args = vec![
              env.create_string("raw")?.into_unknown(),
              env.create_uint32(peer.id().0 as u32)?.into_unknown(),
              env
                .create_buffer_with_data(packet.data().to_vec())?
                .into_unknown(),
            ];
            callback.call(None, &args)?;
          }
        },
        Ok(None) => {}
        Err(e) => {
          return Err(Error::new(
            Status::GenericFailure,
            format!("ENet service error: {}", e),
          ));
        }
      }

      std::thread::sleep(Duration::from_millis(10));
    }

    Ok(())
  }
}
