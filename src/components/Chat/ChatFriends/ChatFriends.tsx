import { memo, ReactElement, useEffect, useState } from "react";
import classes from "./ChatFriends.module.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectFriends } from "../chatSlice";
import ChatFriend from "./ChatFriend";
import { useGetFriendsQuery } from "../chatApi";
import useError from "../../CustomHooks/useError";
import { setModal } from "../../Navigation/navigationSlice";

const ChatFriends = () => {
  // const friends = useAppSelector(selectFriends);
  const [chatFriendsElements, setChatFriendsElements] = useState<JSX.Element[]>();
  const [friendsError, setFriendsError] = useError();
  const dispatch = useAppDispatch();

  const uselessParam: void = undefined;
  const {
    data: chatFriends,
    isSuccess,
    isError,
    error,
  } = useGetFriendsQuery(uselessParam, { refetchOnReconnect: true });

  useEffect(() => {
    if (((isError && error) || (chatFriends && chatFriends.error)) && !friendsError) {
      setFriendsError([isError, error, chatFriends], "ambiguousSource");
    }
  }, [isError, error, chatFriends]);

  useEffect(() => {
    if (friendsError) {
      dispatch(setModal({ message: friendsError }));
    }
  }, [friendsError]);

  useEffect(() => {
    if (chatFriends) {
      const chatFriendsEl = chatFriends.data.map((friend) => {
        return <ChatFriend key={friend.id} otherUser={friend} />;
      });

      setChatFriendsElements(chatFriendsEl);
    }
  }, [chatFriends]);

  return <div className={classes.chatFriends}>{chatFriendsElements}</div>;
};

export default memo(ChatFriends);
