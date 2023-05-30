import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../../app/store";
import { setModal } from "../Navigation/navigationSlice";
import { Langs } from "../Navigation/navigationTexts"
import { defaultTheme, MainThemes, setTheme } from "../Navigation/themeSlice"

export interface UserData {
  /** User Id - usually from Firebase.*/
  id: string

  /** The names - taken from the registration.*/
  names: string

  /** The email from the registration. */
  email: string

  /** The time of registration. */
  timestamp?: string

  /** The url of the registration image if it was available.*/
  profilePic?: string

  /** The url of the image that user chose to use. */
  profilePicStored?: string
}

export interface Image {
  /**
   * The url of the image.
   */
  imageUrl: string
  /**
   * The url pointing to the blob stored in browser memory.
   */
  blobUrl: string
}

export interface Preferences {
  /**
   * The current user theme.
   */
  theme?: MainThemes

  /**
   * The current user language.
   */
  lang?: keyof Langs
}

/**
 * The current user state.
 */
export interface UserState {
  /**
   * An object that contains all data about the current user.
   */
  userData: UserData

  /**
   * An array of objects, containing all urls of downloaded images by the user.
   */
  images: Image[]

  /**
   * An object with all user preferences.
   */
  preferences: Preferences
}

export const defaultLang: keyof Langs = "en"

const getMainInitialState = () => {
  const newState: UserState = {
    userData: { id: "", names: "", profilePic: "", email: "" },
    images: [],
    preferences: {
      theme: defaultTheme,
      lang: defaultLang,
    },
  }
  return newState
}
const initialState = getMainInitialState()

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload
    },
    setUserPreferences: (state, action: PayloadAction<Preferences>) => {
      const setPreferences = { ...state.preferences, ...action.payload }
      state.preferences = setPreferences
    },
    clearUserData: (state) => getMainInitialState(),
    addImageBlobUrl: (state, action: PayloadAction<{ imageUrl: string; blobUrl: string }>) => {
      state.images.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    /**
     * When the theme is set from the theme slice, update the user theme.
     */
    builder.addCase(setTheme, (state, action) => {
      state.preferences.theme = action.payload.main
    })
  },
})

export const { setUserData, clearUserData, addImageBlobUrl, setUserPreferences } = userSlice.actions;

export const selectUserData = (state: RootState) => state.user.userData;
export const selectUserPreferences = (state: RootState) => state.user.preferences;
export const userHasData = (state: RootState) => state.user.userData.id.length > 1;

/** Get's the stored link to the reference in the browser's memory. */
export const selectImageBlobUrl = (state: RootState) => (imageUrl: string) =>
  state.user.images.filter((i) => i.imageUrl === imageUrl);

export const saveLangToLocalStorage = (): AppThunk => (dispatch, getState) => {
  const preferences = selectUserPreferences(getState());
  if (preferences.lang) localStorage.setItem("lang", preferences.lang);
};

export default userSlice.reducer;
