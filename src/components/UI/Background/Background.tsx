import "./Background.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectTheme, setAllOpenToFalse } from "../../Navigation/navigationSlice";
import { useEffect, useMemo, useRef, SVGProps, cloneElement } from "react";
import { singleClick } from "../../../app/utils";

const Background = () => {
  const { main: theme } = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  const background = useRef<HTMLDivElement>(null);
  useEffect(() => {
    singleClick({ ref: background }, () => dispatch(setAllOpenToFalse()));
  }, []);

  const getSvgShapes = () => {
    // Find the size of the screen
    const body = document.body;
    const html = document.documentElement;

    /* The * 1.1 is to help with window resize when address bar is hidden*/
    const windowHeight: number =
      Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight) * 1.1;
    const windowWidth: number = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    );

    // const windowHeight: number = +window.innerHeight;
    // const windowWidth: number = +window.innerWidth;

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

      return {
        key: index,
        points: points,
        className: shape.class,
      };
    });

    return svgShapes;
  };

  const svgShapesWithoutTheme = useMemo(() => getSvgShapes(), []);

  // Assign the theme each time the theme changes
  const svgShapes = svgShapesWithoutTheme.map((p) => {
    return <polygon key={p.key} points={p.points} className={`${p.className} ${theme}`} />;
  });

  return (
    <div id="background" ref={background} className={`background ${theme}`}>
      <svg className="backgroundSvgElements">{svgShapes}</svg>
    </div>
  );
};

export default Background;

// All values are in pixels
// (position of top angle, left to right width 100),(position of top angle, top to bottom height 10) 250,190 160,210
