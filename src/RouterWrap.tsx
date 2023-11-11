import useAuthContext from "./app/auth-context"
import App from "./App"

import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import AuthForm from "./components/Auth/AuthForm"
import Home from "./components/Home/Home"
import Chat from "./components/Chat/Chat"
import Profile from "./components/Profile/Profile"
import Projects from "./components/Projects/Projects"
import Notes from "./components/Notes/Notes"
import NotesBrowse from "./components/Notes/NotesBrowse"
import EditNote from "./components/Notes/NoteDetailed"
import EditTags from "./components/Notes/EditTags"
import NoteForm from "./components/Notes/NoteForm"
import NotePreview from "./components/Notes/NotePreview"

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
              element: <Notes />,
              children: [
                {
                  index: true,
                  element: <NotesBrowse />,
                },
                {
                  path: "new",
                  element: <NoteForm />,
                },
                {
                  path: ":id",
                  children: [
                    {
                      index: true,
                      element: <NotePreview />,
                    },
                    {
                      path: "edit",
                      element: <EditNote />,
                    },
                  ],
                },
                {
                  path: "edittags",
                  element: <EditTags />,
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
