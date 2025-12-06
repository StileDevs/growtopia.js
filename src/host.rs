use crate::peer::NativePeer;
use core::str;
use napi::{bindgen_prelude::*, Ref};
use napi::{Env, JsFunction};
use rusty_enet as enet;
use std::net::{Ipv4Addr, SocketAddrV4};
use std::str::FromStr;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::{net::SocketAddr, net::UdpSocket};

#[napi(js_name = "Host")]
pub struct Host {
  host: Arc<Mutex<enet::Host<UdpSocket>>>,
  emitter: Option<Ref<()>>,
}

#[napi]
impl Host {
  /// Creates a new ENet host for communicating with peers.
  ///
  /// @param ip_address - The IP address to bind to
  /// @param port - The port number to bind to
  /// @param peer_limit - The maximum number of peers that should be allocated for the host
  /// @param channel_limit - The maximum number of channels allowed (cannot be 0)
  /// @param using_new_packet - Whether to use new packet format
  /// @param using_new_packet_server - Whether server uses new packet format
  /// @param incoming_bandwidth_limit - Downstream bandwidth limit in bytes/second, or null for no limit
  /// @param outgoing_bandwidth_limit - Upstream bandwidth limit in bytes/second, or null for no limit
  /// @param enable_compressor - Enable RangeCoder compression (defaults to true)
  /// @param enable_checksum - Enable CRC32 checksum validation (defaults to true)
  /// @param seed - Random number generator seed, or null for random seed
  #[napi(constructor)]
  pub fn new(
    ip_address: String,
    port: u16,
    peer_limit: u32,
    channel_limit: u8,
    using_new_packet: bool,
    using_new_packet_server: bool,
    incoming_bandwidth_limit: Option<u32>,
    outgoing_bandwidth_limit: Option<u32>,
    enable_compressor: Option<bool>,
    enable_checksum: Option<bool>,
    seed: Option<u32>,
  ) -> Self {
    let host_addr: String = format!("{ip_address}:{port}");

    let socket = if using_new_packet {
      UdpSocket::bind(SocketAddr::V4(SocketAddrV4::new(
        Ipv4Addr::UNSPECIFIED,
        port,
      )))
      .unwrap()
    } else {
      UdpSocket::bind(SocketAddr::from_str(&host_addr).unwrap()).unwrap()
    };

    let host = enet::Host::new(
      socket,
      enet::HostSettings {
        peer_limit: peer_limit.try_into().unwrap(),
        channel_limit: channel_limit.try_into().unwrap(),
        incoming_bandwidth_limit,
        outgoing_bandwidth_limit,
        compressor: if enable_compressor.unwrap_or(true) {
          Some(Box::new(enet::RangeCoder::new()))
        } else {
          None
        },
        checksum: if enable_checksum.unwrap_or(true) {
          Some(Box::new(enet::crc32))
        } else {
          None
        },
        seed,
        using_new_packet,
        using_new_packet_server,
        ..Default::default()
      },
    )
    .expect("Failed to create host");

    Host {
      host: Arc::new(Mutex::new(host)),
      emitter: None,
    }
  }

  /// Get the IP address of the host socket.
  /// @returns The IP address as a string
  #[napi(getter)]
  pub fn ip_address(&self) -> String {
    let host = self.host.lock().unwrap();
    host.socket().local_addr().unwrap().ip().to_string()
  }

  /// Get the port number of the host socket.
  /// @returns The port number
  #[napi(getter)]
  pub fn port(&self) -> u16 {
    let host = self.host.lock().unwrap();
    host.socket().local_addr().unwrap().port()
  }

  /// Get the maximum number of peers that can connect to this host.
  /// @returns The peer limit
  #[napi(getter)]
  pub fn peer_limit(&self) -> u32 {
    let host = self.host.lock().unwrap();
    host.peer_limit() as u32
  }

  /// Get the maximum allowed channels for future incoming connections.
  /// @returns The channel limit
  #[napi(getter)]
  pub fn channel_limit(&self) -> u32 {
    let host = self.host.lock().unwrap();
    host.channel_limit() as u32
  }

