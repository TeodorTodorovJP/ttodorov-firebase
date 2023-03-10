import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { RootState, AppThunk, AppDispatch } from "../../app/store";
import { fetchTheme } from "./navigationApi";
import { Langs } from "./NavigationTexts";

export const defaultTheme = "blue";
export const defaultLang: keyof Langs = "en";

const buttonStyling = "buttonStyling hover";

export const ALL_THEMES = {
  red: "red",
  green: "green",
  blue: "blue",
};

type Main = "red" | "green" | "blue";
export type MainObj = { main: Main };
type Light = "light-red" | "light-green" | "light-blue";
type Medium = "medium-red" | "medium-green" | "medium-blue";
type Hard = "hard-red" | "hard-green" | "hard-blue";
type Button =
  | `${typeof buttonStyling} button-red`
  | `${typeof buttonStyling} button-green`
  | `${typeof buttonStyling} button-blue`;
type SVG = "svg-red" | "svg-green" | "svg-blue";
type Decoration = "decoration-red" | "decoration-green" | "decoration-blue";
type Loader = "loader loader-red" | "loader loader-green" | "loader loader-blue";

interface Theme {
  main: Main;
  light: Light;
  medium: Medium;
  hard: Hard;
  button: Button;
  svg: SVG;
  decoration: Decoration;
  loader: Loader;
}

export interface Modal {
  useModal?: boolean;
  modalType?: "loader";
  action?: null | string;
  header?: null | string;
  message?: string;
  agree?: string;
  deny?: null | string;
  response?: null | string;
}

interface User {
  theme: null | string;
  lang: keyof Langs;
}

interface IsOpen {
  navLeftVisible: boolean;
  navRightVisible: boolean;
  showThemes: boolean;
}

const initialIsOpen: IsOpen = { navLeftVisible: false, navRightVisible: false, showThemes: false };

export interface NavigationState {
  theme: Theme;
  status: "idle" | "loading" | "failed";
  modal: Modal;
  user: User;
  isOpen: IsOpen;
}

const initialState: NavigationState = {
  theme: {
    main: defaultTheme,
    light: `light-${defaultTheme}`,
    medium: `medium-${defaultTheme}`,
    hard: `hard-${defaultTheme}`,
    button: `${buttonStyling} button-${defaultTheme}`,
    svg: `svg-${defaultTheme}`,
    decoration: `decoration-${defaultTheme}`,
    loader: `loader loader-${defaultTheme}`,
  },
  status: "idle",
  modal: { useModal: false, action: null, header: null, message: "Message", agree: "OK", deny: null, response: null },
  user: { theme: null, lang: defaultLang },
  isOpen: initialIsOpen,
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const incrementAsync = createAsyncThunk("navigation/fetchTheme", async (theme: string) => {
  const response = await fetchTheme(theme);
  // The value we return becomes the `fulfilled` action payload
  return response.data;
});

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setTheme: (state, action: PayloadAction<{ main: Main }>) => {
      const theme = action.payload.main;
      let newThemeObj: Theme = {
        main: theme,
        light: `light-${theme}`,
        medium: `medium-${theme}`,
        hard: `hard-${theme}`,
        button: `${buttonStyling} button-${theme}`,
        svg: `svg-${theme}`,
        decoration: `decoration-${theme}`,
        loader: `loader loader-${theme}`,
      };

      state.theme = newThemeObj;
    },
    setModal: (state, action: PayloadAction<Modal>) => {
      const data = action.payload;
      state.modal = data;

      if (data.response === "agree") {
        if (data.action === "changeDefaultTheme") {
          localStorage.setItem("theme", state.theme.main);
          state.user.theme = state.theme.main;
        }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    setLang: (state, action: PayloadAction<{ lang: keyof Langs }>) => {
      localStorage.setItem("lang", action.payload.lang);
      state.user.lang = action.payload.lang;
    },
    setIsOpenToTrue: (state, action: PayloadAction<{ item: string; isOpen: boolean }>) => {
      const newIsOpen: IsOpen = { ...state.isOpen };

      newIsOpen[action.payload.item as keyof IsOpen] = action.payload.isOpen;
      state.isOpen = newIsOpen;
    },
    setAllOpenToFalse: (state) => {
      state.isOpen = initialIsOpen;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(incrementAsync.pending, (state) => {
        state.status = "loading";
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = "idle";
        //state.value += action.payload;
      })
      .addCase(incrementAsync.rejected, (state) => {
        state.status = "failed";
      });
  },
});

export const { setTheme, setModal, setUser, setLang, setAllOpenToFalse, setIsOpenToTrue } = navigationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectTheme = (state: RootState) => state.navigation.theme;
export const selectLang = (state: RootState) => state.navigation.user.lang;
export const selectModal = (state: RootState) => state.navigation.modal;
export const selectUser = (state: RootState) => state.navigation.user;
export const selectIsOpen = (state: RootState) => state.navigation.isOpen;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const assignTheme =
//   (): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectTheme(getState());

//     dispatch(setTheme({main: 'red'}));
//   };

export default navigationSlice.reducer;
