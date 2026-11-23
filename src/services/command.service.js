import { AppError } from "../utils/errors.js";
import { controlRepository } from "../repositories/control.repository.js";

async function sendCommand(deviceId, state) {
  const now = Date.now();
  let changed = false;

  await controlRepository.updateControl(deviceId, (current) => {
    if (current.requestedState === state) return undefined;

    if (current.requestedAt && now - current.requestedAt < 3000) {
      throw new AppError(429, "too_many_requests");
    }

    changed = true;

    return { ...current, requestedState: state, requestedAt: now };
  });
  
  return { changed };
}

export const commandService = {
  sendCommand,
};
