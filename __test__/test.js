const { TextPacket, ItemsDat } = require("../dist/index.js");
const { Hono } = require("hono");
const { logger } = require("hono/logger");
const { serveStatic } = require("@hono/node-server/serve-static");
const { serve } = require("@hono/node-server");
const { createServer } = require("https");
const { readFileSync } = require("fs");
const { join, relative } = require("path");

const { Client } = require("../dist/index.js");

const server = new Client({
  enet: {
    ip: "0.0.0.0",
    useNewPacket: {
      asClient: false
    },
    useNewServerPacket: true
  }
});

// server.connect("0.0.0.0", 17091);
// server.host.disconnectNow(0);

server.on("connect", (netID) => {
  console.log("Connected ", netID);
  server.send(netID, 0, TextPacket.from(0x1));
  // setInterval(() => {
  //   console.log(server.host.getPeerData(netID));
  // }, 50);
});
server.on("raw", (netID, channelID, data) => {
  const type = data.readUInt32LE(0);

  console.log("Raw ", channelID, data);
  if (type === 2) {
    console.log("Str ", channelID, data.subarray(4).toString("utf-8"));
  }
  console.log(server.host.getPeerData(netID));
});

server.on("disconnect", (netID) => {
  console.log("Disconnect ", netID);
});

server.listen();

(async () => {
  await Web();
  const file = readFileSync("./assets/items.dat");
  const item = new ItemsDat(file);

  await item.decode();
  console.log(item);
  await item.encode();
})();

async function Web() {
  const app = new Hono();

  app.use(logger((str, ...rest) => console.log(str, ...rest)));

  const to = join(__dirname, "..", "assets", "cache");
  const root = relative(__dirname, to);

  app.use(
    "/growtopia/cache",
    serveStatic({
      root
    })
  );

  app.get("/", (ctx) =>
    ctx.json({
      message: "Hello world"
    })
  );

  app.all("/growtopia/server_data.php", (ctx) => {
    let str = "";

    str += `server|127.0.0.1\n`;
    // str += `type2|1\n`;

    str += `port|17091\nloginurl|login.growserver.app:8080\ntype|1\ntype2|1\n#maint|test\nmeta|ignoremeta\nRTENDMARKERBS1001`;

    return ctx.body(str);
  });

  app.post("/player/login/validate", async (ctx) => {
    const formData = await ctx.req.formData();
    const growID = formData.get("growID");
    const password = formData.get("password");

    // const { token } = await ctx.req.json<{ token: string }>();
    // if (!growID && !password) return ctx.status(401);

    return ctx.html(
      JSON.stringify({
        status: "success",
        message: "Account Validated.",
        token: "adw",
        url: "",
        accountType: "growtopia"
      })
    );
  });

  app.use("/player/login/dashboard", (ctx) => {
    const html = readFileSync(join(__dirname, "..", "assets", "website", "login.html"), "utf-8");
    return ctx.html(html);
  });

  serve(
    {
      fetch: app.fetch,
      port: 443,
      createServer,
      serverOptions: {
        key: readFileSync(join(__dirname, "..", "assets", "ssl", "server.key")),
        cert: readFileSync(join(__dirname, "..", "assets", "ssl", "server.crt"))
      }
    },
    (info) => {
      console.log(`⛅ Running HTTPS server on https://localhost`);
    }
  );

  serve(
    {
      fetch: app.fetch,
      port: 8080,
      createServer,
      serverOptions: {
        key: readFileSync(join(__dirname, "..", "assets", "ssl", "_wildcard.growserver.app-key.pem")),
        cert: readFileSync(join(__dirname, "..", "assets", "ssl", "_wildcard.growserver.app.pem"))
      }
    },
    (info) => {
      console.log(`⛅ Running Login server`);
    }
  );
}
