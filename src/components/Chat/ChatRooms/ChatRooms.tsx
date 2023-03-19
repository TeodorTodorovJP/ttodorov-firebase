import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  DocumentData,
  serverTimestamp,
  query,
  where,
  FirestoreError,
  QuerySnapshot,
} from "firebase/firestore";
import { FormEvent, memo, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fireStore } from "../../../firebase-config";
import { selectUserData } from "../../Auth/userSlice";
import ChatRoom from "../ChatRoom/ChatRoom";
import classes from "./ChatRooms.module.css";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";
import {
  ChatRoomsContent,
  selectShowRooms,
  selectUserRooms,
  setShowRooms,
  setUserRooms,
  UserRoomsArr,
} from "../chatSlice";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import GenerateProfilePic from "../../UI/generateImages/GenerateProfilePic";
import { selectTheme } from "../../Navigation/navigationSlice";
import { ReactComponent as ChatSVG } from "../../Navigation/icons/chat.svg";

type Error = FirestoreError | undefined;
type Snapshot = QuerySnapshot<DocumentData> | undefined;

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

  //////////////////////////////////
  // const roomsCollectionQuery = query(collection(fireStore, "allChatRooms"), where("creator", "==", userData.id));

  // const [usersRooms, loadingRooms, errorRooms, usersRoomsSnapshot] = useCollectionData(roomsCollectionQuery) as [
  //   UserRoomsArr,
  //   boolean,
  //   Error,
  //   Snapshot
  // ];

  // if (errorRooms) {
  //   console.log(errorRooms);
  // }

  // Optimize to update only new rooms and not set a new array every time

  // useEffect(() => {
  //   console.log("usersRooms");
  //   if (usersRoomsSnapshot) {
  //     let prepareRooms: ChatRoomsContent[] = [];

  //     // This will trigger when a new room is added
  //     usersRoomsSnapshot.docChanges().forEach((change) => {
  //       // types: "added", "modified", "removed"
  //       const changeData = change.doc.data();
  //       console.log("type:", change.type);

  //       console.log("changeData:", changeData);

  //       let prepareRoomData: ChatRoomsContent;

  //       if (change.type === "added") {
  //         // This case is useless if you need timestamp and you don't want to do the same work twice
  //         // The "added" case comes with timestamp of null
  //         // Right after that a "modified" change comes with the timestamp
  //         if (!changeData.timestamp) return;
  //       }
  //       if (change.type === "modified") {
  //         prepareRoomData = {
  //           creator: changeData.creator,
  //           roomId: changeData.roomId,
  //           timestamp: JSON.stringify(changeData.timestamp),
  //           otherUserNames: changeData.otherUserNames,
  //           otherUserId: changeData.otherUserId,
  //           isOpened: true,
  //           active: true,
  //           tabClass: "",
  //         };
  //         prepareRooms.push(prepareRoomData);
  //         //console.log("Modified room: ", change.doc.data());
  //       }
  //     });
  //     console.log("usersRooms:", prepareRooms);

  //     dispatch(setUserRooms(prepareRooms));
  //   }
  // }, [usersRoomsSnapshot]);
  //////////////////////////////////

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
