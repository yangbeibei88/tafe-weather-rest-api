import { ObjectId } from "mongodb";

interface User {
  _id: ObjectId;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone?: string;
  role: "teacher" | "student" | "admin";
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
  lastLoggedInAt?: Date;
}

type UserWithoutId = Omit<User, "_id">;
