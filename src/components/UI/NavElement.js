import classes from "./NavElement.module.css";
// import "./Card.css";
// import mySvg from "./mySvg.svg";

const NavElement = (props) => {
  const additionalClass = props.additionalClass
    ? ` ${classes[props.additionalClass]}`
    : "";

  return (
    <a href="#" alt="nav" className={`${classes.nav} ${additionalClass}`}>
      {props.children}
    </a>
  );
};

export default NavElement;
