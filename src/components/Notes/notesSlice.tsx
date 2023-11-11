import { createAsyncThunk, createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit"
import { RootState, AppThunk, AppDispatch } from "../../app/store"
import { Langs } from "./notesTexts"
import { v4 as uuid } from "uuid"

/** Set's the default language of the app. */
export const defaultLang: keyof Langs = "en"

export type NoteData = {
  userId: string
  id: string
  title: string
  markdown: string
  tags: Tag[]
}

export type Tag = {
  id: string
  title: string
}

export interface NotesState {
  notes: NoteData[]
  tags: Tag[]
}

const initialTagValue = { id: uuid(), title: "New Tag" }

const getMainInitialState = () => {
  const newState: NotesState = {
    notes: [],
    tags: [],
  }
  return newState
}

const initialState = getMainInitialState()

export const notesSlice = createSlice({
  name: "notes",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    addTags: (state, action: PayloadAction<Tag[]>) => {
      //state.notes = [ ...state.notes,  action.payload.noteData]
      state.tags = [...state.tags, ...action.payload]
    },

    setTags: (state, action: PayloadAction<Tag[]>) => {
      //state.notes = [ ...state.notes,  action.payload.noteData]
      // Provide an initial tag for each user.
      // if (action.payload.length < 1) {
      //   state.tags = [{ id: "initial", title: "New" }]
      // } else {
      state.tags = action.payload
      //}
    },
    addNote: (state, action: PayloadAction<NoteData>) => {
      //state.notes = [ ...state.notes,  action.payload.noteData]
      state.notes.push(action.payload)
    },

    deleteNote: (state, action: PayloadAction<{ id: string }>) => {
      //state.notes = [ ...state.notes,  action.payload.noteData]
      state.notes.filter((note) => note.id === action.payload.id)
    },

    setNotes: (state, action: PayloadAction<NoteData[]>) => {
      //state.notes = [ ...state.notes,  action.payload.noteData]
      // Provide an initial tag for each user.
      // if (action.payload.length < 1) {
      //   state.notes = [
      //     {
      //       id: "initial",
      //       title: "New Note",
      //       userId: "initial",
      //       markdown: "Text",
      //       tags: [initialTagValue],
      //     },
      //   ]
      // } else {
      state.notes = action.payload
      //}
    },

    /** Reset's the navigation state to the initial values. */
    clearNotesData: (state) => getMainInitialState(),
  },
})

export const { addNote, setNotes, addTags, setTags, clearNotesData, deleteNote } = notesSlice.actions

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectNote = (state: RootState, id: string) => state.notes.notes.filter((note) => note.id === id)
export const selectNotes = (state: RootState) => state.notes.notes
export const selectTags = (state: RootState) => (state.notes.tags.length === 0 ? [initialTagValue] : state.notes.tags)

export default notesSlice.reducer
