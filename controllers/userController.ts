// @deno-types="npm:@types/express-serve-static-core@4.19.5"
import {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express-serve-static-core";
import { OptionalId } from "mongodb";
import { ContextRunner } from "express-validator";
// @deno-types="@types/bcryptjs"
import bcrypt from "bcryptjs";
import { asyncHandlerT } from "../middlewares/asyncHandler.ts";
import {
  Role,
  User,
  UserInput,
  roles,
  userStatus,
} from "../models/UserSchema.ts";
import {
  compareStrings,
  validateBodyFactory,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateSelect,
  validateText,
  validateDate,
} from "../middlewares/validation.ts";
import { ClientError } from "../errors/ClientError.ts";
import {
  deleteUserById,
  findUserByEmail,
  getAllUsers,
  findUserById,
  insertUser,
  deleteUsers,
  updateUsersRole,
} from "../models/UserModel.ts";
import { signToken } from "../middlewares/jwtHandler.ts";
import { JwtPayloadT } from "../utils/utilTypes.ts";
import { objectOmit } from "../utils/helpers.ts";

// Define the validation rules for user-related fields
export const userValidations: Record<keyof UserInput, ContextRunner> = {
  _id: validateText("_id", 2, 50, false),
  firstName: validateText("firstName", 2, 50),
  lastName: validateText("lastName", 2, 50),
  emailAddress: validateEmail("emailAddress"),
  phone: validatePhoneNumber("phone"),
  role: validateSelect("role", roles, "array"),
  status: validateSelect("status", userStatus, "string"),
  password: validatePassword("password", 8, 50),
  confirmPassword: compareStrings("passwords", "password", "confirmPassword"),
  createdAt: validateDate("createdAt", false),
  updatedAt: validateDate("updatedAt", false),
  passwordChangedAt: validateDate("passwordChangedAt", false),
  lastLoggedInAt: validateDate("lastLoggedInAt", false),
};

export const validateNewUserInput = () =>
  validateBodyFactory<UserInput>(userValidations)([
    "firstName",
    "lastName",
    "emailAddress",
    "phone",
    "role",
    "status",
    "password",
    "confirmPassword",
  ]);

export const validateUpdateUserInput = () =>
  validateBodyFactory<UserInput>(userValidations)([
    "firstName",
    "lastName",
    "emailAddress",
    "phone",
    "role",
    "status",
  ]);

export const validateBatchUpdateUsersRoleInput = () =>
  validateBodyFactory<UserInput>(userValidations)(["role"]);

const getValidatedUserInput = (validInputData: UserInput | UserInput[]) => {
  if (Array.isArray(validInputData)) {
    return validInputData.map((obj: UserInput) => {
      return objectOmit(obj, ["password", "confirmPassword"]);
    });
  } else {
    return objectOmit(validInputData, ["password", "confirmPassword"]);
  }
};

export const listUsersAction = asyncHandlerT(
  async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const users = await getAllUsers();

    console.log(req.query);

    res.status(200).json({
      result: users,
    });
  }
);

export const showUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = await findUserById(req.params.id, ["password"]);

    if (!user) {
      return next(new ClientError({ code: 404 }));
    }

    res.status(200).json({
      result: user,
    });
  }
);

export const createUserAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // check if the new user's email already exists
    const user = await findUserByEmail(req.body.emailAddress);

    if (user?.length) {
      return next(
        new ClientError({ code: 400, message: "The user already exists." })
      );
    }

    const currentUserRole = req.user.role;

    if (
      currentUserRole.includes("teacher") &&
      !currentUserRole.includes("admin")
    ) {
      if (
        req.body.role.some((item: string) =>
          ["admin", "teacher"].includes(item)
        )
      ) {
        return next(
          new ClientError({
            code: 403,
            message: "You are not authorised to perform this action.",
          })
        );
      }
    }

    // hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const payload: OptionalId<User> = {
      ...getValidatedUserInput(req.body),
      password: hashedPassword,
      createdAt: new Date(),
      // As removing student 30 days TTL index is based on lastLoggedIn date, this field cannot be undefined, set lastLoggedInAt initial value to now
      lastLoggedInAt: new Date(),
    } as OptionalId<User>;

    console.log(payload);

    const newUser = await insertUser(payload);

    if (!newUser._id) {
      return next(new ClientError({ code: 400 }));
    }
    console.log(typeof newUser._id); // object

    // To compare if each field in decoded payload is deeply equal to stringified fields in the database, so when signing the token, stringify each field.
    const token = signToken<
      JwtPayloadT<Pick<User, "_id" | "emailAddress" | "role" | "status">>
    >({
      _id: newUser._id.toString(),
      emailAddress: newUser.emailAddress,
      role: newUser.role.toString(),
      status: newUser.status,
    });

    res.status(201).json({
      token,
      result: newUser,
    });
  }
);

