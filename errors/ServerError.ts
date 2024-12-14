// deno-lint-ignore-file no-explicit-any
import { HTTPServerErrorStatus } from "../utils/utilTypes.ts";
import { HTTPServerErrorTitle } from "../utils/utilTypes.ts";
import { HTTPServerErrorStatusCode } from "../utils/utilTypes.ts";
import { BaseError } from "./BaseError.ts";

export class ServerError extends BaseError {
  private static readonly _statusCode = 500;
  private readonly _code: HTTPServerErrorStatusCode;
  private readonly _context: { [key: string]: any };
  private readonly _logging: boolean;
  constructor(params?: {
    code: HTTPServerErrorStatusCode;
    message?: string;
    logging?: boolean;
    context?: { [key: string]: any };
  }) {
    const { code, message, logging } = params || {};
    const statusEntry = Object.values(HTTPServerErrorStatus).find(
      (status) => status.code === code
    );

    const defaultMessage: HTTPServerErrorTitle<typeof code> =
      statusEntry?.title || "Internal Server Error";

    super(message || defaultMessage);
    this._code = code || ServerError._statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};

    Object.setPrototypeOf(this, ServerError.prototype);
  }

  get errors() {
    return [{ message: this.message, context: this._context }];
  }

  get statusCode() {
    return this._code;
  }
  get logging() {
    return this._logging;
  }
}
