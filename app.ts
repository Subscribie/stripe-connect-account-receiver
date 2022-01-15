import { serve } from "https://deno.land/std@0.121.0/http/server.ts";
// Load config from .env
import "https://deno.land/x/dotenv@v3.1.0/load.ts";

let REDIS_HOSTNAME = Deno.env.get('REDIS_HOSTNAME');
let REDIS_PORT = Deno.env.get('REDIS_PORT');
let REDIS_PASSWORD = Deno.env.get('REDIS_PASSWORD');
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

const redisConn = await Deno.connect({hostname: REDIS_HOSTNAME, port: Number(REDIS_PORT)})

async function handle(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    console.log(performance.now());
    // Login to redis
    redisConn.write(encoder.encode(`AUTH ${REDIS_PASSWORD}\n\n`));
    const loginBuf = new Uint8Array(1024);
    await redisConn.read(loginBuf);
    console.log(decoder.decode(loginBuf));
    if (decoder.decode(loginBuf).includes("max number of clients reached")) {
      let msg = "Redis max number of clients reached";
      console.error(msg);
      await requestEvent.respondWith(
        new Response(JSON.stringify(msg),{
          status: 500,
      }));
      break;
    }

    // Store the stripe_connect_account_id against the shop_url
    const body = await requestEvent.request.text();
    console.log("Body:", body);
    const parsedBody = JSON.parse(body);
    const stripe_connect_account_id = parsedBody['stripe_connect_account_id'];
    const site_url = parsedBody['site_url'];
    const live_mode = parsedBody['live_mode'];

    console.log([site_url, stripe_connect_account_id, live_mode]);
    // Send stripe connect account id and shop url as key/value
    redisConn.write(encoder.encode(`set ${stripe_connect_account_id} ${site_url}\n\n`));
    // Read response from redis
    const buf = new Uint8Array(1024);
    await redisConn.read(buf);
    console.log(decoder.decode(buf));

    const msg = `Stripe connect account added or updated. site_url: ${site_url} account: ${stripe_connect_account_id}.`;
    console.log(msg);

    const respBody = {
      msg:msg
    }

    await requestEvent.respondWith(
      new Response(JSON.stringify(respBody),{
        status: 200,
    }));
  }
}

let DENO_PORT = Deno.env.get("DENO_PORT");
let HOSTNAME = Deno.env.get('HOSTNAME');
console.log("http://:" + HOSTNAME + ":" + DENO_PORT);

const server = Deno.listen({ port: Number(DENO_PORT) });

for await (const conn of server) {
    handle(conn);
}
