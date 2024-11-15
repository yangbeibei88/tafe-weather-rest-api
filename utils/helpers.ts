function unionToArray<T extends string>(...args: T[]): T[] {
  return args;
}

export type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];
