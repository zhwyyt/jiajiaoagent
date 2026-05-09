import { createContainer } from "./bootstrap/container.js";
import { env } from "./config/env.js";
import { createApp } from "./server/app.js";

const container = await createContainer();
const app = createApp(container);

app.listen(env.port, () => {
  console.log(`backend listening on http://localhost:${env.port}`);
});
