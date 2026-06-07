import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`MechPro Node API running on http://localhost:${env.port}`);
});
