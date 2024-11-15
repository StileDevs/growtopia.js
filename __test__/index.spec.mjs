import test from "ava";

import { sum, Host } from "../index.js";

test("sum from native", (t) => {
  t.is(sum(1, 2), 3);
});

const server = new Host("0.0.0.0", 17091);

test("get ip address from server socket native", (t) => {
  t.is(server.ipAddress, "0.0.0.0");
});

test("get port from server socket native", (t) => {
  t.is(server.port, 17091);
});
