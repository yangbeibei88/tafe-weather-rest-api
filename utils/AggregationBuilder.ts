import { Collection } from "mongodb";

export class AggregationBuilder {
  // deno-lint-ignore no-explicit-any
  private pipeline: any[] = [];
  private limit: number = 10;
  private page: number = 1;

  // deno-lint-ignore no-explicit-any
  match(criteria: Record<string, any>) {
    if (Object.keys(criteria).length > 0) {
      this.pipeline.push({ $match: criteria });
    }
    return this;
  }

  // deno-lint-ignore no-explicit-any
  group(grouping: Record<string, any>) {
    this.pipeline.push({ $group: grouping });
    return this;
  }

  sort(sortCriteria: Record<string, 1 | -1>) {
    this.pipeline.push({ $sort: sortCriteria });
    return this;
  }

  // deno-lint-ignore no-explicit-any
  project(projection: Record<string, any>) {
    this.pipeline.push({ $project: projection });
    return this;
  }

  paginate(limit: number, page: number) {
    this.limit = limit > 0 ? limit : 10;
    this.page = page > 0 ? page : 1;

    const skip = (this.page - 1) * this.limit;

    const paginationFacet = {
      totalCount: [{ $count: "totalCount" }],
      data: [{ $skip: skip }, { $limit: this.limit }],
    };
    this.pipeline.push({ $facet: paginationFacet });
    return this;
  }

  // deno-lint-ignore no-explicit-any
  static parseQueryToMatch(query: Record<string, any>) {
    // deno-lint-ignore no-explicit-any
    const matchCriteria: Record<string, any> = {};

    for (const key in query) {
      if (key === "limit" || key === "page") {
        continue;
      }

      matchCriteria[key] = query[key];
    }

    return matchCriteria;
  }

  static calculatePagination(totalCount: number, limit: number, page: number) {
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = page > totalPages ? totalPages : page;

    return { totalPages, currentPage };
  }

  // deno-lint-ignore no-explicit-any
  build(): any[] {
    return this.pipeline;
  }
}
