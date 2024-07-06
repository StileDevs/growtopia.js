import express from "express";
import { readFileSync } from "fs";
import http from "http";
import https from "https";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { HTTPSServerOptions } from "../../types";

const __dirname = dirname(fileURLToPath(import.meta.url));

const options = {
  key: readFileSync(join(__dirname, "..", "..", "misc", "ssl", "server.key")),
  cert: readFileSync(join(__dirname, "..", "..", "misc", "ssl", "server.crt"))
};

export function WebServer(data: HTTPSServerOptions) {
  const app = express();
  let done = false;

  let httpServer = http.createServer(app);
  let httpsServer = https.createServer(options, app);

  app.use("/growtopia/server_data.php", (req, res) => {
    res.send(
      `server|${data.ip}\nport|${data.enetPort}\ntype|1\n${
        data.type2 ? "type2|1" : ""
      }\n#maint|Server is Maintenance\nmeta|growtopiajs\nRTENDMARKERBS1001`
    );
  });

  httpServer.listen(data.httpPort);
  httpsServer.listen(data.httpsPort);
  httpsServer.on("listening", function () {
    done = true;
  });

  return done ? true : false;
}
