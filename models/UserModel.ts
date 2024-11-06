import { ObjectId } from "mongodb";

type Role = "teacher" | "student" | "admin" | "sensor";

interface User {
  _id?: ObjectId;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phone?: string;
  role: Role[];
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
  lastLoggedInAt?: Date;
}

type UserWithoutId = Omit<User, "_id">;
