#!/bin/zsh
cd "$(dirname "$0")"
(sleep 1.5; open "http://localhost:3000") &
node server.js
