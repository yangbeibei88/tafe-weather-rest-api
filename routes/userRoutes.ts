// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createUserAction,
  deleteUserAction,
  listUsersAction,
  showUserAction,
  updateUserAction,
  validateUserInput,
} from "../controllers/userController.ts";
import { validateParams } from "../middlewares/validation.ts";

export const userRouter = Router();

// Get all users
userRouter.get("/", listUsersAction);

// Get one user
userRouter.get("/:id", validateParams(), showUserAction);

// Create one new user
userRouter.post("/", validateUserInput(), createUserAction);

// Create many users

// Update one user
userRouter.put("/:id", validateParams(), validateUserInput(), updateUserAction);

// Update many users

// Delete one user
userRouter.delete("/:id", validateParams(), deleteUserAction);

// Delete many users
