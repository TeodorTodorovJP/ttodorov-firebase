import { Box } from "@mui/material"
import { Outlet } from "react-router-dom"

/**
 * Notes Component
 *
 * This is the main component. It acts as a wrapper component for the whole Notes application.
 * It provides all the needed styles and the Outlet for the Router.
 *
 */
export const Notes = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        // The general sizing of the notes page
        maxWidth: "100vw",
        minWidth: "100vw",

        // toolbar (navigation) maxHeight: { xs: "64px", md: "110px" }
        top: "64px",
        maxHeight: "calc(100vh - 64px)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Outlet />
    </Box>
  )
}

export default Notes
