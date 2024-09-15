#!/bin/bash

# localhost only useful for local dev testing

curl -v -H 'Content-Type: application/json' -d '{"stripe_connect_account_id":0, "site_url": "example.com"}' 127.0.0.1:8001 | grep 'example.com'
