import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { deviceService } from "./services/device.service.js";
import { startStatusJob } from "./jobs/status.job.js";

const app = createApp();

try {
  await deviceService.ensureDeviceReady();
} catch (err) {
  console.error("Failed to start server: ", err);
  process.exit(1);
}

startStatusJob();

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

server.on("error", (err) => {
  console.error("Failed to start server: ", err);
  process.exit(1);
});
