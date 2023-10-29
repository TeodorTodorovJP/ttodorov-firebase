import { Langs, langs } from "./homeTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, addImageBlobUrl, Image } from "../Auth/userSlice"
import { Data, useGetHomeDataQuery } from "./homeApi"
import useError from "../CustomHooks/useError"
import { useEffect, useState } from "react"
import { setModal } from "../Modal/modalSlice"
import { getBlobUrl } from "../../app/utils"
import { Box, Button, ButtonGroup, Link, Snackbar, Stack, Typography, useMediaQuery } from "@mui/material"
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import { BackGround } from "../UI/BackGround"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"

type AboutButtons = "aboutMe" | "skills" | "experience"

/**
 * The Home component returns a Card component with a div containing the text "Home Page".
 * returns a functional component named `Home` is being returned. It renders a `Card` component with
 * an additional class of "home" and a child `div` element with a class of `classes.home` and the text
 * "Home Page". The value of `classes.home` is not provided in the code snippet.
 */
export const Home = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)

  const FallbackData = {
    email: "ttodorov.jp@gmail.com",
    linkedIn: "https://www.linkedin.com/in/ttodorovjp/",
    phone: "0882 59 19 90",
    repo: "https://github.com/TeodorTodorovJP/",
    profilePicStored:
      "https://firebasestorage.googleapis.com/v0/b/ttodorovnet.appspot.com/o/k602b3bYLJexkEz7NP8PiGmZHcH2%2FFri%2C%2014%20Apr%202023%2010%3A10%3A26%20GMT%2FprofilePicjpg?alt=media&token=523ee63c-f0b1-4594-8993-225692b4ddae",
  }

  const [imageData, setImageData] = useState<Image | null>(null)
  const [data, setData] = useState<Data>(FallbackData)
  const [openSnack, setOpenSnack] = useState<string | null>(null)
  const [aboutButton, setAboutButton] = useState<AboutButtons>("aboutMe")

  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"))

  /** Error hooks */
  const [homeDataError, setHomeDataError] = useError()

  /**
   * Copy the email to the user's clipboard and
   * show a popup to notify the user.
   * */
  const handleSnackClick = (whichButton: string) => {
    const convertToKey = whichButton as keyof Data
    const text = data[convertToKey]

    setOpenSnack(text)

    navigator.clipboard.writeText(text)
  }

  const handleAboutButtonsChange = (setButton: AboutButtons) => {
    setAboutButton(setButton)
  }

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

  const { main } = langs[currentLang as keyof Langs]

  return (
    <Box sx={{ alignSelf: "flex-start", minHeight: "inherit", minWidth: "inherit" }}>
      {data ? (
        <Box sx={{ display: "flex", minHeight: "inherit", minWidth: "inherit", alignItems: "center" }}>
          <Box
            sx={{
              minWidth: "70vw",
              minHeight: "65vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              color: "text",
              marginLeft: { xs: "1vw", md: "10vw" },
            }}
          >
            <BackGround />
            <Stack direction="column" spacing={2}>
              <Box>
                <Typography variant="h3">I am Teodor Todorov</Typography>
                <Typography variant="h3">A Web Developer</Typography>
              </Box>
              <Box sx={{ marginTop: { xs: "40px", md: "initial" } }}>
                <Typography sx={{ fontSize: "15px" }}>
                  If we get to know each other, you will see that I'm a hard-working, creative
                </Typography>
                <Typography sx={{ fontSize: "15px" }}>individual, constantly setting new goals to achieve.</Typography>
              </Box>

              <Stack spacing={2} direction={{ xs: "column", md: "row" }}>
                <Button variant="contained" endIcon={<ArrowDownwardIcon />}>
                  <Typography>VIEW MY WORK PROJECTS HERE OR VIA:</Typography>
                </Button>
              </Stack>

              <Stack direction="column" spacing={2} sx={{ alignSelf: { xs: "center", md: "flex-start" } }}>
                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
                  <Button
                    startIcon={<FiberManualRecordIcon sx={{ width: "10px" }} />}
                    sx={{ color: { xs: "text", md: "white" } }}
                    endIcon={<ContentCopyIcon sx={{ width: "20px" }} />}
                    onClick={() => handleSnackClick("linkedIn")}
                  >
                    LinkedIn
                  </Button>
                  <Link
                    href={data.linkedIn}
                    target="_blank"
                    underline="none"
                    color="inherit"
                    sx={{ textAlign: "center" }}
                  >
                    {data.linkedIn}
                  </Link>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Button
                    startIcon={<FiberManualRecordIcon sx={{ width: "10px" }} />}
                    endIcon={<ContentCopyIcon sx={{ width: "20px" }} />}
                    sx={{ color: { xs: "text", md: "white" } }}
                    onClick={() => handleSnackClick("repo")}
                  >
                    GitHub
                  </Button>
                  <Link href={data.repo} target="_blank" underline="none" color="inherit" sx={{ textAlign: "center" }}>
                    {data.repo}
                  </Link>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Button
                    startIcon={<FiberManualRecordIcon sx={{ width: "10px" }} />}
                    endIcon={<ContentCopyIcon sx={{ width: "20px" }} />}
                    sx={{ color: { xs: "text", md: "white" } }}
                    onClick={() => handleSnackClick("email")}
                  >
                    Gmail
                  </Button>
                  <Typography sx={{ textAlign: "center" }}>{data.email}</Typography>
                </Box>

                <Snackbar
                  open={!!openSnack}
                  onClose={() => setOpenSnack(null)}
                  autoHideDuration={20000}
                  message={`Copied ${openSnack}`}
                  key={"top" + "center"}
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  sx={{ display: "block", textAlign: "center" }}
                />
              </Stack>
            </Stack>
            <Box sx={{ display: "flex", flexDirection: "row", marginTop: "50px" }}>
              <Box
                sx={{
                  backgroundImage: `url(${data.profilePicStored})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "400px",
                  objectFit: "contain",

                  display: { xs: "none", md: "block" },
                }}
              ></Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: { xs: "center", md: "flex-start" },
                  alignItems: { xs: "center", md: "flex-start" },
                }}
              >
                <Stack direction="row" justifyContent="center" alignItems="center">
                  <ButtonGroup aria-label="About buttons" variant={isSmallScreen ? "outlined" : "contained"}>
                    <Button onClick={() => handleAboutButtonsChange("aboutMe")}>ABOUT ME</Button>
                    <Button onClick={() => handleAboutButtonsChange("skills")}>SKILLS</Button>
                    <Button onClick={() => handleAboutButtonsChange("experience")}>EXPERIENCE</Button>
                  </ButtonGroup>
                </Stack>

                {aboutButton === "aboutMe" && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: { xs: "center", md: "flex-start" },
                      alignItems: { xs: "center", md: "flex-start" },
                      padding: "10px",
                    }}
                  >
                    <Typography variant="h3">My Story</Typography>
                    <Typography variant="subtitle1" mt="10px" maxWidth="500px">
                      Long text text text text text text text text text text text text text text text text text text
                      text text text text text texttext text text text text text texttext text text text text text
                      texttext text text text text text text
                    </Typography>
                    <Typography variant="h4">I work on websites</Typography>
                  </Box>
                )}
                {aboutButton === "skills" && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: { xs: "center", md: "flex-start" },
                      alignItems: { xs: "center", md: "flex-start" },
                      padding: "10px",
                    }}
                  >
                    <Typography variant="h3">My Skills</Typography>
                    <Typography variant="subtitle1" mt="10px" maxWidth="500px">
                      Long text text text text text text text text text text text text text text text text text text
                      text text text text text texttext text text text text text texttext text text text text text
                      texttext text text text text text text
                    </Typography>
                    <Typography variant="h4">I work on websites</Typography>
                  </Box>
                )}
                {aboutButton === "experience" && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: { xs: "center", md: "flex-start" },
                      alignItems: { xs: "center", md: "flex-start" },
                      padding: "10px",
                    }}
                  >
                    <Typography variant="h3">My experience</Typography>
                    <Typography variant="subtitle1" mt="10px" maxWidth="500px">
                      Long text text text text text text text text text text text text text text text text text text
                      text text text text text texttext text text text text text texttext text text text text text
                      texttext text text text text text text
                    </Typography>
                    <Typography variant="h4">I work on websites</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

export default Home
