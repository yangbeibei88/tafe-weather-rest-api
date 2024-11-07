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