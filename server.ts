import { app, swaggerApp } from "./main.ts";
import { mongoClient } from "./config/db.ts";

const PORT = Number(Deno.env.get("PORT")) || 3085;
const SWAGGER_PORT = Number(Deno.env.get("SWAGGER_PORT")) || 3086;

console.log(PORT);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
swaggerApp.listen(SWAGGER_PORT, () => {
  console.log(
    `OpenAPI doc available at http://localhost:${SWAGGER_PORT}/api-docs`
  );
});

// Gracefully close MongoDB collection on SIGINT
Deno.addSignalListener("SIGINT", async () => {
  console.log("Closing MongoDB connection...");
  await mongoClient.close();
  Deno.exit(0);
});
