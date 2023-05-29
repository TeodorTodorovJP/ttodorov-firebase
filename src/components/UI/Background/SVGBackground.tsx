import "./SVGBackground.css";
import { useAppSelector } from "../../../app/hooks";
import { useEffect, useMemo, useState } from "react";
import { isMobile } from "../../../app/utils";
import { selectTheme } from "../../Navigation/themeSlice";

/**
 * SVGBackground Component.
 * 
 * The component is not used, because it's not optimized. 
 * The SVG elements take too long to load.
 * 
 * Uses the screen size to generate svg shapes and place them around the screen.
*/
export const SVGBackground = () => {
  const { main: theme } = useAppSelector(selectTheme)

  const [windowHeight, setWindowHeight] = useState<number>()
  const [windowWidth, setWindowWidth] = useState<number>()
  const [viewHeight, setViewHeight] = useState<number>()

  /**
   * If the user is in web and resizes the window, wait for 500ms to apply the changes.
   */
  useEffect(() => {
    // Set sizes on init
    setSizes()
    if (!isMobile()) {
      const delay = 500
      let waitUserResize: ReturnType<typeof setTimeout>
      window.addEventListener("resize", () => {
        clearTimeout(waitUserResize)
        waitUserResize = setTimeout(() => {
          setSizes()
        }, delay)
      })
    }
  }, [])

  /** Reads all possible screen parameters and set's the maximum size. */
  const setSizes = () => {
    // Find the size of the screen
    const body = document.body
    const html = document.documentElement

    const windowMaxHeight: number = Math.max(
      body.scrollHeight,
      body.offsetHeight,
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
    )

    /* This is to help with window resize when address bar is hidden*/
    const addressBarHeight = window.innerHeight - document.documentElement.clientHeight
    const windowHeight = windowMaxHeight + addressBarHeight

    /* This is to help with window resize when address bar is hidden*/
    // 100vh + addressBarVH
    const vhFromPx = 100 + Math.trunc(addressBarHeight / windowMaxHeight)

    const windowWidth: number = Math.max(
      body.scrollWidth,
      body.offsetWidth,
      html.clientWidth,
      html.scrollWidth,
      html.offsetWidth
    )

    setWindowHeight(windowHeight)
    setWindowWidth(windowWidth)
    setViewHeight(vhFromPx)
  }

  /** Prepares the svg shapes based on the screen sizes. */
  const getSvgShapes = () => {
    // const windowHeight: number = +window.innerHeight;
    // const windowWidth: number = +window.innerWidth;
    if (windowHeight === undefined || windowWidth === undefined) return

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
    ]

    const svgShapes = shapesDimensions.map((shape, index) => {
      // Each of those is Width and Height of point in space
      const points = `${shape.tLeft}, ${shape.tRight}, ${shape.bRight}, ${shape.bLeft}`

      return {
        key: index,
        points: points,
        className: shape.class,
      }
    })

    return svgShapes
  }

  /** Get's the svg shapes only when screen size changes. */
  const svgShapesWithoutTheme = useMemo(() => getSvgShapes(), [windowHeight, windowWidth])

  /** Assign the theme each time the theme changes. */
  let svgShapes: JSX.Element[] = []
  if (svgShapesWithoutTheme !== undefined) {
    svgShapes = svgShapesWithoutTheme.map((p) => {
      return <polygon key={p.key} points={p.points} className={`${p.className} ${theme}`} />
    })
  }

  // const bgStyle = { height: "100svh" };
  // const bgSVGStyle = { height: "100svh" };

  // if (isMobile() && viewHeight) {
  //   bgStyle.height = viewHeight + "svh";
  //   bgSVGStyle.height = viewHeight + "svh";
  // }

  return <svg className="backgroundSvgElements">{svgShapes}</svg>
};

export default SVGBackground;

// All values are in pixels
// (position of top angle, left to right width 100),(position of top angle, top to bottom height 10) 250,190 160,210
