// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  greetingAction,
  validateLoginInput,
  authLoginAction,
} from "../controllers/authController.ts";

export const authRouter = Router();

authRouter.get("/", greetingAction);
authRouter.post("/login", validateLoginInput(), authLoginAction);
