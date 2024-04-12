import { ProductDataset } from './datasets';
import { Prescription } from './model';
import { Db } from './services';
import { FormatDate } from './utils';

describe('Prescription', () => {
  const products = new ProductDataset(
    Db.schema.products,
    [ [1, 'Сефпотек 200мг', 14],
      [2, 'Лимекс Форте', 14],
      [3, 'Микомакс 150мг', 3] ]
  );

  it('should be valid', () => {
    expect(new Prescription(products).takes).not.toBe(null);
  }); 
  
  describe('schedule', () => {
    it('should be valid', () => {
      const date = new Date(2024, 0, 1);
      expect(
        new Prescription(products).schedule(date)
          .slice(0, 2)
          .map(({ date, slots }) => [
            FormatDate.day(date),
            ...slots.map(({ slot, drug, dose }) => [slot, drug.description, dose])
          ])
      )
      .toEqual([
        ['2024-01-01', [800,'Сефпотек 200мг',1],[1200,'Лимекс Форте',1],[2000,'Сефпотек 200мг',1]],
        ['2024-01-02', [800,'Сефпотек 200мг',1],[1200,'Лимекс Форте',1],[1200,'Микомакс 150мг',1],[2000,'Сефпотек 200мг',1]],
      ]);
    });
  });
});
