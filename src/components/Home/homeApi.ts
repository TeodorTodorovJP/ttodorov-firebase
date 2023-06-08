import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore"
import { apiSlice } from "../../app/apiSlice"
import { getError } from "../../app/utils"
import { fireStore } from "../../firebase-config"

interface NoResult {}

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHomeData: builder.query<NoResult, any>({
      queryFn: async (args, { signal, dispatch, getState }, extraOptions, baseQuery) => {
        try {
          const homeDataRef = doc(fireStore, "homePage", "main")
          const homeData = await getDoc(homeDataRef)

          return { data: { data: homeData, error: null } }
        } catch (err: any) {
          return { data: { data: [], error: getError(err) } }
        }
      },
    }),
  }),
  //
  //
  //
  //
})

export const { useGetHomeDataQuery } = extendedApi
