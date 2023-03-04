import { getAuth } from "firebase/auth";
import { addDoc, collection, DocumentData, serverTimestamp } from "firebase/firestore";
import { FormEvent, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../app/hooks";
import { fireStore } from "../../../firebase-config";
import { selectUserData } from "../../Auth/userSlice";
import { ChatRoomsContent } from "../Chat";
import ChatRoom from "../ChatRoom/ChatRoom";
import classes from "./ChatRooms.module.css";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";

const ChatRooms = (props: { rooms: ChatRoomsContent[]; closeRoom: Function; hideRooms: Function }) => {
  const textRef = useRef<HTMLElement>(null);
  const userData = useAppSelector(selectUserData);

  const rooms = props.rooms;

  // Local state
  const [activeRoom, setActiveRoom] = useState<ChatRoomsContent>(rooms[0]);
  const [roomTabs, setRoomTabs] = useState<ChatRoomsContent[]>([]);

  useEffect(() => {
    let activeRoomId = "";
    const currentTabs = rooms
      .filter((room) => room.isOpened)
      .map((room) => {
        if (room.active) activeRoomId = room.roomId;
        room.tabClass = `${classes.tab} ${room.active ? classes.activeTab : ""}`;
        return room;
      });
    setRoomTabs(currentTabs);
    changeRoom(activeRoomId);
  }, [rooms]);

  const changeRoom = (roomId: string) => {
    const activateRoom = rooms.filter((room) => room.roomId == roomId)[0];
    setActiveRoom(activateRoom);
    setRoomTabs((prev) => {
      const updatedClass = [...prev].map((tab) => {
        tab.tabClass = `${classes.tab} ${tab.roomId === roomId ? classes.activeTab : ""}`;
        return tab;
      });
      return updatedClass;
    });
  };

  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }

  return (
    <div className={classes.chatRooms}>
      <button type="button" className={classes.goBackBtn} onClick={() => props.hideRooms()}>
        <CloseSVG />
      </button>
      <div className={classes.tabs}>
        {roomTabs.length > 0 &&
          roomTabs.map((room) => {
            return (
              <button key={room.roomId} type="button" className={room.tabClass} onClick={() => changeRoom(room.roomId)}>
                <p className={classes.btnText}>{room.otherUserNames}</p>
              </button>
            );
          })}
      </div>
      <div>{activeRoom && <ChatRoom key={activeRoom.roomId} room={activeRoom} closeRoom={props.closeRoom} />}</div>
    </div>
  );

  // '<div class="spacing"><div class="pic"></div></div>' +
  // '<div class="message"></div>' +
  // '<div class="name"></div>' +
};

export default ChatRooms;
