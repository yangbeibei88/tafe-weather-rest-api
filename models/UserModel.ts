import { Filter, FindOptions, ObjectId, OptionalId } from "mongodb";
import { usersColl } from "../config/db.ts";
import { User } from "./UserSchema.ts";
import { QueryBuilder } from "../services/QueryBuilder.ts";
import { ProjectionBuilder } from "../services/ProjectionBuilder.ts";

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

export const findUserById = async (
  id: string,
  hideFields?: (keyof User)[],
  showFields?: (keyof User)[]
) => {
  try {
    const options: FindOptions = {};

    const projectionBuilder = new ProjectionBuilder<User>();
    const projection = projectionBuilder
      .hide(hideFields)
      .show(showFields)
      .build();

    if (Object.keys(projection).length > 0) {
      options.projection = projection;
    }

    const result = await usersColl.findOne<User>(
      { _id: new ObjectId(id) },
      options
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

export const updateAccountById = async (
  id: string,
  payload: Pick<User, "firstName" | "lastName" | "phone" | "updatedAt">
) => {
  try {
    const result = await usersColl.updateOne(
      { _id: new ObjectId(id) },
      { $set: payload }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const updateUsersRole = async (
  filter: Filter<OptionalId<User>>,
  payload: Pick<OptionalId<User>, "role" | "updatedAt">
) => {
  try {
    const filterBuilder = new QueryBuilder(filter);
    const filterParam = filterBuilder.filterBuild();
    const result = await usersColl.updateMany(filterParam, { $set: payload });
    return result;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Only used in `protect` middleware
 *
 * @param id - user id passed in ObjectId
 * @returns
 */
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

export const updateUserPassword = async (
  id: string,
  payload: Pick<User, "password" | "passwordChangedAt" | "updatedAt">
) => {
  try {
    const result = await usersColl.updateOne(
      { _id: ObjectId(id) },
      { $set: payload }
    );
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUserById = async (id: string) => {
  try {
    const result = await usersColl.deleteOne({ _id: new ObjectId(id) });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const deleteUsers = async (filter: Filter<OptionalId<User>>) => {
  try {
    const filterBuilder = new QueryBuilder(filter);
    const filterParam = filterBuilder.filterBuild();
    const result = await usersColl.deleteMany(filterParam);
    return result;
  } catch (error) {
    console.log(error);
  }
};
