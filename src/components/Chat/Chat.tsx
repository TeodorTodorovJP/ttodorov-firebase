import { useAppSelector } from "../../app/hooks"
import { selectShowRooms, selectUserRooms } from "./chatSlice"
import ChatRooms from "./ChatRooms/ChatRooms"
import ChatUsers from "./ChatUsers/ChatUsers"
import { useGetUserDataQuery } from "../Auth/userApi"
import { useEffect, useState } from "react"
import { Box, Drawer, IconButton, Typography } from "@mui/material"
import ChatIcon from "@mui/icons-material/Chat"

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
  const rooms = useAppSelector(selectUserRooms)
  const showRooms = useAppSelector(selectShowRooms)

  /** Hooks */
  const [viewUsers, setViewUsers] = useState<boolean>(false)

  /** Toggling the chat Users. */
  const toggleUsers = () => {
    setViewUsers(!viewUsers)
  }

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
    //isError, // When true, indicates that the query is in an error state.
    //error, // The error result if present.
    //isLoading: isLoadingUsers, // When true, indicates that the query is currently loading for the first time, and has no data yet. This will be true for the first request fired off, but not for subsequent requests.
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

  useEffect(() => {
    setViewUsers(!showRooms)
  }, [showRooms])

  const toggleViewUsersButton = viewUsers ? "none" : "inline-flex"

  const setOpacityForRooms = showRooms ? "100" : "0"

  const setDisplayForIntro = showRooms ? "none" : "flex"

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        // The general sizing of the chat page
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "100vw",
        minHeight: { xs: "90vh", md: "80vh" },
        top: { xs: "8vh", md: "initial" },
      }}
    >
      <Box
        sx={{
          opacity: setOpacityForRooms,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "auto",
        }}
      >
        {rooms && rooms.length > 0 && <ChatRooms />}
      </Box>

      <Box
        sx={{
          display: setDisplayForIntro,
          position: "absolute",
          width: "70vw",
          top: "20vh",
          left: 0,
          right: 0,
          margin: "auto",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: { xs: "26px", md: "30px" } }}>Welcome to my chat!</Typography>
        <Typography sx={{ fontSize: { xs: "18px", md: "30px", marginTop: "30px", textAlign: "center" } }}>
          Click the message icon {<ChatIcon color="primary" />} to select a user to chat with.
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <IconButton
          type="button"
          onClick={toggleUsers}
          edge="start"
          color="inherit"
          aria-label="open drawer"
          sx={{
            mr: 2,
            position: "fixed",
            right: 0,
            top: "10vh",
            display: toggleViewUsersButton,
            size: "large",
            transform: "scale(2)",
          }}
        >
          <ChatIcon color="primary" />
        </IconButton>

        <Drawer
          anchor="right"
          variant="persistent"
          open={viewUsers}
          onClose={toggleUsers}
          PaperProps={{
            elevation: 10,
            sx: {
              variant: "elevation",
              height: "fit-content",
              maxHeight: 474,
              display: "flex",
              justifyContent: "flex-end",
              top: "15vh",
              "::-webkit-scrollbar": {
                display: "none",
              },
            },
          }}
        >
          <IconButton
            type="button"
            onClick={toggleUsers}
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2, transform: "scale(1.8)" }}
          >
            <ChatIcon color="primary" />
          </IconButton>

          {isSuccess && !chatUsers.error && chatUsers.data.length > 0 ? <ChatUsers /> : <p>No Users</p>}
        </Drawer>
      </Box>
    </Box>
  )
}

export default Chat
