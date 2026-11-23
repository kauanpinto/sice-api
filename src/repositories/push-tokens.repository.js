import { createHash } from "node:crypto";
import { db } from "../infra/firebase.js";

function hash(token) {
  return createHash("sha256").update(token).digest("hex");
}

async function countTokens(uid) {
  const snap = await db.ref(`users/${uid}/pushTokens`).get();

  return snap.exists() ? Object.keys(snap.val()).length : 0;
}

async function saveToken(uid, token) {
  await db
    .ref(`users/${uid}/pushTokens/${hash(token)}`)
    .set({ token, updatedAt: Date.now() });
}

async function removeToken(uid, token) {
  await db.ref(`users/${uid}/pushTokens/${hash(token)}`).remove();
}
async function getTokens(uid) {
  const snap = await db.ref(`users/${uid}/pushTokens`).get();

  if (!snap.exists()) return [];

  return Object.values(snap.val()).map((v) => v.token);
}

export const pushTokensRepository = {
  countTokens,
  saveToken,
  removeToken,
  getTokens,
};
