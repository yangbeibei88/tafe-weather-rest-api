// deno-lint-ignore-file no-explicit-any
import { Weather } from "../models/WeatherSchema.ts";

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

const weatherAggregationPipeline = (
  operation: AggOperation,
  prop: WeatherProp,
  startDate?: Date,
  endDate?: Date,
  recentMonths?: number,
  groupBy?: string | null
) => {};
