// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createUserAction,
  deleteUserAction,
  deleteUsersAction,
  listUsersAction,
  showUserAction,
  updateUsersRoleAction,
  validateBatchUpdateUsersRoleInput,
  validateNewUserInput,
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

// Delete one user
userRouter.delete("/:id", validatePathParams(), deleteUserAction);

// Delete many users
userRouter.delete(
  "/batch",
  validateQueryParams(["role", "lastLoggedInAt"]),
  deleteUsersAction
);

// Update many users role
userRouter.patch(
  "/roles/:role",
  validatePathParams(),
  validateQueryParams(["createdAt"]),
  validateBatchUpdateUsersRoleInput(),
  updateUsersRoleAction
);
