import React from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "./app/store"
import reportWebVitals from "./reportWebVitals"

import { AuthContextProvider } from "./app/auth-context"
import RouterWrap from "./RouterWrap"

/**
 * This is the entry point of the application that renders the React component tree.
 * It creates a root container element, attaches it to the DOM, and renders the App component inside it.
 * The App component is wrapped with React.StrictMode to detect potential problems in the application.
 * The AuthContextProvider component provides the authentication context to the app.
 * The Provider component is used to provide the redux store to the app.
 * The CssBaseline: It fixes some inconsistencies across browsers and devices while providing resets that are better tailored to fit Material UI.
 * The RouterWrap component is the top-level component for routing.
 * @module - Root Rendering index
 */

const container = document.getElementById("root")!
const root = createRoot(container)

/**
 * On mobile devices, the address bar is moving the website down and at the same time 
 * it doesn't affect the vh, so the bottom part of the website get's cut off. 
 * To fix that you have to get the correct height of it, so that you can adjust the position of the page.
 * This code is an attempt to avoid these issues.
 * Doesn't work!!!!!!
*/
// window.addEventListener("load",() => {
//   setTimeout(() => {
//       // This hides the address bar:
//       window.scrollTo(0, 1);
//   }, 0);
// });

root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <Provider store={store}>
        <RouterWrap />
      </Provider>
    </AuthContextProvider>
  </React.StrictMode>
)

// reportWebVitals();
