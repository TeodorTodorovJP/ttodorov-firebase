import { useEffect, useState } from "react";
import classes from "./App.module.css";
// import "./App.css";
import Card from "./components/UI/Card";
import Navigation from "./components/Navigation/Navigation";
import { Outlet } from "react-router-dom";
import Background from "./components/UI/Background/Background";
import Modal from "./components/Modal/Modal";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectModal, setTheme, setUser, MainObj, defaultTheme } from "./components/Navigation/navigationSlice";

// import useAuthContext from "./app/auth-context";

const App = () => {
  // const authCtx = useAuthContext();

  const { show } = useAppSelector(selectModal);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV";
      //authCtx.login("fakeToken", "Sun Jan 15 3025");
    } else {
      document.title = "TTodorov";
    }

    let userDefaultTheme = localStorage.getItem("theme");
    userDefaultTheme = userDefaultTheme ? userDefaultTheme : defaultTheme;
    dispatch(setUser({ theme: userDefaultTheme }));

    let changeTheme: MainObj = { main: userDefaultTheme } as MainObj;
    dispatch(setTheme(changeTheme));
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
      <Modal />
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
