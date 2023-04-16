import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { Modal, setModal } from "./navigationSlice";

export const defaultTheme = "blue";

const buttonStyling = "buttonStyling hover";

export const ALL_THEMES = {
  red: "red",
  green: "green",
  blue: "blue",
  svg: "svg",
};

export type MainThemes = "red" | "green" | "blue";
export type MainObj = { main: MainThemes };
type Light = "light-red" | "light-green" | "light-blue";
type Medium = "medium-red" | "medium-green" | "medium-blue";
type Hard = "hard-red" | "hard-green" | "hard-blue";
type Button =
  | `${typeof buttonStyling} button-red`
  | `${typeof buttonStyling} button-green`
  | `${typeof buttonStyling} button-blue`;
type SVG = "svg-red" | "svg-green" | "svg-blue";
type Decoration = "decoration-red" | "decoration-green" | "decoration-blue";
type Scrollbar = "scrollbar-red" | "scrollbar-green" | "scrollbar-blue";
type Loader = "loader loader-red" | "loader loader-green" | "loader loader-blue";

interface Theme {
  main: MainThemes;
  light: Light;
  medium: Medium;
  hard: Hard;
  button: Button;
  svg: SVG;
  decoration: Decoration;
  scrollbar: Scrollbar;
  loader: Loader;
}

export interface ThemeState {
  theme: Theme;
}
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
      scrollbar: `scrollbar-${defaultTheme}`,
      loader: `loader loader-${defaultTheme}`,
    },
  };
  return newState;
};

const initialState = getMainInitialState();

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setTheme: (state, action: PayloadAction<{ main: MainThemes }>) => {
      const theme = action.payload.main;
      let newThemeObj: Theme = {
        main: theme,
        light: `light-${theme}`,
        medium: `medium-${theme}`,
        hard: `hard-${theme}`,
        button: `${buttonStyling} button-${theme}`,
        svg: `svg-${theme}`,
        decoration: `decoration-${theme}`,
        scrollbar: `scrollbar-${theme}`,
        loader: `loader loader-${theme}`,
      };

      state.theme = newThemeObj;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => state.theme.theme;

export const saveThemeToLocalStorage = (): AppThunk => (dispatch, getState) => {
  const theme = selectTheme(getState());
  localStorage.setItem("theme", theme.main);
};

export const getThemeFromLocalStorage =
  (): AppThunk =>
  (dispatch, getState): MainThemes => {
    const theme = localStorage.getItem("theme") as MainThemes;
    return theme;
  };

export default themeSlice.reducer;
