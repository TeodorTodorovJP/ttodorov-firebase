import { Box, SxProps } from "@mui/material"
import background from "./images/home-background.png"

interface BackGroundType {
  customBackground?: string
  sx?: SxProps
}

export const BackGround = ({ customBackground, sx }: BackGroundType) => {
  let provideSx: SxProps = {
    backgroundImage: `url(${background})`,
    backgroundRepeat: "no-repeat",
    width: "100vw",
    height: "65vh",
    backgroundSize: "100%",
    filter: "brightness(75%)",
    position: "absolute",
    top: "40px",
    left: "0",
    zIndex: "-1",
  }
  if (sx) {
    provideSx = { ...provideSx, ...sx }
  }
  return <Box sx={provideSx}></Box>
}
