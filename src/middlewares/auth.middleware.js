import { AppError } from "../utils/errors.js";
import { adminAuth } from "../infra/firebase.js";
import { deviceRepository } from "../repositories/device.repository.js";

export async function requireAuth(req, _res, next) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "unauthorized");
  }

  const token = authorization.slice(7);

  if (!token) {
    throw new AppError(401, "unauthorized");
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    req.user = { uid: decoded.uid };

    next();
  } catch {
    throw new AppError(401, "unauthorized");
  }
}

export async function requireOwner(req, _res, next) {
  const id = req.params.id;

  if (!/^[a-z0-9-]{3,40}$/.test(id)) {
    throw new AppError(404, "not_found");
  }

  const ownerUid = await deviceRepository.getOwnerUid(id);

  if (!ownerUid) {
    throw new AppError(404, "not_found");
  }

  if (ownerUid !== req.user.uid) {
    throw new AppError(403, "forbidden");
  }

  next();
}
