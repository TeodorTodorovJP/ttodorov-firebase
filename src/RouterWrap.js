import React, { useEffect, useContext } from "react";
import classes from "./App.module.css";
import Card from "./components/UI/Card";
import Navigation from "./components/Navigation/Navigation";
import MealsList from "./components/MealsList/MealsList";
import AuthContext from "./app/auth-context";
import App from "./App";

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AuthForm from "./components/Auth/AuthForm";
import { Counter } from "./features/counter/Counter";

/**
 * The only purpose of this component is to address the router + context issue
 * The issue is to require context (useContext) inside index.tsx which is not a Component
 */

const RouterWrap = (props) => {
  const authCtx = useContext(AuthContext);

  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
      errorElement: <div>Oops! There was an error.</div>,
      children: [
        {
          errorElement: <div>Oops! There was an error.</div>,
          children: [
            // { index: true, element: <Index /> },
            {
              path: "/auth",
              element: !authCtx.isLoggedIn && <AuthForm />,
            },
            {
              path: "/counter",
              element: authCtx.isLoggedIn ? (
                <Counter />
              ) : (
                <Navigate to="/" replace={true} />
              ),
            },
          ],
        },
      ],
    },
  ]);

  return (
    // @ts-ignore
    <RouterProvider router={router}>{props.children}</RouterProvider>
  );
};

export default RouterWrap;
