import { ObjectId } from "mongodb";

/**
 * https://www.mongodb.com/docs/manual/reference/operator/query/type/#std-label-document-type-available-types
 */
type MongoBSONAlias =
  | "double"
  | "string"
  | "int"
  | "array"
  | "object"
  | "binData"
  | "objectId"
  | "bool"
  | "date"
  | "timestamp"
  | "null"
  | "regex"
  | "javascript"
  | "long"
  | "decimal"
  | "minKey"
  | "maxKey";

/**
 * https://www.mongodb.com/docs/manual/reference/operator/query/jsonSchema/#mongodb-query-op.-jsonSchema
 */
type StandardType =
  | "string"
  | "number"
  | "boolean"
  | "array"
  | "object"
  | "null";

/**
 * https://www.mongodb.com/docs/manual/geospatial-queries/
 */
type Coordinate = [longitude: number, latitude: number];

export type GeoJSONGeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon";

export type CoordinatesType<T extends GeoJSONGeometryType> = T extends "Point"
  ? Coordinate
  : T extends "LineString"
  ? Coordinate[]
  : T extends "Polygon"
  ? Coordinate[][]
  : T extends "MultiPoint"
  ? Coordinate[]
  : T extends "MultiLineString"
  ? Coordinate[][]
  : T extends "MultiPolygon"
  ? Coordinate[][][]
  : never;

export interface GeoLocation<T extends GeoJSONGeometryType> {
  type: T;
  coordinates: CoordinatesType<T>;
}

/**
 * MongoDB JSON Schema, from MongoDB's $jsonSchema documenation, the schema is a subset of JSON Schema (draft4 standard)
 * https://www.mongodb.com/docs/manual/reference/operator/query/jsonSchema/#mongodb-query-op.-jsonSchema
 *
 */
export interface MongoJSONSchema {
  additionalItems?: boolean | MongoJSONSchema;
  additionalProperties?: boolean | MongoJSONSchema;
  allOf?: MongoJSONSchema[];
  anyOf?: MongoJSONSchema[];
  bsonType?: MongoBSONAlias | MongoBSONAlias[];
  dependencies?: { [key: string]: MongoJSONSchema | string[] };
  description?: string;
  // deno-lint-ignore no-explicit-any
  enum?: any[];
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  items?: MongoJSONSchema | MongoJSONSchema[];
  maximum?: number;
  maxItems?: number;
  maxLength?: number;
  maxProperties?: number;
  minimum?: number;
  minItems?: number;
  minLength?: number;
  minProperties?: number;
  multipleOf?: number;
  not?: MongoJSONSchema;
  oneOf?: MongoJSONSchema[];
  pattern?: string;
  patternProperties?: { [key: string]: MongoJSONSchema };
  properties?: {
    [key: string]: MongoJSONSchema;
  };
  required?: string[];
  title?: string;
  type?: StandardType | StandardType[];
  uniqueItems?: boolean;
}

/**
 * https://www.mongodb.com/docs/manual/reference/database-references/#dbrefs
 */
export interface MongoDBRef {
  $ref: string;
  $id: ObjectId;
  $db?: string;
}

export const HTTPSuccessStatus = {
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  IMUsed: 226,
} as const;

export type HTTPSuccessStatusCode =
  (typeof HTTPSuccessStatus)[keyof typeof HTTPSuccessStatus];

export const HTTPRedirectStatus = {
  MultipleChoices: { code: 300, title: "Multiple Choices" },
  MovedPermanently: { code: 301, title: "MovedPermanently" },
  Found: { code: 302, title: "Found" },
  SeeOthers: { code: 303, title: "See Others" },
  NotModified: { code: 304, title: "Not Modified" },
  UseProxy: { code: 305, title: "Use Proxy" },
  Unused: { code: 306, title: "Unused" },
} as const;

export type HTTPRedirectStatusCode =
  (typeof HTTPRedirectStatus)[keyof typeof HTTPRedirectStatus]["code"];

