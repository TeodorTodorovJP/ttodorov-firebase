import classes from "./Profile.module.css";
import Card from "../UI/Card";
import { selectUserData, setUserData } from "../Auth/userSlice";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { ReactElement, useEffect, useRef, useState } from "react";
import { ReactComponent as AccountSVG } from "../UI/SVG/account.svg";
import { selectLang, selectTheme, setModal } from "../Navigation/navigationSlice";
import { ReactComponent as ImageSVG } from "../UI/SVG/imageSVG.svg";
import { useOnlineStatus } from "../CustomHooks/useOnlineStatus";
import { getAuth } from "firebase/auth";
import { langs, Langs } from "./ProfileTexts";
import { useSaveImageMutation } from "../Chat/chatApi";
import useError from "../CustomHooks/useError";
import { useUpdateUserDataMutation } from "../Auth/userApi";
import { addImageBlobUrl, Image, selectImageBlobUrl } from "../Auth/userSlice";
import { getBlobUrl } from "../../app/utils";

const Profile = () => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector(selectUserData);
  const images = useAppSelector(selectImageBlobUrl);
  const { id: userId, names, email, profilePic, profilePicStored } = userData;
  const theme = useAppSelector(selectTheme);
  const currentLang = useAppSelector(selectLang);

  const { isOnline } = useOnlineStatus();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [saveImagesError, setSaveImagesError] = useError();
  const [updateUserError, setUpdateUserError] = useError();

  const [imageData, setImageData] = useState<Image | null>(null);

  // Update User Data in firebase hook
  const [
    updateUserDataDb,
    { data: dataUpdatedUser, isLoading: sendingUpdateUser, isError: isErrorUpdateUser, error: errorUpdateUser },
  ] = useUpdateUserDataMutation();

  // Handle useSaveImageMutation errors
  useEffect(() => {
    if (((isErrorUpdateUser && errorUpdateUser) || (dataUpdatedUser && dataUpdatedUser.error)) && !updateUserError) {
      setUpdateUserError([isErrorUpdateUser, errorUpdateUser, dataUpdatedUser], "ambiguousSource");
    }
  }, [isErrorUpdateUser, errorUpdateUser, dataUpdatedUser]);

  useEffect(() => {
    if (updateUserError) dispatch(setModal({ message: updateUserError }));
  }, [updateUserError]);

  // Save image to firebase hook
  const [
    saveImageToDB,
    { data: dataSaveImg, isLoading: sendingSaveImg, isError: isErrorSaveImg, error: errorSaveImg },
  ] = useSaveImageMutation();

  // Handle useSaveImageMutation errors
  useEffect(() => {
    if (((isErrorSaveImg && errorSaveImg) || (dataSaveImg && dataSaveImg.error)) && !saveImagesError) {
      setSaveImagesError([isErrorSaveImg, errorSaveImg, dataSaveImg], "ambiguousSource");
    }
  }, [isErrorSaveImg, errorSaveImg, dataSaveImg]);

  useEffect(() => {
    if (saveImagesError) dispatch(setModal({ message: saveImagesError }));
  }, [saveImagesError]);

  if ((profilePicStored && !imageData) || (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)) {
    const foundImage = images(profilePicStored)[0];
    if (foundImage) setImageData(foundImage);
  }

  useEffect(() => {
    let revoke: Function | null;
    if (
      (profilePicStored && !imageData) ||
      (profilePicStored && imageData && profilePicStored !== imageData.imageUrl)
    ) {
      const getData = async () => {
        const { blobUrl, revokeUrl } = await getBlobUrl(profilePicStored);
        revoke = revokeUrl;
        dispatch(addImageBlobUrl({ imageUrl: profilePicStored, blobUrl }));
      };
      getData();
    }
    return () => (revoke ? revoke(profilePicStored) : null);
  }, [profilePicStored, imageData]);

  let idRow = `User id: ${userId}`;
  let namesRow = `User names: ${names}`;
  let emailRow = `User email: ${email ? email : "No email"}`;

  let profileImage: ReactElement = <p>No image</p>;

  const { main } = langs[currentLang as keyof Langs];

  function addSizeToGoogleProfilePic(url: string) {
    if (url.indexOf("googleusercontent.com") !== -1 && url.indexOf("?") === -1) {
      return url + "?sz=200";
    }
    return url;
  }

  if (imageData) {
    profileImage = <img src={imageData.blobUrl} alt="image can't load" />;
  } else if (profilePic) {
    profileImage = <img src={profilePic} alt="image can't load"></img>;
  } else {
    profileImage = <AccountSVG />;
  }

  const isUserSignedIn = () => !!getAuth().currentUser;

  const triggerInput = () => {
    updateUserDataDb({ userData });
    if (imageInputRef) {
      imageInputRef.current?.click();
    }
  };

  const handleSaveImageBtn = async (event: React.FormEvent<HTMLInputElement>) => {
    if (!isUserSignedIn || !event.currentTarget.files) {
      return;
    }
    const file = event.currentTarget.files[0];

    // Check if the file is an image.
    if (!file.type.match("image.*")) {
      dispatch(setModal({ message: main.onlyImages }));
      return;
    }
    //imageName: string; roomId: string; file: File
    saveImageToDB({ userId, file: file })
      .unwrap()
      .then((res) => {
        if (res.data) {
          // change the profileImage
          const sendData = { ...userData, profilePicStored: res.data.imageUrl };
          updateUserDataDb({ userData: sendData });
          // Update the store
          // The user data is not made to use the cached store data
          dispatch(setUserData(sendData));
        } else if (res.error) {
          dispatch(setModal({ message: res.error }));
        }
      });
  };

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
  );
};

export default Profile;
