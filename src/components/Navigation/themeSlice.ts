import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store"

/** The default theme of the app. */
export const defaultTheme = "blue";

/** For all buttons that will have a hover effect. */
const buttonStyling = "buttonStyling hover";

/** All available themes. */
export type MainThemes = "red" | "green" | "blue"
export type MainObj = { main: MainThemes };

/** Set the tones for each theme. */
type Light = "light-red" | "light-green" | "light-blue";
type Medium = "medium-red" | "medium-green" | "medium-blue";
type Hard = "hard-red" | "hard-green" | "hard-blue";

/** Style the buttons. */
type Button =
  | `${typeof buttonStyling} button-red`
  | `${typeof buttonStyling} button-green`
  | `${typeof buttonStyling} button-blue`;

/** Adjust the SVG colors according to the theme. */
type SVG = "svg-red" | "svg-green" | "svg-blue";

/** Set's the color of any element to the chosen theme. */
type Decoration = "decoration-red" | "decoration-green" | "decoration-blue";

/** Set's the light decoration tone. */
type DecorationToneL = "decoration-red-l" | "decoration-green-l" | "decoration-blue-l";
/** Set's the medium decoration tone. */
type DecorationToneM = "decoration-red-m" | "decoration-green-m" | "decoration-blue-m";
/** Set's the hard decoration tone. */
type DecorationToneH = "decoration-red-h" | "decoration-green-h" | "decoration-blue-h";

/** For all scrollbars. */
type Scrollbar = "scrollbar-red" | "scrollbar-green" | "scrollbar-blue";

/** Styles the modal loader. */
type Loader = "loader loader-red" | "loader loader-green" | "loader loader-blue";

/** Combines all available stylings. */
interface Theme {
  main: MainThemes
  light: Light
  medium: Medium
  hard: Hard
  button: Button
  svg: SVG
  decoration: Decoration
  decorationL: DecorationToneL
  decorationM: DecorationToneM
  decorationH: DecorationToneH
  scrollbar: Scrollbar
  loader: Loader
}

export interface ThemeState {
  theme: Theme;
}

/**
 * Combines all stylings and exposes them to be used.
 * Each is dynamically prepared with the chosen theme.
*/
const getMainInitialState = () => {
  const newState: ThemeState = {
    theme: {
      main: defaultTheme,
      light: `light-${defaultTheme}`,
      medium: `medium-${defaultTheme}`,
      hard: `hard-${defaultTheme}`,
      button: `${buttonStyling} button-${defaultTheme}`,
      svg: `svg-${defaultTheme}`,
      decoration: `decoration-${defaultTheme}`,
      decorationL: `decoration-${defaultTheme}-l`,
      decorationM: `decoration-${defaultTheme}-m`,
      decorationH: `decoration-${defaultTheme}-h`,
      scrollbar: `scrollbar-${defaultTheme}`,
      loader: `loader loader-${defaultTheme}`,
    },
  }
  return newState;
};

const initialState = getMainInitialState();

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    /**
     * Takes the currently chosen theme and uses it to reset all styled elements.
     */
    setTheme: (state, action: PayloadAction<{ main: MainThemes }>) => {
      const theme = action.payload.main
      let newThemeObj: Theme = {
        main: theme,
        light: `light-${theme}`,
        medium: `medium-${theme}`,
        hard: `hard-${theme}`,
        button: `${buttonStyling} button-${theme}`,
        svg: `svg-${theme}`,
        decoration: `decoration-${theme}`,
        decorationL: `decoration-${theme}-l`,
        decorationM: `decoration-${theme}-m`,
        decorationH: `decoration-${theme}-h`,
        scrollbar: `scrollbar-${theme}`,
        loader: `loader loader-${theme}`,
      }

      state.theme = newThemeObj
    },
  },
})

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.theme;

/**
 * Saves the current theme selected by the user to the local storage.
 */
export const saveThemeToLocalStorage = (): AppThunk => (dispatch, getState) => {
  const theme = selectTheme(getState());
  localStorage.setItem("theme", theme.main);
};

/**
 * Not used at the moment.
*/
export const getThemeFromLocalStorage =
  (): AppThunk =>
  (dispatch, getState): MainThemes => {
    const theme = localStorage.getItem("theme") as MainThemes;
    return theme;
  };

export default themeSlice.reducer;
