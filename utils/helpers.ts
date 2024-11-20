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

export function objectPick(obj: object, keys: string[]) {
  return Object.entries(obj).filter(([key]) => keys.includes(key));
}

export function objectOmit(obj: object, keys: string[]) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
}
