import React, { useEffect } from "react";
import classes from "./App.module.css";
import Card from "./components/UI/Card";
import Navigation from "./components/Navigation/Navigation";
import MealsList from "./components/MealsList/MealsList";
import { Outlet } from "react-router-dom";

const App = () => {
  useEffect(() => {
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV";
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

  let theme = "regular";
  let backGround = "";
  if (theme === "regular") {
    // background-image: url("./components/UI/backgrounds/seaside.jpg");
    backGround =
      "linear-gradient(90deg, rgba(44,72,84,1) 0%, rgba(167,124,124,1) 60%)";
  }

  return (
    <Card additionalClass="app" backGround={backGround}>
      <div className={`${classes.app} ${classes[theme]}`}>
        <Navigation />
        <MealsList />
        <Outlet />
      </div>
    </Card>
  );
};

export default App;
// You can use autocomplete, look how to do it with user permission like popup or alert
// <input id="email" autocomplete="email" name="email" aria-required="true" placeholder="Email" required>
