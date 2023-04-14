import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../app/store";

export interface UserData {
  id: string;
  names: string;
  timestamp?: string;
  email?: string;
  profilePic?: string;
  profilePicStored?: string;
}

export interface Image {
  imageUrl: string;
  blobUrl: string;
}

export interface UserState {
  userData: UserData;
  images: Image[];
}

const initialState: UserState = {
  userData: { id: "", names: "", profilePic: "" },
  images: [],
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
      state.images = initialState.images;
    },
    addImageBlobUrl: (state, action: PayloadAction<{ imageUrl: string; blobUrl: string }>) => {
      state.images.push(action.payload);
    },
  },
});

export const { setUserData, clearUserData, addImageBlobUrl } = userSlice.actions;

export const selectUserData = (state: RootState) => state.user.userData;
export const userHasData = (state: RootState) => state.user.userData.id.length > 1;
export const selectImageBlobUrl = (state: RootState) => (imageUrl: string) =>
  state.user.images.filter((i) => i.imageUrl === imageUrl);

export default userSlice.reducer;
