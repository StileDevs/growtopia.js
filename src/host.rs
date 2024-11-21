use core::str;
use napi::{bindgen_prelude::*, Ref};
use napi::{Env, JsFunction};
use rusty_enet as enet;
use std::str::FromStr;
use std::time::Duration;
use std::{net::SocketAddr, net::UdpSocket};

use crate::peer::IPeer;

#[napi(js_name = "Host")]
pub struct Host {
  host: enet::Host<UdpSocket>,
  emitter: Option<Ref<()>>,
}

#[napi]
impl Host {
  #[napi(constructor)]
  pub fn new(
    ip_address: String,
    port: u16,
    peer_limit: u32,
    channel_limit: u8,
    using_new_packet: bool,
  ) -> Self {
    let host_addr: String = format!("{ip_address}:{port}");
    Host {
      host: enet::Host::new(
        UdpSocket::bind(SocketAddr::from_str(&host_addr).unwrap()).unwrap(),
        enet::HostSettings {
          peer_limit: peer_limit.try_into().unwrap(),
          channel_limit: channel_limit.try_into().unwrap(),
          compressor: Some(Box::new(enet::RangeCoder::new())),
          checksum: Some(Box::new(enet::crc32)),
          using_new_packet,
          ..Default::default()
        },
      )
      .unwrap(),
      emitter: None,
    }
  }

  #[napi(getter)]
  pub fn ip_address(&self) -> String {
    self.host.socket().local_addr().unwrap().ip().to_string()
  }

  #[napi(getter)]
  pub fn port(&self) -> u16 {
    self.host.socket().local_addr().unwrap().port()
  }

  #[napi]
  pub fn connect(&mut self, ip_address: String, port: u16) -> Result<bool> {
    let addr = format!("{ip_address}:{port}");
    let socket = SocketAddr::from_str(&addr).unwrap();
    let _ = self.host.connect(socket, 2, 0).unwrap();

    Ok(true)
  }

  #[napi]
  pub fn get_peer_data(&self, env: Env, net_id: u32) -> Result<()> {
    if let Some(peer) = self.host.get_peer(enet::PeerID(net_id.try_into().unwrap())) {
      let mut js_peer = env.create_object()?;
      let native_peer = IPeer {
        rtt: peer.round_trip_time().as_secs(),
      };

      let obj = env.wrap(&mut js_peer, native_peer)?;
      Ok(obj)
    } else {
      return Err(Error::new(
        Status::GenericFailure,
        "ENet peer cant find peer",
      ));
    }
  }

  #[napi]
  pub fn disconnect(&mut self, net_id: u32) -> Result<bool> {
    let peer = self
      .host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .unwrap();

    peer.disconnect(0);
    Ok(true)
  }

  #[napi]
  pub fn disconnect_later(&mut self, net_id: u32) -> Result<bool> {
    let peer = self
      .host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .unwrap();

    peer.disconnect_later(0);
    Ok(true)
  }

  #[napi]
  pub fn disconnect_now(&mut self, net_id: u32) -> Result<bool> {
    let peer = self
      .host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .unwrap();

    peer.disconnect_now(0);
    Ok(true)
  }

  #[napi]
  pub fn send(&mut self, net_id: u32, mut data: Buffer, channel_id: u8) -> Result<bool> {
    let peer = self
      .host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .unwrap();

    let packet = enet::Packet::reliable(data.as_mut());

    if let Err(e) = peer.send(channel_id, &packet) {
      return Err(Error::new(
        Status::GenericFailure,
        format!("ENet peer error cant send packet : {}", e),
      ));
    } else {
      Ok(true)
    }
  }

  #[napi]
  pub fn set_emitter(&mut self, env: Env, emitter: JsFunction) -> Result<()> {
    self.emitter = Some(env.create_reference(emitter).unwrap());
    Ok(())
  }

  #[napi]
  pub fn service(&mut self, env: Env) -> Result<()> {
    if self.emitter.is_none() {
      return Err(Error::new(
        Status::GenericFailure,
        "ENet service error: emitter method empty",
      ));
    }

    if let Some(ref emitter) = self.emitter {
      let callback: JsFunction = env.get_reference_value(emitter)?;

      match self.host.service() {
        Ok(Some(event)) => match event {
          enet::Event::Connect { peer, .. } => {
            let args = vec![
              env.create_string("connect")?.into_unknown(),
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
          enet::Event::Disconnect { peer, .. } => {
            let args = vec![
              env.create_string("disconnect")?.into_unknown(),
              env.create_uint32(peer.id().0 as u32)?.into_unknown(),
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
