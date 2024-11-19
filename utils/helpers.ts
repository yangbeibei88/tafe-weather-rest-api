import { Weather } from "../models/WeatherSchema.ts";

function unionToArray<T extends string>(...args: T[]): T[] {
  return args;
}

export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

export function isSubset(
  arr1: Array<string | number>,
  arr2: Array<string | number>
): boolean {
  return arr2.every((element) => arr1.includes(element));
}

export function getKeys<T extends object>() {
  return Object.keys({} as T) as Array<keyof T>;
}
const weatherKeys = getKeys<Weather>();
console.log(weatherKeys);
