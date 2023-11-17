import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore"
import { apiSlice } from "../../app/apiSlice"
import { fireStore } from "../../firebase-config"
import { setModal } from "../Modal/modalSlice"
import { addNote, addTags, NoteData, setNotes, setTags } from "./notesSlice"

interface DefaultQueryFnType {
  data: any
  error: any
}

/**
 * Firebase requires each collection document, to have a key and value.
 * The Autocomplete can work with that, but at the cost of being a controlled component
 * which makes the code much more complex.
 * This is why this type is needed.
 * The only difference is that the tags are an array of objects, not array of strings.
 */
interface NoteDataForFirebase {
  userId: string
  id: string
  title: string
  markdown: string
  tags: TagForFirebase[]
}

interface TagForFirebase {
  tag: string
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Sending new tags to the DB
     * @param {string} userId
     * @param {string[]} tagData
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    //                       ResultType           QueryArg
    //                           v                   v
    addTags: builder.mutation<DefaultQueryFnType, { userId: string; tagData: string[] }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (args, { dispatch }) => {
        try {
          /** Access a reference to the user's tags. */
          const collectionRef = collection(fireStore, "notes", args.userId, "tags")

          /** For each new tag, call addDoc to store the tag. */
          args.tagData.forEach(async (tag) => {
            const fireBaseObj: TagForFirebase = { tag: tag }
            await addDoc(collectionRef, fireBaseObj)
          })

          // Update the store with all new tags.
          dispatch(addTags(args.tagData))
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: args.tagData, error: err.message } }
        }
        // data is always returned because of queryFn requirements
        return { data: { data: args.tagData, error: null } }
      },
    }),
    //
    //
    /**
     * Delete a tag.
     * @param {string} tag
     * @param {string} userId
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    deleteTag: builder.mutation<DefaultQueryFnType, { tag: string; userId: string }>({
      invalidatesTags: ["NotesTags"],
      queryFn: async (args, { dispatch }) => {
        try {
          /**
           * Access a reference to the user's tags and filter them,
           * to receive only the document of the tag that you want to delete.
           */
          const allTags = query(collection(fireStore, "notes", args.userId, "tags"), where("tag", "==", args.tag))
          /** Get the document. */
          const querySnapshot = await getDocs(allTags)

          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            deleteDoc(doc.ref)
          })

          /** Here an update to the store is not required, because of 'invalidatesTags' which will trigger getTags. */
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: args.tag, error: err.message } }
        }
        return { data: { data: args.tag, error: null } }
      },
    }),
    //
    //
    /**
     * Get all tags of the current user.
     * @param {string} userId
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    getTags: builder.query<DefaultQueryFnType, string>({
      providesTags: ["NotesTags"],
      queryFn: async (userId: string, { dispatch }) => {
        const tagData = [] as string[]
        try {
          /** Access a reference to the user's tags. */
          const querySnapshot = await getDocs(collection(fireStore, "notes", userId, "tags"))

          /** Convert all tag objects to tag strings. */
          querySnapshot.forEach((doc) => {
            const newDoc = doc.data() as TagForFirebase
            tagData.push(newDoc.tag)
          })
          // update store with data
          dispatch(setTags(tagData))
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: tagData, error: err.message } }
        }

        return { data: { data: tagData, error: null } }
      },
    }),
    //
    //
    /**
     * Creates a new note.
     * @param {NoteData} noteData
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    addNote: builder.mutation<DefaultQueryFnType, NoteData>({
      queryFn: async (noteData: NoteData, { dispatch }) => {
        try {
          /** Access a reference to a user note that does not yet exist. */
          const noteRef = doc(fireStore, "notes", noteData.userId, "notes", noteData.id)
          /** Tries to access it, doesn't find it and creates a reference. */
          const noteSnap = await getDoc(noteRef)

          /** Confirms that the note is not existing yet. */
          if (!noteSnap.exists()) {
            /** Prepares data for Firebase */
            const sendNoteData: NoteDataForFirebase = {
              ...noteData,
              id: noteRef.id,
              tags: noteData.tags.map((tag) => ({ tag: tag })),
            }

            /** Creates the note by sending data to the new reference. */
            await setDoc(noteRef, sendNoteData)
          }

          // update store with data
          dispatch(addNote(noteData))
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: noteData, error: err.message } }
        }

        return { data: { data: noteData, error: null } }
      },
    }),
    //
    //
    /**
     * Update note data.
     * @param {NoteData} noteData
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    changeNote: builder.mutation<DefaultQueryFnType, NoteData>({
      invalidatesTags: ["Notes"],
      queryFn: async (noteData: NoteData, { dispatch }) => {
        try {
          /** Access a reference to the user note. */
          const noteRef = doc(fireStore, "notes", noteData.userId, "notes", noteData.id)
          /** Prepare data for Firebase */
          const sendNoteData: NoteDataForFirebase = {
            id: noteData.id,
            markdown: noteData.markdown,
            title: noteData.title,
            userId: noteData.userId,
            tags: noteData.tags.map((tag) => ({ tag: tag })),
          }
          /** Typescript has an weird issue here. It needs the data to be passed as {data: noteData}, it works fine for addNote */
          // @ts-ignore
          await updateDoc(noteRef, sendNoteData)

          /** Here an update to the store is not required, because of 'invalidatesTags' which will trigger getNotes. */
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: noteData, error: err.message } }
        }

        return { data: { data: noteData, error: null } }
      },
    }),
    //
    //
    /**
     * Get all notes for the current user.
     * @param {string} userId
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    getNotes: builder.query<DefaultQueryFnType, string>({
      providesTags: ["Notes"],
      queryFn: async (userId: string, { dispatch }) => {
        const noteData = [] as NoteData[]
        try {
          /** Access a reference to the users notes. */
          const querySnapshot = await getDocs(collection(fireStore, "notes", userId, "notes"))

          querySnapshot.forEach((doc) => {
            const newFirebaseDoc = doc.data() as NoteDataForFirebase

            // Firebase stores array values as objects {key: value}
            // So a conversion is required
            const newDoc: NoteData = {
              ...newFirebaseDoc,
              tags: newFirebaseDoc.tags.map((tagObj) => tagObj.tag),
            }

            noteData.push(newDoc)
          })

          // update store with data
          dispatch(setNotes(noteData))
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: noteData, error: err.message } }
        }

        return { data: { data: noteData, error: null } }
      },
    }),
    //
    //
    /**
     * Delete a note.
     * @param {string} noteId
     * @param {string} userId
     *
     * @returns data as null and error. Error can be null or a message.
     *
     */
    deleteNote: builder.mutation<DefaultQueryFnType, { noteId: string; userId: string }>({
      invalidatesTags: ["Notes"],
      queryFn: async (args, { dispatch }) => {
        try {
          /**
           * Access a reference to the user's notes and filter them,
           * to receive only the document of the note that you want to delete.
           */
          const recentMessagesQuery = query(
            collection(fireStore, "notes", args.userId, "notes"),
            where("id", "==", args.noteId)
          )
          const querySnapshot = await getDocs(recentMessagesQuery)

          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            deleteDoc(doc.ref)
          })
        } catch (err: any) {
          dispatch(setModal({ type: "error", text: err.message }))
          return { data: { data: args.noteId, error: err.message } }
        }
        return { data: { data: args.noteId, error: null } }
      },
    }),
    //
    //
  }),
})

export const {
  useAddTagsMutation,
  useAddNoteMutation,
  useGetNotesQuery,
  useGetTagsQuery,
  useDeleteNoteMutation,
  useDeleteTagMutation,
  useChangeNoteMutation,
} = extendedApi
