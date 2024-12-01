// deno-lint-ignore-file no-explicit-any
// @deno-types="@types/swagger-ui-express"
import { JsonObject } from "swagger-ui-express";

// function unionToArray<T extends string>(...args: T[]): T[] {
//   return args;
// }

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

type OpenAPISchemaObject = {
  [key: string]: any;
  $ref?: string;
};

export function preprocessOpenAPIDoc(doc: JsonObject): JsonObject {
  const deepCloneDoc = structuredClone(doc);

  if (deepCloneDoc.components?.schemas) {
    // Separate internal schemas
    const internalSchemas = Object.entries(deepCloneDoc.components.schemas)
      .filter(([_, schema]) => (schema as any)["x-internal"])
      .reduce((acc, [key, schema]) => {
        acc[key] = schema;
        return acc;
      }, {} as Record<string, any>);

    // Remove internal schemas from components.schemas
    deepCloneDoc.components.schemas = Object.fromEntries(
      Object.entries(deepCloneDoc.components.schemas).filter(
        ([, schema]) => !(schema as any)["x-internal"]
      )
    );

    // Inline internal schemas where they are referenced
    const inlineInternalSchemas = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;
      if (obj.$ref) {
        const refSegments = obj.$ref.split("/");
        const schemaName = refSegments[refSegments.length - 1];
        if (schemaName && internalSchemas[schemaName]) {
          return { ...internalSchemas[schemaName] };
        }
      }

      // Recursively process arrays and objects
      if (Array.isArray(obj)) {
        return obj.map(inlineInternalSchemas);
      }

      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          inlineInternalSchemas(value),
        ])
      );
    };
    return inlineInternalSchemas(deepCloneDoc);
  }
  return deepCloneDoc;
}
