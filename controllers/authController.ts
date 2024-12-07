// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { ContextRunner } from "express-validator";
// @deno-types="@types/bcryptjs"
import bcrypt from "bcryptjs";
// @deno-types="@types/jsonwebtoken"
import jwt from "jsonwebtoken";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import { Role, User } from "../models/UserSchema.ts";
import {
  validateBodyFactory,
  validateEmail,
  validatePassword,
} from "../middlewares/validation.ts";
import {
  findUserByEmail,
  findUserById,
  updateUserLastLoggedInAt,
} from "../models/UserModel.ts";
import { ClientError } from "../errors/ClientError.ts";
import { decodeJwt, signToken } from "../middlewares/jwtHandler.ts";
import { JwtPayloadT } from "../utils/utilTypes.ts";
import { isSubset } from "../utils/helpers.ts";

const loginValidations: Record<
  keyof Pick<User, "emailAddress" | "password">,
  ContextRunner
> = {
  emailAddress: validateEmail("emailAddress"),
  password: validatePassword("password", 8, 50),
};

export const validateLoginInput = () =>
  validateBodyFactory<Pick<User, "emailAddress" | "password">>(
    loginValidations
  )(["emailAddress", "password"]);

// greetings
export const greetingAction = (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to TAFE Weather REST API v1! Please login to continue.",
  });
};

// authenticate login
export const authLoginAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // 1) CHECK if username is in `users` collection and status is active
    const user = await findUserByEmail(req.body.emailAddress);
    if (!user?.length || !(user?.[0].status === "active")) {
      return next(
        new ClientError({ code: 401, message: "Incorrect Credentials" })
      );
    }

    // 2) CHECK if password is correct
    const userPassword = user[0].password;
    const verifyPasswordPromise = await bcrypt.compare(
      req.body.password,
      userPassword
    );

    console.log(verifyPasswordPromise);

    if (!verifyPasswordPromise) {
      return next(
        new ClientError({ code: 401, message: "Incorrect Credentials" })
      );
    }

    // IF LOGIN CREDENTIALS CORRECT, SEND TOKEN TO THE CLIENT
    const token = signToken<
      JwtPayloadT<Pick<User, "_id" | "emailAddress" | "role" | "status">>
    >({
      _id: user[0]._id.toString(),
      emailAddress: user[0].emailAddress,
      role: user[0].role.toString(),
      status: user[0].status,
    });

    res.status(200).json({
      token,
    });
  }
);

const logoutAction = (_req: Request, res: Response, _next: NextFunction) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ message: "Loggedout successfully." });
};

export const protect = asyncHandlerT(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // 1) check if token exists
    if (req.headers?.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2) verify token
    if (!token || token === "") {
      return next(
        new ClientError({ code: 401, message: "Please login to get access." })
      );
    }

    const decoded = await decodeJwt(
      token,
      Deno.env.get("JWT_SECRET") as jwt.Secret
    );

    console.log(decoded);

    // 3) check if user still exists
    const currentUser = await findUserById(decoded._id);
    if (!currentUser || currentUser.status === "inactive") {
      return next(
        new ClientError({ code: 401, message: "The user no longer exists." })
      );
    }

    // 3) TODO: check if user's email, status, role are changed after issued (change stream)
    // 4) TODO: check if user changed password after the token was issued

    req.user = currentUser;

    // update last loggedIn date when an authenticated user access to protect routes
    await updateUserLastLoggedInAt(decoded._id);

    next();
  }
);

// Restrict permission
export const authorisedTo = (...roles: Role[]) =>
  ((req: Request, _res: Response, next: NextFunction) => {
    if (!isSubset(roles, req.user.role)) {
      return next(
        new ClientError({
          code: 403,
          message: "Sorry, you are not authorised for this resouce",
        })
      );
    }
    next();
  }) as RequestHandler;
