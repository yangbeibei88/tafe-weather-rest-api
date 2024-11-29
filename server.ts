import { app } from "./main.ts";
import { mongoClient } from "./config/db.ts";

const PORT = Number(Deno.env.get("PORT")) || 3000;

console.log(PORT);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`OpenAPI doc available at http://localhost:${PORT}/api-docs`);
});

// Gracefully close MongoDB collection on SIGINT
Deno.addSignalListener("SIGINT", async () => {
  console.log("Closing MongoDB connection...");
  await mongoClient.close();
  Deno.exit(0);
});
