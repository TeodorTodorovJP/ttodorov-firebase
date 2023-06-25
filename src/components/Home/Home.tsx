import classes from "./Home.module.css";

import Card from "../UI/Card";
import { Langs, langs } from "./homeTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, addImageBlobUrl, Image } from "../Auth/userSlice"
import { Data, useGetHomeDataQuery, useUpdateHomeDataMutation } from "./homeApi"
import useError from "../CustomHooks/useError"
import { ReactElement, useEffect, useState } from "react"
import { setModal } from "../Modal/modalSlice"
import { getBlobUrl } from "../../app/utils"
import { selectTheme } from "../Navigation/themeSlice"
import { ReactComponent as AddressSVG } from "./SVG/address.svg"
import { ReactComponent as GitHubSVG } from "./SVG/gitHub.svg"
import { ReactComponent as GmailSVG } from "./SVG/gmail.svg"
import { ReactComponent as LinkedInSVG } from "./SVG/linkedIn.svg"
import { ReactComponent as PhoneSVG } from "./SVG/phone.svg"

/**
 * The Home component returns a Card component with a div containing the text "Home Page".
 * returns a functional component named `Home` is being returned. It renders a `Card` component with
 * an additional class of "home" and a child `div` element with a class of `classes.home` and the text
 * "Home Page". The value of `classes.home` is not provided in the code snippet.
 */
export const Home = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const theme = useAppSelector(selectTheme)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)

  const DATARemove = {
    email: "ttodorov.jp@gmail.com",
    linkedIn: "https://www.linkedin.com/in/ttodorovjp/",
    phone: "0882 59 19 90",
    repo: "https://github.com/TeodorTodorovJP/",
    profilePicStored:
      "https://firebasestorage.googleapis.com/v0/b/ttodorovnet.appspot.com/o/k602b3bYLJexkEz7NP8PiGmZHcH2%2FFri%2C%2014%20Apr%202023%2010%3A10%3A26%20GMT%2FprofilePicjpg?alt=media&token=523ee63c-f0b1-4594-8993-225692b4ddae",
  }

  const [imageData, setImageData] = useState<Image | null>(null)
  const [data, setData] = useState<Data>()

  /** Error hooks */
  const [homeDataError, setHomeDataError] = useError()

  /**
   * Get the current user data.
   * */
  const uselessParam: void = undefined
  const {
    data: homeData, // The latest returned result regardless of hook arg, if present.
    isSuccess, // When true, indicates that the query has data from a successful request.
    isError, // When true, indicates that the query is in an error state.
    error, // The error result if present.
    isLoading: isLoadingUsers,
  } = useGetHomeDataQuery(uselessParam)

  /**
   * For useGetUserDataQuery
   * Checks for errors generated from the RTKQ and errors generated from Firebase
   * */
  useEffect(() => {
    if (((isError && error) || (homeData && homeData.error)) && !homeDataError) {
      setHomeDataError([isError, error, homeData], "ambiguousSource")
    }
  }, [isError, error, homeData])

  /**
   * For useGetUserDataQuery
   * When error is caught show the modal
   * */
  useEffect(() => {
    if (homeDataError) {
      dispatch(setModal({ message: homeDataError }))
    }
  }, [homeDataError])

  /**
   * If the current user has an image but is not yet loaded or
   * use the user's image has changed, add the new image to the list.
   */
  useEffect(() => {
    if (!homeData || !homeData.data) return
    const { profilePicStored } = homeData.data
    setData(homeData.data)
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
  }, [imageData, homeData])

  /**
   * If we have not stored the image, store it.
   */
  if (
    (data && data.profilePicStored && !imageData) ||
    (data && data.profilePicStored && imageData && data.profilePicStored !== imageData.imageUrl)
  ) {
    const foundImage = images(data.profilePicStored)[0]
    if (foundImage) setImageData(foundImage)
  }
  let profileImage: ReactElement = <p>No image</p>

  if (imageData) {
    profileImage = <img className={classes.mainImage} src={imageData.blobUrl} alt="image can't load" />
  }

  const { main } = langs[currentLang as keyof Langs]

  return (
    <Card additionalClass="home">
      {data ? (
        <div className={classes.home}>
          <div className={classes.data}>
            <div>
              <div className={` ${classes.address} ${theme.svg}`}>
                <AddressSVG /> <p>Sofia</p>
              </div>
              <div className={classes.mainHeader}>
                <p className={theme.decorationH}>I Build Custom</p>
                <p className={theme.decorationM}>Website Solutions</p>
                <p className={theme.decorationH}>That Help Your</p>
                <p className={theme.decorationM}>Business Grow</p>
              </div>
              <p>I help you increase conversion and performance in every possible way.</p>
            </div>
            {profileImage}
          </div>

          {
            <div className={classes.data}>
              <div>
                <div className={classes.contact}>
                  <div className={` ${classes.contactSvg} ${theme.svg}`}>
                    <GmailSVG />
                  </div>
                  <div>
                    <div>{data.email}</div>
                  </div>
                </div>

                <div className={classes.contact}>
                  <div className={` ${classes.contactSvg} ${theme.svg}`}>
                    <LinkedInSVG />
                  </div>
                  <div>
                    <a href={data.linkedIn} target="_blank">
                      {data.linkedIn}
                    </a>
                  </div>
                </div>

                <div className={classes.contact}>
                  <div className={` ${classes.contactSvg} ${theme.svg}`}>
                    <PhoneSVG />
                  </div>
                  <div>
                    <div>{data.phone}</div>
                  </div>
                </div>

                <div className={classes.contact}>
                  <div className={` ${classes.contactSvg} ${theme.svg}`}>
                    <GitHubSVG />
                  </div>

                  <div>
                    <a href={data.repo} target="_blank">
                      {data.repo}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      ) : null}
    </Card>
  )
}

export default Home;
