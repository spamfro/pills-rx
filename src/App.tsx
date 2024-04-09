import { 
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
  useParams,
} from 'react-router-dom';

const App = () => (
  <RouterProvider router={createAppRouter()} />
);

const createAppRouter = () => (
  createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />} >
        <Route index element={<HomePage />} />
        <Route
          path={'/about/:id'}
          element={<AboutPage />}
        />
      </Route>
    )
  )
);

const Layout = () => (
  <>
    <h1>Layout</h1>
    <Outlet />
  </>
);

const HomePage = () => (
  <>
    <h2>Home</h2>
    <XComponent />
  </>
);

const AboutPage = () => {
  const { id } = useParams();
  return (
    <>
      <h2>About {id}</h2>
      <XComponent />
      <YComponent />
    </>
  );
};

const XComponent = () => (
  <p>X Component</p>
);

const YComponent = () => (
  <p>Y Component</p>
);

export default App;
