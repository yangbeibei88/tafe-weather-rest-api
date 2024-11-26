// deno-lint-ignore-file no-explicit-any
import { Weather } from "../models/WeatherSchema.ts";
import { AggregationBuilder } from "../utils/AggregationBuilder.ts";

type AggOperation = "min" | "max" | "avg" | "median";
type WeatherProp = keyof Pick<
  Weather,
  | "precipitation"
  | "temperature"
  | "atmosphericPressure"
  | "maxWindSpeed"
  | "solarRadiation"
  | "vaporPressure"
  | "humidity"
  | "windDirection"
>;

export const weatherAggregationPipeline = (
  operation: string,
  aggField: string,
  groupBy?: string | null,
  projection?: Record<string, any>,
  createdAt?: Date | object,
  recentMonths?: number,
  sort: Record<string, any> = {},
  customMatch: Record<string, any> = {},
  customGroup: Record<string, any> = {}
) => {
  const aggBuilder = new AggregationBuilder({
    operation,
    aggField,
    createdAt,
    recentMonths,
  });

  const matchParams: Record<string, any> = { ...customMatch };

  const pipeline = aggBuilder
    .match(matchParams)
    .project(projection)
    .group2(operation, aggField, groupBy, customGroup)
    .aggFilter({
      input: "$docs",
      as: "doc",
      cond: { $eq: [`$$doc.${aggField}`, `$${operation}${aggField}`] },
    })
    .unwind("$docs")
    .replaceRoot({ newRoot: "$docs" })
    .sort(sort)
    .build();

  return pipeline;
};