export const validateBatchUsersRoleQueryParams = (): RequestHandler => {
  return ((req: Request, _res: Response, next: NextFunction) => {
    const role: Role = req.params.role;
    const createdAt: string | Record<string, string> | undefined =
      req.query.createdAt;
    const lastLoggedInAt: string | Record<string, string> | undefined =
      req.query.lastLoggedInAt;

    if (!roles.includes(role)) {
      return next(
        new ClientError({ code: 404, message: "This role is not found." })
      );
    }

    // Prevent update all documents if no filter provided
    // Both role and createdAt are needed, throw error if:
    // 1) either role or createdAt or both are missing in query params
    // 2) role's length is 0
    // 3) when createdAt is a equal string, but isNaN when parse date
    // 4) when createdAt is a range object, but not all values parsed into date are number
    if (
      (!createdAt && !lastLoggedInAt) ||
      (createdAt &&
        typeof createdAt === "string" &&
        isNaN(Date.parse(createdAt))) ||
      (createdAt &&
        typeof createdAt === "object" &&
        Object.values(createdAt).some(
          (v) => typeof v === "string" && isNaN(Date.parse(v))
        )) ||
      (lastLoggedInAt &&
        typeof lastLoggedInAt === "string" &&
        isNaN(Date.parse(lastLoggedInAt))) ||
      (lastLoggedInAt &&
        typeof lastLoggedInAt === "object" &&
        Object.values(lastLoggedInAt).some(
          (v) => typeof v === "string" && isNaN(Date.parse(v))
        ))
    ) {
      return next(
        new ClientError({
          code: 400,
          message: "Invalid date",
        })
      );
    }

    const currentUserRole = req.user.role;

    if (
      currentUserRole.includes("teacher") &&
      !currentUserRole.includes("admin")
    ) {
      // if the current user is a teacher but not admin, he cannot update users with admin/teacher role; he cannot update users to admin/teacher role (he can only update users to student/sensor)
      if (["admin", "teacher"].includes(role)) {
        return next(
          new ClientError({
            code: 403,
            message: "You are not authorised to perform this action.",
          })
        );
      }
    } else if (currentUserRole.includes("admin")) {
      // If the current user is an admin, then he cannot update an admin user
      if (role === "admin") {
        return next(
          new ClientError({
            code: 403,
            message: "You are not authorised to perform this action.",
          })
        );
      }
    }

    next();
  }) as RequestHandler;
};

export const updateUsersRoleAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.user.role.includes("teacher") && !req.user.role.includes("admin")) {
      if (
        req.body.role.some((item: string) =>
          ["teacher", "admin"].includes(item)
        )
      ) {
        return next(
          new ClientError({
            code: 403,
            message: "You are not authorised to perform this action.",
          })
        );
      }
    }

    const payload: Pick<User, "role" | "updatedAt"> = {
      // role has been validated in last middleware, safe to add to payload
      role: req.body.role,
      updatedAt: new Date(),
    };

    const result = await updateUsersRole(
      {
        role: req.query.role,
        createdAt: req.query.createdAt,
        lastLoggedInAt: req.query.lastLoggedInAt,
      },
      payload
    );

    res.status(200).json({
      result: {
        matchedCount: result?.matchedCount,
        modifiedCount: result?.modifiedCount,
      },
    });
  }
);

export const deleteUserByIdAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const currentUserRole = req.user.role;

    const deletingUser = await findUserById(req.params.id);

    // if the current user is a teacher but not admin,
    // then he cannot delete a teacher/admin users
    if (
      currentUserRole.includes("teacher") &&
      !currentUserRole.includes("admin")
    ) {
      if (
        deletingUser?.role.some((item) => ["teacher", "admin"].includes(item))
      ) {
        return next(
          new ClientError({
            code: 403,
            message: "You are not authorised to perform this action.",
          })
        );
      }
    } else if (currentUserRole.includes("admin")) {
      // if the current user is an admin, he cannot delete admin users
      if (deletingUser?.role.includes("admin")) {
        return next(
          new ClientError({
            code: 403,
            message: "You are not authorised to perform this action.",
          })
        );
      }
    }
    const result = await deleteUserById(req.params.id);

    if (!result?.deletedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "The user not found.",
        })
      );
    }

    res.status(204).json({
      result: {
        deletedCount: result.deletedCount,
      },
    });
  }
);

export const deleteUsersByRoleAction = asyncHandlerT(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const result = await deleteUsers({
      role: req.query.role,
      lastLoggedInAt: req.query.lastLoggedInAt,
      createdAt: req.query.createdAt,
    });

    if (!result?.deletedCount) {
      return next(
        new ClientError({
          code: 404,
          message: "Users not found in this date range.",
        })
      );
    }

    res.status(204).json({
      result: {
        deletedCount: result.deletedCount,
      },
    });
  }
);
