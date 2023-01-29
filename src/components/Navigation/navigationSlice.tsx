import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { StringLiteral } from "typescript";
import { RootState, AppThunk, AppDispatch } from "../../app/store";
import { fetchTheme } from "./navigationApi";

export const defaultTheme = "blue";

const buttonStyling = "buttonStyling";

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
type Decoration = "decoration-red" | "decoration-green" | "decoration-blue";

interface Theme {
  main: Main;
  light: Light;
  medium: Medium;
  hard: Hard;
  button: Button;
  decoration: Decoration;
}

export interface Modal {
  type: string;
  show: boolean;
  header: string;
  message: string;
  agree: string;
  deny: null | string;
  response: string;
}

interface User {
  theme: null | string;
}

export interface NavigationState {
  theme: Theme;
  status: "idle" | "loading" | "failed";
  modal: Modal;
  user: User;
}

const initialState: NavigationState = {
  theme: {
    main: defaultTheme,
    light: `light-${defaultTheme}`,
    medium: `medium-${defaultTheme}`,
    hard: `hard-${defaultTheme}`,
    button: `${buttonStyling} button-${defaultTheme}`,
    decoration: `decoration-${defaultTheme}`,
  },
  status: "idle",
  modal: { type: "", show: false, header: "Header", message: "Message", agree: "Yes", deny: "No", response: "deny" },
  user: { theme: null },
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
        button: `buttonStyling button-${theme}`,
        decoration: `decoration-${theme}`,
      };

      state.theme = newThemeObj;
    },
    setModal: (state, action: PayloadAction<Modal>) => {
      const data = action.payload;
      state.modal = data;

      if (data.response === "agree") {
        if ((data.type = "changeDefaultTheme")) {
          localStorage.setItem("theme", state.theme.main);
          state.user.theme = state.theme.main;
        }
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user.theme = action.payload.theme;
    },
    // changeDefaultTheme: (state, action: PayloadAction<{ response: string }>) => {
    //   localStorage.setItem("theme", state.theme.main);
    // },
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

export const { setTheme, setModal, setUser } = navigationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectTheme = (state: RootState) => state.navigation.theme;
export const selectModal = (state: RootState) => state.navigation.modal;
export const selectUser = (state: RootState) => state.navigation.user;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const assignTheme =
//   (): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectTheme(getState());

//     dispatch(setTheme({main: 'red'}));
//   };

export default navigationSlice.reducer;
