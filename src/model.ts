import { ProductDataset } from "./datasets";
import { Dates } from "./utils";

export class Prescription {
  takes: Take[];

  constructor(_products: ProductDataset) {
    // TODO: build from datasets...
    
    const drugs = new Map<number, Drug>([
      [1, { description: 'Сефпотек 200мг' }],
      [2, { description: 'Лимекс Форте' }],
      [3, { description: 'Микомакс 150мг' }],
    ]);
    this.takes = [
      { slots: [800, 2000], drug: drugs.get(1)!, dose: 1,
        rule: { ks: [0], r: 1, n: 14 }
      },
      { slots: [1200], drug: drugs.get(2)!, dose: 1,
        rule: { ks: [0], r: 1, n: 14 }
      },
      { slots: [1200], drug: drugs.get(3)!, dose: 1,
        rule: { ks: [1,6,13], r: 14, n: 14 }
      },
    ];
  }

  schedule(start: Date): Schedule {
    let numDays = Math.max(...this.takes.map(({ rule: { n } }) => n));
    const schedule: Schedule = [];
    for (let i = 0; i < numDays; ++i) {
      const date = Dates.addDays(start, i);
      const slots: Slot[] = [];
      for (const { slots: takeSlots, drug, dose, rule } of this.takes) {
        if (Prescription.isAcceptable(i, rule)) {
          slots.push(...takeSlots.map(slot => ({ slot, drug, dose })));
        }
      }
      slots.sort(Prescription.compareSlots);
      schedule.push({ date, slots });
    }    
    return schedule;
  }

  static isAcceptable(i: number, { ks, r, n }: Rule): boolean {
    return i < n && ks.some(k => i % r == k);
  }
  static compareSlots(lhs: Slot, rhs: Slot): number {
    if (lhs.slot !== rhs.slot) { return lhs.slot - rhs.slot }
    return lhs.drug.description.localeCompare(rhs.drug.description);
  }
}

export type Schedule = { date: Date; slots: Slot[] }[];
type Slot = { slot: number; drug: Drug; dose: number };
type Take = { slots: number[]; drug: Drug; dose: number; rule: Rule }
export type Drug = { description: string }
type Rule = { ks: number[], r: number, n: number }
