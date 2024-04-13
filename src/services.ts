import { Shape } from './utils';

export class Services {
  db = new Db();
}

export class Db {
  static schema = {
    products: ['ID', 'DESCR', 'DOSES']
  };

  async fetchProducts({ signal }: Shape<{ signal: AbortSignal }>): Promise<any[]> {
    const response = await fetch('./data/products.json', { signal });
    if (!response.ok) { throw new Error(response.statusText) }
    return await response.json();
  }
}
