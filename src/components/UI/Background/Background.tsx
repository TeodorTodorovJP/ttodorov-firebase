import "./Background.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setAllOpenToFalse } from "../../Navigation/navigationSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { singleClick } from "../../../app/utils";
import SVGBackground from "./SVGBackground";
import { isSVG } from "./backgroundSlice";
import { selectTheme } from "../../Navigation/themeSlice";

const Background = () => {
  const { main: theme } = useAppSelector(selectTheme);
  const showSVG = useAppSelector(isSVG);
  const dispatch = useAppDispatch();

  const background = useRef<HTMLDivElement>(null);

  useEffect(() => {
    singleClick({ ref: background }, () => dispatch(setAllOpenToFalse()));
  }, []);

  return (
    <div id="background" ref={background} className={`background ${theme}`}>
      {showSVG && <SVGBackground />}
    </div>
  );
};

export default Background;

// All values are in pixels
// (position of top angle, left to right width 100),(position of top angle, top to bottom height 10) 250,190 160,210
