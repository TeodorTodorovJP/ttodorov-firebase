import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store"
import { Langs } from "./notesTexts"
import { onlyUnique } from "../../app/utils"

/** Set's the default language of the app. */
export const defaultLang: keyof Langs = "en"

export type NoteData = {
  userId: string
  id: string
  title: string
  markdown: string
  tags: string[]
}

export interface NotesState {
  notes: NoteData[]
  tags: string[]
}

const initialTagValue = "New Tag"

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
  reducers: {
    /**
     * Adds all new tags.
     * @param {string[]} action.payload
     */
    addTags: (state, action: PayloadAction<string[]>) => {
      let allTags = [...state.tags, ...action.payload]
      state.tags = allTags.filter(onlyUnique)
    },

    /**
     * Adds all tags.
     * @param {string[]} action.payload
     */
    setTags: (state, action: PayloadAction<string[]>) => {
      state.tags = action.payload
    },

    /**
     * Deletes a tag.
     * @param {string} action.payload.tag
     */
    deleteTag: (state, action: PayloadAction<{ tag: string }>) => {
      state.tags.filter((tag) => tag === action.payload.tag)
    },

    /**
     * Adds a single note.
     * @param {NoteData} action.payload
     */
    addNote: (state, action: PayloadAction<NoteData>) => {
      state.notes.push(action.payload)
    },

    /**
     * Adds all notes.
     * @param {NoteData[]} action.payload
     */
    setNotes: (state, action: PayloadAction<NoteData[]>) => {
      state.notes = action.payload
    },

    /**
     * Deletes a note.
     * @param {string} action.payload.id
     */
    deleteNote: (state, action: PayloadAction<{ id: string }>) => {
      state.notes.filter((note) => note.id === action.payload.id)
    },

    /** Reset's the notes state to the initial values. */
    clearNotesData: (state) => getMainInitialState(),
  },
})

export const { addNote, setNotes, addTags, setTags, clearNotesData, deleteNote, deleteTag } = notesSlice.actions

export const selectNote = (state: RootState, id: string) => state.notes.notes.filter((note) => note.id === id)
export const selectNotes = (state: RootState) => state.notes.notes
export const selectTags = (state: RootState) => (state.notes.tags.length === 0 ? [initialTagValue] : state.notes.tags)

export default notesSlice.reducer
