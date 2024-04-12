import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from 'react-router-dom';
import { ProductDataset, ProductRow, } from './datasets';
import { Db, Services } from './services';
import { Dates, Format } from './utils';

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
      )
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
  const [products, setProducts] = useState<ProductRow[]>([]);
  const services = useContext(ServicesContext);

  const startDate = new Date(2024, 3, 9);  // TODO
  const range = Dates.range(startDate, Dates.addDays(startDate, 14));  // TODO
  
  useEffect(() => {
    const controller = new AbortController();
    services?.db.fetchProducts({ signal: controller.signal })
      .then(values => { 
        const ds = new ProductDataset(Db.schema.products, values);
        setProducts(ds.rows);
      });
    return () => { controller.abort() }
  }, []);

  return (
    <>
      <table className='prescription'>
        <thead>
          <tr className='slots'>
            <th colSpan={2}></th>
            <th colSpan={1}>8am</th>
            <th colSpan={2}>12pm</th>
            <th colSpan={1}>8pm</th>
          </tr>
          <tr>
            <th colSpan={2}></th>
            <th>A</th>
            <th>B</th>
            <th>C</th>
            <th>A</th>
          </tr>
        </thead>
        <tbody>
          {Array.from(range).map((dt, day) => {
            return (
              <tr key={day}>
                <td className='day'>{day + 1}</td>
                <td className='date'>{Format.weekDay(dt)}</td>
                <td className='take'><input type='checkbox' /></td>
                <td className='take'><input type='checkbox' /></td>
                <td className='take'><input type='checkbox' /></td>
                <td className='take'><input type='checkbox' /></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Legeend:</h3>
      <ol type='A'>
        {products.map(({ id, description }) => (
          <li key={id}>{description}</li>
        ))}
      </ol>
    </>
  );
}
