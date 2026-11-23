import { AppError } from "../utils/errors.js";
import { db } from "../infra/firebase.js";

const RULES = ["absence", "dark", "outsideSchedule", "highUsage"];

async function ackAlert(req, res) {
  const { rule } = req.params;

  if (!RULES.includes(rule)) {
    throw new AppError(400, "validation_error");
  }

  const ref = db.ref(`devices/${req.params.id}/alerts/${rule}`);
  const { committed, snapshot } = await ref.transaction((cur) => {
    if (!cur || cur.state === "pending") {
      return undefined;
    }

    if (cur.acknowledged) {
      return undefined;
    }

    return { ...cur, acknowledged: true, acknowledgedAt: Date.now() };
  });

  if (!snapshot.exists()) {
    throw new AppError(404, "not_found");
  }

  if (!committed) {
    return res.status(200).send();
  }

  return res.status(204).send();
}

export const alertsController = {
  ackAlert,
};
