import Card from "../UI/Card";
import classes from "./Chat.module.css";
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectShowRooms, selectUserRooms } from "./chatSlice"
import ChatRooms from "./ChatRooms/ChatRooms"
import ChatUsers from "./ChatUsers/ChatUsers"
import { useGetUserDataQuery } from "../Auth/userApi"
import useError from "../CustomHooks/useError"
import { setModal } from "../Navigation/navigationSlice"
import { useEffect } from "react"

/**
 * Chat Component
 *
 * This component is responsible for displaying a chat interface. It manages the display of rooms and users, handling error conditions and managing data loading states.
 *
 * State: Description of state instances within the component:
 * - usersError: This state instance is responsible for keeping track of any user-related errors in the component.
 * - setOpacity: This state instance controls the opacity of the component based on whether the chat rooms are to be displayed.
 *
 * Custom Hooks: Description of custom hooks within the component:
 * - useAppDispatch: This custom hook provides dispatch function for Redux store.
 * - useAppSelector: This custom hook is used for selecting data from Redux store.
 * - useError: This custom hook manages errors within the component.
 * - useGetUserDataQuery: This custom hook is responsible for fetching user data.
 *
 * Functions: Description of functions within the component:
 * - setUsersError: This function is used to set user-related errors.
 * - dispatch: This function is used to dispatch actions to Redux store.
 * - useEffect (two instances): The first useEffect checks for errors from RTKQ and Firebase and sets them to state if present. The second useEffect displays a modal when an error is detected.
 */

export const Chat = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const rooms = useAppSelector(selectUserRooms)
  const showRooms = useAppSelector(selectShowRooms)

  /** Error hooks */
  const [usersError, setUsersError] = useError()

  /**
   * Left as an example.
   */
  // const { data, error, status } = useGetUserDataQuery(name, {
  //   skip: true, // if skip is true, it will skip loading the data, if set to false, it will load the data
  //   refetchOnMountOrArgChange: 30 // refetch the data every 30 seconds
  //   selectFromResult: ({ data, error, isLoading }) => ({ // filter the fetched data, or modify it
  //      data: data?.filter((item: Pokemon) => item.name.endsWith("saur")),
  //      error,
  //      isLoading
  //   }),
  //   pollingInterval: 1000 * 60,// each minute - if you need to check for a non listener result
  //   refetchOnFocus: true, // if the user hides then shows the window/app
  //   refetchOnReconnect: true,
  // });

  /**
   * Get the current user data.
   * */
  const uselessParam: void = undefined
  const {
    data: chatUsers, // The latest returned result regardless of hook arg, if present.
    isSuccess, // When true, indicates that the query has data from a successful request.
    isError, // When true, indicates that the query is in an error state.
    error, // The error result if present.
    isLoading: isLoadingUsers, // When true, indicates that the query is currently loading for the first time, and has no data yet. This will be true for the first request fired off, but not for subsequent requests.
    //currentData, // The latest returned result for the current hook arg, if present.
    //isFetching, // When true, indicates that the query is currently fetching, but might have data from an earlier request. This will be true for both the first request fired off, as well as subsequent requests.
    //isUninitialized, // When true, indicates that the query has not started yet.
    //refetch, // A function to force refetch the query
    //endpointName,
    //originalArgs, // the hook parameter
    //requestId, // unique id
    //fulfilledTimeStamp,
    //startedTimeStamp,
  } = useGetUserDataQuery(uselessParam, { refetchOnReconnect: true })

  /**
   * For useGetUserDataQuery
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isError && error) || (chatUsers && chatUsers.error)) && !usersError) {
      setUsersError([isError, error, chatUsers], "ambiguousSource")
    }
  }, [isError, error, chatUsers])

  /**
   * For useGetUserDataQuery
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (usersError) {
      dispatch(setModal({ message: usersError }))
    }
  }, [usersError])

  const setOpacity = showRooms ? "100" : "0"

  return (
    <div className={classes.chat}>
      <div style={{ opacity: setOpacity }}>
        {rooms && <Card additionalClass="chatRooms">{rooms.length > 0 ? <ChatRooms /> : <p>No rooms</p>}</Card>}
      </div>
      <Card additionalClass={`${showRooms ? "chatUsersHide" : "chatUsers"}`}>
        {isSuccess && !chatUsers.error && chatUsers.data.length > 0 ? <ChatUsers /> : <p>No Users</p>}
      </Card>
    </div>
  )
}

export default Chat;
