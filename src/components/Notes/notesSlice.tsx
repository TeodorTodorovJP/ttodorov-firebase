import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit"
import { RootState, AppThunk, AppDispatch } from "../../app/store"
import { Langs } from "./notesTexts"

/** Set's the default language of the app. */
export const defaultLang: keyof Langs = "en"

/**
 * For handling all menu states.
 */
interface IsOpen {
  navLeftVisible: boolean
  navRightVisible: boolean
  showThemes: boolean
}

/** Initially all menu's a closed. */
const initialIsOpen: IsOpen = { navLeftVisible: false, navRightVisible: false, showThemes: false }

export interface NotesState {
  status: "idle" | "loading" | "failed"
  isOpen: IsOpen
}
const getMainInitialState = () => {
  const newState: NotesState = {
    status: "idle",
    isOpen: initialIsOpen,
  }
  return newState
}

const initialState = getMainInitialState()

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    /** Opens a menu, passed to the item param. */
    setIsOpenToTrue: (state, action: PayloadAction<{ item: string; isOpen: boolean }>) => {
      const newIsOpen: IsOpen = { ...state.isOpen }

      newIsOpen[action.payload.item as keyof IsOpen] = action.payload.isOpen
      state.isOpen = newIsOpen
    },

    /** Closes all menus. */
    setAllOpenToFalse: (state) => {
      state.isOpen = initialIsOpen
    },

    /** Reset's the navigation state to the initial values. */
    clearNotesData: (state) => getMainInitialState(),
  },
})

export const { setAllOpenToFalse, setIsOpenToTrue, clearNotesData } = notesSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectIsOpen = (state: RootState) => state.notes.isOpen

export default notesSlice.reducer
