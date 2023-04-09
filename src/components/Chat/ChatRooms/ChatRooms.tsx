import { FormEvent, memo, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData } from "../../Auth/userSlice";
import ChatRoom from "../ChatRoom/ChatRoom";
import classes from "./ChatRooms.module.css";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";
import { ChatRoomsContent, selectShowRooms, selectUserRooms, setShowRooms } from "../chatSlice";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import GenerateProfilePic from "../../UI/generateImages/GenerateProfilePic";
import { selectTheme } from "../../Navigation/navigationSlice";
import { ReactComponent as ChatSVG } from "../../Navigation/icons/chat.svg";

const ChatRooms = () => {
  const dispatch = useAppDispatch();

  const textRef = useRef<HTMLElement>(null);
  const userData = useAppSelector(selectUserData);
  const rooms = useAppSelector(selectUserRooms);
  const theme = useAppSelector(selectTheme);
  const showRooms = useAppSelector(selectShowRooms);

  // console.log("ChatRooms");

  // Local state
  const [activeRoom, setActiveRoom] = useState<ChatRoomsContent>(rooms[0]);
  const [roomTabs, setRoomTabs] = useState<ChatRoomsContent[]>([]);
  const [showTabs, setShowTabs] = useState(false);

  useEffect(() => {
    let activeRoomId = "";
    const currentTabs = rooms
      .filter((room) => room.isOpened)
      .map((currentRoom) => {
        let room = { ...currentRoom };
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
      const updatedClass = [...prev].map((currentTab) => {
        let tab = { ...currentTab };
        tab.tabClass = `${classes.tab} ${tab.roomId === roomId ? theme.decoration : ""}`;
        return tab;
      });
      return updatedClass;
    });
  };

  const handleHideRooms = () => {
    dispatch(setShowRooms({ showRooms: false }));
  };

  // if (props.imageUrl) {
  //     content = <img src={props.imageUrl + "&" + new Date().getTime()} alt="Girl in a jacket" width="500" height="600"/>
  // }

  // useEffect(() => {
  //   let image;
  //   if (profilePic) {
  //     image = (
  //       <img
  //         className={classes.image}
  //         onError={({ currentTarget }) => {
  //           currentTarget.onerror = null; // prevents looping
  //           setProfileImage(<AccountSVG />);
  //         }}
  //         src={profilePic}
  //       ></img>
  //     );
  //   } else {
  //     image = <AccountSVG />;
  //   }
  //   setProfileImage(image);
  // }, []);

  const toggleTabs = () => {
    setShowTabs(!showTabs);
  };

  return (
    <div className={classes.chatRooms}>
      <button type="button" className={classes.goBackBtn} onClick={() => handleHideRooms()}>
        <CloseSVG />
      </button>

      <div className={`${classes.tabs}`}>
        <div className={`${classes.tabToggle} ${theme.svg}`} onClick={() => toggleTabs()}>
          <ChatSVG />
        </div>
        {roomTabs.length > 0 &&
          roomTabs.map((room) => {
            return (
              <div
                key={room.roomId}
                className={`${room.tabClass} ${showTabs ? classes.showTabs : ""}`}
                onClick={() => changeRoom(room.roomId)}
              >
                <GenerateProfilePic names={room.otherUserNames} />
              </div>
            );
          })}
      </div>
      <div>{activeRoom && <ChatRoom key={activeRoom.roomId} room={activeRoom} />}</div>
    </div>
  );

  // '<div class="spacing"><div class="pic"></div></div>' +
  // '<div class="message"></div>' +
  // '<div class="name"></div>' +
};

export default memo(ChatRooms);
