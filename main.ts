import express, { Express, Request, Response, NextFunction } from "express";

const app: Express = express();
const PORT = Number(Deno.env.get("PORT")) || 3000;

const reqLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.info(`${req.method} request to ${req.url} by ${req.hostname}`);
  next();
};

app.use(reqLogger);

app.get("/api/v1", (_req: Request, res: Response) => {
  res.status(200).json({ msg: "Welcome to TAFE Weather REST API v1" });
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});

// export function add(a: number, b: number): number {
//   return a + b;
// }

// // Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
// if (import.meta.main) {
//   console.log("Add 2 + 3 =", add(2, 3));
// }
