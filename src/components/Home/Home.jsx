import classes from "./Home.module.css";

import Card from "../UI/Card";

const Home = () => {
  return (
    <Card additionalClass="home">
      <div className={classes.home}>Home Page</div>
    </Card>
  );
};

export default Home;
