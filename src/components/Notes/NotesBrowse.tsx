import { Langs, langs } from "./notesTexts"
import { useAppSelector } from "../../app/hooks"
import { selectUserPreferences, selectUserData } from "../Auth/userSlice"
import { useMemo, useState } from "react"
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material"

import { Link as RouterLink } from "react-router-dom"
import { useGetNotesQuery, useGetTagsQuery } from "./notesApi"
import { selectNotes, selectTags } from "./notesSlice"
import NotesList from "./NotesList"

/**
 * NotesBrowse Component
 *
 * Main goal is to present all notes.
 * It can filter/search by title and tags.
 * It can access the NoteForm, NotePreview and EditTags
 *
 */
export const NotesBrowse = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)
  const notes = useAppSelector(selectNotes)
  const tags = useAppSelector(selectTags)

  useGetTagsQuery(currentUser.id)
  useGetNotesQuery(currentUser.id)

  /**
   * The tempTags are needed because the Autocomplete MUI component
   * doesn't provide an outlet for all currently selected tags.
   */
  const [tempTags, setTempTags] = useState<string[]>([])
  const [title, setTitle] = useState<string>("")

  const { main } = langs[currentLang as keyof Langs]

  /** Filters the Notes based on their title and tags. */
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      return (
        (title === "" || note.title.toLocaleLowerCase().includes(title?.toLocaleLowerCase())) &&
        (tempTags.length === 0 || tempTags.every((tag) => note.tags.some((noteTag) => noteTag === tag)))
      )
    })
  }, [title, tempTags, notes])

  /** Stores the tag names each time the tags are changed. */
  const onTagsChange = (event: React.SyntheticEvent<Element, Event>, values: string[]) => {
    /** Updates the tempTags so that the filtering can trigger. */
    setTempTags(values)
  }

  /** If notes take a while to load */
  if (!notes) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  /** If tags take a while to load */
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
        <Box
          sx={{
            display: "flex",
            gap: "1vh",
            flexDirection: { xs: "column", sm: "row" },
            marginTop: { xs: "10px", md: "0px" },
          }}
        >
          <Button variant="contained" component={RouterLink} to="/notes/new" sx={{ textAlign: "center" }}>
            {main.newNote}
          </Button>
          <Button variant="contained" component={RouterLink} to="/notes/edittags" sx={{ textAlign: "center" }}>
            {main.editTags}
          </Button>
        </Box>
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
            placeholder={main.title}
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
            //getOptionLabel={getLabels}
            renderInput={(params) => <TextField {...params} variant="outlined" placeholder={main.tags} />}
            onChange={onTagsChange}
            isOptionEqualToValue={(option, value) => option === value}
          />
        </Box>
      </Box>

      <NotesList notes={filteredNotes} />
    </Box>
  )
}

export default NotesBrowse
