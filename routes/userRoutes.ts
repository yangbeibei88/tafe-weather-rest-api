// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createUserAction,
  deleteUserAction,
  listUsersAction,
  showUserAction,
  updateUserAction,
  validateNewUserInput,
  validateUpdateUserInput,
} from "../controllers/userController.ts";
import { validateParams, validateQuery } from "../middlewares/validation.ts";
import { protect, authorisedTo } from "../controllers/authController.ts";

export const userRouter = Router();

// protect all user routes
userRouter.use(protect, authorisedTo("admin", "teacher"));

// Get all users
userRouter.get("/", listUsersAction);

// Create one new user
userRouter.post("/", validateNewUserInput(), createUserAction);

// Get one user
userRouter.get("/:id", validateParams(), showUserAction);

// Create many users

// Update one user
userRouter.put(
  "/:id",
  validateParams(),
  validateUpdateUserInput(),
  updateUserAction
);

// Update many users

// Delete one user
userRouter.delete("/:id", validateParams(), deleteUserAction);

// Delete many users
userRouter.delete("/batch", validateQuery(), deleteUserAction);
