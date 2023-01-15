import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from "./app/store";
import reportWebVitals from './reportWebVitals';
import "./index.module.css";

import { AuthContextProvider } from "./app/auth-context";
import RouterWrap from "./RouterWrap";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <Provider store={store}>
        <RouterWrap />
      </Provider>
    </AuthContextProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
