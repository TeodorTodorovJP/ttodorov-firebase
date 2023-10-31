import { Box, Grid, Typography } from "@mui/material"
import Project from "./Project"
import ChatCollage from "../UI/images/ChatCollage.png"
import { langs, Langs } from "./projectsTexts"
import { useAppSelector } from "../../app/hooks"
import { selectUserPreferences } from "../Auth/userSlice"

export const Projects = () => {
  // For the translates
  const { lang } = useAppSelector(selectUserPreferences)
  const { main, chat } = langs[lang as keyof Langs]

  const chatInfo = {
    link: "/chat",
    image: ChatCollage,
    header: chat.header,
    description: chat.description,
  }

  const projects = [chatInfo]
  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        alignSelf: "flex-start",
        gap: "5vh",
        top: "10vh",
      }}
    >
      <Typography variant="h3">{main.header}</Typography>
      <Typography>{main.description}</Typography>
      <Box sx={{ maxWidth: "100vw", minWidth: "100vw", marginLeft: { xs: "5vw", md: "6vw" } }}>
        <Grid container spacing={{ xs: 1, sm: 1, md: 3 }} columns={{ xs: 4, sm: 8, md: 12, lg: 8 }}>
          {projects.map((pr, index) => (
            <Grid key={index} item xs={4} sm={4} md={4} lg={2}>
              <Project {...pr} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export default Projects
