#!/usr/bin/env bash
# SPDX-License-Identifier: MIT

function cardboard_convert() {
  # base64ToUrl and base64FromUrl taken from https://github.com/google/wwgc/blob/master/www/js/Cardboard.js
  node --eval "$(cat <<EOF
const e = process.argv[1];
const fs = require('fs');
// License for base64ToUrl and base64FromUrl
// Copyright 2015 Google Inc. All Rights Reserved.
// SPDX-License-Identifier: Apache License 2.0
function base64ToUrl(s) {
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

function base64FromUrl(s) {
  s = s + '==='.slice(0, [0, 3, 2, 1][s.length % 4]);
  return s.replace(/-/g, '+').replace(/_/g, '/');
}
const data = fs.readFileSync(0).toString();
if(e == "base64FromUrl") {
  console.log(base64FromUrl(data));
} else {
  console.log(base64ToUrl(data));
}
EOF
)" $@
}

function decode() {
  echo -n "${1?}" | cardboard_convert base64FromUrl | base64 -d -w0 | protoc --proto_path=. --decode=DeviceParams CardboardDevice.proto
}

function encode() {
  local PROTODATA=$(cat <<EOF
vendor: "Google"
model: "Cardboard v1"
screen_to_lens_distance: 0.0393
inter_lens_distance: 0.0639
left_eye_field_of_view_angles: [40.0, 40.0, 40.0, 40.0]
vertical_alignment: BOTTOM
tray_to_lens_distance: 0.035
distortion_coefficients: [0.33583, 0.55349]
has_magnet: false
primary_button: NONE
EOF
)

  [[ -n "$1" ]] && PROTODATA=$(cat "$1")

  protoc --proto_path=. --encode=DeviceParams CardboardDevice.proto <<EOF | base64 -w0 | cardboard_convert base64ToUrl
$PROTODATA
EOF
}

function encode_uri() {
  echo 'http://google.com/cardboard/cfg?p='$(encode "$1")
}

function genqr() {
  local ARGS=()
  [[ $# -le 1 ]] && ARGS=(-t UTF8)
  [[ $# -eq 2 ]] && ARGS=(-o "$2" -s 8 -t PNG)
  encode_uri "$1" | qrencode "${ARGS[@]}"
}

function help() {
    echo "cardboard-profile.sh - Cardboard Profile QR generator

Sub commands:

  decode     decode proto data base64-like encoded string
  decode     encode proto data to base64-like encoded string
  genqr      generates a qr picture from protodata file
  help       prints this
  
Exampels:

  cardboard-profile.sh genqr cardboard.protodata cardboard-qr.png
  
    Generates a QR-Code PNG image from the provided data in cardboard.protodata
    
  cardboard-profile.sh genqr cardboard.protodata
  
    Generates a QR-Code from the provided data in cardboard.protodata and prints it to stdout
"
}

case "$1" in
  genqr*|decode*|encode*)
    "$@"
    ;;
  shortlist)
    echo genqr help
    ;;
  help|*)
    help
    ;;
esac
