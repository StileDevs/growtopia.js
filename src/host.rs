use core::str;
use napi::{bindgen_prelude::*, JsObject, Ref};
use napi::{Env, JsFunction};
use rusty_enet as enet;
use std::net::{Ipv4Addr, SocketAddrV4};
use std::str::FromStr;
use std::time::Duration;
use std::{net::SocketAddr, net::UdpSocket};

#[napi(js_name = "Host")]
pub struct Host {
  host: enet::Host<UdpSocket>,
  emitter: Option<Ref<()>>,
  ip_address: String,
  port: u16,
  using_new_packet: bool,
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
    using_new_packet_for_server: bool,
  ) -> Self {
    let host_addr: String = format!("{ip_address}:{port}");

    let socket = if using_new_packet {
      UdpSocket::bind(SocketAddr::V4(SocketAddrV4::new(Ipv4Addr::UNSPECIFIED, 0))).unwrap()
    } else {
      UdpSocket::bind(SocketAddr::from_str(&host_addr).unwrap()).unwrap()
    };

    let host = enet::Host::new(
      socket,
      enet::HostSettings {
        peer_limit: peer_limit.try_into().unwrap(),
        channel_limit: channel_limit.try_into().unwrap(),
        compressor: Some(Box::new(enet::RangeCoder::new())),
        checksum: Some(Box::new(enet::crc32)),
        using_new_packet,
        using_new_packet_for_server,
        ..Default::default()
      },
    )
    .expect("Failed to create host");

    Host {
      host,
      emitter: None,
      ip_address,
      port,
      using_new_packet,
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
    match self.host.connect(socket, 2, 0) {
      Ok(_peer) => Ok(true),
      Err(_err) => Ok(false),
    }
  }

  #[napi]
  pub fn get_peer_data(&self, env: Env, net_id: u32) -> Result<JsObject> {
    if let Some(peer) = self.host.get_peer(enet::PeerID(net_id.try_into().unwrap())) {
      let mut js_peer = env.create_object()?;
      let peer_addr = peer.address().unwrap();

      if let Err(err) = js_peer.set("rtt", peer.round_trip_time().as_millis() as u32) {
        return Err(Error::new(
          Status::GenericFailure,
          format!("Failed to set 'rtt': {:?}", err),
        ));
      }
      if let Err(err) = js_peer.set("port", peer_addr.port()) {
        return Err(Error::new(
          Status::GenericFailure,
          format!("Failed to set 'port': {:?}", err),
        ));
      }
      if let Err(err) = js_peer.set("ip", peer_addr.ip().to_string()) {
        return Err(Error::new(
          Status::GenericFailure,
          format!("Failed to set 'ip': {:?}", err),
        ));
      }

      Ok(js_peer)
    } else {
      return Err(Error::new(Status::InvalidArg, "ENet peer cant find peer"));
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
  pub fn set_timeout(&mut self, net_id: u32, limit: u32, min: u32, max: u32) -> Result<bool> {
    let peer = self
      .host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .unwrap();

    peer.set_timeout(limit, min, max);
    Ok(true)
  }

  #[napi]
  pub fn set_ping_interval(&mut self, net_id: u32, ping_interval: u32) -> Result<bool> {
    let peer = self
      .host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .unwrap();

    peer.set_ping_interval(ping_interval);
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
          enet::Event::Receive {
            peer,
            packet,
            channel_id,
            ..
          } => {
            let args = vec![
              env.create_string("raw")?.into_unknown(),
              env.create_uint32(peer.id().0 as u32)?.into_unknown(),
              env.create_uint32(channel_id as u32)?.into_unknown(),
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
        Err(e) if e.kind() == std::io::ErrorKind::ConnectionReset => {
          // eprintln!("Connection reset. Retrying...");
          // ignore
        }
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
