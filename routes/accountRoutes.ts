// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import { authorisedTo, protect } from "../controllers/authController.ts";
import {
  validateUpdatePasswordInput,
  updatePasswordAction,
} from "../controllers/accountController.ts";

export const accountRouter = Router();

accountRouter.use(
  protect,
  authorisedTo("admin", "teacher", "student", "sensor")
);

accountRouter.patch(
  "/updatePassword",
  validateUpdatePasswordInput(),
  updatePasswordAction
);
