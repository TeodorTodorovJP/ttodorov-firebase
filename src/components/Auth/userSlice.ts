import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface UserData {
  id: string;
  names: string;
  email?: string;
  profilePic?: string;
}

export interface UserState {
  userData: UserData;
}

const initialState: UserState = {
  userData: { id: "", names: "", profilePic: "" },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    clearUserData: (state) => {
      state.userData = initialState.userData;
    },
  },
});

export const { setUserData, clearUserData } = userSlice.actions;

export const selectUserData = (state: RootState) => state.user.userData;
export const userHasData = (state: RootState) => state.user.userData.id.length > 1;

export default userSlice.reducer;
