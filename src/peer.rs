use rusty_enet as enet;

/// A snapshot of peer data and statistics.
/// This struct contains a point-in-time copy of peer information.
/// To perform operations on the peer, use the methods which require a Host reference.
#[napi(js_name = "NativePeer")]
pub struct NativePeer {
  pub(crate) net_id: u32,
  pub(crate) state: u8,
  pub(crate) ip: String,
  pub(crate) port: u16,
  pub(crate) rtt: u32,
  pub(crate) round_trip_time: u32,
  pub(crate) round_trip_time_variance: u32,
  pub(crate) mtu: u16,
  pub(crate) channel_count: u32,
  pub(crate) incoming_bandwidth: u32,
  pub(crate) outgoing_bandwidth: u32,
  pub(crate) incoming_bandwidth_throttle_epoch: u32,
  pub(crate) outgoing_bandwidth_throttle_epoch: u32,
  pub(crate) ping_interval: u32,
  pub(crate) timeout_limit: u32,
  pub(crate) timeout_minimum: u32,
  pub(crate) timeout_maximum: u32,
  pub(crate) last_round_trip_time_variance: u32,
  pub(crate) last_round_trip_time: u32,
  pub(crate) lowest_round_trip_time: u32,
  pub(crate) packet_throttle_interval: u32,
  pub(crate) packet_throttle_acceleration: u32,
  pub(crate) packet_throttle_deceleration: u32,
  pub(crate) packet_throttle: u32,
  pub(crate) packets_sent: u32,
  pub(crate) packets_lost: u32,
  pub(crate) packet_loss: u32,
  pub(crate) packet_loss_variance: u32,
  pub(crate) incoming_data_total: u32,
  pub(crate) outgoing_data_total: u32,
}

#[napi]
impl NativePeer {
  /// The peer's network ID.
  #[napi(getter)]
  pub fn net_id(&self) -> u32 {
    self.net_id
  }

  /// The peer's current state (as numeric value).
  #[napi(getter)]
  pub fn state(&self) -> u8 {
    self.state
  }

  /// Whether this peer is currently in a connected state.
  #[napi(getter)]
  pub fn connected(&self) -> bool {
    self.state == enet::PeerState::Connected as u8
  }

  /// The IP address of the peer.
  #[napi(getter)]
  pub fn ip(&self) -> String {
    self.ip.clone()
  }

  /// The port number of the peer.
  #[napi(getter)]
  pub fn port(&self) -> u16 {
    self.port
  }

  /// Round trip time (RTT) in milliseconds.
  #[napi(getter)]
  pub fn rtt(&self) -> u32 {
    self.rtt
  }

  /// Mean round trip time (RTT) in milliseconds between sending a reliable packet and receiving its acknowledgement.
  #[napi(getter)]
  pub fn round_trip_time(&self) -> u32 {
    self.round_trip_time
  }

  /// Round trip time (RTT) variance in milliseconds.
  #[napi(getter)]
  pub fn round_trip_time_variance(&self) -> u32 {
    self.round_trip_time_variance
  }

  /// The maximum transmission unit (MTU) for this peer.
  #[napi(getter)]
  pub fn mtu(&self) -> u16 {
    self.mtu
  }

  /// Number of channels allocated for communication with this peer.
  #[napi(getter)]
  pub fn channel_count(&self) -> u32 {
    self.channel_count
  }

  /// Downstream bandwidth of the peer in bytes/second.
  #[napi(getter)]
  pub fn incoming_bandwidth(&self) -> u32 {
    self.incoming_bandwidth
  }

  /// Upstream bandwidth of the peer in bytes/second.
  #[napi(getter)]
  pub fn outgoing_bandwidth(&self) -> u32 {
    self.outgoing_bandwidth
  }

  /// Total amount of downstream data received from this peer.
  #[napi(getter)]
  pub fn incoming_data_total(&self) -> u32 {
    self.incoming_data_total
  }

  /// Total amount of upstream data sent to this peer.
  #[napi(getter)]
  pub fn outgoing_data_total(&self) -> u32 {
    self.outgoing_data_total
  }

  /// Total number of packets sent to this peer.
  #[napi(getter)]
  pub fn packets_sent(&self) -> u32 {
    self.packets_sent
  }

