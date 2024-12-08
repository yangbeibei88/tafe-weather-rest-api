// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  createUserAction,
  deleteUserByIdAction,
  deleteUsersByRoleAction,
  listUsersAction,
  showUserAction,
  updateUsersRoleAction,
  validateBatchUpdateUsersRoleInput,
  validateBatchUsersRoleQueryParams,
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
userRouter.get("/", validateQueryParams(["page", "limit"]), listUsersAction);

// Create one new user
userRouter.post("/", validateNewUserInput(), createUserAction);

// Get one user
userRouter.get("/:id", validatePathParams(), showUserAction);

// Delete one user
userRouter.delete("/:id", validatePathParams(), deleteUserByIdAction);

// Update many users role
userRouter.patch(
  "/roles/:role",
  validatePathParams(),
  validateQueryParams(["createdAt", "lastLoggedInAt"]),
  validateBatchUsersRoleQueryParams(),
  validateBatchUpdateUsersRoleInput(),
  updateUsersRoleAction
);

// Delete many users
userRouter.delete(
  "/roles/:role",
  validatePathParams(),
  validateQueryParams(["lastLoggedInAt", "createdAt"]),
  validateBatchUsersRoleQueryParams(),
  deleteUsersByRoleAction
);
