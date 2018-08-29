import { Observable, Subject } from "rxjs";
import * as ws from "ws";
const port = process.env.PORT || 8080;
// Our test server is using self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const wsClient = new ws(`wss://localhost:${port}`);
const incomingData = new Observable<{ data?: { num: number }; error?: any }>(
  obs => {
    wsClient.on("message", wsMessageData => {
      const stringData = wsMessageData.toString();
      try {
        const parsedData = JSON.parse(stringData);
        obs.next({ data: parsedData });
      } catch (err) {
        obs.next({ error: new Error("Failed to parse json!") });
      }
    });
    wsClient.on("close", () => obs.complete());
    wsClient.on("error", error => obs.next({ error }));
  }
);
const outgoingData = new Subject<any>();
outgoingData.subscribe(dataToGo => {
  if (wsClient.readyState == wsClient.OPEN) {
    wsClient.send(JSON.stringify(dataToGo));
  }
});
// Application
incomingData.subscribe(
  message => {
    if (message.data) {
      console.log(`[Client2] ${message.data.num}`);
      outgoingData.next({ num: message.data.num + 1 });
    } else if (message.error) {
      console.warn(`[Client2] ${message.error.message}`) ||
        console.error(message.error);
    }
  },
  err => console.warn(`[Client2] ${err.message}`) || console.error(err),
  () => console.warn(`[Client2] Completed!`)
);
