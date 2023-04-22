import Card from "../UI/Card";
import classes from "./Chat.module.css";
import { Langs, langs } from "./ChatTexts";
import { getAuth } from "firebase/auth";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectUserData } from "../Auth/userSlice";
import { selectShowRooms, selectUserRooms } from "./chatSlice";
import ChatRooms from "./ChatRooms/ChatRooms";
import ChatUsers from "./ChatUsers/ChatUsers";
import { useGetUserDataQuery } from "../Auth/userApi";
import useError from "../CustomHooks/useError";
import { setModal } from "../Navigation/navigationSlice";
import { useEffect } from "react";

const Chat = () => {
  // Store
  const { id: userId } = useAppSelector(selectUserData);
  const dispatch = useAppDispatch();
  const rooms = useAppSelector(selectUserRooms);
  const showRooms = useAppSelector(selectShowRooms);
  const [usersError, setUsersError] = useError();

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

  const uselessParam: void = undefined;
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
  } = useGetUserDataQuery(uselessParam, { refetchOnReconnect: true });

  useEffect(() => {
    if (((isError && error) || (chatUsers && chatUsers.error)) && !usersError) {
      setUsersError([isError, error, chatUsers], "ambiguousSource");
    }
  }, [isError, error, chatUsers]);

  useEffect(() => {
    if (usersError) {
      dispatch(setModal({ message: usersError }));
    }
  }, [usersError]);

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
};

export default Chat;
