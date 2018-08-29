import * as https from "https";
import { Server } from "ws";
import * as fs from "fs";

const port = process.env.PORT || 8080;

function credentials() {
  //
  const key = fs.readFileSync("rxjswebsocketsubjecttest.key", "utf8");
  const cert = fs.readFileSync("rxjswebsocketsubjecttest.crt", "utf8");
  return { key, cert };
}

const server = https
  .createServer(credentials())
  .listen(port, () => console.log(`[Server] Started listening to ${port}.`));
const ws = new Server({
  server
});

let closeServerWhenThisHitsZero = 2;
ws.on("connection", wsConnection => {
  //connection is up, let's add a simple simple event
  wsConnection.on("message", (data: string) => {
    const parsed = JSON.parse(data) as { num: number };
    console.log(`[Server] ${parsed.num}`);
    const nextNum = parsed.num + 1;
    if (nextNum < 10) {
      const dataToSend = JSON.stringify({ num: nextNum });
      wsConnection.send(dataToSend);
    } else {
      wsConnection.close();
    }
  });
  wsConnection.on("close", () => {
    closeServerWhenThisHitsZero -= 1;
    if (closeServerWhenThisHitsZero < 1) {
      ws.close();
      server.close();
      console.log(`[Server] Complete!`);
    }
  });
  const dataToSend = JSON.stringify({ num: 0 });
  wsConnection.send(dataToSend);
  wsConnection.send("Hi!");
});
