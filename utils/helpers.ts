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