  /// The maximum transmission unit (MTU), or the maximum packet size that will be sent by this host.
  /// @returns The MTU value
  #[napi(getter)]
  pub fn mtu(&self) -> u16 {
    let host = self.host.lock().unwrap();
    host.mtu()
  }

  /// Initiates a connection to a foreign host.
  /// @param ip_address - The IP address of the remote host
  /// @param port - The port number of the remote host
  /// @returns True if connection initiated successfully, false otherwise
  #[napi]
  pub fn connect(&mut self, ip_address: String, port: u16) -> Result<bool> {
    let addr = format!("{ip_address}:{port}");
    let socket = SocketAddr::from_str(&addr).unwrap();
    let mut host = self.host.lock().unwrap();
    match host.connect(socket, 2, 0) {
      Ok(_peer) => Ok(true),
      Err(_err) => Ok(false),
    }
  }

  /// Get a snapshot of peer data by peer ID.
  /// Returns a NativePeer object containing current state and statistics.
  /// @param net_id - The peer ID
  /// @returns NativePeer snapshot containing peer data
  /// @throws Error if peer not found
  #[napi]
  pub fn get_peer(&self, net_id: u32) -> Result<NativePeer> {
    let host = self.host.lock().unwrap();
    let peer = host
      .get_peer(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;

    let addr = peer
      .address()
      .unwrap_or_else(|| std::net::SocketAddr::from(([0, 0, 0, 0], 0)));

    Ok(NativePeer {
      net_id,
      state: peer.state() as u8,
      ip: addr.ip().to_string(),
      port: addr.port(),
      rtt: peer.round_trip_time().as_millis() as u32,
      round_trip_time: peer.round_trip_time().as_millis() as u32,
      round_trip_time_variance: peer.round_trip_time_variance().as_millis() as u32,
      mtu: peer.mtu(),
      channel_count: peer.channel_count() as u32,
      incoming_bandwidth: peer.incoming_bandwidth(),
      outgoing_bandwidth: peer.outgoing_bandwidth(),
      incoming_bandwidth_throttle_epoch: 0,
      outgoing_bandwidth_throttle_epoch: 0,
      ping_interval: peer.ping_interval().as_millis() as u32,
      timeout_limit: 0,
      timeout_minimum: 0,
      timeout_maximum: 0,
      last_round_trip_time_variance: 0,
      last_round_trip_time: 0,
      lowest_round_trip_time: 0,
      packet_throttle_interval: 0,
      packet_throttle_acceleration: 0,
      packet_throttle_deceleration: 0,
      packet_throttle: 0,
      packets_sent: peer.packets_sent(),
      packets_lost: peer.packets_lost(),
      packet_loss: peer.packet_loss(),
      packet_loss_variance: peer.packet_loss_variance(),
      incoming_data_total: peer.incoming_data_total(),
      outgoing_data_total: peer.outgoing_data_total(),
    })
  }

  /// Checks for any queued events on the host.
  /// @returns True if there are queued events, false otherwise
  #[napi]
  pub fn check_events(&mut self) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    Ok(host.check_events().is_some())
  }

  /// Get the number of connected peers.
  /// @returns The count of currently connected peers
  #[napi]
  pub fn peer_count(&self) -> u32 {
    let mut host = self.host.lock().unwrap();
    host.connected_peers().count() as u32
  }

  /// Get the current time according to this host.
  /// @returns Time in milliseconds since epoch
  #[napi]
  pub fn now(&self) -> u32 {
    let host = self.host.lock().unwrap();
    host.now().as_millis() as u32
  }

  /// Send a reliable packet to a specific peer.
  /// @param net_id - The peer ID to send to
  /// @param data - The packet data to send
  /// @param channel_id - The channel ID to send on
  /// @returns True if packet queued successfully
  /// @throws Error if peer not found or send fails
  #[napi]
  pub fn send(&mut self, net_id: u32, data: Buffer, channel_id: u8) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;

