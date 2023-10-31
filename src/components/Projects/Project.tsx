import { Card, CardActionArea, CardContent, CardMedia, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

interface ProjectType {
  link: string
  image: string
  header: string
  description: string
}

export const Project = ({ link, image, header, description }: ProjectType) => {
  /** Access Router */
  const navigate = useNavigate()

  return (
    <Card
      raised
      onClick={() => navigate(link)}
      sx={{
        maxWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "20vw" },
        minWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "20vw" },
      }}
    >
      <CardActionArea>
        <CardMedia
          component="img"
          image={image}
          alt="project image"
          sx={{
            maxWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "20vw" },
            minWidth: { xs: "93vw", sm: "40vw", md: "25vw", lg: "20vw" },
            maxHeight: { xs: "93vw", sm: "40vw", md: "25vw", lg: "20vw" },
            minHeight: { xs: "93vw", sm: "40vw", md: "25vw", lg: "20vw" },
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {header}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default Project
