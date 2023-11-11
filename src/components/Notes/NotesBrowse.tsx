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

export const NotesBrowse = () => {
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
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          justifyContent: "space-between",
          paddingTop: { xs: "0vh", md: "2vh" },
          paddingLeft: "2vh",
          paddingRight: "2vh",
        }}
      >
        <Typography variant="h3">{main.notes}</Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" onClick={() => navigate("/notes/new")}>
            {main.newNote}
          </Button>
          <Button variant="contained" onClick={() => navigate("/notes/edittags")}>
            {main.editTags}
          </Button>
        </Stack>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          marginLeft: "2vh",
          marginRight: "2vh",
          flexDirection: { xs: "column", md: "row" },
          alignSelf: "center",
          alignItems: "center",
          minWidth: "93vw",
          maxWidth: "93vw",
        }}
      >
        <Box sx={{ width: { xs: "90vw", md: "45vw" }, maxWidth: { xs: "90vw", md: "45vw" } }}>
          <InputLabel htmlFor="title">{main.title}</InputLabel>
          <OutlinedInput
            fullWidth
            required
            id="title"
            name="title"
            defaultValue="Title"
            autoFocus
            onChange={(event) => setTitle(event.target.value)}
          />
        </Box>
        <Box sx={{ width: { xs: "90vw", md: "45vw" }, maxWidth: { xs: "90vw", md: "45vw" } }}>
          <InputLabel>{main.tags}</InputLabel>

          <Autocomplete
            multiple
            autoSelect
            id="tags-standard"
            options={tags}
            getOptionLabel={getLabels}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder={main.tags} />}
            onChange={onTagsChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Box>
      </Box>

      <NotesList notes={filteredNotes} />
    </Box>
  )
}

export default NotesBrowse

/*

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
