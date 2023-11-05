import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, Image } from "../Auth/userSlice"
import useError from "../CustomHooks/useError"
import { useEffect, useState } from "react"
import { getBlobUrl } from "../../app/utils"
import { Box, Typography, useMediaQuery } from "@mui/material"

import { Outlet, useNavigate } from "react-router-dom"
import NoteForm from "./NoteForm"

type AboutButtons = "aboutMe" | "skills" | "experience"

export const NewNote = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)

  const [imageData, setImageData] = useState<Image | null>(null)
  const [openSnack, setOpenSnack] = useState<string | null>(null)
  const [aboutButton, setAboutButton] = useState<AboutButtons>("aboutMe")

  const { main } = langs[currentLang as keyof Langs]

  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"))

  /** Access Router */
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "fixed",
        // The general sizing of the new notes page
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "100vw",
        minHeight: { xs: "90vh", md: "80vh" },
        top: { xs: "8vh", md: "initial" },
      }}
    >
      <Typography>New Note</Typography>
      <NoteForm />
    </Box>
  )
}

export default NewNote
