// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { OptionalId } from "mongodb";
import { User } from "../models/UserSchema.ts";
import {
  validateBody,
  validateEmail,
  validateNumber,
  validatePassword,
  validatePhoneNumber,
  validateText,
} from "../middlewares/validation.ts";
import { ClientError } from "../errors/ClientError.ts";
import {
  findUserByEmail,
  getAllUsers,
  getUser,
  insertUser,
} from "../models/UserModel.ts";

export const listUsersAction = asyncHandlerT(
  async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await getAllUsers();

    res.status(200).json({
      success: true,
      data: users,
    });
  }
);

export const showUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await getUser(req.params.id);

    if (!user) {
      next(new ClientError({ code: 404 }));
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

export const validateUserInput = validateBody([
  validateText("firstName", 2, 50),
  validateText("lastName", 2, 50),
  validateEmail("emailAddress", true, findUserByEmail, true),
  validatePhoneNumber("phone"),
  validatePassword("password", 8, 50),
]);

export const createUserAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const inputData: OptionalId<User> = {
      emailAddress: req.body.emailAddress,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      role: req.body.role,
      status: req.body.status,
    };

    const newUser = await insertUser(inputData);

    res.status(201).json({
      success: true,
      data: newUser,
    });
  }
);

export const updateUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {}
);
