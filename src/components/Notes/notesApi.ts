import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore"
import { apiSlice } from "../../app/apiSlice"
import { getDateDataInUTC, getError } from "../../app/utils"
import { fireStore } from "../../firebase-config"
import { UserData } from "../Auth/userSlice"
import { addNote, NoteData, Tag } from "./notesSlice"

interface NoResult {}

interface UpdateTags {
  data: Tag | null
  error: any | null
}

interface AddNote {
  noteData: NoteData | null
  error: any | null
}

interface GetUsers {
  data: UserData[]
  error: any
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Updating the user data
     * @param {UserData} userData
     * @returns data as null and error. Error can be null or error object
     *
     */
    //                            ResultType            QueryArg
    //                                  v                 v
    addTag: builder.mutation<UpdateTags, { tagData: Tag }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (
        args,
        { signal, dispatch, getState, abort, endpoint, extra, type, forced },
        extraOptions,
        baseQuery
      ) => {
        try {
          // Gets a reference to the users
          const userRef = doc(fireStore, "users", args.tagData.id)
          // Set's the user data
          // Currently if someone tempers with it, can mess with the data
          await setDoc(userRef, args.tagData)
        } catch (err: any) {
          return { data: { data: null, error: getError(err) } }
        }
        // data is always returned because of queryFn requirements
        return { data: { data: null, error: null } }
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
          const notesRef = doc(fireStore, "notes", noteData.id)

          await setDoc(notesRef, noteData)

          // update store with data
          dispatch(addNote(noteData))

          // invalidate cache for other queries
        } catch (err: any) {
          console.log("err: ", err)
          // update store with err
        }

        // Don't return the data here and pass it through the store
        return { data: {} }
      },
    }),
    //
    //
  }),
})

export const { useAddTagMutation, useAddNoteMutation } = extendedApi
