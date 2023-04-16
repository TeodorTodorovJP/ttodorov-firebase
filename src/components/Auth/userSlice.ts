import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { setModal } from "../Navigation/navigationSlice";
import { Langs } from "../Navigation/NavigationTexts";
import { defaultTheme, MainThemes, setTheme } from "../Navigation/themeSlice";

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

export interface Preferences {
  theme?: MainThemes;
  lang?: keyof Langs;
}

export interface UserState {
  userData: UserData;
  images: Image[];
  preferences: Preferences;
}

export const defaultLang: keyof Langs = "en";

const getMainInitialState = () => {
  const newState: UserState = {
    userData: { id: "", names: "", profilePic: "" },
    images: [],
    preferences: {
      theme: defaultTheme,
      lang: defaultLang,
    },
  };
  return newState;
};
const initialState = getMainInitialState();

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    setUserPreferences: (state, action: PayloadAction<Preferences>) => {
      const setPreferences = { ...state.preferences, ...action.payload };
      state.preferences = setPreferences;
    },
    clearUserData: (state) => getMainInitialState(),
    addImageBlobUrl: (state, action: PayloadAction<{ imageUrl: string; blobUrl: string }>) => {
      state.images.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setTheme, (state, action) => {
      state.preferences.theme = action.payload.main;
    });
  },
});

export const { setUserData, clearUserData, addImageBlobUrl, setUserPreferences } = userSlice.actions;

export const selectUserData = (state: RootState) => state.user.userData;
export const selectUserPreferences = (state: RootState) => state.user.preferences;
export const userHasData = (state: RootState) => state.user.userData.id.length > 1;
export const selectImageBlobUrl = (state: RootState) => (imageUrl: string) =>
  state.user.images.filter((i) => i.imageUrl === imageUrl);

export const saveLangToLocalStorage = (): AppThunk => (dispatch, getState) => {
  const preferences = selectUserPreferences(getState());
  if (preferences.lang) localStorage.setItem("lang", preferences.lang);
};

export default userSlice.reducer;
