import { memo, ReactElement, useEffect, useState } from "react";
import classes from "./ChatUsers.module.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import ChatUser from "./ChatUser";
import useError from "../../CustomHooks/useError"
import { useGetUserDataQuery } from "../../Auth/userApi"
import { selectUserData } from "../../Auth/userSlice"
import { setModal } from "../../Modal/modalSlice"
import { Box, List, ListItem, ListItemText, ListSubheader, Paper } from "@mui/material"

/**
 * ChatUsers Component
 *
 * A component that fetches and displays a list of chat users, excluding the current user.
 * Each user is rendered as a `ChatUser` component.
 *
 * Props - No props for this component.
 *
 * State - short description of all state instances within the component
 * - chatUsersElements: Contains a list of JSX elements to render for each chat user.
 * - usersError: Contains the error message, if any, encountered when fetching user data.
 *
 * Custom Hooks - short description of all custom hooks within the component
 * - useAppDispatch: Returns the dispatch function from the Redux store.
 * - useAppSelector: Returns the current state value based on the selector provided.
 * - useGetUserDataQuery: Returns user data from a remote server and manages the loading and error states.
 * - useError: Provides state and setter function for error handling.
 *
 * Functions - short description of all functions within the component
 * - useEffect (1): Listens for errors from useGetUserDataQuery and sets usersError state when an error occurs.
 * - useEffect (2): Listens for changes in usersError and dispatches setModal to show an error message when an error occurs.
 * - useEffect (3): Filters out the current user from chatUsers, maps remaining users to ChatUser components, and stores these in the chatUsersElements state.
 */
export const ChatUsers = () => {
  const [chatUsersElements, setChatUsersElements] = useState<JSX.Element[]>()
  const [usersError, setUsersError] = useError()
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectUserData)

  /**
   * Get users from firebase.
   */
  const uselessParam: void = undefined
  const { data: chatUsers, isSuccess, isError, error } = useGetUserDataQuery(uselessParam, { refetchOnReconnect: true })

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

  /**
   * Updates the `chatUsersElements` state whenever the `chatUsers` state changes.
   * It filters out the current user from the list of chat users and maps over
   * the remaining users to create an array of `ChatUser` components with the appropriate props.
   * It then sets this array as the new value of the `chatUsersElements` state.
   * */
  useEffect(() => {
    if (chatUsers && currentUser.id !== "") {
      setChatUsersElements((prev) => {
        return chatUsers.data
          .filter((user) => user.id !== currentUser.id)
          .map((user) => {
            return <ChatUser key={user.id} currentUser={currentUser} otherUser={user} />
          })
      })
    }
  }, [chatUsers, currentUser])

  return (
    <List
      sx={{
        borderColor: "primary",
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        position: "relative",
        overflow: "auto",
        "& ul": { padding: 0 },
        "::-webkit-scrollbar": {
          display: "none",
        },
      }}
    >
      {chatUsersElements}
    </List>
  )
}

export default memo(ChatUsers);
