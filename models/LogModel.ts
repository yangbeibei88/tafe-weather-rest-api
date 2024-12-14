// deno-lint-ignore-file no-explicit-any
import { ObjectId } from "mongodb";
import { logsColl } from "../config/db.ts";
import { QueryBuilder } from "../services/QueryBuilder.ts";
import { Log } from "./LogSchema.ts";
import { getPaginatedData } from "../services/modelFactory.ts";

// const logsColl = database.collection<Log>("logs");

export const getAllLogs = async (
  query: Record<string, any>,
  limit: number = 10,
  page: number = 1,
  sort: Record<string, any> = { deletedAt: -1 }
) => {
  try {
    const result = await getPaginatedData(logsColl, query, limit, page, sort);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getLog = async (id: string) => {
  try {
    const result = await logsColl.findOne<Log>({
      _id: new ObjectId(id),
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const deleteLog = async (id: string) => {
  try {
    const result = await logsColl.deleteOne({
      _id: new ObjectId(id),
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const deleteLogs = async (filter: {
  deletedAt?: string | Record<string, string>;
}) => {
  try {
    const filterBuilder = new QueryBuilder(filter);
    const filterParam = filterBuilder.filterBuild();
    const result = await logsColl.deleteMany(filterParam);
    return result;
  } catch (error) {
    console.log(error);
  }
};
