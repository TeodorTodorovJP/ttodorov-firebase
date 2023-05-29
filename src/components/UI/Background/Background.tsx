import "./Background.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setAllOpenToFalse } from "../../Navigation/navigationSlice";
import { useEffect, useMemo, useRef, useState } from "react";
import { singleClick } from "../../../app/utils";
import SVGBackground from "./SVGBackground";
import { isSVG } from "./backgroundSlice";
import { selectTheme } from "../../Navigation/themeSlice";

/**
 * Background Component
 *
 * This is a functional component that renders a background for your application.
 * The background is controlled by the theme selected from the redux state, and it has the ability to display an SVG background.
 * It listens to clicks, and dispatches an action to the redux store when clicked.
 *
 * Props - This component does not accept any props.
 *
 * State - The component maintains no local state variables but does use Redux for state management.
 *
 * Custom Hooks - These hooks are used within the component:
 * - useAppDispatch: Used to access the redux dispatch function.
 * - useAppSelector: Used to access specific values from the redux store. Here, it is used to get the theme and SVG show status.
 *
 * Functions - The component uses the following functions:
 * - singleClick: This function is used to attach a click listener to the background. On a click, it dispatches the `setAllOpenToFalse` action to the redux store.
 *
 * Refs - The component uses the following refs:
 * - background: This ref is attached to the div that is used to render the background. It is used in the `singleClick` function to attach a click listener.
 */
export const Background = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const { main: theme } = useAppSelector(selectTheme)
  const showSVG = useAppSelector(isSVG)

  /** Local state */
  const background = useRef<HTMLDivElement>(null)

  /** Attach the function setAllOpenToFalse to be executed on each single click on the background. */
  useEffect(() => {
    singleClick({ ref: background }, () => dispatch(setAllOpenToFalse()))
  }, [])

  return (
    <div id="background" ref={background} className={`background ${theme}`}>
      {showSVG && <SVGBackground />}
    </div>
  )
}

export default Background;

// All values are in pixels
// (position of top angle, left to right width 100),(position of top angle, top to bottom height 10) 250,190 160,210
