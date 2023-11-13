import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { selectIsOpen, clearNavData } from "./navigationSlice"
import Logo from "../UI/SVG/logo.svg";
import useAuthContext from "../../app/auth-context";
import { langs, Langs } from "./navigationTexts"
import {
  clearUserData,
  saveLangToLocalStorage,
  selectUserData,
  selectUserPreferences,
  setUserPreferences,
} from "../Auth/userSlice"
import { getAuth, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { addImageBlobUrl, Image, selectImageBlobUrl } from "../Auth/userSlice"
import { getBlobUrl } from "../../app/utils"
import { clearChatData, selectInbox, setInbox } from "../Chat/chatSlice"
import { selectTheme, toggleTheme } from "./themeSlice"
import { useNavigate } from "react-router-dom"
import MenuIcon from "@mui/icons-material/Menu"
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Collapse,
  Container,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  Menu,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"
import { AccountCircle } from "@mui/icons-material"
import NotificationsIcon from "@mui/icons-material/Notifications"
import HomeRoundedIcon from "@mui/icons-material/HomeRounded"
import LoginIcon from "@mui/icons-material/Login"
import LogoutIcon from "@mui/icons-material/Logout"
import GTranslateIcon from "@mui/icons-material/GTranslate"
import ChatIcon from "@mui/icons-material/Chat"
import NoteAltIcon from "@mui/icons-material/NoteAlt"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import AccountTreeIcon from "@mui/icons-material/AccountTree"

// import "./Card.css";
// import mySvg from "./mySvg.svg";

/**
 * Navigation Component
 *
 * This component provides navigation functionalities to the application.
 *
 * Props - This component does not have props.
 *
 * State - short description of all state instances within the component
 * - imageData: Local state holding the image data.
 *
 * Custom Hooks - short description of all custom hooks within the component
 * - useAppDispatch: Hook from Redux toolkit to dispatch actions.
 * - useAppSelector: Hook from Redux toolkit to select values from the state.
 * - useNavigate: Hook from react-router to programmatically navigate between routes.
 * - useAuthContext: Custom hook to use authentication context.
 *
 * Functions - short description of all functions within the component
 * - logoutHandler: Logs out the user by clearing context, local storage, state, Firebase authentication, store data, and local image data.
 * - navLeftClickHandle: Toggles visibility of the left menu.
 * - navRightClickHandle: Toggles visibility of the right menu and hides the themes submenu.
 * - changeThemeHandle: Handles the change of theme based on the passed theme name.
 * - saveThemeHandle: Displays a modal with options to confirm or deny the save theme action.
 * - handleToggleTheme: Toggles visibility of the theme menu.
 * - handleToggleLanguage: Toggles the language between Bulgarian (bg) and English (en).
 * - handleNewMessageNotif: Redirects to the chat page and sets the userClickedNotif flag for all inbox messages.
 */
export const Navigation = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const { lang } = useAppSelector(selectUserPreferences)
  const { navLeftVisible, navRightVisible, showThemes } = useAppSelector(selectIsOpen)
  const { profilePic, profilePicStored } = useAppSelector(selectUserData)
  const inboxData = useAppSelector(selectInbox)
  const { value: storeTheme } = useAppSelector(selectTheme)
  const images = useAppSelector(selectImageBlobUrl)

  /** Access Router */
  const navigate = useNavigate()

  /** Local state */
  const [imageData, setImageData] = useState<Image | null>(null)

  const [anchorElMenuLeft, setAnchorElMenuLeft] = useState<null | HTMLElement>(null)
  const [anchorElMenuRight, setAnchorElMenuRight] = useState<null | HTMLElement>(null)

  /**
   * Prepare component data.
   */
  const { main, leftMenu } = langs[lang as keyof Langs]

  /** Access Context */
  const authCtx = useAuthContext()
  const { isLoggedIn, logout } = authCtx

  /**
   * If we have not stored the image, store it.
   */
  if ((profilePicStored && !imageData) || (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)) {
    const foundImage = images(profilePicStored)[0]
    if (foundImage) setImageData(foundImage)
  }

  /**
   * If the current user has an image but is not yet loaded or
   * use the user's image has changed, add the new image to the list.
   */
  useEffect(() => {
    let revoke: Function | null
    if (
      (profilePicStored && !imageData) ||
      (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)
    ) {
      const getData = async () => {
        const { blobUrl, revokeUrl } = await getBlobUrl(profilePicStored)
        revoke = revokeUrl
        dispatch(addImageBlobUrl({ imageUrl: profilePicStored, blobUrl }))
      }
      getData()
    }
    return () => (revoke ? revoke(profilePicStored) : null)
  }, [profilePicStored, imageData])

  /** Prepare all links for the left menu. */
  const navLeftItems = [
    { path: "/", text: leftMenu.home, icon: <HomeRoundedIcon color="primary" /> },
    { path: "auth", text: leftMenu.authenticate, icon: <LoginIcon color="primary" /> },
    { path: "chat", text: leftMenu.chat, icon: <ChatIcon color="primary" /> },
    { path: "notes", text: leftMenu.notes, icon: <NoteAltIcon color="primary" /> },
    { path: "projects", text: leftMenu.projects, icon: <AccountTreeIcon color="primary" /> },
    // { path: "meals/meal", text: "Your Single Meal", icon: <HamburgerMenu /> },
  ].map((link) => (
    <ListItemButton
      key={link.path}
      sx={{ pl: 4 }}
      onClick={() => {
        handleCloseNavMenuLeft()
        navigate(link.path)
      }}
    >
      <ListItemIcon>{link.icon}</ListItemIcon>
      <Typography>{link.text}</Typography>
    </ListItemButton>
  ))

  /**
   * Logout the user by clearing context, local storage, state, Firebase authentication,
   * store data, and local image data.
   */
  const logoutHandler = () => {
    // Context, local storage, state
    logout()
    // Firebase
    signOut(getAuth())
    // Store
    dispatch(clearUserData())
    dispatch(clearNavData())
    dispatch(clearChatData())
    // Clear local state
    setImageData(null)
  }

  /** Toggles the languages between bg and en. */
  const handleToggleLanguage = () => {
    const setLang = lang == "bg" ? "en" : "bg"
    dispatch(setUserPreferences({ lang: setLang }))
    dispatch(saveLangToLocalStorage())
  }

  const navRightItems = (
    <>
      {isLoggedIn && (
        <Tooltip title="Your Profile">
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => {
              navigate("profile")
            }}
          >
            <ListItemIcon>
              {imageData || profilePic ? (
                <Avatar
                  alt="Your Image"
                  sx={{ height: "24px", width: "24px" }}
                  src={imageData ? imageData.blobUrl : profilePic}
                />
              ) : (
                <AccountCircle color="primary" />
              )}
            </ListItemIcon>

            <Typography>{main.profile}</Typography>
          </ListItemButton>
        </Tooltip>
      )}
      {!isLoggedIn && (
        <Tooltip title="Login">
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => {
              navigate("auth")
            }}
          >
            <ListItemIcon>
              <LoginIcon color="primary" />
            </ListItemIcon>

            <Typography>{main.login}</Typography>
          </ListItemButton>
        </Tooltip>
      )}
      {isLoggedIn && (
        <Tooltip title="Logout">
          <ListItemButton
            sx={{ pl: 4 }}
            onClick={() => {
              logoutHandler()
              navigate("/")
            }}
          >
            <ListItemIcon>
              <LogoutIcon color="primary" />
            </ListItemIcon>
            <Typography>{main.logout}</Typography>
          </ListItemButton>
        </Tooltip>
      )}
    </>
  )

  /** Toggling the left menu. */
  const handleOpenNavMenuLeft = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenuLeft(event.currentTarget)
  }

  const handleCloseNavMenuLeft = () => {
    setAnchorElMenuLeft(null)
  }

  /** Toggling the right menu. */
  const handleOpenNavMenuRight = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElMenuRight(event.currentTarget)
  }

  const handleCloseNavMenuRight = () => {
    setAnchorElMenuRight(null)
  }

  const toggleThemeHandle = () => {
    dispatch(toggleTheme())
  }

  /**
   * If there are unread messages and the user is not in the chat page,
   * there will be a chat icon to notify the user.
   * When clicking it, it will lead to the chat page.
   */
  const handleNewMessageNotif = () => {
    if (inboxData) {
      const updatedInbox = Object.values(inboxData)
        .map((obj) => Object.values(obj))
        .flat()
        .map((message) => {
          return { ...message, userClickedNotif: true }
        })
      dispatch(setInbox({ inboxData: updatedInbox }))
    }
    navigate("/chat")
  }

  const isInChat = window.location.pathname === "/chat"

  const numberOfMessages = inboxData && !isInChat ? Object.keys(inboxData).length : null

  return (
    <AppBar sx={{ paddingRight: "0!important" }}>
      <Container sx={{ minWidth: "100vw" }}>
        <Toolbar sx={{ maxHeight: { xs: "64px", md: "110px" } }}>
          <IconButton
            type="button"
            onClick={handleOpenNavMenuLeft}
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            sx={{ mt: { xs: "60px", md: "65px" } }}
            id="menu-appbar-left"
            anchorEl={anchorElMenuLeft}
            anchorOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
            open={Boolean(anchorElMenuLeft)}
            onClose={handleCloseNavMenuLeft}
          >
            <Collapse in={Boolean(anchorElMenuLeft)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {navLeftItems}
              </List>
            </Collapse>
          </Menu>

          <Box
            component="img"
            src={Logo}
            alt="Logo"
            sx={{ maxWidth: { xs: 80, md: 100 } }}
            onClick={() => {
              navigate("/")
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: "flex", gap: "15px" }}>
            <IconButton sx={{ ml: 1 }} color="inherit" onClick={() => toggleThemeHandle()}>
              {storeTheme === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              onClick={() => handleToggleLanguage()}
              sx={{ display: { xs: "none", sm: "flex" } }}
            >
              <GTranslateIcon />
              <Typography sx={{ ml: "5px" }}>{lang == "bg" ? "EN" : "BG"}</Typography>
            </IconButton>

            <IconButton
              size="large"
              aria-label="show new notifications"
              color="inherit"
              onClick={() => handleNewMessageNotif()}
            >
              <Badge badgeContent={numberOfMessages} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Tooltip title="Your Menu">
              <IconButton onClick={handleOpenNavMenuRight} sx={{ p: 0 }}>
                {(imageData || profilePic) && (
                  <Avatar alt="Your Image" src={imageData ? imageData.blobUrl : profilePic} />
                )}
                {!(imageData || profilePic) && <AccountCircle />}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar-right"
              anchorEl={anchorElMenuRight}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElMenuRight)}
              onClose={handleCloseNavMenuRight}
            >
              <Collapse in={Boolean(anchorElMenuRight)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {isLoggedIn && (
                    <Tooltip title="Your Profile">
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => {
                          handleCloseNavMenuRight()
                          navigate("profile")
                        }}
                      >
                        <ListItemIcon>
                          {imageData || profilePic ? (
                            <Avatar
                              alt="Your Image"
                              sx={{ height: "24px", width: "24px" }}
                              src={imageData ? imageData.blobUrl : profilePic}
                            />
                          ) : (
                            <AccountCircle color="primary" />
                          )}
                        </ListItemIcon>

                        <Typography>{main.profile}</Typography>
                      </ListItemButton>
                    </Tooltip>
                  )}
                  {!isLoggedIn && (
                    <Tooltip title="Login">
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => {
                          handleCloseNavMenuRight()
                          navigate("auth")
                        }}
                      >
                        <ListItemIcon>
                          <LoginIcon color="primary" />
                        </ListItemIcon>

                        <Typography>{main.login}</Typography>
                      </ListItemButton>
                    </Tooltip>
                  )}
                  {isLoggedIn && (
                    <Tooltip title="Logout">
                      <ListItemButton
                        sx={{ pl: 4 }}
                        onClick={() => {
                          handleCloseNavMenuRight()
                          logoutHandler()
                          navigate("/")
                        }}
                      >
                        <ListItemIcon>
                          <LogoutIcon color="primary" />
                        </ListItemIcon>
                        <Typography>{main.logout}</Typography>
                      </ListItemButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Language" sx={{ display: { xs: "flex", sm: "none" } }}>
                    <ListItemButton
                      sx={{ pl: 4, display: { xs: "flex", sm: "none" } }}
                      onClick={() => handleToggleLanguage()}
                      aria-label="change language"
                    >
                      <ListItemIcon>
                        <GTranslateIcon color="primary" />
                      </ListItemIcon>
                      <Typography sx={{ ml: "5px" }}>{main.lang}</Typography>
                    </ListItemButton>
                  </Tooltip>
                </List>
              </Collapse>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navigation;
