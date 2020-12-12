# Accept POST requests from sites and store their stripe connect account id

Expected input:

- Method: `POST`
- Content-type: application/json
- Body:
```
"{
  "stripe_connect_account_id": "acct_abc123dfji", 
  "live_mode": 0, "site_url": "http://127.0.0.1:5000/"
}"
```

Which is then parsed and stored by this program:

```
  const parsedBody = JSON.parse(requestBody);
  const stripe_connect_account_id = parsedBody['stripe_connect_account_id'];
  const site_url = parsedBody['site_url'];
  const live_mode = parsedBody['live_mode'];
```

## How to run

Copy .env.example:

```
cp .env.example .env
```

Then run securly:

```
deno run --allow-net=127.0.0.1 --allow-env --allow-read=.env,.env.example,.env.defaults,stripe_connect_sites.db,stripe_connect_sites.db-journal --allow-write=stripe_connect_sites.db,stripe_connect_sites.db-journal index.js
```

## How to debug

```
deno run --inspect-brk --allow-net=127.0.0.1 --allow-env --allow-read=.env,.env.example,.env.defaults,stripe_connect_sites.db,stripe_connect_sites.db-journal --allow-write=stripe_connect_sites.db,stripe_connect_sites.db-journal index.js
```

Then visit: chrome://inspect/#devices in chrome, and click "inspect" to
step through in the debugger. Very useful.

Monitor via the systemd service:

```
journalctl -u deno-stripe-connect-account-accounce-server.service -f
```

## How to deploy

Install deno
Install and enable systemd unit file to keep it running

See example systemd unit service file in `deno-systemd-service.example` 
Save to `/etc/systemd/system/deno-stripe-connect-account-accounce-server.service`

To enable:

```
sudo systemctl daemon-reload
sudo systemctl start deno-stripe-connect-account-accounce-server.service
```

Verify running:
```
sudo systemctl status deno-stripe-connect-account-accounce-server.service
```
