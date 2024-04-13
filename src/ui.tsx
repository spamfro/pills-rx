import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
import { ProductDataset } from './datasets';
import { Db, Services } from './services';
import { Dates, FormatDate, legendLabel } from './utils';
import { Drug, Prescription, Schedule } from './model';

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

function PrescriptionPage() {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const services = useContext(ServicesContext);
  const startDate = new Date(2024, 3, 9);  // TODO: should be part of model
  
  useEffect(() => {
    const controller = new AbortController();

    services?.db.fetchProducts({ signal: controller.signal })
      .then(values => { 
        const products = new ProductDataset(Db.schema.products, values);
        setPrescription(new Prescription(products));
      });

    return () => { controller.abort() }
  }, []);

  return (
    <>
      {prescription 
        ? <ScheduleTable schedule={prescription.schedule(startDate)} />
        : <p>Loading...</p>}
    </>
  );
}

interface ScheduleTableProps {
  schedule: Schedule;
}

function ScheduleTable({ schedule }: ScheduleTableProps) {
  // schedule -> { drug -> legendIndex }
  const drugs = new Map<Drug, number>(
    Array.from(
      new Set(schedule.flatMap(({ slots }) => slots.map(({ drug }) => drug)))
    )
    .map((drug, legendIndex) => [drug, legendIndex])
  );

  type Col = { slot: number, legendIndex: number, drug: Drug };
  type SlotCol = { col: Col, colSpan: number };

  // schedule -> [ (slot, legendIndex, drug) ]
  const cols = Array.from<Col>(
    new Map<number, Col>(
      schedule.flatMap(
        ({ slots }) => slots.map(({ slot, drug }) => [
          (slot * drugs.size) + drugs.get(drug)!,         // key
          { slot, legendIndex: drugs.get(drug)!, drug }   // value
        ])
      )
    ).values()
  );
  cols.sort(({ slot: ls, legendIndex: ld }, { slot: rs, legendIndex: rd }) => {
    if (ls !== rs) { return ls - rs }
    return ld - rd;
  });

  // cols -> [ (col, colSpan) ]
  const slots = cols.reduce<Array<SlotCol>>((acc, col) => {
    if (acc.length > 0 && acc[acc.length - 1].col.slot === col.slot) {
      acc[acc.length - 1].colSpan++;
    } else {
      acc.push({ col, colSpan: 1 })
    }
    return acc
  }, []);

  return (
    <>
      <table className='prescription'>
        <thead>
          <tr className='slots'>
            <th colSpan={2}></th>
            {slots.map(({ col: { slot }, colSpan }, slotColIndex) => (
              <th key={slotColIndex} colSpan={colSpan}>{slot}</th>
            ))}
          </tr>
          <tr>
            <th colSpan={2}></th>
            {cols.map(({ legendIndex }, colIndex) => (
              <th key={colIndex}>{legendLabel(legendIndex)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {schedule.map(({ date, slots }) => {
            return (
              <tr key={Dates.diffDays(date, schedule[0].date)}>
                <td className='day'>{(Dates.diffDays(date, schedule[0].date)) + 1}</td>
                <td className='date'>{FormatDate.weekDay(date)}</td>
                {cols.map(col => slots.find(slot => (col.slot === slot.slot && col.drug === slot.drug)) ?? { dose: null })
                .map(({ dose },i) => (
                  <td key={i} className='take'>{dose && <input type='checkbox' />}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Legend:</h3>
      <table className='legend'>
        <tbody>
          {Array.from(drugs.entries()).map(([{ description }, legendIndex]) => (
            <tr key={legendIndex}>
              <td className='key'>{legendLabel(legendIndex)}.</td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
