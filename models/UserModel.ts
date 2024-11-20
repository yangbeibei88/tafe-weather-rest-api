import { OptionalId } from "mongodb";
import { usersColl } from "../config/db.ts";
import { User } from "./UserSchema.ts";
import { ObjectId } from "mongodb";

// const usersColl = database.collection<OptionalId<User>>("users");
export const getAllUsers = async () => {
  try {
    const cursor = usersColl.find<User>(
      {},
      { projection: { password: 0 }, sort: { createdAt: -1 }, limit: 10 }
    );
    const results = await cursor.toArray();
    return results;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    const cursor = usersColl.find<User>({
      emailAddress: email,
    });
    const results = await cursor.toArray();
    return results;
  } catch (error) {
    console.log(error);
  }
};

export const findUserById = async (id: string) => {
  try {
    const result = await usersColl.findOne<User>(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const insertUser = async (
  user: OptionalId<User>
): Promise<Omit<User, "password">> => {
  try {
    const result = await usersColl.insertOne({
      ...user,
      createdAt: new Date(),
    });

    // if (!result.insertedId) {
    //   throw new Error("User insert failed.");
    // }

    // // const insertedId = result.insertedId;

    // console.log(typeof result.insertedId);
    // deno-lint-ignore no-unused-vars
    const { password, ...userWithoutPassword } = user;

    return { _id: result.insertedId, ...userWithoutPassword };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateUser = async (
  id: string,
  user: Omit<OptionalId<User>, "password">
) => {
  try {
    const result = await usersColl.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...user } }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const updateUserLastLoggedInAt = async (id: string) => {
  try {
    const result = await usersColl.updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLoggedInAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (id: string) => {
  try {
    const result = await usersColl.deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUsers = async () => {
  try {
    const result = await usersColl.deleteMany({});
  } catch (error) {
    console.log(error);
  }
};
