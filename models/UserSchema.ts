import { ObjectId } from "mongodb";
import { MongoJSONSchema } from "../utils/utilTypes.ts";
import { RequiredKeys } from "../utils/helpers.ts";

export const roles = ["teacher", "student", "admin", "sensor", "test"] as const;

export const userStatus = ["active", "inactive"] as const;

export type Role = (typeof roles)[number];

export type UserStatus = (typeof userStatus)[number];

export interface User {
  _id: ObjectId;
  emailAddress: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role[];
  status: UserStatus;
  createdAt?: Date;
  updatedAt?: Date;
  passwordChangedAt?: Date;
  lastLoggedInAt?: Date;
}

type UserWithoutId = Omit<User, "_id">;
export type UserWithoutIdkeys = keyof UserWithoutId;
export type RequiredUser = Pick<UserWithoutId, RequiredKeys<UserWithoutId>>;
export type UserInput = Omit<User, "_id"> & {
  confirmPassword?: string;
};

export type UpdatePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

export const userSchema: MongoJSONSchema = {
  bsonType: "object",
  title: "user object validation",
  required: [
    "_id",
    "emailAddress",
    "password",
    "firstName",
    "lastName",
    "phone",
    "role",
    "status",
  ],
  properties: {
    _id: {
      bsonType: "objectId",
    },
    emailAddress: {
      bsonType: "string",
      minLength: 5,
      maxLength: 200,
      pattern: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
      description: "Must be a string and required, 5-200 characters",
    },
    password: {
      bsonType: "string",
      maxLength: 255,
      description: "Must be a string and required, max 255 characters",
    },
    firstName: {
      bsonType: "string",
      minLength: 2,
      maxLength: 50,
      description: "Must be a string and required, 2-50 characters",
    },
    lastName: {
      bsonType: "string",
      minLength: 2,
      maxLength: 50,
      description: "Must be a string and required, 2-50 characters",
    },
    phone: {
      bsonType: "string",
      pattern: "^0[2-478]\\d{8}$",
      description:
        "Phone number must be 10 digits without spaces and special charachters",
    },
    role: {
      bsonType: "array",
      minItems: 1,
      uniqueItems: true,
      items: {
        type: "string",
        enum: ["teacher", "student", "admin", "sensor"],
        description:
          'Each role must be one of "teacher", "student", "admin", or "sensor".',
      },
      additionalItems: false,
      description:
        'Exaustive combination of array of user roles ["teacher", "student", "admin", "sensor"]',
    },
    status: {
      bsonType: "string",
      enum: ["active", "inactive"],
      description: 'Status must be either "active" or "inactive".',
    },
    createdAt: {
      bsonType: ["date", "null"],
      description: "Date when the user was created.",
    },
    updatedAt: {
      bsonType: ["date", "null"],
      description: "Date when the user was last updated.",
    },
    passwordChangedAt: {
      bsonType: ["date", "null"],
      description: "Date when the user's password was last updated.",
    },
    lastLoggedInAt: {
      bsonType: ["date", "null"],
      description: "Date when the user last logged in.",
    },
  },
  additionalProperties: false,
};

// export const createUsersCollection = async (database: Db) => {
//   try {
//     await database.createCollection("users", {
//       validator: {
//         $jsonSchema: userSchema,
//       },
//       validationLevel: "strict",
//       validationAction: "error",
//     });
//     console.log("Users collection created successfully.");
//   } catch (error) {
//     if (
//       error instanceof MongoServerError &&
//       error.codeName === "NamespaceExists"
//     ) {
//       console.log("Collection already exists");
//       return;
//     } else {
//       console.error("Error creating users collection: ", error);
//     }
//   }
// };

// const userColl = database.collection<User>("users");

// sample user:
// {
//   "firstName": "test3",
//   "lastName": "test",
//   "emailAddress": "test3@test.io",
//   "phone": "0400123120",
//   "role": "student",
//   "status": "active",
//   "password": "********",
//   "confirmPassword": "********"
// }
