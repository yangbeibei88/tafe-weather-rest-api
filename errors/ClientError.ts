import { BaseError } from "./BaseError.ts";
import {
  HTTPClientErrorStatus,
  HTTPClientErrorStatusCode,
  HTTPClientErrorTitle,
} from "../utils/utilTypes.ts";

export class ClientError extends BaseError {
  private static readonly _statusCode = 400;
  private readonly _code: HTTPClientErrorStatusCode;

  private readonly _logging: boolean;
  // deno-lint-ignore no-explicit-any
  private readonly _context: { [key: string]: any };

  constructor(params?: {
    code: HTTPClientErrorStatusCode;
    message?: string;
    logging?: boolean;
    // deno-lint-ignore no-explicit-any
    context?: { [key: string]: any };
  }) {
    const { code, message, logging } = params || {};

    const statusEntry = Object.values(HTTPClientErrorStatus).find(
      (status) => status.code === code
    );

    const defaultMessage: HTTPClientErrorTitle<typeof code> =
      statusEntry?.title || "Bad Request";

    super(message || defaultMessage);
    this._code = code || ClientError._statusCode;
    this._logging = logging || false;
    this._context = params?.context || {};

    Object.setPrototypeOf(this, ClientError.prototype);
  }

  get errors() {
    return [
      {
        message: this.message,
        context: this._context,
      },
    ];
  }

  get statusCode() {
    return this._code;
  }

  get logging() {
    return this._logging;
  }
}
