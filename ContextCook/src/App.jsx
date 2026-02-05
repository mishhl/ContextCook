import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home  from './pages/Home'
import Profile from './pages/Profile'
import Recipes  from './pages/Recipes'
import Recommendations from './pages/Recommendations'
import MainLayout from './layouts/MainLayout'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/recipes",
        element: <Recipes />
      },
      {
        path: "/recommendations",
        element: <Recommendations />
      }
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
