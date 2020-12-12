import { serve } from "https://deno.land/std@0.80.0/http/server.ts";
import { DB } from "https://deno.land/x/sqlite@v2.3.2/mod.ts";
import { config } from "https://deno.land/x/dotenv@v1.0.1/mod.ts";


// Load config from .env
console.log(config({ safe: true, export: true}));

const PORT = parseInt(Deno.env.get('PORT'));
const HOSTNAME = Deno.env.get('HOSTNAME');
const DB_NAME = Deno.env.get('DB_NAME');

const s = serve({ hostname: HOSTNAME, port: PORT});
console.log("http://:" + HOSTNAME + ":" + PORT);

const decoder = new TextDecoder('utf-8');
const db = new DB(DB_NAME);

// Create database if does not exist
db.query("CREATE TABLE IF NOT EXISTS sites (id INTEGER PRIMARY KEY AUTOINCREMENT, site_url TEXT, stripe_connect_account_id TEXT UNIQUE, live_mode BOOLEAN)");
db.close();

for await (const req of s) {
  const requestBody = await decoder.decode(await Deno.readAll(req.body));
  const parsedBody = JSON.parse(requestBody);
  const stripe_connect_account_id = parsedBody['stripe_connect_account_id'];
  const site_url = parsedBody['site_url'];
  const live_mode = parsedBody['live_mode'];

  // Store the stripe_connect_account_id against the shop_url
  const sitesDB = new DB(DB_NAME);
  console.log([site_url, stripe_connect_account_id, live_mode]);
  sitesDB.query("INSERT OR REPLACE INTO sites (site_url, stripe_connect_account_id, live_mode) VALUES (?, ?, ?)", [site_url, stripe_connect_account_id, live_mode]);
  sitesDB.close();
  
  const response = `Stripe connect account added or updated. site_url: ${site_url} account: ${stripe_connect_account_id}.`;
  console.log(response);
  req.respond({ body: response});
}