  /// Total number of packets lost from this peer.
  #[napi(getter)]
  pub fn packets_lost(&self) -> u32 {
    self.packets_lost
  }

  /// Mean packet loss of reliable packets as a ratio.
  #[napi(getter)]
  pub fn packet_loss(&self) -> u32 {
    self.packet_loss
  }

  /// Variance of the mean packet loss.
  #[napi(getter)]
  pub fn packet_loss_variance(&self) -> u32 {
    self.packet_loss_variance
  }

  /// Ping interval in milliseconds.
  #[napi(getter)]
  pub fn ping_interval(&self) -> u32 {
    self.ping_interval
  }

  /// Timeout limit value.
  #[napi(getter)]
  pub fn timeout_limit(&self) -> u32 {
    self.timeout_limit
  }

  /// Minimum timeout value in milliseconds.
  #[napi(getter)]
  pub fn timeout_minimum(&self) -> u32 {
    self.timeout_minimum
  }

  /// Maximum timeout value in milliseconds.
  #[napi(getter)]
  pub fn timeout_maximum(&self) -> u32 {
    self.timeout_maximum
  }

  /// Last round trip time variance.
  #[napi(getter)]
  pub fn last_round_trip_time_variance(&self) -> u32 {
    self.last_round_trip_time_variance
  }

  /// Last round trip time.
  #[napi(getter)]
  pub fn last_round_trip_time(&self) -> u32 {
    self.last_round_trip_time
  }

  /// Lowest round trip time recorded.
  #[napi(getter)]
  pub fn lowest_round_trip_time(&self) -> u32 {
    self.lowest_round_trip_time
  }

  /// Packet throttle interval.
  #[napi(getter)]
  pub fn packet_throttle_interval(&self) -> u32 {
    self.packet_throttle_interval
  }

  /// Packet throttle acceleration rate.
  #[napi(getter)]
  pub fn packet_throttle_acceleration(&self) -> u32 {
    self.packet_throttle_acceleration
  }

  /// Packet throttle deceleration rate.
  #[napi(getter)]
  pub fn packet_throttle_deceleration(&self) -> u32 {
    self.packet_throttle_deceleration
  }

  /// Current packet throttle value.
  #[napi(getter)]
  pub fn packet_throttle(&self) -> u32 {
    self.packet_throttle
  }

  /// Incoming bandwidth throttle epoch.
  #[napi(getter)]
  pub fn incoming_bandwidth_throttle_epoch(&self) -> u32 {
    self.incoming_bandwidth_throttle_epoch
  }

  /// Outgoing bandwidth throttle epoch.
  #[napi(getter)]
  pub fn outgoing_bandwidth_throttle_epoch(&self) -> u32 {
    self.outgoing_bandwidth_throttle_epoch
  }

  /// Send a ping request to this peer.
  /// Ping requests factor into the mean round trip time.
  /// ENet automatically pings all connected peers at regular intervals,
  /// however this function may be called to ensure more frequent ping requests.
  /// @param host - The host instance managing this peer
  #[napi]
  pub fn ping(&self, host: &mut crate::host::Host) -> napi::Result<()> {
    host.ping_peer(self.net_id)
  }

  /// Send a reliable packet to this peer on the specified channel.
  /// @param host - The host instance managing this peer
  /// @param channel_id - The channel ID to send on
  /// @param data - The packet data to send
  /// @returns True if packet queued successfully
  #[napi]
  pub fn send(
    &self,
    host: &mut crate::host::Host,
    channel_id: u8,
    data: napi::bindgen_prelude::Buffer,
  ) -> napi::Result<bool> {
    host.send(self.net_id, data, channel_id)
  }

  /// Request a disconnection from this peer.
  /// An Event::Disconnect will be generated once the disconnection is complete.
  /// @param host - The host instance managing this peer
  /// @param data - An integer value to pass to the peer upon disconnection
  /// @returns True on success
  #[napi]
  pub fn disconnect(&self, host: &mut crate::host::Host, data: u32) -> napi::Result<bool> {
    host.disconnect_peer(self.net_id, data)
  }

