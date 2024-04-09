import { useEffect, useState } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';

function App() {
  return (
    <RouterProvider router={createAppRouter()} />
  );
}

function createAppRouter() {
  return (
    createBrowserRouter(
      createRoutesFromElements(
        <Route path='/' element={<Layout />} >
          <Route index element={<Prescription />} />
        </Route>
      )
    )
  );
}

function Layout() {
  return (
    <>
      <h1>Pills Rx</h1>
      <Outlet />
    </>
  );
}

type Product = [id: number, description: string, dosesPerUnit: number];

class Dates {
  static addDays(dt: Date, n: number): Date {
    return new Date(dt.getTime() + n * 24 * 60 * 60 * 1000);
  }
  static *range(bdt: Date, edt?: Date): Generator<Date> {
    yield bdt;
    for (let dt = bdt; edt === undefined || dt < edt; dt = Dates.addDays(dt, 1)) {
      yield dt;
    }
  }
}

class Format {
  static day(dt: Date): string { return dt === undefined ? '' : `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}` }
  static weekDay(dt: Date): string { return dt === undefined ? '' : `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')} ${Format.weekday[dt.getDay()]}` }
  static weekday = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
}

function Prescription() {
  const [products, setProducts] = useState<Product[]>([]);
  const startDate = new Date(2024, 3, 9);  // TODO
  const range = Dates.range(startDate, Dates.addDays(startDate, 14));  // TODO

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      const products = await fetch('/data/products.json', { signal: controller.signal })
        .then(response => {
          if (!response.ok) { throw new Error(response.statusText) }
          return response.json();
        });

      setProducts(products);
    }

    fetchProducts();

    return () => { controller.abort() };  // AbortError
  }, []);

  return (
    <>
      <table>
        <thead>
          <tr>
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
                <td>{day + 1}</td>
                <td>{Format.weekDay(dt)}</td>
                <td><input type='checkbox' /></td>
                <td><input type='checkbox' /></td>
                <td><input type='checkbox' /></td>
                <td><input type='checkbox' /></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3>Legend</h3>
      <ol type='A'>
        {products.map(([id, description]) => (
          <li key={id}>{description}</li>
        ))}
      </ol>
    </>
  );
}

export default App;
