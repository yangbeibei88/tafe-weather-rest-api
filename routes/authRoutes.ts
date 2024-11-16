// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  greetingAction,
  validateLoginInputs,
  authLoginAction,
} from "../controllers/authController.ts";

export const authRouter = Router();

authRouter.get("/", greetingAction);
authRouter.get("/login", greetingAction);
authRouter.post("/login", validateLoginInputs(), authLoginAction);