  /// Force an immediate disconnection from this peer.
  /// No Event::Disconnect will be generated.
  /// The foreign peer is not guaranteed to receive the disconnect notification.
  /// @param host - The host instance managing this peer
  /// @param data - An integer value to pass to the peer upon disconnection
  /// @returns True on success
  #[napi]
  pub fn disconnect_now(&self, host: &mut crate::host::Host, data: u32) -> napi::Result<bool> {
    host.disconnect_now_peer(self.net_id, data)
  }

  /// Request a disconnection from this peer, but only after all queued outgoing packets are sent.
  /// An Event::Disconnect will be generated once the disconnection is complete.
  /// @param host - The host instance managing this peer
  /// @param data - An integer value to pass to the peer upon disconnection
  /// @returns True on success
  #[napi]
  pub fn disconnect_later(&self, host: &mut crate::host::Host, data: u32) -> napi::Result<bool> {
    host.disconnect_later_peer(self.net_id, data)
  }

  /// Forcefully disconnect this peer without notification.
  /// The foreign host represented by this peer is not notified of the disconnection and will timeout.
  /// @param host - The host instance managing this peer
  /// @returns True on success
  #[napi]
  pub fn reset(&self, host: &mut crate::host::Host) -> napi::Result<bool> {
    host.reset_peer(self.net_id)
  }

  /// Set timeout parameters for this peer.
  /// Timeout values use an exponential backoff mechanism.
  /// If a reliable packet is not acknowledged within some multiple of the average RTT,
  /// the timeout will be doubled until it reaches the limit.
  /// @param host - The host instance managing this peer
  /// @param limit - The timeout limit (defaults to PEER_TIMEOUT_LIMIT if 0)
  /// @param minimum - The minimum timeout (defaults to PEER_TIMEOUT_MINIMUM if 0)
  /// @param maximum - The maximum timeout (defaults to PEER_TIMEOUT_MAXIMUM if 0)
  /// @returns True on success
  #[napi]
  pub fn set_timeout(
    &self,
    host: &mut crate::host::Host,
    limit: u32,
    minimum: u32,
    maximum: u32,
  ) -> napi::Result<bool> {
    host.set_timeout_peer(self.net_id, limit, minimum, maximum)
  }

  /// Set the interval at which pings will be sent to this peer in milliseconds.
  /// Pings are used to monitor connection liveness and dynamically adjust the throttle
  /// during periods of low traffic for better responsiveness during traffic spikes.
  /// @param host - The host instance managing this peer
  /// @param ping_interval - The ping interval in milliseconds
  /// @returns True on success
  #[napi]
  pub fn set_ping_interval(
    &self,
    host: &mut crate::host::Host,
    ping_interval: u32,
  ) -> napi::Result<bool> {
    host.set_ping_interval_peer(self.net_id, ping_interval)
  }

  /// Configure throttle parameters for this peer.
  /// The throttle represents a probability that an unreliable packet should be sent.
  /// When throttle is at maximum, 100% of unreliable packets are sent.
  /// When at 0, all unreliable packets are dropped.
  /// @param host - The host instance managing this peer
  /// @param interval - Interval in milliseconds over which to measure lowest mean RTT
  /// @param acceleration - Rate at which to increase throttle probability as RTT declines
  /// @param deceleration - Rate at which to decrease throttle probability as RTT increases
  /// @returns True on success
  #[napi]
  pub fn set_throttle(
    &self,
    host: &mut crate::host::Host,
    interval: u32,
    acceleration: u32,
    deceleration: u32,
  ) -> napi::Result<bool> {
    host.set_throttle_peer(self.net_id, interval, acceleration, deceleration)
  }

  /// Set the maximum transmission unit (MTU) for this peer.
  /// @param host - The host instance managing this peer
  /// @param mtu - The MTU value (must be between PROTOCOL_MINIMUM_MTU and PROTOCOL_MAXIMUM_MTU)
  /// @returns True on success
  /// @throws Error if MTU is out of valid range
  #[napi]
  pub fn set_mtu(&self, host: &mut crate::host::Host, mtu: u16) -> napi::Result<bool> {
    host.set_mtu_peer(self.net_id, mtu)
  }
}
