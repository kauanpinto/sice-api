import { env } from "../config/env.js";

async function getMe(req, res) {
  return res.status(200).json({ uid: req.user.uid, deviceId: env.DEVICE_ID });
}

export const meController = { getMe };
