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
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOthers: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
} as const;

export type HTTPRedirectStatusCode =
  (typeof HTTPRedirectStatus)[keyof typeof HTTPRedirectStatus];

export const HTTPClientErrorStatus = {
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  ContentTooLarge: 413,
  URITooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  IMATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 427,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
} as const;

export type HTTPClientErrorStatusCode =
  (typeof HTTPClientErrorStatus)[keyof typeof HTTPClientErrorStatus];

export const HTTPServerErrorStatus = {
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTiemout: 504,
  HTTPVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
} as const;

export type HTTPServerErrorStatusCode =
  (typeof HTTPServerErrorStatus)[keyof typeof HTTPServerErrorStatus];
