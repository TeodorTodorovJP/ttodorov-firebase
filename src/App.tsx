import { useEffect, useState } from "react";
import classes from "./App.module.css";
// import "./App.css";
import Card from "./components/UI/Card";
import Navigation from "./components/Navigation/Navigation";
import { Outlet } from "react-router-dom";
import Background from "./components/UI/Background/Background";

// import useAuthContext from "./app/auth-context";

const App = () => {
  // const authCtx = useAuthContext();

  useEffect(() => {
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV";
      //authCtx.login("fakeToken", "Sun Jan 15 3025");
    } else {
      document.title = "TTodorov";
    }
  }, []);

  // Make these like helper functions
  // const accessibility = accessibilityProvider('div', 'label', 'customMessage');
  // const accessibility = {
  //   div: {
  //     role: "myRole", // if you want to make div into a button
  //     "aria-label": "aria-label-text", // for name
  //     "aria-expanded": "true", // in this case, this is the value
  //   },
  // };

  return (
    <div className={classes.app}>
      <Background />
      <Navigation />
      <div className={classes.outlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default App;
// You can use autocomplete, look how to do it with user permission like popup or alert
// <input id="email" autocomplete="email" name="email" aria-required="true" placeholder="Email" required>
