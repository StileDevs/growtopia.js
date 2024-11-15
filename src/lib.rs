#![deny(clippy::all)]
// use napi::bindgen_prelude::*;
// use napi::{Env, JsFunction, JsObject, Result, Status};
// use rusty_enet::{Host, HostSettings};
use rusty_enet as enet;
use std::str::FromStr;
use std::{collections::HashMap, net::SocketAddr, net::UdpSocket};
#[macro_use]
extern crate napi_derive;

#[napi]
pub fn sum(a: i32, b: i32) -> i32 {
  a + b
}

// #[napi(constructor)]
// struct Animal {
//   pub name: String,
//   pub kind: u32,
// }

// #[napi]
// impl Animal {
//   #[napi]
//   pub fn change_name(&mut self, new_name: String) {
//     self.name = new_name;
//   }

// }

#[napi(js_name = "Client")]
pub struct Client {
  host: enet::Host<UdpSocket>,
}

#[napi]
impl Client {
  #[napi(constructor)]
  pub fn new() -> Self {
    Client {
      host: enet::Host::new(
        UdpSocket::bind(SocketAddr::from_str("0.0.0.0:17091").unwrap()).unwrap(),
        enet::HostSettings {
          peer_limit: 0,
          channel_limit: 2,
          compressor: Some(Box::new(enet::RangeCoder::new())),
          checksum: Some(Box::new(enet::crc32)),
          ..Default::default()
        },
      )
      .unwrap(),
    }
  }
}
