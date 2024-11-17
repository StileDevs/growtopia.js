import test from "ava";

import { sum, Host } from "../index.js";

test("sum from native", (t) => {
  t.is(sum(1, 2), 3);
});

function cbTest() {
  console.log("awd");
}
const server = new Host("0.0.0.0", 17091);
// const acceptPromise = () => new Promise((resolve) => setImmediate(() => resolve(server.service())));

test("get ip address from server socket native", (t) => {
  t.is(server.ipAddress, "0.0.0.0");
});

test("get port from server socket native", (t) => {
  t.is(server.port, 17091);
});

test("test server service", (t) => {
  server.setEventEmitter(cbTest);

  try {
    server.service();
  } catch (e) {
    console.error("woi", e);
  }
  t.pass();
});
