import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
import { Db, Services } from './services';
import { Dates, FormatDate, legendLabel } from './utils';
import { Model } from './model';

export default function App() {
  return (
    <ServicesProvider services={new Services()}>
      <RouterProvider router={createAppRouter()} />
    </ServicesProvider>
  );
}

const ServicesContext = createContext<Services | null>(null);

interface ServicesProviderProps { 
  services: Services; 
  children: ReactNode
}

function ServicesProvider({ services, children }: ServicesProviderProps) {
  return (
    <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>
  );
}

function createAppRouter() {
  return (
    createBrowserRouter(
      createRoutesFromElements(
        <Route path='/' element={<Layout />} >
          <Route index element={<PrescriptionPage />} />
        </Route>
      ),
      {
        basename: window.location.pathname
      }
    )
  );
}

function Layout() {
  return (
    <>
      <h1 className='title'>Pills Rx</h1>
      <Outlet />
    </>
  );
}

async function fetchPrescription(
  id: number, 
  options: { services: Services, signal: AbortSignal }
): Promise<Model.Prescription> {
  const { services, signal } = options;
  const [drugs = [], prescriptions = [], rules = [], takes = []] = await Promise.all([
    services.datasets.drugs.get({ signal }),
    services.datasets.prescriptions.get({ id, signal }),
    services.datasets.rules.get({ signal }),
    services.datasets.takes.get({ pid: id, signal }),
  ]);
  return new Model.Prescription(id, { drugs, prescriptions, rules, takes });
}

function PrescriptionPage() {
  const [prescription, setPrescription] = useState<Model.Prescription | null>(null);
  const services = useContext(ServicesContext)!;
  
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;
    const id = 1; // TODO

    fetchPrescription(id, { services, signal })
      .then(setPrescription);

    return () => { controller.abort() }
  }, []);

  const schedule = useMemo(() => {
    if (prescription) { 
      return new ViewModel.Schedule(prescription);
    }
  }, [prescription]);

  return (
    <>
      {!schedule && <p>Loading...</p>}
      {schedule && <Schedule schedule={schedule}/>}
      {schedule && <Legend legend={schedule.legend} />}
    </>
  );
}

interface ScheduleProps {
  schedule: ViewModel.Schedule;
}

function Schedule({ schedule }: ScheduleProps) {
  const { slots, drugs, days } = schedule;
  return (
    <>
      <table className='prescription'>
        <thead>
          <tr className='slots'>
            <th colSpan={2}></th>
            {slots.map(({ span, label }, colIndex) => (
              <th key={colIndex} colSpan={span}>{label}</th>
            ))}
          </tr>
          <tr>
            <th colSpan={2}></th>
            {drugs.map(({ label }, colIndex) => (
              <th key={colIndex}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(({ day, date, takes }, rowIndex) => (
            <tr key={rowIndex}>
              <td className='day'>{day}</td>
              <td className='date'>{FormatDate.weekDay(date)}</td>
              {takes.map((take, colIndex) => (
                <td key={colIndex} className='take'>{take && <input type='checkbox' />}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

interface LegendProps {
  legend: ViewModel.Legend;
}

function Legend({ legend }: LegendProps) {
  return (
    <>
      <h3>Legend:</h3>
      <table className='legend'>
        <tbody>
          {legend.map(({ label, description }, index) => (
            <tr key={index}>
              <td className='key'>{label}</td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

namespace ViewModel {

  export type Legend = Array<{ label: string; description: string }>;

  export class Schedule {
    slots: Array<{ span: number; label: string }>;
    drugs: Array<{ label: string }>;
    legend: Legend;
    days: Array<{ day: number; date: Date; takes: Array<{ dose: number } | undefined> }>;
    
    constructor(prescription: Model.Prescription) {
      const days: Array<{ day: number; date: Date; takes: Model.Take[]}> = [];
      for (let day = 0; day < prescription.numDays; ++day) {
        const takes = prescription.takes.filter(({ rule }) => !rule || rule.includes(day, prescription.numDays));
        if (takes.length > 0) {
          days.push({ day: day+1, date: Dates.addDays(prescription.start, day), takes });
        }
      }
      const uniqueDrugs = Array.from(
        new Set(days.flatMap(({ takes }) => takes.map(({ drug }) => drug)))
      );
      uniqueDrugs.sort(({ description: lhs }, { description: rhs }) => lhs.localeCompare(rhs));
      const drugsIndex: Map<Db.Drug, number> = uniqueDrugs.reduce((acc, drug, drugId) => acc.set(drug, drugId), new Map());

      const uniqueSlots = Array.from(
        new Set(days.flatMap(({ takes }) => takes.flatMap(({ slots }) => slots)))
      );
      uniqueSlots.sort(({ time: lhs }, { time: rhs }) => lhs - rhs);
      const slotsIndex: Map<Model.Slot, number> = uniqueSlots.reduce((acc, slot, slotId) => acc.set(slot, slotId), new Map());

      type Col = { key: number; slot: Model.Slot; drug: Db.Drug };
      const colKey = (slot: Model.Slot, drug: Db.Drug) => slotsIndex.get(slot)!*drugsIndex.size + drugsIndex.get(drug)!;
      const cols: Array<Col> = Array.from(
        days.flatMap(({ takes }) => takes.flatMap(({ drug, slots }) => slots.map(slot => ({ slot, drug, key: colKey(slot, drug) }))))
        .reduce((acc, col) => acc.set(col.key, col), new Map())
        .values()
      );
      cols.sort((lhs, rhs) => lhs.key - rhs.key);

      const slots: Array<{ span: number; slot: Model.Slot }> = cols.reduce((acc, { slot }, i) => {
        if (i > 0 && acc[acc.length-1].slot === slot) { acc[acc.length-1].span++ }
        else { acc.push({ span: 1, slot }) }
        return acc;
      }, new Array());


      this.slots = slots.map(({ span, slot: { time } }) => ({ span, label: time.toString() }));
      this.drugs = cols.map(({ drug }) => ({ label: legendLabel(drugsIndex.get(drug)!) }));
      this.legend = Array.from(drugsIndex.entries())
        .map(([{ description }, drugId]) => ({ label: legendLabel(drugId), description }));
      this.legend.sort(({ label: lhs }, { label: rhs }) => lhs.localeCompare(rhs));
      this.days = days.map(({ day, date, takes: dayTakes }) => {
        const takes = dayTakes.flatMap(({ slots, drug, dose }) => slots.map(slot => ({ 
          slot, drug, dose,
          key: colKey(slot, drug)
        })))
        .reduce((acc, take) => acc.set(take.key, take), new Map<number, { slot: Model.Slot, drug: Db.Drug, dose: number }>());
        return { day, date, takes: cols.map(({ key }) => takes.get(key)) };
      });
    }
  }

} // namespace ViewModel
