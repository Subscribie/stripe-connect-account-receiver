#!/bin/bash

uvicorn --reload  --log-level debug --port 8001 main:app
