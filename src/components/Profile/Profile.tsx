import { selectUserData, selectUserPreferences, setUserData } from "../Auth/userSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { ReactElement, useEffect, useRef, useState } from "react"
import { useOnlineStatus } from "../CustomHooks/useOnlineStatus"
import { getAuth } from "firebase/auth"
import { langs, Langs } from "./profileTexts"
import { useSaveImageMutation } from "../Chat/chatApi"
import { useUpdateUserDataMutation } from "../Auth/userApi"
import { addImageBlobUrl, Image, selectImageBlobUrl } from "../Auth/userSlice"
import { getBlobUrl } from "../../app/utils"
import { setModal } from "../Modal/modalSlice"
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto"
import { AccountCircle } from "@mui/icons-material"
import {
  Avatar,
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from "@mui/material"
import { BackGround } from "../UI/BackGround"

/**
 * Profile Component
 *
 * The Profile component is a component dedicated to managing and displaying
 * user profile information. It allows the user to upload a profile image, and handles
 * error and loading states for the update user and save image actions. It retrieves
 * user data, theme, and image blob URLs from the Redux store, and also makes use of the
 * useOnlineStatus and useError custom hooks.
 *
 * Props - The component does not accept any props.
 *
 * State - The component's local state:
 * - imageData: Stores image data which includes the blobUrl of the image.
 *
 * Custom Hooks - The following custom hooks are used in this component:
 * - useAppDispatch: Used to dispatch actions to the Redux store.
 * - useAppSelector: Used to select and return specific values from the Redux store.
 * - useOnlineStatus: Used to monitor if the user is online.
 * - useError: Used to handle and track errors in the component.
 * - useUpdateUserDataMutation: Used to handle updating the user data in firebase.
 * - useSaveImageMutation: Used to handle saving the user's image to firebase.
 *
 * Functions - The following functions are used in this component:
 * - triggerInput: Triggers an input event for uploading an image file.
 * - handleSaveImageBtn: Handles the event when the user uploads an image, saves it to the database, and updates the user data.
 * - addSizeToGoogleProfilePic: Adds size to the Google profile picture URL.
 * - isUserSignedIn: Checks if a user is signed in by verifying the existence of a current user object.
 *
 * Use - This component is used to display user profile information, allow image upload for the user's profile picture,
 * and handle the loading and error states for the related actions.
 */
export const Profile = () => {
  /** Access store */
  const dispatch = useAppDispatch()
  const userData = useAppSelector(selectUserData)
  const images = useAppSelector(selectImageBlobUrl)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)

  /** Custom hooks */
  const { isOnline } = useOnlineStatus()

  /** Local state */
  const [imageData, setImageData] = useState<Image | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { id: userId, names, email, profilePic, profilePicStored } = userData

  /** Update User Data in firebase. */
  const [updateUserDataDb] = useUpdateUserDataMutation()

  /** Save image to firebase */
  const [saveImageToDB] = useSaveImageMutation()

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

  let profileImage: ReactElement = <p>No image</p>

  /** Get the texts. */
  const { main } = langs[currentLang as keyof Langs]

  const imageSide = { xs: "100px", md: "300px" }
  const imageSizes = { width: imageSide, height: imageSide }

  if (imageData) {
    profileImage = <Avatar alt="Your Image" src={imageData.blobUrl} sx={imageSizes} />
  } else if (profilePic) {
    profileImage = <Avatar alt="Your Image" src={profilePic} sx={imageSizes} />
  } else {
    profileImage = <AccountCircle />
  }

  /**
   * Checks if a user is signed in by verifying the existence of a current user object.
   */
  const isUserSignedIn = () => !!getAuth().currentUser

  /**
   * When the "Upload Image" is clicked it trigger's an input event for a element.
   * That element is a hidden input field that triggers upload file.
   */
  const triggerInput = () => {
    if (imageInputRef) {
      imageInputRef.current?.click()
    }
  }

  /**
   * When the upload is initiated by the user and an image is uploaded, save it to db.
   */
  const handleSaveImageBtn = async (event: React.FormEvent<HTMLInputElement>) => {
    if (!isUserSignedIn || !event.currentTarget.files) {
      return
    }
    const file = event.currentTarget.files[0]

    // Check if the file is an image.
    if (!file.type.match("image.*")) {
      dispatch(setModal({ text: main.onlyImages }))
      return
    }
    //imageName: string; roomId: string; file: File
    saveImageToDB({ userId, file: file })
      .unwrap()
      .then((res) => {
        if (res.data) {
          // change the profileImage
          const sendData = { ...userData, profilePicStored: res.data.imageUrl }
          updateUserDataDb({ userData: sendData })
          // Update the store
          // The user data is not made to use the cached store data
          dispatch(setUserData(sendData))
        } else if (res.error) {
          dispatch(setModal({ text: res.error }))
        }
      })
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BackGround sx={{ top: "10vh" }} />

      <Typography variant="h3" sx={{ marginTop: "64px" }}>
        {main.header}
      </Typography>
      <Paper
        variant="elevation"
        elevation={10}
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          marginTop: "5vh",
          maxWidth: "100vw",
          minWidth: "100vw",
          gap: "30px",
          padding: "40px",
        }}
      >
        <TableContainer
          component={Paper}
          sx={{ minWidth: { xs: "auto", md: "500px" }, maxWidth: { xs: "auto", md: "500px" } }}
        >
          <Table sx={{ minWidth: "100%", maxWidth: "100%" }} size="small" aria-label="a dense table">
            <TableBody>
              <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell sx={{ minWidth: "84px" }} align="left">
                  {main.userId}
                </TableCell>
                <TableCell align="left">{userId}</TableCell>
              </TableRow>
              <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell sx={{ minWidth: "84px" }} align="left">
                  {main.userNames}
                </TableCell>
                <TableCell align="left">{names}</TableCell>
              </TableRow>
              <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                <TableCell sx={{ minWidth: "84px" }} align="left">
                  {main.userEmail}
                </TableCell>
                <TableCell align="left">{email ? email : "No email"}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {profileImage}

          <input type="file" style={{ display: "none" }} ref={imageInputRef} onChange={(e) => handleSaveImageBtn(e)} />
          <IconButton
            id="submitImage"
            onClick={() => triggerInput()}
            disabled={!isOnline}
            type="button"
            edge="start"
            color="inherit"
            aria-label="send image"
            sx={{
              transform: { xs: "scale(2)", md: "scale(3)" },
              fontSize: "large",
              padding: "0",
              margin: "30px",
            }}
          >
            <InsertPhotoIcon color="primary" />
          </IconButton>
          <Typography sx={{ textAlign: "center" }}>{main.uploadImage}</Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Profile
