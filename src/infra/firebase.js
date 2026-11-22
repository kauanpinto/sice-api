import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { getMessaging } from "firebase-admin/messaging";
import { env } from "../config/env.js";

function loadServiceAccount() {
  try {
    const decoded = Buffer.from(
      env.FIREBASE_SERVICE_ACCOUNT_BASE64,
      "base64",
    ).toString("utf-8");

    return JSON.parse(decoded);
  } catch (error) {
    throw new Error("Failed to load Firebase service account", {
      cause: error,
    });
  }
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert(loadServiceAccount()),
    databaseURL: env.FIREBASE_DATABASE_URL,
  });
}

export const db = getDatabase();
export const adminAuth = getAuth();
export const messaging = getMessaging();
