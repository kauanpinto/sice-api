import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

server.on("error", (err) => {
  console.error("Failed to start server: ", err);
  process.exit(1);
});
