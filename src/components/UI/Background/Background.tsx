import "./Background.css";
import { useAppSelector } from "../../../app/hooks";
import { selectTheme } from "../../Navigation/navigationSlice";

const Background = () => {
  const { main: theme, glass: themeStyle } = useAppSelector(selectTheme);

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

    return <polygon key={index} points={points} className={`${shape.class} ${theme} ${themeStyle}`} />;
  });

  return (
    <div className={`background ${theme}`}>
      <svg className="backgroundSvgElements">
        <filter id="glassFilter">
          <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="dark_edge_01" />
          <feOffset dx="5" dy="5" in="dark_edge_01" result="dark_edge_03" />
          <feFlood flood-color="rgba(0,0,0,.5)" result="dark_edge_04" />
          <feComposite in="dark_edge_04" in2="dark_edge_03" operator="in" result="dark_edge" />

          <feMorphology operator="dilate" radius="4" in="SourceAlpha" result="light_edge_01" />
          <feOffset dx="-2" dy="-2" in="light_edge_01" result="light_edge_03" />
          <feFlood flood-color={`var(--theme-${theme}-el-l)`} result="light_edge_04" />
          <feComposite in="light_edge_04" in2="light_edge_03" operator="in" result="light_edge" />

          <feMerge result="edges">
            <feMergeNode in="dark_edge" />
            <feMergeNode in="light_edge" />
          </feMerge>
          <feComposite in="edges" in2="SourceGraphic" operator="out" result="edges_complete" />

          <feGaussianBlur stdDeviation="5" result="bevel_blur" />
          <feSpecularLighting
            result="bevel_lighting"
            in="bevel_blur"
            specularConstant="2.4"
            specularExponent="13"
            lighting-color="rgba(60,60,60,.4)"
          >
            <feDistantLight azimuth="25" elevation="40" />
          </feSpecularLighting>
          <feComposite in="bevel_lighting" in2="SourceGraphic" operator="in" result="bevel_complete" />

          <feMerge result="complete">
            <feMergeNode in="edges_complete" />
            <feMergeNode in="bevel_complete" />
          </feMerge>
        </filter>
        {svgShapes}
      </svg>
    </div>
  );
};

export default Background;

// All values are in pixels
// (position of top angle, left to right width 100),(position of top angle, top to bottom height 10) 250,190 160,210
