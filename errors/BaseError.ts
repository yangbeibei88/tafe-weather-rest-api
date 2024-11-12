export type BaseErrorContent = {
  message: string;
  // deno-lint-ignore no-explicit-any
  context?: { [key: string]: any };
};

export abstract class BaseError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errors: BaseErrorContent[];
  abstract readonly logging: boolean;

  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, BaseError.prototype);
  }
}
