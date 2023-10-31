import { Box, Grid, Typography } from "@mui/material"
import Project from "./Project"
import ChatCollage from "../UI/images/ChatCollage.png"

export const Projects = () => {
  const chat = {
    link: "/chat",
    image: ChatCollage,
    header: "Chat",
    description: "A chat app for talking with your friends.",
  }

  const projects = [chat]
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
      <Typography variant="h3">My projects</Typography>
      <Typography>Currently there is only one project!</Typography>
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
