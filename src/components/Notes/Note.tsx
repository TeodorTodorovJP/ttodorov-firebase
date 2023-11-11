import { Box, Card, CardActionArea, CardContent, CardMedia, Chip, Paper, Typography } from "@mui/material"
import { memo } from "react"
import { useNavigate } from "react-router-dom"
import { NoteData } from "./notesSlice"

export const Note = memo(({ userId, id, title, markdown, tags }: NoteData) => {
  /** Access Router */
  const navigate = useNavigate()

  return (
    <Card
      key={id}
      variant="elevation"
      elevation={10}
      sx={{
        maxWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "15vw" },
        minWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "15vw" },

        maxHeight: { xs: "93vw", sm: "40vw", md: "25vw", lg: "15vw" },
        minHeight: { xs: "93vw", sm: "40vw", md: "25vw", lg: "15vw" },

        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transition: "ease 0.5s",

        "&:hover": {
          boxShadow: 20,
          cursor: "pointer",
          marginTop: "-5px",
          marginLeft: "-5px",
        },
      }}
      onClick={() => navigate(`/notes/${id}`)}
    >
      <Typography gutterBottom variant="h5" component="div">
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px" }}>
        {tags.map((tag) => {
          return <Chip key={tag.id} label={tag.title} color="primary" />
        })}
      </Box>
    </Card>
  )
})

export default Note
