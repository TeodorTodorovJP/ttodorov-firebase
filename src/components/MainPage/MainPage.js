import React, { useEffect } from "react";
import classes from "./MainPage.module.css";
import Card from "../UI/Card";
import Navigation from "../navigation/Navigation";

const MainPage = () => {
  useEffect(() => {
    if (document.location.hostname === "localhost") {
      document.title = "TTodorov DEV";
    } else {
      document.title = "TTodorov";
    }
  }, []);

  const DUMMY_MEALS = [
    {
      id: "m1",
      name: "Sushi",
      description: "Finest fish and veggies",
      price: 22.99,
    },
    {
      id: "m2",
      name: "Schnitzel",
      description: "A german specialty!",
      price: 16.5,
    },
    {
      id: "m3",
      name: "Barbecue Burger, Barbecue Burger, Barbecue Burger, Barbecue Burger, Barbecue Burger, Barbecue Burger",
      description: "American, raw, meaty",
      price: 12.99,
    },
    {
      id: "m4",
      name: "Green Bowl",
      description: "Healthy...and green...",
      price: 18.99,
    },
  ];
  const meals = DUMMY_MEALS.map((m) => <p key={m.id}>{m.name}</p>);

  // Make these like helper functions
  // const accessibility = accessibilityProvider('div', 'label', 'customMessage');
  const accessibility = {
    div: {
      role: "myRole", // if you want to make div into a button
      "aria-label": "aria-label-text", // for name
      "aria-expanded": "true", // in this case, this is the value
    },
  };

  return (
    <Card additionalClass="main-page">
      <div {...accessibility.div} className={classes["main-page"]}>
        <Navigation />
        {meals}
      </div>
    </Card>
  );
};

export default MainPage;
// You can use autocomplete, look how to do it with user permission like popup or alert
// <input id="email" autocomplete="email" name="email" aria-required="true" placeholder="Email" required>
