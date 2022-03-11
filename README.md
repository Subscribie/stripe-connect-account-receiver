# stripe-connect-account-announcer

Sites announce their stripe connect account id to this endpoint.

Accepts POST requests from sites and stores their stripe connect account id in
redis.

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

## How to run locally

Copy .env.example:

```
#Update settings:
cp .env.example .env
```

```
python3 -m venv venv
. venv/bin/activate
pip install -r requirements.txt
# Run it
uvicorn --reload  --log-level debug main:app
```


## How to deploy

Install redis, enable as a service (apt repo does this automatically,
  Verify redis is listening on localhost onlw. How? `nc -zv <server-ip> 6379` e.g. `nc -zv 192.168.1.1 6379` or `telnet <server-ip> 6379`


## How to update an existing record

> For example, the shop web address changes, and now redis must be updated
  to store the new shop address:

Example:

1. Get the Stripe connect account id from Stripe,
   by going to Stripe dashboard -> connect -> Clicking the account -> view the url (this contains the
   connect account id.
2. Connect to redis and update the record

```
# Connect to redis, verify the old address (`GET`), then update (`SET`) the new web address
# with the same connect account key
$ telnet 127.0.0.1 6379
GET acct_abc123
$41
https://example.co.uk/
SET acct_abc123 "http://example.com/"
+OK
GET acct_abc123
$24
https://example.com/
QUIT
+OK
Connection closed by foreign host.
```

## Smoke test

```
curl -v -H 'Conexampletent-Type: application/json' -d '{"stripe_connect_account_id":"example", "site_url":"example"}' http://testing-stripe-connect-account-announcer.pcpink.co.uk:8001| grep 'example'
```

### Load test
With apache bench `ab`.
```
ab -p post_loc.txt -n 999900 -c 10 http://127.0.0.1:8001/
```

```
Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    0   0.0      0       1
Processing:    13   20   2.1     20      46
Waiting:       11   18   2.3     18      44
Total:         13   20   2.1     20      46
```
