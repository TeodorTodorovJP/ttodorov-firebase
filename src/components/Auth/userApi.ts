import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore";
import { apiSlice } from "../../app/apiSlice";
import { getDateDataInUTC, getError } from "../../app/utils";
import { fireStore } from "../../firebase-config";
import { UserData } from "../Auth/userSlice";
import { setModal } from "../Modal/modalSlice"

interface UpdateUserData {
  data: UserData | null
  error: any | null
}

interface AddUser {
  userData: UserData | null
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
    updateUserData: builder.mutation<UpdateUserData, { userData: UserData }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (args, { dispatch }) => {
        try {
          // Gets a reference to the users
          const userRef = doc(fireStore, "users", args.userData.id)
          // Set's the user data
          // Currently if someone tempers with it, can mess with the data
          await setDoc(userRef, args.userData)
        } catch (err: any) {
          dispatch(setModal({ text: err.message }))
          return { data: { data: null, error: getError(err) } }
        }
        // data is always returned because of queryFn requirements
        return { data: { data: null, error: null } }
      },
    }),
    //
    //
    addUserData: builder.mutation<AddUser, UserData>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: async (userData: UserData, { dispatch }) => {
        try {
          // Gets a reference to the users
          const usersRef = doc(fireStore, "users", userData.id)
          const userSnap = await getDoc(usersRef)
          let user: UserData
          // Test if we have the user
          // .exists() doesn't work as expected
          if (!userSnap.data()) {
            // If we don't have the user, return the input data
            // Add the current time as timestamp
            const { utcDate: timestamp } = getDateDataInUTC()
            await setDoc(usersRef, { timestamp, ...userData })
            user = { ...userData, timestamp }
          } else {
            // If we have the user, return the existing data
            user = userSnap.data() as UserData
          }
          return { data: { userData: user, error: null } }
        } catch (err: any) {
          dispatch(setModal({ text: err.message }))
          return { data: { userData: null, error: getError(err) } }
        }
      },
    }),
    //
    //
    getUserData: builder.query<GetUsers, void>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      /**
       * The "uselessParam" exists because the query + queryFn + Typescript combination,
       * requires that the type of the second param of builder.query to match the type of the first param of queryFn.
       * @link https://redux-toolkit.js.org/rtk-query/usage-with-typescript#typing-query-and-mutation-endpoints
       */
      queryFn: (uselessParam: void) => ({ data: { data: [], error: null } }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      // Attaches a listener for any changes from the query, but we use it as a way to sustain a listener from the API
      // Otherwise the old Thunk may be used, but will cost the caching benefits
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }) {
        // create a websocket connection when the cache subscription starts

        // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
        // in which case `cacheDataLoaded` will throw
        await cacheDataLoaded
        // when data is received from the socket connection to the server
        let unsubscribe
        try {
          const usersCollectionQuery = query(collection(fireStore, "users"))
          unsubscribe = onSnapshot(usersCollectionQuery, (querySnapshot) => {
            try {
              let prepareUsers: UserData[] = []
              // This will trigger when a new user is added
              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as UserData
                if (!changeData.timestamp) return
                // Firebase may return their bad timestamp
                // changeData.timestamp = JSON.stringify(changeData.timestamp);
                prepareUsers.push(changeData)
              })
              updateCachedData((draft) => {
                draft.data = [...draft.data, ...prepareUsers]
                draft.error = null
                return draft
              })
            } catch (err: any) {
              dispatch(setModal({ text: err.message }))
              updateCachedData((draft) => {
                draft.error = getError(err)
                return draft
              })
            }
          })
        } catch (err: any) {
          dispatch(setModal({ text: err.message }))
          updateCachedData((draft) => {
            draft.error = getError(err)
            return draft
          })
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        if (unsubscribe) {
          unsubscribe()
        }
      },
      // providesTags: (result, error, arg) =>
      //   result ? [...result.map(({ id }) => ({ type: "Users" as const, id })), "Users"] : ["Users"],
    }),
    //
    //
  }),
})

export const { useUpdateUserDataMutation, useAddUserDataMutation, useGetUserDataQuery } = extendedApi;
