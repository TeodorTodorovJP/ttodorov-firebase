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
  const [theme, setTheme] = useState({
    main: "blue",
    light: "light-blue",
    medium: "medium-blue",
    hard: "hard-blue",
  });
  const [themeStyle, setThemeStyle] = useState("");

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

  // let backGround = "";
  // if (theme === "regular") {
  //   // background-image: url("./components/UI/backgrounds/seaside.jpg");
  //   // backGround = "linear-gradient(90deg, rgba(44,72,84,1) 0%, rgba(167,124,124,1) 60%)";
  // }

  const allThemes = {
    red: "red",
    green: "green",
    blue: "blue",
  };

  const changeThemeHandle = (theme: string) => {
    const themeObj = {
      main: theme,
      light: `light-${theme}`,
      medium: `medium-${theme}`,
      hard: `hard-${theme}`,
    };
    setTheme(themeObj);
  };
  const changeThemeStyleHandle = (theme: string) => {
    setThemeStyle(themeStyle === "" ? "glassFilter" : "");
  };
  return (
    <div className={classes.app}>
      <Background theme={theme.main} themeStyle={themeStyle} side="bottom" />
      <Navigation
        theme={theme}
        changeTheme={changeThemeHandle}
        allThemes={allThemes}
        changeThemeStyle={changeThemeStyleHandle}
      />
      <div className={classes.outlet}>
        <Outlet />
      </div>
    </div>
  );
};

export default App;
// You can use autocomplete, look how to do it with user permission like popup or alert
// <input id="email" autocomplete="email" name="email" aria-required="true" placeholder="Email" required>
