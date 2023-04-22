import { FormEvent, memo, ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectUserData } from "../../Auth/userSlice";
import ChatRoom from "../ChatRoom/ChatRoom";
import classes from "./ChatRooms.module.css";
import { ReactComponent as CloseSVG } from "../closeSVG.svg";
import { ChatRoomsContent, selectShowRooms, selectUserRooms, setShowRooms } from "../chatSlice";
import { ReactComponent as AccountSVG } from "../../UI/SVG/account.svg";
import GenerateProfilePic from "../../UI/generateImages/GenerateProfilePic";
import { ReactComponent as ChatSVG } from "../../Navigation/icons/chat.svg";
import { selectTheme } from "../../Navigation/themeSlice";

const ChatRooms = () => {
  const dispatch = useAppDispatch();

  const textRef = useRef<HTMLElement>(null);
  const userData = useAppSelector(selectUserData);
  const rooms = useAppSelector(selectUserRooms);
  const theme = useAppSelector(selectTheme);
  const showRooms = useAppSelector(selectShowRooms);

  // console.log("ChatRooms");

  // Local state
  const [activeRoom, setActiveRoom] = useState<string>(rooms[0].roomId)
  const [roomTabs, setRoomTabs] = useState<ChatRoomsContent[]>([])
  const [showTabs, setShowTabs] = useState(false)

  interface UnreadRoomMessages {
    [key: string]: number
  }
  const [unreadMessages, setUnreadMessages] = useState<UnreadRoomMessages>({})

  useEffect(() => {
    let activeRoomId = ""
    const currentTabs = rooms
      .filter((room) => room.isOpened)
      .map((currentRoom) => {
        let room = { ...currentRoom }
        if (room.active) activeRoomId = room.roomId
        room.tabClass = `${classes.tab} ${room.active ? classes.activeTab : ""}`
        return room
      })
    setRoomTabs(currentTabs)
    changeRoom(activeRoomId)
  }, [rooms])

  const changeRoom = (roomId: string) => {
    // const activateRoom = rooms.filter((room) => room.roomId == roomId)[0];
    setActiveRoom(roomId)
    setUnreadMessages((prev) => {
      const newObj = { ...prev }
      delete newObj[roomId]
      return newObj
    })
    setRoomTabs((prev) => {
      const updatedClass = [...prev].map((currentTab) => {
        let tab = { ...currentTab }
        tab.tabClass = `${classes.tab} ${tab.roomId === roomId ? theme.decoration : ""}`
        return tab
      })
      return updatedClass
    })
  }

  const listenForMessages = (activeRoomId: string) => {
    return (roomId: string, numberOfNewMessages: number) => {
      if (roomId !== activeRoomId) {
        setUnreadMessages((prev) => {
          const newObj = { ...prev }
          if (newObj[roomId]) {
            newObj[roomId] = newObj[roomId] + numberOfNewMessages
          } else {
            newObj[roomId] = numberOfNewMessages
          }
          return newObj
        })
      }
    }
  }

  const handleHideRooms = () => {
    dispatch(setShowRooms({ showRooms: false }))
  }

  const toggleTabs = () => {
    setShowTabs(!showTabs)
  }

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
                {unreadMessages[room.roomId] && <div className={classes.notif}>{unreadMessages[room.roomId]}</div>}
              </div>
            )
          })}
      </div>
      {rooms &&
        rooms.map((room) => {
          const setOpacity = room.roomId === activeRoom ? "100" : "0"
          return (
            <div key={room.roomId} style={{ opacity: setOpacity }}>
              <ChatRoom key={room.roomId} room={room} notifyForMessages={listenForMessages(activeRoom)} />
            </div>
          )
        })}
    </div>
  )
};

export default memo(ChatRooms);
