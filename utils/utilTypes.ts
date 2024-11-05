export type GeoJSONGeometryType =
  | "Point"
  | "LineString"
  | "Polygon"
  | "MultiPoint"
  | "MultiLineString"
  | "MultiPolygon";

export type CoordinatesType<T extends GeoJSONGeometryType> = T extends "Point"
  ? [number, number]
  : T extends "LineString"
  ? [number, number][]
  : T extends "Polygon"
  ? [number, number][][]
  : T extends "MultiPoint"
  ? [number, number][]
  : T extends "MultiLineString"
  ? [number, number][][]
  : T extends "MultiPolygon"
  ? [number, number][][][]
  : never;

export interface GeoLocation<T extends GeoJSONGeometryType> {
  type: T;
  coordinates: CoordinatesType<T>;
}
