import classes from "./Profile.module.css";
import Card from "../UI/Card";
import { selectUserData, selectUserPreferences, setUserData } from "../Auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ReactElement, useEffect, useRef, useState } from "react";
import { ReactComponent as AccountSVG } from "../UI/SVG/account.svg"
import { ReactComponent as ImageSVG } from "../UI/SVG/imageSVG.svg";
import { useOnlineStatus } from "../CustomHooks/useOnlineStatus";
import { getAuth } from "firebase/auth";
import { langs, Langs } from "./profileTexts"
import { useSaveImageMutation } from "../Chat/chatApi"
import useError from "../CustomHooks/useError"
import { useUpdateUserDataMutation } from "../Auth/userApi"
import { addImageBlobUrl, Image, selectImageBlobUrl } from "../Auth/userSlice"
import { getBlobUrl } from "../../app/utils"
import { selectTheme } from "../Navigation/themeSlice"
import { setModal } from "../Modal/modalSlice"

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
  const theme = useAppSelector(selectTheme)
  const { lang: currentLang } = useAppSelector(selectUserPreferences)

  /** Custom hooks */
  const { isOnline } = useOnlineStatus()
  const [saveImagesError, setSaveImagesError] = useError()
  const [updateUserError, setUpdateUserError] = useError()

  /** Local state */
  const [imageData, setImageData] = useState<Image | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const { id: userId, names, email, profilePic, profilePicStored } = userData

  /** Update User Data in firebase. */
  const [
    updateUserDataDb,
    { data: dataUpdatedUser, isLoading: sendingUpdateUser, isError: isErrorUpdateUser, error: errorUpdateUser },
  ] = useUpdateUserDataMutation()

  /**
   * For useUpdateUserDataMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorUpdateUser && errorUpdateUser) || (dataUpdatedUser && dataUpdatedUser.error)) && !updateUserError) {
      setUpdateUserError([isErrorUpdateUser, errorUpdateUser, dataUpdatedUser], "ambiguousSource")
    }
  }, [isErrorUpdateUser, errorUpdateUser, dataUpdatedUser])

  /**
   * For useUpdateUserDataMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (updateUserError) dispatch(setModal({ message: updateUserError }))
  }, [updateUserError])

  /** Save image to firebase */
  const [
    saveImageToDB,
    { data: dataSaveImg, isLoading: sendingSaveImg, isError: isErrorSaveImg, error: errorSaveImg },
  ] = useSaveImageMutation()

  /**
   * For useSaveImageMutation
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isErrorSaveImg && errorSaveImg) || (dataSaveImg && dataSaveImg.error)) && !saveImagesError) {
      setSaveImagesError([isErrorSaveImg, errorSaveImg, dataSaveImg], "ambiguousSource")
    }
  }, [isErrorSaveImg, errorSaveImg, dataSaveImg])

  /**
   * For useSaveImageMutation
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (saveImagesError) dispatch(setModal({ message: saveImagesError }))
  }, [saveImagesError])

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

  /** Prepare text formatting. */
  let idRow = `User id: ${userId}`
  let namesRow = `User names: ${names}`
  let emailRow = `User email: ${email ? email : "No email"}`

  let profileImage: ReactElement = <p>No image</p>

  /** Get the texts. */
  const { main } = langs[currentLang as keyof Langs]

  /**
   * Add size to the google image link.
   * Not needed because of the blob image storage functionality.
   * */
  function addSizeToGoogleProfilePic(url: string) {
    if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
      return url + "?sz=200"
    }
    return url
  }

  if (imageData) {
    profileImage = <img src={imageData.blobUrl} alt="image can't load" />
  } else if (profilePic) {
    profileImage = <img src={profilePic} alt="image can't load"></img>
  } else {
    profileImage = <AccountSVG />
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
      dispatch(setModal({ message: main.onlyImages }))
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
          dispatch(setModal({ message: res.error }))
        }
      })
  }

  return (
    <Card additionalClass="profile">
      <div className={classes.profile}>
        <h1>Profile page</h1>
        <div className={classes.data}>
          <div className={classes.leftSide}>
            <p>{idRow}</p>
            <p>{namesRow}</p>
            <p>{emailRow}</p>
          </div>
          <div className={`${classes.rightSide} ${theme.svg}`}>
            {profileImage}
            <input
              type="file"
              style={{ display: "none" }}
              ref={imageInputRef}
              onChange={(e) => handleSaveImageBtn(e)}
            />
            {
              <div className={classes.uploadImage}>
                <button
                  id="submitImage"
                  onClick={() => triggerInput()}
                  className={`${classes.saveImageBtn} hover`}
                  disabled={!isOnline}
                >
                  <ImageSVG />
                </button>
                <p>Upload Image</p>
              </div>
            }
          </div>
        </div>
      </div>
    </Card>
  )
}

export default Profile;
