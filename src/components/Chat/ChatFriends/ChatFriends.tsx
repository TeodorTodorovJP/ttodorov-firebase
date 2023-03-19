import { memo, ReactElement, useEffect, useState } from "react";
import classes from "./ChatFriends.module.css";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectFriends } from "../chatSlice";
import ChatFriend from "./ChatFriend";

const ChatFriends = () => {
  const friends = useAppSelector(selectFriends);
  const [chatFriendsElements, setChatFriendsElements] = useState<JSX.Element[]>();
  useEffect(() => {
    const chatFriendsEl = friends.map((friend) => {
      return <ChatFriend key={friend.id} otherUser={friend} />;
    });

    setChatFriendsElements(chatFriendsEl);
  }, [friends]);

  return <div className={classes.chatFriends}>{chatFriendsElements}</div>;
};

export default memo(ChatFriends);
