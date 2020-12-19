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
deno run --allow-net --allow-env --allow-read=.env,.env.example,.env.defaults index.js
```

## How to debug

```
deno run --inspect-brk --allow-net --allow-env --allow-read=.env,.env.example,.env.defaults index.js
```

Then visit: chrome://inspect/#devices in chrome, and click "inspect" to
step through in the debugger. Very useful.

Monitor via the systemd service:

```
journalctl -u deno-stripe-connect-account-accounce-server.service -f
```

## How to deploy

Install redis, enable as a service (apt repo does this automatically,
  Verify redis is listening on localhost onlw. How? `nc -zv <server-ip> 6379` e.g. `nc -zv 192.168.1.1 6379` or `telnet <server-ip> 6379`
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

### Speed

Excluding the network the deno code can respond in under 4 milliseconds
```
time curl -v http://127.0.0.1:5050/ -d '{"stripe_connect_account_id":"abc123", "site_url":"example.com", "live_mode": 0}'
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 5050 (#0)
> POST / HTTP/1.1
> Host: 127.0.0.1:5050
> User-Agent: curl/7.58.0
> Accept: */*
> Content-Length: 80
> Content-Type: application/x-www-form-urlencoded
> 
* upload completely sent off: 80 out of 80 bytes
< HTTP/1.1 200 OK
< content-length: 79
< 
* Connection #0 to host 127.0.0.1 left intact
Stripe connect account added or updated. site_url: example.com account: abc123.
real	0m0.008s
user	0m0.003s
sys	0m0.003s
```
