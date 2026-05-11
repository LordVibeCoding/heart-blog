#!/usr/bin/env node
// 用 WebCrypto PBKDF2 生成密码哈希（Workers 兼容）
// 用法: node scripts/hash-password.mjs <password>

import { webcrypto } from "node:crypto";

const ITER = 200_000;
const KEY_LEN = 32;

const password = process.argv[2];
if (!password) {
  console.error("用法: node scripts/hash-password.mjs <password>");
  process.exit(1);
}

const salt = webcrypto.getRandomValues(new Uint8Array(16));
const enc = new TextEncoder();
const keyMaterial = await webcrypto.subtle.importKey(
  "raw",
  enc.encode(password),
  "PBKDF2",
  false,
  ["deriveBits"],
);
const bits = await webcrypto.subtle.deriveBits(
  { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
  keyMaterial,
  KEY_LEN * 8,
);

const toB64 = (u8) => Buffer.from(u8).toString("base64");

const sessionSecret = toB64(webcrypto.getRandomValues(new Uint8Array(32)));

console.log("\n复制到 .env.local：\n");
console.log(`ADMIN_USERNAME=hylas520`);
console.log(`ADMIN_PASSWORD_ITER=${ITER}`);
console.log(`ADMIN_PASSWORD_SALT=${toB64(salt)}`);
console.log(`ADMIN_PASSWORD_HASH=${toB64(new Uint8Array(bits))}`);
console.log(`SESSION_SECRET=${sessionSecret}`);
console.log();
