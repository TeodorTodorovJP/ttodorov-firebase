import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore"
import { apiSlice } from "./app/apiSlice"
import { getDateDataInUTC, getError } from "./app/utils"
import { UserData } from "./components/Auth/userSlice"
import { fireStore } from "./firebase-config"

interface NoResult {}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //                   ResultType   QueryArg
    //                        v         v
    addLog: builder.mutation<NoResult, any>({
      queryFn: async (log: any) => {
        try {
          // Gets a reference to the logs
          const { utcDate: timestamp } = getDateDataInUTC()
          const usersRef = doc(fireStore, "logs", timestamp)
          await setDoc(usersRef, { timestamp, log })

          return { data: {} }
        } catch (err: any) {
          return { data: {} }
        }
      },
    }),
  }),
})

export const { useAddLogMutation } = extendedApi
