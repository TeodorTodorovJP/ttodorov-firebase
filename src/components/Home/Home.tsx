import { Langs, langs } from "./homeTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, addImageBlobUrl, Image } from "../Auth/userSlice"
import { Data, useGetHomeDataQuery } from "./homeApi"
import useError from "../CustomHooks/useError"
import { useEffect, useState } from "react"
import { setModal } from "../Modal/modalSlice"
import { getBlobUrl } from "../../app/utils"
import { Box, Button, ButtonGroup, IconButton, Link, Snackbar, Stack, Typography, useMediaQuery } from "@mui/material"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
import { BackGround } from "../UI/BackGround"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import { useNavigate } from "react-router-dom"
import LanguageIcon from "@mui/icons-material/Language"
import AccountTreeIcon from "@mui/icons-material/AccountTree"

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
    repo: "https://github.com/TeodorTodorovJP/ttodorov-firebase",
    profilePicStored:
      "https://firebasestorage.googleapis.com/v0/b/ttodorovnet.appspot.com/o/k602b3bYLJexkEz7NP8PiGmZHcH2%2FFri%2C%2014%20Apr%202023%2010%3A10%3A26%20GMT%2FprofilePicjpg?alt=media&token=523ee63c-f0b1-4594-8993-225692b4ddae",
  }

  const techSkills = [
    "JavaScript",
    "ES6 ",
    "TypeScript",
    "React",
    "Redux",
    "RTK",
    "React Router",
    "HTML/CSS",
    "Bootstrap for React",
    "NodeJS",
    "ExpressJS",
    "MariaDB",
    "MySQL",
    "ESLint",
    "Git",
    "React Context",
    "Firebase",
    "PL/SQL",
    "Jira",
    "Microsoft Office",
    "AngularJS",
    "ES5",
  ]

  const [imageData, setImageData] = useState<Image | null>(null)
  const [data, setData] = useState<Data>(FallbackData)
  const [openSnack, setOpenSnack] = useState<string | null>(null)
  const [aboutButton, setAboutButton] = useState<AboutButtons>("aboutMe")

  const { main, aboutMe, skills, experience } = langs[currentLang as keyof Langs]

  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"))

  /** Access Router */
  const navigate = useNavigate()

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

  return (
    <Box
      sx={{ alignSelf: "flex-start", minHeight: "inherit", minWidth: "inherit", marginTop: { xs: "7vh", sm: "0vh" } }}
    >
      {data ? (
        <Box
          sx={{
            display: "flex",
            minHeight: "inherit",
            minWidth: "inherit",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
          }}
        >
          <Box
            sx={{
              minWidth: "70vw",
              minHeight: "65vh",
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              color: "text",
              marginLeft: { xs: "1vw", md: "10vw" },
            }}
          >
            <BackGround />
            <Stack
              direction="column"
              spacing={3}
              sx={{ paddingTop: "3vh", alignItems: { xs: "center", md: "flex-start" } }}
            >
              <Box sx={{ maxWidth: "95vw", textAlign: { xs: "center", md: "left" } }}>
                <Typography variant="h3">{main.headerOne}</Typography>
                <Typography variant="h3">{main.headerTwo}</Typography>
              </Box>
              <Box
                sx={{
                  marginTop: { xs: "40px", md: "initial" },
                  maxWidth: "95vw",
                  textAlign: "center",
                  //alignSelf: "center",
                }}
              >
                <Typography sx={{ fontSize: "1.4rem" }}>{main.subHead}</Typography>
              </Box>

              <Stack
                spacing={2}
                direction="row"
                sx={{
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              >
                <Typography sx={{ fontSize: "inherit" }}>{main.projectsButtonLeft}</Typography>

                <Button onClick={() => navigate("/projects")} variant="contained">
                  <AccountTreeIcon sx={{ color: "primary.contrastText" }} />
                </Button>

                <Typography sx={{ fontSize: "inherit" }}>{main.projectsButtonRight}</Typography>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  minWidth: { xs: "100vw", md: "inherit" },
                  alignSelf: { xs: "center", md: "flex-start" },
                  justifyContent: "space-evenly",
                }}
              >
                <Stack
                  spacing={2}
                  sx={{
                    flexDirection: { xs: "column", md: "row" },
                    alignSelf: { xs: "center", md: "flex-start" },
                    alignItems: { xs: "center", md: "baseline" },
                  }}
                >
                  <Box
                    sx={{ display: "flex", flexDirection: "row", justifyContent: "flex-start", alignItems: "center" }}
                  >
                    <Link
                      href={data.linkedIn}
                      target="_blank"
                      color="inherit"
                      sx={{ textAlign: "center", color: { xs: "text", md: "white" }, marginLeft: "16px" }}
                    >
                      {main.linkedIn}
                    </Link>

                    <IconButton
                      size="large"
                      aria-label="show new notifications"
                      color="inherit"
                      onClick={() => handleSnackClick("linkedIn")}
                      sx={{ color: { xs: "text", md: "white" } }}
                    >
                      <ContentCopyIcon sx={{ width: "20px" }} />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Link
                      href={data.repo}
                      target="_blank"
                      color="inherit"
                      sx={{ textAlign: "center", color: { xs: "text", md: "white" } }}
                    >
                      {main.repo}
                    </Link>
                    <IconButton
                      size="large"
                      aria-label="show new notifications"
                      color="inherit"
                      onClick={() => handleSnackClick("repo")}
                      sx={{ color: { xs: "text", md: "white" } }}
                    >
                      <ContentCopyIcon sx={{ width: "20px" }} />
                    </IconButton>
                  </Box>
                </Stack>
                <Stack
                  spacing={2}
                  sx={{
                    flexDirection: { xs: "column", md: "row" },
                    alignSelf: { xs: "center", md: "flex-start" },
                    alignItems: { xs: "center", md: "baseline" },
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Typography sx={{ textAlign: "center" }}>{main.email}</Typography>
                    <IconButton
                      size="large"
                      aria-label="show new notifications"
                      color="inherit"
                      onClick={() => handleSnackClick("email")}
                      sx={{ color: { xs: "text", md: "white" } }}
                    >
                      <ContentCopyIcon sx={{ width: "20px" }} />
                    </IconButton>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                    <Typography sx={{ textAlign: "center" }}>{main.phone}</Typography>
                    <IconButton
                      size="large"
                      aria-label="show new notifications"
                      color="inherit"
                      onClick={() => handleSnackClick("phone")}
                      sx={{ color: { xs: "text", md: "white" } }}
                    >
                      <ContentCopyIcon sx={{ width: "20px" }} />
                    </IconButton>
                  </Box>
                </Stack>
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
            <Box
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: { xs: "baseline", md: "normal" },
                height: "450px",
                minHeight: "450px",
                maxHeight: "450px",
                marginTop: "5vh",
              }}
            >
              <Box
                sx={{
                  backgroundImage: `url(${data.profilePicStored})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "450px",
                  minWidth: "450px",
                  maxWidth: "450px",
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
                  marginLeft: { xs: 0, md: "20px" },
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  sx={{ paddingLeft: { xs: "0px", md: "10px" } }}
                >
                  <ButtonGroup aria-label="About buttons" variant={isSmallScreen ? "outlined" : "contained"}>
                    <Button onClick={() => handleAboutButtonsChange("aboutMe")}>{main.aboutButton}</Button>
                    <Button onClick={() => handleAboutButtonsChange("skills")}>{main.skillsButton}</Button>
                    <Button onClick={() => handleAboutButtonsChange("experience")}>{main.expButton}</Button>
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
                    <Typography variant="h3">{aboutMe.header}</Typography>
                    <Typography
                      variant="subtitle1"
                      mt="10px"
                      maxWidth="500px"
                      sx={{ textAlign: { xs: "center", md: "justify" } }}
                    >
                      {aboutMe.one}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      mt="10px"
                      maxWidth="500px"
                      sx={{ textAlign: { xs: "center", md: "justify" } }}
                    >
                      {aboutMe.two}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      mt="10px"
                      maxWidth="500px"
                      sx={{ textAlign: { xs: "center", md: "justify" } }}
                    >
                      {aboutMe.three}
                    </Typography>
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
                    <Typography variant="h3">{skills.header}</Typography>
                    <Typography
                      variant="subtitle1"
                      mt="10px"
                      maxWidth="500px"
                      sx={{ textAlign: { xs: "center", md: "justify" } }}
                    >
                      {skills.one}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      mt="10px"
                      maxWidth="500px"
                      sx={{ textAlign: { xs: "center", md: "justify" } }}
                    >
                      {skills.two}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "flex-start",
                        justifyContent: "flex-start",
                        maxWidth: "420px",
                        flexWrap: "wrap",
                        marginTop: "20px",
                      }}
                    >
                      {techSkills.map((skill) => (
                        <Typography sx={{ textDecoration: "underline" }}>{skill}</Typography>
                      ))}
                    </Box>
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
                    <Typography variant="h3">{experience.header}</Typography>
                    <Typography
                      variant="subtitle1"
                      mt="10px"
                      maxWidth="500px"
                      sx={{ textAlign: { xs: "center", md: "justify" } }}
                    >
                      {experience.one}
                    </Typography>
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
