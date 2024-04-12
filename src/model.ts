// import { Dates } from "./utils";

export class Prescription {
  takes: Take[];

  constructor() {
    const drugs = new Map<number, Drug>([
      [1, { description: 'Сефпотек 200мг' }],
      [2, { description: 'Лимекс Форте' }],
      [3, { description: 'Микомакс 150мг' }],
    ]);
    this.takes = [
      { slots: [800, 2000], drug: drugs.get(1)!, dose: 1,
        rule: { ks: [0], r: 0, n: 14 }
      },
      { slots: [1200], drug: drugs.get(2)!, dose: 1,
        rule: { ks: [0], r: 0, n: 14 }
      },
      { slots: [1200], drug: drugs.get(3)!, dose: 1,
        rule: { ks: [0,6,13], r: 0, n: 14 }
      },
    ];
  }

  schedule(_start: Date) {
    let numDays = Math.max(...this.takes.map(({ rule: { n } }) => n));
    // const days = [];
    // for (let i = 0; i < numDays; ++i) {
    //   const dt = Dates.addDays(start, i);
    //   const slots = [];
    //   for (const take of this.takes) {
        
    //   }
    // }    
    return { numDays };
  }
}

type Take = { slots: number[]; drug: Drug; dose: number; rule: Rule }
type Drug = { description: string }
type Rule = { ks: number[], r: number, n: number }
