import { OptionalId } from "mongodb";
import { usersColl } from "../config/db.ts";
import { User } from "./UserSchema.ts";

// const usersColl = database.collection<OptionalId<User>>("users");

const insertUser = async (user: User) => {};
