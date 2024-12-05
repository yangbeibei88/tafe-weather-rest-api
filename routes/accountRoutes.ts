// @deno-types="npm:@types/express@4.17.21"
import { Router } from "express";
import { authorisedTo, protect } from "../controllers/authController.ts";
import {
  validateUpdatePasswordInput,
  validateUpdateAccountInput,
  updatePasswordAction,
  showAccountAction,
  updateAccountAction,
} from "../controllers/accountController.ts";

export const accountRouter = Router();

accountRouter.use(
  protect,
  authorisedTo("admin", "teacher", "student", "sensor")
);

accountRouter.get("/", showAccountAction);

accountRouter.put("/", validateUpdateAccountInput(), updateAccountAction);

accountRouter.patch(
  "/updatePassword",
  validateUpdatePasswordInput(),
  updatePasswordAction
);
