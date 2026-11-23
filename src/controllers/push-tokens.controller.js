import { AppError } from "../utils/errors.js";
import { pushTokenSchema } from "../schemas/push-tokens.schema.js";
import { pushTokensService } from "../services/push-tokens.service.js";

async function saveToken(req, res) {
  const parsed = pushTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "validation_error");
  }

  await pushTokensService.saveToken(req.user.uid, parsed.data.token);

  return res.status(204).send();
}

async function removeToken(req, res) {
  const parsed = pushTokenSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "validation_error");
  }

  await pushTokensService.removeToken(req.user.uid, parsed.data.token);

  return res.status(204).send();
}

export const pushTokensController = {
  saveToken,
  removeToken,
};
