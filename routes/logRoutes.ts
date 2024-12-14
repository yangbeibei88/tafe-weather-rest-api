// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import {
  validatePathParams,
  validateQueryParams,
} from "../middlewares/validation.ts";
import {
  deleteLogByIdAction,
  listLogsAction,
  showLogAction,
} from "../controllers/logController.ts";
import { authorisedTo, protect } from "../controllers/authController.ts";
import { deleteLogsAction } from "../controllers/logController.ts";

export const logRouter = Router();

logRouter.use(protect, authorisedTo("admin", "teacher"));

logRouter.get(
  "/",
  validateQueryParams(["page", "limit", "deletedAt"]),
  listLogsAction
);

logRouter.delete(
  "/batch",
  validateQueryParams(["deletedAt"]),
  deleteLogsAction
);

logRouter.get("/:id", validatePathParams(), showLogAction);

logRouter.delete("/:id", validatePathParams(), deleteLogByIdAction);
