import useAuthContext from "./app/auth-context"
import App from "./App"

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import AuthForm from "./components/Auth/AuthForm"
import Home from "./components/Home/Home"
import Chat from "./components/Chat/Chat"
import Profile from "./components/Profile/Profile"
import Projects from "./components/Projects/Projects"
import Notes from "./components/Notes/Notes"
import NewNote from "./components/Notes/NewNote"

/**
 * The only purpose of this component is to address the router + context issue.
 * The issue is to require a hook (useContext, useAuthContext) inside index.tsx which is not a Component.
 * @module
 * @ignore
 */
const RouterWrap = () => {
  const authCtx = useAuthContext()

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
              path: "chat",
              element: authCtx.isLoggedIn ? <Chat /> : <AuthForm />,
            },
            {
              path: "projects",
              element: <Projects />,
            },
            {
              path: "notes",
              children: [
                {
                  index: true,
                  element: <Notes />,
                },
                {
                  path: "new",
                  element: <NewNote />,
                },
                {
                  path: ":id",
                  children: [
                    {
                      index: true,
                      element: <p>Show</p>,
                    },
                    {
                      path: "edit",
                      element: <p>Edit</p>,
                    },
                  ],
                },
              ],
            },
            // {
            //   path: "meals",
            //   element: authCtx.isLoggedIn && <MealsList />,
            //   children: [
            //     {
            //       path: "meal",
            //       element: <p>Single meal</p>,
            //     },
            //   ],
            //   children: [
            //     {
            //       path: "meal",
            //       element: <p>Single meal</p>,
            //     },
            //   ],
            // },
            {
              path: "*",
              element: <Navigate to="/" replace={true} />,
            },
          ],
        },
      ],
    },
  ])

  return <RouterProvider router={router} />
}

export default RouterWrap
