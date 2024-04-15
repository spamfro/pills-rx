
import { Db } from './services';

export namespace Model {
  
  export class Prescription {
    start: Date;
    numDays: number;
    takes: Take[];
    
    constructor(
      id: number, 
      db: { 
        drugs: Db.Drug[],
        prescriptions: Db.Prescription[],
        rules: Db.Rule[],
        takes: Db.Take[]
    }) {
  
      const prescription = db.prescriptions.find(({ id: prescriptionId }) => prescriptionId === id);
      if (prescription === undefined) { throw new Error('Not found') }
      const { start, numDays } = prescription;
  
      const drugById = db.drugs.reduce((acc, drug) => acc.set(drug.id, drug), new Map());
      const ruleById = db.rules.reduce((acc, rule) => (acc.get(rule.id) ?? acc.set(rule.id, new Rule(rule.days, numDays, rule.cycleNumDays)), acc), new Map());
  
      const slotByTime = db.takes.flatMap(take => take.slots)
        .reduce((acc, time) => (acc.get(time) ?? acc.set(time, { time }), acc), new Map());
  
      const takes = db.takes.filter(({ pid: takePid }) => takePid === id)
      .map(({ did, dose, slots: takeSlots, rid}) => {
        const drug = drugById.get(did);
        const slots = takeSlots.map(time => slotByTime.get(time)).filter(Boolean);
        const rule = ruleById.get(rid);
        if (!drug || slots.length === 0) { throw new Error('Bad data') }
        return { drug, dose, slots, rule };
      });
  
      this.start = start;
      this.numDays = numDays;
      this.takes = takes;
    }
  }

  export interface Slot {
    time: number;
  }
  
  class Rule {
    constructor(
      public days: number[], 
      public numDays: number, 
      public cycleNumDays?: number) {
    }
    includes(day: number, numDays: number): boolean {
      const r = this.cycleNumDays || numDays;
      return this.days.some(k => day % r === k);
    }
  }

  export interface Take {
    drug: Db.Drug;
    dose: number;
    slots: Slot[];
    rule?: Rule;
  }
}  // namespace Model
