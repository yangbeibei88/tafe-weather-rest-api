// deno-lint-ignore-file no-explicit-any
type Operator = "gte" | "gt" | "lte" | "lt" | "in" | "all";

export class QueryBuilder {
  private filter: Record<string, any> = {};

  // query here for req.query
  // param here for req.params
  constructor(
    private param: Record<string, any> = {},
    private query: Record<string, any> = {}
  ) {}

  filterBuild(): Record<string, any> {
    for (const [key, value] of Object.entries(this.param)) {
      this.filter[key] = value;
    }
    for (const [key, value] of Object.entries(this.query)) {
      // skip pagination and sort-related keys
      if (
        key === "limit" ||
        key === "page" ||
        key === "operation" ||
        key === "aggField" ||
        key.startsWith("sort[")
      ) {
        continue;
      }
      // check if key contains an operator e.g. humidity[gt]
      const match = key.match(/(.+)\[(.+)\]/);

      if (match) {
        const [, field, operator] = match; // ["humidity[gt]", "humidity", "gt"]
        this.addOperator(field, operator as Operator, value);
      } else {
        this.filter[key] = value;
      }
    }
    return this.filter;
  }

  private addOperator(field: string, operator: Operator, value: any) {
    if (!this.filter[field]) {
      this.filter[field] = {};
    }

    switch (operator) {
      case "in":
        this.filter[field]["$in"] = this.parseArray(value);
        break;
      case "all":
        this.filter[field]["$all"] = this.parseArray(value);
        break;
      case "gte":
        this.filter[field]["$gte"] = this.parseValue(value);
        break;
      case "gt":
        this.filter[field]["$gt"] = this.parseValue(value);
        break;
      case "lte":
        this.filter[field]["$lte"] = this.parseValue(value);
        break;
      case "lt":
        this.filter[field]["$lt"] = this.parseValue(value);
        break;

      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private parseValue(value: any): any {
    if (this.isISODate(value)) {
      return new Date(value);
    }
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    if (value === "true" || value === "false") {
      return value === "true";
    }
    return value;
  }

  private parseArray(value: any): any[] {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",");
    throw new Error(`Invalid array value: ${value}`);
  }

  private isISODate(value: string): boolean {
    return !isNaN(Date.parse(value));
  }
}
