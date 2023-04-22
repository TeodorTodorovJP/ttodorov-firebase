import { memo, ReactElement, useEffect, useState } from "react";
import classes from "./ChatUsers.module.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import ChatUser from "./ChatUser";
import useError from "../../CustomHooks/useError";
import { setModal } from "../../Navigation/navigationSlice";
import { useGetUserDataQuery } from "../../Auth/userApi";
import { selectUserData } from "../../Auth/userSlice";

const ChatUsers = () => {
  const [chatUsersElements, setChatUsersElements] = useState<JSX.Element[]>()
  const [usersError, setUsersError] = useError()
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector(selectUserData)

  const uselessParam: void = undefined
  const { data: chatUsers, isSuccess, isError, error } = useGetUserDataQuery(uselessParam, { refetchOnReconnect: true })

  useEffect(() => {
    if (((isError && error) || (chatUsers && chatUsers.error)) && !usersError) {
      setUsersError([isError, error, chatUsers], "ambiguousSource")
    }
  }, [isError, error, chatUsers])

  useEffect(() => {
    if (usersError) {
      dispatch(setModal({ message: usersError }))
    }
  }, [usersError])

  useEffect(() => {
    if (chatUsers) {
      const chatUsersEl = chatUsers.data
        .filter((user) => user.id !== currentUser.id)
        .map((user) => {
          return <ChatUser key={user.id} currentUser={currentUser} otherUser={user} />
        })

      setChatUsersElements(chatUsersEl)
    }
  }, [chatUsers])

  return <div className={classes.chatUsers}>{chatUsersElements}</div>
}

export default memo(ChatUsers);
