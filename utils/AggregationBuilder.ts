// deno-lint-ignore-file no-explicit-any
import { QueryBuilder } from "./QueryBuilder.ts";

export class AggregationBuilder extends QueryBuilder {
  private pipeline: any[] = [];
  // private limit: number = 10;
  // private page: number = 1;

  constructor(
    param: Record<string, any> = {},
    query: Record<string, any> = {}
  ) {
    super(param, query);
  }

  match() {
    const filter = this.filterBuild();
    if (filter && Object.keys(filter).length > 0) {
      this.pipeline.push({ $match: filter });
    }
    return this;
  }

  group(grouping?: Record<string, any>) {
    if (grouping && Object.keys(grouping).length > 0) {
      this.pipeline.push({ $group: grouping });
    }
    return this;
  }

  lookup(lookupCriteria?: Record<string, any>) {
    if (lookupCriteria && Object.keys(lookupCriteria).length > 0) {
      this.pipeline.push({ $lookup: lookupCriteria });
    }
    return this;
  }

  project(projection?: Record<string, any>) {
    if (projection) {
      this.pipeline.push({ $project: projection });
    }
    return this;
  }

  set(fields: Record<string, any>) {
    if (fields && Object.keys(fields).length > 0) {
      this.pipeline.push({ $set: fields });
    }
    return this;
  }

  unwind(path: string) {
    this.pipeline.push({ $unwind: path });
    return this;
  }

  replaceRoot(newRoot: Record<string, any>) {
    this.pipeline.push({ $replaceRoot: { newRoot } });
    return this;
  }

  aggFilter(filter: Record<string, any>) {
    if (filter && Object.keys(filter).length > 0) {
      this.pipeline.push({ $project: { docs: { $filter: filter } } });
    }
    return this;
  }

  paginate(limit: number, page: number) {
    // this.limit = limit > 0 ? limit : 10;
    // this.page = page > 0 ? page : 1;

    const skip = (page - 1) * limit;

    const paginationFacet = {
      totalCount: [{ $count: "totalCount" }],
      data: [{ $skip: skip }, { $limit: limit }],
    };
    this.pipeline.push({ $facet: paginationFacet });
    return this;
  }

  sort(sortCriteria?: Record<string, 1 | -1>) {
    if (sortCriteria && Object.keys(sortCriteria).length > 0) {
      this.pipeline.push({ $sort: sortCriteria });
    }
    return this;
  }

  static parseSort(query: Record<string, any>) {
    const sortCriteria: Record<string, 1 | -1> = {};

    for (const key in query) {
      if (key.startsWith("sort[")) {
        // extract field name from `sort[field]`
        const field = key.slice(5, -1);
        const order = parseInt(query[key], 10);
        if (order === 1 || order === -1) {
          sortCriteria[field] = order;
        }
      }
    }
    return Object.keys(sortCriteria).length > 0 ? sortCriteria : undefined;
  }

  static calculatePagination(totalCount: number, limit: number, page: number) {
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.min(page, totalPages);

    return { totalPages, currentPage };
  }

  build(): any[] {
    return this.pipeline;
  }
}
