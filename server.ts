import { app } from "./main.ts";
import { connectDB } from "./config/db.ts";

const PORT = Number(Deno.env.get("PORT")) || 3000;

console.log(PORT);

connectDB();

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
