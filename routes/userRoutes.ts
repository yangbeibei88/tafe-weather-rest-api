// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createUserAction,
  deleteUserAction,
  deleteUsersAction,
  listUsersAction,
  showUserAction,
  updateUserAction,
  updateUsersRoleAction,
  validateNewUserInput,
  validateUpdateUserInput,
} from "../controllers/userController.ts";
import {
  validatePathParams,
  validateQueryParams,
} from "../middlewares/validation.ts";
import { protect, authorisedTo } from "../controllers/authController.ts";

export const userRouter = Router();

// protect all user routes
userRouter.use(protect, authorisedTo("admin", "teacher"));

// Get all users
userRouter.get("/", listUsersAction);

// Create one new user
userRouter.post("/", validateNewUserInput(), createUserAction);

// Get one user
userRouter.get("/:id", validatePathParams(), showUserAction);

// Create many users

// Update one user
userRouter.put(
  "/:id",
  validatePathParams(),
  validateUpdateUserInput(),
  updateUserAction
);

// Update many users role
userRouter.patch("/batch", validateQueryParams(), updateUsersRoleAction);

// Delete one user
userRouter.delete("/:id", validatePathParams(), deleteUserAction);

// Delete many users
userRouter.delete("/batch", validateQueryParams(), deleteUsersAction);
