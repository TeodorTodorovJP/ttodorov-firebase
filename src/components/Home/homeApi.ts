import { collection, doc, getDoc, onSnapshot, query, setDoc } from "firebase/firestore"
import { apiSlice } from "../../app/apiSlice"
import { getError } from "../../app/utils"
import { fireStore } from "../../firebase-config"
import { UserData } from "../Auth/userSlice"

export interface Data {
  email: string
  linkedIn: string
  phone: string
  repo: string
  profilePicStored: string
}

interface HomeData {
  data: Data | null
  error: any | null
} // UserData

export const extendedApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHomeData: builder.query<HomeData, any>({
      queryFn: async (args, { signal, dispatch, getState }, extraOptions, baseQuery) => {
        try {
          // ttodorov.jp@gmail.com
          const homeDataRef = doc(fireStore, "pages", "home")
          const homeDataResponse = await getDoc(homeDataRef)
          const homeData = homeDataResponse.data() as Data

          if (homeData) {
            return { data: { data: homeData, error: null } }
          } else {
            return { data: { data: null, error: null } }
          }
        } catch (err: any) {
          return { data: { data: null, error: getError(err) } }
        }
      },
    }),
    //                            ResultType            QueryArg
    //                                  v                 v
    updateHomeData: builder.mutation<HomeData, { homeData: HomeData }>({
      // inferred as the type from the `QueryArg` type
      //                 v
      queryFn: async (args) => {
        try {
          // Gets a reference to the users
          const homeRef = doc(fireStore, "pages", "home")
          // Set's the user data
          // Currently if someone tempers with it, can mess with the data
          await setDoc(homeRef, args.homeData.data)
        } catch (err: any) {
          return { data: { data: null, error: getError(err) } }
        }
        // data is always returned because of queryFn requirements
        return { data: { data: null, error: null } }
      },
    }),
    //
    //
  }),
})

export const { useGetHomeDataQuery, useUpdateHomeDataMutation } = extendedApi
