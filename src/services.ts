export class Services {
  datasets = new Db.Datasets();
}

export namespace Db {
  
  export class Datasets {
    drugs = new Drugs();
    prescriptions = new Prescriptions();
    rules = new Rules();
    takes = new Takes();
  }

  class Takes {
    async get({ pid, signal }: { pid: number; signal: AbortSignal }): Promise<Db.Take[]> {
      const response = await fetch(`./data/takes.${pid}.json`, { signal });
      if (!response.ok) { throw new Error(response.statusText) }
      return await response.json();
    }
  }
  
  class Rules {
    async get({ signal }: { signal: AbortSignal }): Promise<Db.Rule[]> {
      const response = await fetch('./data/rules.json', { signal });
      if (!response.ok) { throw new Error(response.statusText) }
      return await response.json();
    }
  }
  
  class Prescriptions {
    async get({ id, signal }: { id: number; signal: AbortSignal }): Promise<Db.Prescription[]> {
      const response = await fetch(`./data/prescriptions.${id}.json`, { signal });
      if (!response.ok) { throw new Error(response.statusText) }
      return (
        (await response.json() as { id: number; start: string; numDays: number }[])
        .flatMap(row => {
          const start = new Date(row.start);
          return isNaN(start.getFullYear()) ? [] : [{ ...row, start }];
        })
      );
    }
  }
  
  class Drugs {
    async get({ signal }: { signal: AbortSignal }): Promise<Db.Drug[]> {
      const response = await fetch('./data/drugs.json', { signal });
      if (!response.ok) { throw new Error(response.statusText) }
      return await response.json();
    }
  }
  
  export interface Drug { 
    id: number; 
    description: string; 
    doses: number;
  }

  export interface Prescription {
    id: number;
    start: Date;
    numDays: number;
  }

  export interface Take {
    pid: number;
    did: number;
    dose: number;
    slots: number[];
    rid?: number;
  }
  
  export interface Rule {
    id: number;
    days: number[];
    cycleNumDays?: number;
  }
}
