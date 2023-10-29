import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store"

export const defaultTheme = "light"

export type Themes = "light" | "dark"

interface stateType {
  value: Themes
}

const initialState: stateType = {
  value: defaultTheme,
}

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setTheme: (state, action: PayloadAction<{ theme: Themes }>) => {
      state.value = action.payload.theme
    },
    toggleTheme: (state) => {
      state.value = state.value === "light" ? "dark" : "light"
    },
  },
})

export const { setTheme, toggleTheme } = themeSlice.actions

export const selectTheme = (state: RootState) => state.theme

export default themeSlice.reducer;
