import { AppError } from "../utils/errors.js";
import { commandSchema } from "../schemas/command.schema.js";
import { commandService } from "../services/command.service.js";

async function sendCommand(req, res) {
  const parsed = commandSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new AppError(400, "validation_error");
  }

  const { changed } = await commandService.sendCommand(
    req.params.id,
    parsed.data.state,
  );

  if (!changed) {
    return res.status(200).send();
  }

  res.set("Retry-After", "3");

  return res.status(202).send();
}

export const commandController = {
  sendCommand,
};