export const HTTPClientErrorStatus = {
  BadRequest: { code: 400, title: "Bad Request" },
  Unauthorized: { code: 401, title: "Unauthorized" },
  PaymentRequired: { code: 402, title: "Payment Required" },
  Forbidden: { code: 403, title: "Forbidden" },
  NotFound: { code: 404, title: "Not Found" },
  MethodNotAllowed: { code: 405, title: "Method Not Allowed" },
  NotAcceptable: { code: 406, title: "Not Acceptable" },
  ProxyAuthenticationRequired: {
    code: 407,
    title: "Proxy Authentication Required",
  },
  RequestTimeout: {
    code: 408,
    title: "Request Timeout",
  },
  Conflict: {
    code: 409,
    title: "Conflict",
  },
  Gone: { code: 410, title: "Gone" },
  LengthRequired: { code: 411, title: "Length Required" },
  PreconditionFailed: { code: 412, title: "Precondition Failed" },
  ContentTooLarge: { code: 413, title: "Content Too Large" },
  URITooLong: { code: 414, title: "URI Too Long" },
  UnsupportedMediaType: { code: 415, title: "Unsupported Media Type" },
  RangeNotSatisfiable: { code: 416, title: "Range Not Satisfiable" },
  ExpectationFailed: { code: 417, title: "Expectation Failed" },
  IMATeapot: { code: 418, title: "I'm a teapot" },
  MisdirectedRequest: { code: 421, title: "Misdirected Request" },
  UnprocessableEntity: { code: 422, title: "Unprocessable Entity" },
  Locked: { code: 423, title: "Locked" },
  FailedDependency: { code: 424, title: "Failed Dependency" },
  TooEarly: { code: 425, title: "Too Early" },
  UpgradeRequired: { code: 426, title: "Upgrade Required" },
  PreconditionRequired: { code: 427, title: "Precondition Required" },
  TooManyRequests: { code: 429, title: "Too Many Requests" },
  RequestHeaderFieldsTooLarge: {
    code: 431,
    title: "Request Header Fields Too Large",
  },
  UnavailableForLegalReasons: {
    code: 451,
    title: "Unavailable For Legal Reasons",
  },
} as const;

export type HTTPClientErrorStatusCode =
  (typeof HTTPClientErrorStatus)[keyof typeof HTTPClientErrorStatus]["code"];

export type HTTPClientErrorTitle<T> = Extract<
  (typeof HTTPClientErrorStatus)[keyof typeof HTTPClientErrorStatus],
  { code: T }
>["title"];

let clientErrorTitle: HTTPClientErrorTitle<400>;

export const HTTPServerErrorStatus = {
  InternalServerError: { code: 500, title: "Internal Server Error" },
  NotImplemented: { code: 501, title: "Not Implemented" },
  BadGateway: { code: 502, title: "Bad Gateway" },
  ServiceUnavailable: { code: 503, title: "Service Unavailable" },
  GatewayTiemout: { code: 504, title: "Gateway Tiemout" },
  HTTPVersionNotSupported: { code: 505, title: "HTTP Version Not Supported" },
  VariantAlsoNegotiates: { code: 506, title: "Variant Also Negotiates" },
  InsufficientStorage: { code: 507, title: "Insufficient Storage" },
  LoopDetected: { code: 508, title: "Loop Detected" },
  NotExtended: { code: 510, title: "Not Extended" },
  NetworkAuthenticationRequired: {
    code: 511,
    title: "Network Authentication Required",
  },
} as const;

export type HTTPServerErrorStatusCode =
  (typeof HTTPServerErrorStatus)[keyof typeof HTTPServerErrorStatus]["code"];

export type HTTPServerErrorTitle<T> = Extract<
  (typeof HTTPServerErrorStatus)[keyof typeof HTTPServerErrorStatus],
  { code: T }
>["title"];

let errorTitle: HTTPServerErrorTitle<500>;
