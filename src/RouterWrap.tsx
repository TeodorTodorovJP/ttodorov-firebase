import MealsList from "./components/MealsList/MealsList";
import useAuthContext from "./app/auth-context";
import App from "./App";

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AuthForm from "./components/Auth/AuthForm";
import { Counter } from "./components/Counter/Counter";
import Home from "./components/Home/Home";
import Chat from "./components/Chat/Chat";
import Profile from "./components/Profile/Profile";

/**
 * The only purpose of this component is to address the router + context issue
 * The issue is to require a hook (useContext, useAuthContext) inside index.tsx which is not a Component
 */

const RouterWrap = () => {
  const authCtx = useAuthContext();

  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <div>Oops! There was an error.</div>,
      children: [
        {
          errorElement: <div>Oops! There was an error.</div>,
          children: [
            { index: true, element: <Home /> },
            {
              path: "auth",
              element: <AuthForm />,
            },
            {
              path: "profile",
              element: authCtx.isLoggedIn ? <Profile /> : <Home />,
            },
            {
              path: "counter",
              element: authCtx.isLoggedIn ? <Counter /> : <AuthForm />,
            },
            {
              path: "chat",
              element: authCtx.isLoggedIn ? <Chat /> : <AuthForm />,
            },
            // {
            //   path: "meals",
            //   element: authCtx.isLoggedIn && <MealsList />,
            //   // children: [
            //   //   {
            //   //     path: "meal",
            //   //     element: <p>Signle meal</p>,
            //   //   },
            //   // ],
            // },
            {
              path: "*",
              element: <Navigate to="/" replace={true} />,
            },
          ],
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default RouterWrap;
