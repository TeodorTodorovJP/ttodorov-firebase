import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, Image, selectUserData } from "../Auth/userSlice"
import useError from "../CustomHooks/useError"
import { useEffect, useMemo, useState, useRef } from "react"
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"

import { Outlet, useNavigate } from "react-router-dom"
import { Preview } from "@mui/icons-material"
import { useGetNotesQuery, useGetTagsQuery } from "./notesApi"
import { NoteData, selectNotes, selectTags, Tag } from "./notesSlice"
import NotesList from "./NotesList"

type AboutButtons = "aboutMe" | "skills" | "experience"

export const Notes = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)
  const currentUser = useAppSelector(selectUserData)
  const notes = useAppSelector(selectNotes)
  const tags = useAppSelector(selectTags)

  // Use the default user id of guestuser@abvg.bg
  useGetTagsQuery(currentUser.id)

  const [imageData, setImageData] = useState<Image | null>(null)
  const [openSnack, setOpenSnack] = useState<string | null>(null)
  const [aboutButton, setAboutButton] = useState<AboutButtons>("aboutMe")
  const [tempTags, setTempTags] = useState<Tag[]>([])
  const [title, setTitle] = useState<string>("")

  /** Get messages for the current room from firebase */

  const { main, error } = langs[currentLang as keyof Langs]

  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"))

  const onTagsChange = (event: React.SyntheticEvent<Element, Event>, values: Tag[]) => {
    setTempTags(values)
  }

  const getLabels = (option: string | Tag) => {
    if (typeof option === "string") {
      return option
    } else if (!!option && !!option.title) {
      return option.title
    } else {
      return ""
    }
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      return (
        (title === "" || note.title.toLocaleLowerCase().includes(title?.toLocaleLowerCase())) &&
        (tempTags.length === 0 || tempTags.every((tag) => note.tags.some((noteTag) => noteTag.title === tag.title)))
      )
    })
  }, [title, tempTags, notes])

  /** Access Router */
  const navigate = useNavigate()

  useGetNotesQuery(currentUser.id)

  if (!notes) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!tags) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

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
        //minHeight: { xs: "90vh", md: "80vh" },
        //top: { xs: "8vh", md: "initial" },
      }}
    >
      <Outlet />
    </Box>
  )
}

export default Notes






/*

npm install --save-dev @babel/plugin-proposal-private-property-in-object


One of your dependencies, babel-preset-react-app, is importing the
"@babel/plugin-proposal-private-property-in-object" package without        
declaring it in its dependencies. This is currently working because        
"@babel/plugin-proposal-private-property-in-object" is already in your     
node_modules folder for unrelated reasons, but it may break at any time.   

babel-preset-react-app is part of the create-react-app project, which      
is not maintianed anymore. It is thus unlikely that this bug will
ever be fixed. Add "@babel/plugin-proposal-private-property-in-object" to  
your devDependencies to work around this error. This will make this message
go away.




*/