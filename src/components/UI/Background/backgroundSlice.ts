import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../../app/store";
export interface BackgroundState {
  svg: boolean;
}

const initialState: BackgroundState = {
  svg: false,
};

export const backgroundSlice = createSlice({
  name: "background",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    toggleSVG: (state) => {
      state.svg = !state.svg;
    },
  },
});

export const { toggleSVG } = backgroundSlice.actions;

export const isSVG = (state: RootState) => state.background.svg;

export default backgroundSlice.reducer;
