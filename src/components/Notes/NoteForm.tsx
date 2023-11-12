import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectUserPreferences, selectUserData } from "../Auth/userSlice"
import { useEffect, useRef, useState } from "react"
import { getDateDataInUTC } from "../../app/utils"
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { useAddNoteMutation, useAddTagsMutation, useChangeNoteMutation, useDeleteNoteMutation } from "./notesApi"
import { NoteData, selectTags } from "./notesSlice"
import { setModal } from "../Modal/modalSlice"
import DialogConfirm from "../Modal/DialogConfirm"

type NoteFormProps = {
  noteData?: NoteData
}

/**
 * NoteForm Component
 *
 * Has two main goals:
 *  1. Filling data for a new note
 *  2. Updating data for an existing note
 *    - Optional noteData is available if loaded from 'EditNote' Component
 *
 */
export const NoteForm = ({ noteData }: NoteFormProps) => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)
  const tags = useAppSelector(selectTags)

  const [addNote] = useAddNoteMutation()
  const [addTags] = useAddTagsMutation()
  const [deleteNote] = useDeleteNoteMutation()
  const [updateNote] = useChangeNoteMutation()
  const navigate = useNavigate()

  const dispatch = useAppDispatch()

  const titleRef = useRef<HTMLInputElement>(null)
  const markDownRef = useRef<HTMLTextAreaElement>(null)

  /**
   * The tempTags are needed because the Autocomplete MUI component
   * doesn't provide an outlet for all currently selected tags.
   */
  const [tempTags, setTempTags] = useState<string[]>([])
  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState<boolean>(false)

  const { main, error, onDeleteNote } = langs[currentLang as keyof Langs]

  /**
   * If the component is provided with data
   * and user has tags in it (always true)
   * and user has not edited the tags field
   * the tags on save would be empty.
   *
   * The tempTags are needed because the Autocomplete MUI component
   * doesn't provide an outlet for all currently selected tags.
   */
  useEffect(() => {
    setTempTags(noteData ? [...noteData.tags] : [tags[0]])
  }, [])

  /** Saves all newly created tags by the user. */
  const addTagsToDB = () => {
    /** Get's all new tags. */
    const newTags = tempTags.filter((tag) => !tags.includes(tag))

    /**
     * If the user has created new tags, we save them in DB
     * These tags appear as suggestions when creating or editing a note
     * Or when searching for a note in 'NotesBrowse'
     */
    if (newTags.length > 0) {
      addTags({ userId: currentUser.id, tagData: newTags })
    }
  }

  /** Validates and saves the notes and triggers addTagsToDB */
  const saveNoteHandler = async () => {
    const { formattedDate: timestampAsId } = getDateDataInUTC()

    let message: string = ""

    /** Validates the Text of the note. Between 5 and 5000 symbols. */
    if (markDownRef.current!.value.length < 5 || markDownRef.current!.value.length > 5000) {
      message = error.body
    }

    /** Validates the number of tags of the note. Between 1 and 6. */
    if (tempTags.length < 1 || tempTags.length > 6) {
      message = error.tags
    }

    /** Validates the Title of the note. Between 3 and 70 symbols. */
    if (titleRef.current!.value.length < 3 || titleRef.current!.value.length > 70) {
      message = error.title
    }

    /** If any of the above fail, show a message. */
    if (message.length > 0) {
      dispatch(setModal({ header: "Error", agree: "OK", message }))
      return
    }

    addTagsToDB()

    /** Check if we have noteData, which means we are in edit mode. */
    const isEdit = !!noteData && !!noteData.id

    /** If we have noteData, reuse the note Id */
    const noteId = isEdit ? noteData.id : timestampAsId

    const noteObject = {
      userId: currentUser.id,
      id: noteId,
      title: titleRef.current!.value,
      markdown: markDownRef.current!.value,
      tags: tempTags,
    }

    const callMethod = isEdit ? updateNote : addNote

    await callMethod(noteObject)

    navigate("/notes")
  }

  /** On user responding the deletion of a Note. */
  const deleteModalHandler = (userResponse: string) => {
    if (userResponse === "ok") deleteNoteHandler()
    if (userResponse === "cancel") setOpenConfirmDeleteModal(false)
  }

  /** On user confirming the deletion of a Note. */
  const deleteNoteHandler = () => {
    deleteNote({
      userId: currentUser.id,
      noteId: noteData!.id,
    })

    navigate("/notes")
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
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "2vh",
        paddingTop: { xs: "0vh", md: "2vh" },
      }}
    >
      <Typography variant="h5">{noteData?.title ? noteData?.title : main.newNote}</Typography>
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
            defaultValue={noteData?.title || ""}
            placeholder={main.title}
            autoFocus
            inputRef={titleRef}
            sx={{
              "&.Mui-disabled > input": {
                WebkitTextFillColor: "#fff",
              },
            }}
          />
        </Box>
        <Box sx={{ width: { xs: "90vw", md: "45vw" }, maxWidth: { xs: "90vw", md: "45vw" } }}>
          <InputLabel>{main.tags}</InputLabel>

          <Autocomplete
            multiple
            freeSolo
            autoSelect
            id="tags-standard"
            options={tags}
            defaultValue={!!noteData ? noteData.tags : []}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder={noteData ? "" : main.tags} />
            )}
            onChange={(event, values) => setTempTags(values)}
            sx={{
              minWidth: "300px",
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          marginLeft: "2vh",
          marginRight: "2vh",
          alignSelf: "center",
          alignItems: "center",
          minWidth: "90vw",
          maxWidth: "90vw",
        }}
      >
        <InputLabel>{main.body}</InputLabel>
        <OutlinedInput
          multiline
          required
          rows={15}
          fullWidth
          id="markDown"
          name="markDown"
          defaultValue={noteData?.markdown || ""}
          placeholder={main.body}
          inputRef={markDownRef}
          sx={{
            "&.Mui-disabled > textarea": {
              WebkitTextFillColor: "#fff",
            },
            "& > textarea": {
              minHeight: "25vh",
              maxHeight: "35vh",
            },
          }}
        />
      </Box>

      <Stack
        direction="row"
        justifyContent="space-around"
        alignItems="flex-start"
        spacing={2}
        sx={{ marginBottom: "3vh" }}
      >
        <Button variant="contained" type="button" onClick={() => saveNoteHandler()}>
          {main.save}
        </Button>

        <Button variant="contained" type="button" component={RouterLink} to="..">
          {main.cancel}
        </Button>

        {!!noteData && (
          <Button variant="contained" color="error" type="button" onClick={() => setOpenConfirmDeleteModal(true)}>
            {main.delete}
          </Button>
        )}
      </Stack>

      <DialogConfirm
        id="delete-confirm"
        keepMounted
        open={openConfirmDeleteModal}
        userResponse={deleteModalHandler}
        texts={{ ok: onDeleteNote.ok, cancel: onDeleteNote.cancel, text: onDeleteNote.text, title: onDeleteNote.title }}
      />
    </Box>
  )
}

export default NoteForm
