import "./Background.css";
import { useAppSelector } from "../../../app/hooks";
import { selectTheme } from "../../Navigation/navigationSlice";

const Background = () => {
  const { main: theme } = useAppSelector(selectTheme);

  // Decide how many elements we want
  const windowHeight: number = +window.innerHeight;
  const windowWidth: number = +window.innerWidth;

  const shapesDimensions = [
    // Width, Height of point
    {
      class: "polygon-light",
      tLeft: `0 ${windowHeight * 0.15}`,
      tRight: `0 ${windowHeight * 0.15}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth * 0.65} ${windowHeight}`,
    },
    {
      class: "polygon-light",
      tLeft: `0 ${windowHeight * 0.3}`,
      tRight: `${windowWidth} ${windowHeight * 0.45}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth} ${windowHeight}`,
    },
    {
      class: "polygon-light",
      tLeft: `${windowWidth} ${windowHeight * 0.15}`,
      tRight: `${windowWidth} ${windowHeight * 0.15}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth / 2} ${windowHeight}`,
    },
    {
      class: "polygon-medium",
      tLeft: `${windowWidth} ${windowHeight * 0.5}`,
      tRight: `${windowWidth} ${windowHeight * 0.5}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth} ${windowHeight}`,
    },
    {
      class: "polygon-medium",
      tLeft: `0 ${windowHeight * 0.85}`,
      tRight: `${windowWidth} ${windowHeight * 0.45}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth} ${windowHeight}`,
    },
    {
      class: "polygon-medium",
      tLeft: `0 ${windowHeight * 0.5}`,
      tRight: `0 ${windowHeight * 0.5}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth} ${windowHeight}`,
    },
    {
      class: "polygon-hard",
      tLeft: `0 ${windowHeight * 0.7}`,
      tRight: `${windowWidth} ${windowHeight * 0.8}`,
      bLeft: `0 ${windowHeight}`,
      bRight: `${windowWidth} ${windowHeight}`,
    },
  ];

  const svgShapes = shapesDimensions.map((shape, index) => {
    // Each of those is Width and Height of point in space
    const points = `${shape.tLeft}, ${shape.tRight}, ${shape.bRight}, ${shape.bLeft}`;

    return <polygon key={index} points={points} className={`${shape.class} ${theme}`} />;
  });

  return (
    <div className={`background ${theme}`}>
      <svg className="backgroundSvgElements">{svgShapes}</svg>
    </div>
  );
};

export default Background;

// All values are in pixels
// (position of top angle, left to right width 100),(position of top angle, top to bottom height 10) 250,190 160,210
