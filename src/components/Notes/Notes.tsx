import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, Image } from "../Auth/userSlice"
import useError from "../CustomHooks/useError"
import { useEffect, useState } from "react"
import { getBlobUrl } from "../../app/utils"
import { Box, useMediaQuery } from "@mui/material"

import { useNavigate } from "react-router-dom"

type AboutButtons = "aboutMe" | "skills" | "experience"

export const Notes = () => {
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

  return <Box>Hello</Box>
}

export default Notes