    let packet = enet::Packet::reliable(data.as_ref());

    if let Err(e) = peer.send(channel_id, &packet) {
      return Err(Error::new(
        Status::GenericFailure,
        format!("ENet peer error cant send packet : {}", e),
      ));
    } else {
      Ok(true)
    }
  }

  // Internal methods for NativePeer to use
  pub(crate) fn ping_peer(&mut self, net_id: u32) -> Result<()> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.ping();
    Ok(())
  }

  pub(crate) fn disconnect_peer(&mut self, net_id: u32, data: u32) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.disconnect(data);
    Ok(true)
  }

  pub(crate) fn disconnect_now_peer(&mut self, net_id: u32, data: u32) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.disconnect_now(data);
    Ok(true)
  }

  pub(crate) fn disconnect_later_peer(&mut self, net_id: u32, data: u32) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.disconnect_later(data);
    Ok(true)
  }

  pub(crate) fn reset_peer(&mut self, net_id: u32) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.reset();
    Ok(true)
  }

  pub(crate) fn set_timeout_peer(
    &mut self,
    net_id: u32,
    limit: u32,
    minimum: u32,
    maximum: u32,
  ) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.set_timeout(limit, minimum, maximum);
    Ok(true)
  }

  pub(crate) fn set_ping_interval_peer(&mut self, net_id: u32, ping_interval: u32) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.set_ping_interval(ping_interval);
    Ok(true)
  }

  pub(crate) fn set_throttle_peer(
    &mut self,
    net_id: u32,
    interval: u32,
    acceleration: u32,
    deceleration: u32,
  ) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    peer.set_throttle(interval, acceleration, deceleration);
    Ok(true)
  }

  pub(crate) fn set_mtu_peer(&mut self, net_id: u32, mtu: u16) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let peer = host
      .get_peer_mut(enet::PeerID(net_id.try_into().unwrap()))
      .ok_or_else(|| Error::new(Status::InvalidArg, "Peer not found"))?;
    if let Err(e) = peer.set_mtu(mtu) {
      return Err(Error::new(
        Status::InvalidArg,
        format!("Failed to set MTU: {}", e),
      ));
    }
    Ok(true)
  }

  /// Sends any queued packets on the host to its designated peers.
  /// @returns True on success
  #[napi]
  pub fn flush(&mut self) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    host.flush();
    Ok(true)
  }

  /// Queues a packet to be sent to all connected peers.
  /// @param data - The packet data to broadcast
  /// @param channel_id - The channel ID to broadcast on
  /// @returns True on success
  #[napi]
  pub fn broadcast(&mut self, data: Buffer, channel_id: u8) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    let packet = enet::Packet::reliable(data.as_ref());
    host.broadcast(channel_id, &packet);
    Ok(true)
  }

  /// Limits the maximum allowed channels of future incoming connections.
  /// @param channel_limit - The channel limit (cannot be 0)
  /// @returns True on success
  /// @throws Error if channel_limit is 0
  #[napi]
  pub fn set_channel_limit(&mut self, channel_limit: u32) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    if let Err(e) = host.set_channel_limit(channel_limit as usize) {
      return Err(Error::new(
        Status::InvalidArg,
        format!("Failed to set channel limit: {}", e),
      ));
    }
    Ok(true)
  }

  /// Adjusts the bandwidth limits of the host in bytes/second.
  /// ENet will strategically drop packets to ensure bandwidth is not overwhelmed.
  /// The bandwidth parameters also determine the window size which limits reliable packets in transit.
  /// @param incoming - Downstream bandwidth limit in bytes/second, or null for no limit (cannot be 0)
  /// @param outgoing - Upstream bandwidth limit in bytes/second, or null for no limit (cannot be 0)
  /// @returns True on success
  /// @throws Error if limits are set to 0
  #[napi]
  pub fn set_bandwidth_limit(
    &mut self,
    incoming: Option<u32>,
    outgoing: Option<u32>,
  ) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    if let Err(e) = host.set_bandwidth_limit(incoming, outgoing) {
      return Err(Error::new(
        Status::InvalidArg,
        format!("Failed to set bandwidth limit: {}", e),
      ));
    }
    Ok(true)
  }

  /// Get the host's current bandwidth limits.
  /// @returns Object with optional 'incoming' and 'outgoing' properties (bytes/second), undefined if no limit
  #[napi]
  pub fn get_bandwidth_limit(&self, env: Env) -> Result<napi::JsObject> {
    let host = self.host.lock().unwrap();
    let (incoming, outgoing) = host.bandwidth_limit();

    let mut obj = env.create_object()?;
    if let Some(incoming_val) = incoming {
      obj.set("incoming", incoming_val)?;
    }
    if let Some(outgoing_val) = outgoing {
      obj.set("outgoing", outgoing_val)?;
    }

    Ok(obj)
  }

  /// Set the maximum transmission unit (MTU) for this host.
  /// @param mtu - The MTU value (must be between PROTOCOL_MINIMUM_MTU and PROTOCOL_MAXIMUM_MTU)
  /// @returns True on success
  /// @throws Error if MTU is out of valid range
  #[napi]
  pub fn set_mtu(&mut self, mtu: u16) -> Result<bool> {
    let mut host = self.host.lock().unwrap();
    if let Err(e) = host.set_mtu(mtu) {
      return Err(Error::new(
        Status::InvalidArg,
        format!("Failed to set MTU: {}", e),
      ));
    }
    Ok(true)
  }

  /// Set the event emitter callback function.
  /// This callback will be invoked during service() calls when events occur.
  /// @param emitter - The callback function to handle events (connect, raw, disconnect)
  #[napi]
  pub fn set_emitter(&mut self, env: Env, emitter: JsFunction) -> Result<()> {
    self.emitter = Some(env.create_reference(emitter).unwrap());

    Ok(())
  }

  /// Checks for events on the host and shuttles packets between the host and its peers.
  /// Should be called regularly for adequate performance.
  /// Dispatches events to the emitter callback set via set_emitter().
  /// @throws Error if emitter is not set
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

      // Extract event data while holding the lock, then drop lock before calling JS
      let event_data: Option<(String, Vec<u32>, Option<Vec<u8>>)> = {
        let mut host = self.host.lock().unwrap();
        match host.service() {
          Ok(Some(event)) => match event {
            enet::Event::Connect { peer, .. } => {
              Some(("connect".to_string(), vec![peer.id().0 as u32], None))
            }
            enet::Event::Receive {
              peer,
              packet,
              channel_id,
              ..
            } => Some((
              "raw".to_string(),
              vec![peer.id().0 as u32, channel_id as u32],
              Some(packet.data().to_vec()),
            )),
            enet::Event::Disconnect { peer, .. } => {
              Some(("disconnect".to_string(), vec![peer.id().0 as u32], None))
            }
          },
          Ok(None) => None,
          Err(_) => None,
        }
      }; // Lock is dropped here

      // Now call JavaScript without holding the lock
      if let Some((event_type, peer_data, packet_data)) = event_data {
        match event_type.as_str() {
          "connect" => {
            let args = vec![
              env.create_string("connect")?.into_unknown(),
              env.create_uint32(peer_data[0])?.into_unknown(),
            ];
            callback.call(None, &args)?;
          }
          "raw" => {
            let args = vec![
              env.create_string("raw")?.into_unknown(),
              env.create_uint32(peer_data[0])?.into_unknown(),
              env.create_uint32(peer_data[1])?.into_unknown(),
              env
                .create_buffer_with_data(packet_data.unwrap())?
                .into_unknown(),
            ];
            callback.call(None, &args)?;
          }
          "disconnect" => {
            let args = vec![
              env.create_string("disconnect")?.into_unknown(),
              env.create_uint32(peer_data[0])?.into_unknown(),
            ];
            callback.call(None, &args)?;
          }
          _ => {}
        }
      }

      std::thread::sleep(Duration::from_millis(10));
    }

    Ok(())
  }
}
