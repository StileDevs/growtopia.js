import test from "ava";

import { Host } from "../esm.mjs";

function cbTest() {
  console.log("awd");
}
const server = new Host("0.0.0.0", 17091, 1024, 2, false, false);

test("get ip address from server socket native", (t) => {
  t.is(server.ipAddress, "0.0.0.0");
});

test("get port from server socket native", (t) => {
  t.is(server.port, 17091);
});

test("test server service", (t) => {
  server.setEmitter(cbTest);

  try {
    server.service();
  } catch (e) {
    console.error("woi", e);
  }
  t.pass();
});
