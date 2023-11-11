import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore"
import { apiSlice } from "../../app/apiSlice"
import { fireStore } from "../../firebase-config"
import { UserData } from "../Auth/userSlice"
import { setModal } from "../Modal/modalSlice"
import { addNote, addTags, deleteNote, NoteData, setNotes, setTags, Tag } from "./notesSlice"

interface NoResult {}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Updating the user data
     * @param {UserData} userData
     * @returns data as null and error. Error can be null or error object
     *
     */
    //                       ResultType       QueryArg
    //                           v             v
    addTags: builder.mutation<NoResult, { userId: string; tagData: Tag[] }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (args, { dispatch }) => {
        try {
          const collectionRef = collection(fireStore, "notes", args.userId, "tags")

          // await addDoc(collectionRef, args.tagData[0])

          args.tagData.forEach(async (tag) => {
            await addDoc(collectionRef, tag)
          })

          // update store with data
          dispatch(addTags(args.tagData))
        } catch (err: any) {
          dispatch(setModal({ modalType: "error", message: err.message }))
        }
        // data is always returned because of queryFn requirements
        return { data: {} }
      },
    }),
    //
    //
    deleteTag: builder.mutation<NoResult, { tagId: string; userId: string }>({
      invalidatesTags: ["NotesTags"],
      queryFn: async (args, { dispatch }) => {
        try {
          const recentMessagesQuery = query(
            collection(fireStore, "notes", args.userId, "tags"),
            where("id", "==", args.tagId)
          )
          const querySnapshot = await getDocs(recentMessagesQuery)

          querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            deleteDoc(doc.ref)
          })
        } catch (err: any) {
          dispatch(setModal({ modalType: "error", message: err.message }))
        }
        return { data: {} }
      },
    }),
    //
    //
    getTags: builder.query<NoResult, string>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      providesTags: ["NotesTags"],
      queryFn: async (userId: string, { dispatch }) => {
        try {
          // Gets a reference to the users
          const querySnapshot = await getDocs(collection(fireStore, "notes", userId, "tags"))
          const tagData = [] as Tag[]

          querySnapshot.forEach((doc) => {
            const newDoc = doc.data() as Tag
            tagData.push(newDoc)
          })
          // update store with data
          dispatch(setTags(tagData))

          // invalidate cache for other queries
        } catch (err: any) {
          dispatch(setModal({ modalType: "error", message: err.message }))
        }

        return { data: {} }
      },
    }),
    //
    //
    addNote: builder.mutation<NoResult, NoteData>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: async (noteData: NoteData, { dispatch }) => {
        try {
          // Gets a reference to the users
          await addDoc(collection(fireStore, "notes", noteData.userId, "notes"), noteData)

          // update store with data
          dispatch(addNote(noteData))

          // invalidate cache for other queries
        } catch (err: any) {
          dispatch(setModal({ modalType: "error", message: err.message }))
        }

        return { data: {} }
      },
    }),
    //
    //
    changeNote: builder.mutation<NoResult, NoteData>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: async (noteData: NoteData, { dispatch }) => {
        try {
          const noteRef = doc(fireStore, "notes", noteData.userId, "notes", noteData.id)

          // Update note data
          await updateDoc(noteRef, noteData)

          // invalidate cache for other queries
        } catch (err: any) {
          dispatch(setModal({ modalType: "error", message: err.message }))
        }

        return { data: {} }
      },
    }),
    //
    //
    getNotes: builder.query<NoResult, string>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      providesTags: ["Notes"],
      queryFn: async (userId: string, { dispatch }) => {
        try {
          // Gets a reference to the users
          const querySnapshot = await getDocs(collection(fireStore, "notes", userId, "notes"))
          const noteData = [] as NoteData[]

          querySnapshot.forEach((doc) => {
            const newDoc = doc.data() as NoteData
            noteData.push(newDoc)
          })

          // update store with data
          dispatch(setNotes(noteData))

          // invalidate cache for other queries
        } catch (err: any) {
          dispatch(setModal({ modalType: "error", message: err.message }))
        }

        return { data: {} }
      },
    }),
    //
    //
    deleteNote: builder.mutation<NoResult, { noteId: string; userId: string }>({
      invalidatesTags: ["Notes"],
      queryFn: async (args, { dispatch }) => {
        try {
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
          dispatch(setModal({ modalType: "error", message: err.message }))
        }
        return { data: {} }
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
} = extendedApi
