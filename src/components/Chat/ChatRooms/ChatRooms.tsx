import { memo, useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import ChatRoom from "../ChatRoom/ChatRoom"
import { ChatRoomsContent, selectUserRooms, setShowRooms } from "../chatSlice"
import GenerateProfilePic from "../../UI/generateImages/GenerateProfilePic"
import { Avatar, Badge, Box, Button, List, ListItem, ListItemAvatar, Paper } from "@mui/material"
import { selectUserPreferences } from "../../Auth/userSlice"
import { langs, Langs } from "../chatTexts"

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
  const { lang: currentLang } = useAppSelector(selectUserPreferences)

  /** Local state */
  const [activeRoom, setActiveRoom] = useState<string>(rooms[0].roomId)
  const [roomTabs, setRoomTabs] = useState<ChatRoomsContent[]>([])
  const [showTabs, setShowTabs] = useState(false)

  /** Access all text translations */
  const { main } = langs[currentLang as keyof Langs]

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <Paper
        variant="elevation"
        elevation={10}
        sx={{
          // The general sizing of the chat rooms
          maxWidth: { xs: "96vw", md: "40vw" },
          minWidth: { xs: "96vw", md: "40vw" },
          maxHeight: { xs: "88vh", md: "70vh" },
          minHeight: { xs: "88vh", md: "70vh" },

          display: "flex",
          flexDirection: "column",
          position: "relative",
          top: "1vh",
          marginLeft: "2vw",
          zIndex: "1",
        }}
      >
        <Button variant="contained" type="button" onClick={() => handleHideRooms()}>
          {main.closeChats}
        </Button>

        {rooms &&
          rooms.map((room) => {
            const setDisplay = room.roomId === activeRoom ? "block" : "none"
            return (
              <Box key={room.roomId} style={{ display: setDisplay }}>
                <ChatRoom key={room.roomId} room={room} notifyForMessages={listenForMessages(activeRoom)} />
              </Box>
            )
          })}
      </Paper>

      <Box>
        <List
          dense
          sx={{
            borderColor: "primary",
            width: "100%",
            maxWidth: 360,
            position: "relative",
            zIndex: "2",
            top: "15vh",
            right: { xs: "50px", md: "30px" },
            overflow: "auto",
            "& ul": { padding: 0 },
            "::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {roomTabs.length > 0 &&
            roomTabs.map((room) => {
              return (
                <ListItem dense key={room.roomId} onClick={() => changeRoom(room.roomId)}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "top", horizontal: "left" }}
                    color="error"
                    badgeContent={unreadMessages[room.roomId] && unreadMessages[room.roomId]}
                  >
                    <ListItemAvatar sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      {room.otherUserImage ? (
                        <Avatar src={room.otherUserImage} alt="image can't load" />
                      ) : (
                        <GenerateProfilePic names={room.otherUserNames} />
                      )}
                    </ListItemAvatar>
                  </Badge>
                </ListItem>
              )
            })}
        </List>
      </Box>
    </Box>
  )
}

export default memo(ChatRooms)
