import classes from "./Home.module.css";

import Card from "../UI/Card";

/**
 * The Home component returns a Card component with a div containing the text "Home Page".
 * returns a functional component named `Home` is being returned. It renders a `Card` component with
 * an additional class of "home" and a child `div` element with a class of `classes.home` and the text
 * "Home Page". The value of `classes.home` is not provided in the code snippet.
 */
export const Home = () => {
  return (
    <Card additionalClass="home">
      <div className={classes.home}>Home Page</div>
    </Card>
  );
};

export default Home;
