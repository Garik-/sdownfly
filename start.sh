#!/usr/bin/env bash
set -e

export PUID=$(id -u)
export PGID=$(id -g)

exec docker compose up -d