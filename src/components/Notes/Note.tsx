import { Box, Card, Chip, Typography } from "@mui/material"
import { memo } from "react"
import { NoteData } from "./notesSlice"
import { Link as RouterLink } from "react-router-dom"

/**
 * Note Component
 *
 * Main goal is to display each note on the 'NotesBrowse' screen.
 *
 */
export const Note = memo(({ id, title, tags }: NoteData) => {
  return (
    <Card
      key={id}
      variant="elevation"
      elevation={10}
      component={RouterLink}
      to={`/notes/${id}`}
      sx={{
        maxWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "15vw" },
        minWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "15vw" },

        maxHeight: { xs: "30vw", sm: "40vw", md: "25vw", lg: "15vw" },
        minHeight: { xs: "30vw", sm: "40vw", md: "25vw", lg: "15vw" },

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "ease 0.5s",
        textDecoration: "none",
        marginBottom: "5vh",

        "&:hover": {
          boxShadow: 20,
          cursor: "pointer",
          marginTop: "-5px",
          marginLeft: "-5px",
        },
      }}
    >
      <Typography gutterBottom variant="h5" component="div">
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px" }}>
        {tags.map((tag) => {
          return <Chip key={tag} label={tag} color="primary" />
        })}
      </Box>
    </Card>
  )
})

export default Note
