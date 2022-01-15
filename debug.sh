#!/bin/bash

deno run --inspect --allow-all --allow-net --allow-env --allow-read=.env,.env.example,.env.defaults app.ts
