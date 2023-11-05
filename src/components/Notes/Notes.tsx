import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, Image } from "../Auth/userSlice"
import useError from "../CustomHooks/useError"
import { useEffect, useMemo, useState } from "react"
import { getBlobUrl, getDateDataInUTC } from "../../app/utils"
import { Box, Button, Link, Typography, useMediaQuery } from "@mui/material"

import { Outlet, useNavigate } from "react-router-dom"
import { Preview } from "@mui/icons-material"

type AboutButtons = "aboutMe" | "skills" | "experience"

export type Note = {
  id: string
} & NoteData

export type RawNote = {
  id: string
} & RawNoteData

export type RawNoteData = {
  title: string
  markdown: string
  tagIds: string[]
}

export type NoteData = {
  title: string
  markdown: string
  tags: Tag[]
}

export type Tag = {
  id: string
  label: string
}

export const Notes = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)

  const [imageData, setImageData] = useState<Image | null>(null)
  const [openSnack, setOpenSnack] = useState<string | null>(null)
  const [aboutButton, setAboutButton] = useState<AboutButtons>("aboutMe")

  const [notes, setNotes] = useState<RawNote[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const notesWithTags = useMemo(() => {
    return notes.map((note) => {
      return { ...note, tags: tags.filter((tag) => note.tagIds.includes(tag.id)) }
    })
  }, [notes, tags])

  const onCreateNote = ({ tags, ...data }: NoteData) => {
    const { formattedDate: timestamp } = getDateDataInUTC()

    setNotes((prevNotes) => {
      return [...prevNotes, { ...data, id: timestamp, tagIds: tags.map((tag) => tag.id) }]
    })
  }

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
        position: "fixed",
        // The general sizing of the notes page
        maxWidth: "100vw",
        maxHeight: "100vh",
        minWidth: "100vw",
        minHeight: { xs: "90vh", md: "80vh" },
        top: { xs: "8vh", md: "initial" },
      }}
    >
      <Typography>Hello</Typography>
      <Button onClick={() => navigate("/notes/new")}> New Note </Button>

      <Outlet />
    </Box>
  )
}

export default Notes
