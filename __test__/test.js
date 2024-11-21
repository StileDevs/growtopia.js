const { Host } = require("../index.js");
const { Hono } = require("hono");
const { logger } = require("hono/logger");
const { serveStatic } = require("@hono/node-server/serve-static");
const { serve } = require("@hono/node-server");
const { createServer } = require("https");
const { readFileSync } = require("fs");
const { join, relative } = require("path");

const server = new Host("0.0.0.0", 17091, 1024, 2, false);
function onEvent(event, id, data) {
  console.log("Event received:", event, id, data);

  if (event === "connect") {
    const buf = Buffer.alloc(4);
    buf.writeUint32LE(1);
    server.send(id, buf, 0);
    console.log(server.getPeerData(id));
  }
}

(async () => {
  await Web();
  server.setEmitter(onEvent);
  console.log(server.port);
  const acceptPromise = () =>
    new Promise((resolve) => setImmediate(() => resolve(server.service())));
  while (true) await acceptPromise();
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

    const randPort = 17091;
    str += `port|${randPort}\nloginurl|login.growserver.app:8080\ntype|1\n#maint|test\nmeta|ignoremeta\nRTENDMARKERBS1001`;

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
      port: 80
    },
    (info) => {
      console.log(`⛅ Running HTTP server on http://localhost`);
    }
  );

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
        key: readFileSync(
          join(__dirname, "..", "assets", "ssl", "_wildcard.growserver.app-key.pem")
        ),
        cert: readFileSync(join(__dirname, "..", "assets", "ssl", "_wildcard.growserver.app.pem"))
      }
    },
    (info) => {
      console.log(`⛅ Running Login server`);
    }
  );
}
