import classes from "./MealsList.module.css";
import Card from "../UI/Card";
import { Outlet } from "react-router-dom";

const MealsList = (props) => {
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
  const meals = DUMMY_MEALS.map((meal) => (
    <Card key={meal.id} additionalClass="meals-list">
      <div className={classes["meals-list"]}>
        <p>{meal.name}</p>
        <p>{meal.price}</p>
        <p>{meal.description}</p>
      </div>
    </Card>
  ));

  return (
    <>
      <div>{meals}</div>
      <Outlet />
    </>
  );
};

export default MealsList;
