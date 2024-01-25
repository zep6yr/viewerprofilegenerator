// License for base64ToUrl and base64FromUrl
// taken from https://github.com/google/wwgc/blob/master/www/js/Cardboard.js
// Copyright 2015 Google Inc. All Rights Reserved.
// SPDX-License-Identifier: Apache License 2.0
export function base64ToUrl(s: string): string {
  return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=+$/, '');
}

export function base64FromUrl(s: string): string {
  s = s + '==='.slice(0, [0, 3, 2, 1][s.length % 4]);
  return s.replace(/-/g, '+').replace(/_/g, '/');
}
