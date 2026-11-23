import { AppError } from "../utils/errors.js";
import { pushTokensRepository } from "../repositories/push-tokens.repository.js";

async function saveToken(uid, token) {
  const count = await pushTokensRepository.countTokens(uid);

  if (count >= 10) {
    throw new AppError(409, "too_many_tokens");
  }

  await pushTokensRepository.saveToken(uid, token);
}

async function removeToken(uid, token) {
  await pushTokensRepository.removeToken(uid, token);
}

export const pushTokensService = {
  saveToken,
  removeToken
};
