import { webSocket } from "rxjs/webSocket";
const port = process.env.PORT || 8080;
// Our test server is using self signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const socket$ = webSocket<any>({
  url: `wss://localhost:${port}`,
  WebSocketCtor: require("ws")
});

socket$.subscribe(
  data => {
    console.log(`[Client] ${data.num}`);
    socket$.next({ num: data.num + 1 });
  },
  err => {
    console.warn(`[Client] ${err.message}`) || console.error(err);
    // Without manual complete, you end up with unusable websocket connection.
    socket$.complete();
  },
  () => console.warn(`[Client] Completed!`)
);
