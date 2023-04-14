import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore";
import { apiSlice } from "../../app/apiSlice";
import { getDateDataInUTC, getError } from "../../app/utils";
import { fireStore } from "../../firebase-config";
import { UserData } from "../Auth/userSlice";

interface UpdateUserData {
  data: UserData | null;
  error: any | null;
}

interface AddUser {
  userData: UserData | null;
  error: any | null;
}

interface GetUsers {
  data: UserData[];
  error: any;
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //                            ResultType            QueryArg
    //                                  v                 v
    updateUserData: builder.mutation<UpdateUserData, { userData: UserData }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (args, { signal, dispatch, getState }, extraOptions, baseQuery) => {
        try {
          const userRef = doc(fireStore, "users", args.userData.id);
          await setDoc(userRef, args.userData);
        } catch (err: any) {
          return { data: { data: null, error: getError(err) } };
        }
        return { data: { data: null, error: null } };
      },
    }),
    //
    //
    addUserData: builder.mutation<AddUser, UserData>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: async (userData: UserData) => {
        try {
          const usersRef = doc(fireStore, "users", userData.id);
          const userSnap = await getDoc(usersRef);
          let user: UserData;
          // .exists() doesn't work as expected
          if (!userSnap.data()) {
            const { utcDate: timestamp } = getDateDataInUTC();
            await setDoc(usersRef, { timestamp, ...userData });
            user = { ...userData, timestamp };
          } else {
            user = userSnap.data() as UserData;
          }
          return { data: { userData: user, error: null } };
        } catch (err: any) {
          return { data: { userData: null, error: getError(err) } };
        }
      },
    }),
    //
    //
    getUserData: builder.query<GetUsers, void>({
      // The query is not relevant here as the data will be provided via streaming updates.
      // A queryFn returning an empty array is used, with contents being populated via
      // streaming updates below as they are received.
      queryFn: (uselessParam: void) => ({ data: { data: [], error: null } }),
      keepUnusedDataFor: 60 * 60 * 24, // one day
      async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        // create a websocket connection when the cache subscription starts

        // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`,
        // in which case `cacheDataLoaded` will throw
        await cacheDataLoaded;
        // when data is received from the socket connection to the server,
        // if it is a message and for the appropriate channel,
        // update our query result with the received message
        let unsubscribe;
        try {
          const usersCollectionQuery = query(collection(fireStore, "users"));
          unsubscribe = onSnapshot(usersCollectionQuery, (querySnapshot) => {
            try {
              let prepareUsers: UserData[] = [];
              // This will trigger when a new room is added
              querySnapshot.docChanges().forEach((change) => {
                // types: "added", "modified", "removed"
                const changeData = change.doc.data() as UserData;
                if (!changeData.timestamp) return;
                // Firebase may return their bad timestamp
                // changeData.timestamp = JSON.stringify(changeData.timestamp);
                prepareUsers.push(changeData);
              });
              updateCachedData((draft) => {
                draft.data = [...draft.data, ...prepareUsers];
                draft.error = null;
                return draft;
              });
            } catch (err: any) {
              updateCachedData((draft) => {
                draft.error = getError(err);
                return draft;
              });
            }
          });
        } catch (err: any) {
          updateCachedData((draft) => {
            draft.error = getError(err);
            return draft;
          });
        }
        // cacheEntryRemoved will resolve when the cache subscription is no longer active
        await cacheEntryRemoved;
        // perform cleanup steps once the `cacheEntryRemoved` promise resolves
        if (unsubscribe) {
          unsubscribe();
        }
      },
      // providesTags: (result, error, arg) =>
      //   result ? [...result.map(({ id }) => ({ type: "Users" as const, id })), "Users"] : ["Users"],
    }),
    //
    //
  }),
});

export const { useUpdateUserDataMutation, useAddUserDataMutation, useGetUserDataQuery } = extendedApi;
