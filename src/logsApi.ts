import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore"
import { apiSlice } from "./app/apiSlice"
import { getDateDataInUTC, getError } from "./app/utils"
import { UserData } from "./components/Auth/userSlice"
import { fireStore } from "./firebase-config"

interface NoResult {}

interface LogData {
  timestamp: string
  log: any
}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    //                   ResultType   QueryArg
    //                        v         v
    addLog: builder.mutation<NoResult, any>({
      queryFn: async (log: any) => {
        try {
          // Gets a reference to the logs
          const { formattedDate: timestamp } = getDateDataInUTC()
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
