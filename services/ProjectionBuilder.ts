// deno-lint-ignore-file ban-types
/**
 * For non-cursor query projection option
 */
export class ProjectionBuilder<T> {
  private projection: {} | Record<keyof T, 0 | 1> = {};

  build() {
    console.log(this.projection);
    return this.projection;
  }

  hide(fields: (keyof T)[] = []) {
    if (fields.length > 0) {
      const hideProjection = fields.reduce((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {} as Record<keyof T, 0>);

      if (Object.keys(hideProjection).length > 0) {
        this.projection = { ...this.projection, ...hideProjection };
      }
    }
    return this;
  }

  show(fields: (keyof T)[] = []) {
    if (fields.length > 0) {
      const showProjection = fields.reduce((acc, key) => {
        acc[key] = 1;
        return acc;
      }, {} as Record<keyof T, 1>);

      if (Object.keys(showProjection).length > 0) {
        this.projection = { ...this.projection, ...showProjection };
      }
    }
    return this;
  }
}
