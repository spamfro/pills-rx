import { Shape } from './utils';

export type ProductRow = Shape<{ id: number; description: string; doses: number }>;

export class ProductDataset {
  rows = new Array<ProductRow>();
  index = new Map<number, ProductRow>();

  constructor(header: string[], values: Array<any[]>) {
    const schema = new Map(header.map((x, i) => [x, i]));
    values.forEach(value => {
      const id = parseInt(value[schema.get('ID') ?? -1]);
      const description = value[schema.get('DESCR') ?? -1];
      const doses = parseInt(value[schema.get('DOSES') ?? -1]);
      if (id > 0 && !!description && doses > 0) {
        const row = { id, description, doses };
        this.rows.push(row);
        this.index.set(row.id, row);
      }
    });
  }
}
