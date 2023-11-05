import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit"
import { RootState, AppThunk, AppDispatch } from "../../app/store"
import { getDateDataInUTC } from "../../app/utils"
import { Langs } from "./notesTexts"

/** Set's the default language of the app. */
export const defaultLang: keyof Langs = "en"

export type NoteData = {
  id: string
  title: string
  markdown: string
  tags: Tag[]
}

export type Tag = {
  id: string
  label: string
}

export interface NotesState {
  notes: NoteData[]
}

const getMainInitialState = () => {
  const newState: NotesState = {
    notes: [],
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
    addNote: (state, action: PayloadAction<NoteData>) => {
      const { formattedDate: timestamp } = getDateDataInUTC()
      action.payload.id = timestamp

      //state.notes = [ ...state.notes,  action.payload.noteData]
      state.notes.push(action.payload)
    },

    /** Reset's the navigation state to the initial values. */
    clearNotesData: (state) => getMainInitialState(),
  },
})

export const { addNote, clearNotesData } = notesSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectNote = (state: RootState, id: string) => state.notes.notes.filter((note) => note.id === id)
export const selectNotes = (state: RootState) => state.notes.notes

export default notesSlice.reducer
