import express from "express";
import { readFileSync } from "fs";
import http from "http";
import https from "https";

const options = {
  key: readFileSync("misc/ssl/server.key"),
  cert: readFileSync("misc/ssl/server.crt")
};

export function WebServer(ip: string, port: number) {
  const app = express();
  let done = false;

  let httpServer = http.createServer(app);
  let httpsServer = https.createServer(options, app);

  app.use("/growtopia/server_data.php", (req, res) => {
    res.send(
      `server|${ip}\nport|${port}\ntype|1\n#maint|Server is Maintenance\nmeta|growtopiajs\nRTENDMARKERBS1001`
    );
  });

  httpServer.listen(80);
  httpsServer.listen(443);
  httpsServer.on("listening", function () {
    done = true;
  });

  return done ? true : false;
}
