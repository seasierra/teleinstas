export function isValidURL(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

import * as fs from 'fs';
import * as path from 'path';

export const getFile = (name: string) =>
  fs.readFileSync(path.resolve(__dirname, name), 'utf8');
