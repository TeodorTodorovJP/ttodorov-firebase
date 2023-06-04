import { memo, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import ChatRoom from "../ChatRoom/ChatRoom"
import classes from "./ChatRooms.module.css"
import { ReactComponent as CloseSVG } from "../closeSVG.svg"
import { ChatRoomsContent, selectUserRooms, setShowRooms } from "../chatSlice"
import GenerateProfilePic from "../../UI/generateImages/GenerateProfilePic"
import { ReactComponent as ChatSVG } from "../../Navigation/icons/chat.svg"
import { selectTheme } from "../../Navigation/themeSlice"

/**
 * ChatRooms component provides functionality to manage multiple chat rooms. It maintains
 * the state of active room and unread messages for each room.
 *
 * State:
 * - activeRoom: Keeps track of currently active room.
 * - roomTabs: Maintains a list of rooms that are currently opened.
 * - showTabs: A boolean flag to show/hide the tabs.
 * - unreadMessages: An object that keeps track of unread messages in each room.
 *
 * Methods:
 * - changeRoom(roomId: string): Changes the active room to the specified roomId.
 * - listenForMessages(activeRoomId: string): Listens for new messages in each chat room and updates
 *   the count of unread messages for that room if it is not the active room.
 * - handleHideRooms(): Dispatches an action to hide all chat rooms.
 * - toggleTabs(): Toggles the visibility of the tabs for each chat room.
 *
 * Effects:
 * - Updates the roomTabs and activeRoom whenever 'rooms' state changes.
 *
 * Returns:
 * - A JSX element representing multiple chat rooms with unread messages count.
 */

const ChatRooms = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const rooms = useAppSelector(selectUserRooms)
  const theme = useAppSelector(selectTheme)

  /** Local state */
  const [activeRoom, setActiveRoom] = useState<string>(rooms[0].roomId)
  const [roomTabs, setRoomTabs] = useState<ChatRoomsContent[]>([])
  const [showTabs, setShowTabs] = useState(false)

  interface UnreadRoomMessages {
    [key: string]: number
  }
  const [unreadMessages, setUnreadMessages] = useState<UnreadRoomMessages>({})

  /**
   * Listen's for room changes and update's the tabs and the styling.
   */
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

  /**
   * Changes the active room to the specified roomId.
   */
  const changeRoom = (roomId: string) => {
    // Set's the active room to roomId
    setActiveRoom(roomId)

    // Removes the unread messages for that room.
    setUnreadMessages((prev) => {
      const newObj = { ...prev }
      delete newObj[roomId]
      return newObj
    })

    // Updates's the styling
    setRoomTabs((prev) => {
      const updatedClass = [...prev].map((currentTab) => {
        let tab = { ...currentTab }
        tab.tabClass = `${classes.tab} ${tab.roomId === roomId ? theme.decoration : ""}`
        return tab
      })
      return updatedClass
    })
  }

  /**
   * Listens for new messages in each chat room and updates the count of unread messages for
   * that room if it is not the active room.
   * @param {string} activeRoomId - a string representing the ID of the currently active chat room.
   * @returns The function `listenForMessages` returns another function that takes two arguments:
   * `roomId` and `numberOfNewMessages`.
   */
  const listenForMessages = (activeRoomId: string) => {
    return (roomId: string, numberOfNewMessages: number) => {
      if (roomId !== activeRoomId) {
        setUnreadMessages((prev) => {
          const newObj = { ...prev }
          if (newObj[roomId]) {
            // If we have messages for that room.

            // Add the new messages to the old
            newObj[roomId] = newObj[roomId] + numberOfNewMessages
          } else {
            newObj[roomId] = numberOfNewMessages
          }
          return newObj
        })
      }
    }
  }

  /**
   * Hides all chat rooms, but doesn't close them.
   */
  const handleHideRooms = () => {
    dispatch(setShowRooms({ showRooms: false }))
  }

  /**
   * Shows and hides the tabs for each chat room.
   */
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
}

export default memo(ChatRooms)
