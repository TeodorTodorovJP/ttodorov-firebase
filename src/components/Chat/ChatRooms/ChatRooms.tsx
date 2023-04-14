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

  // if ((profilePicStored && !imageData) || (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)) {
  //   const foundImage = images(profilePicStored)[0];
  //   if (foundImage) setImageData(foundImage);
  // }

  // useEffect(() => {
  //   let revoke: Function | null;
  //   if (
  //     (profilePicStored && !imageData) ||
  //     (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)
  //   ) {
  //     const getData = async () => {
  //       const { blobUrl, revokeUrl } = await getBlobUrl(profilePicStored);
  //       revoke = revokeUrl;
  //       dispatch(addImageBlobUrl({ imageUrl: profilePicStored, blobUrl }));
  //     };
  //     getData();
  //   }
  //   return () => (revoke ? revoke(profilePicStored) : null);
  // }, [profilePicStored, imageData]);

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
                {room.otherUserImage ? (
                  <img className={classes.profileImage} src={room.otherUserImage} alt="image can't load" />
                ) : (
                  <GenerateProfilePic names={room.otherUserNames} />
                )}
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
