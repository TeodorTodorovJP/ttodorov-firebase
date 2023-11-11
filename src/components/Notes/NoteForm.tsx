import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, selectUserData } from "../Auth/userSlice"
import { useEffect, useRef, useState, useMemo } from "react"
import { getDateDataInUTC } from "../../app/utils"
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputLabel,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import { useAddNoteMutation, useAddTagsMutation, useDeleteNoteMutation, useGetTagsQuery } from "./notesApi"
import { NoteData, selectTags, Tag } from "./notesSlice"
import { v4 as uuid } from "uuid"
import { setModal } from "../Modal/modalSlice"
import DialogConfirm from "../Modal/DialogConfirm"
import ReactMarkdown from "react-markdown"

type AboutButtons = "aboutMe" | "skills" | "experience"

type NoteFormProps = {
  noteData?: NoteData
}

export const NoteForm = ({ noteData }: NoteFormProps) => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)
  const currentUser = useAppSelector(selectUserData)
  const tags = useAppSelector(selectTags)

  const titleRef = useRef<HTMLInputElement>(null)
  const [titleErr, setTitleErr] = useState<string | null>(null)

  const [tempTags, setTempTags] = useState<Tag[]>([])

  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState<boolean>(false)

  const markDownRef = useRef<HTMLTextAreaElement>(null)
  const [markDownErr, setMarkDownErr] = useState<string | null>(null)

  const { main, error, onDeleteNote } = langs[currentLang as keyof Langs]

  const [addNote] = useAddNoteMutation()
  const [addTags] = useAddTagsMutation()
  const [deleteNote] = useDeleteNoteMutation()

  useEffect(() => {
    setTempTags(noteData ? [...noteData.tags] : [tags[0]])
  }, [])

  /** Access Router */
  const navigate = useNavigate()

  const tagsIds = useMemo(() => {
    if (tags.length > 0) {
      return tags.map((tag) => tag.id)
    }
    return []
  }, [tags])

  const addTagsToDB = () => {
    const newTags = tempTags.filter((tag) => !tagsIds.includes(tag.id))

    if (newTags.length > 0) {
      addTags({ userId: currentUser.id, tagData: newTags })
    }
  }

  const saveNoteHandler = () => {
    const { formattedDate: timestampAsId } = getDateDataInUTC()

    let message: string = ""

    if (markDownRef.current!.value.length < 5 || markDownRef.current!.value.length > 5000) {
      message = error.body
    }

    if (tempTags.length < 1 || tempTags.length > 6) {
      message = error.tags
    }

    if (titleRef.current!.value.length < 3 || titleRef.current!.value.length > 70) {
      message = error.title
    }

    if (message.length > 0) {
      dispatch(setModal({ header: "Error", agree: "OK", message }))
      return
    }

    addNote({
      userId: currentUser.id,
      id: timestampAsId,
      title: titleRef.current!.value,
      markdown: markDownRef.current!.value,
      tags: tempTags,
    })

    addTagsToDB()

    navigate("/notes")
  }

  const deleteModalHandler = (value: string) => {
    if (value === "ok") deleteNoteHandler()
    if (value === "cancel") setOpenConfirmDeleteModal(false)
  }

  const deleteNoteHandler = () => {
    deleteNote({
      userId: currentUser.id,
      noteId: noteData!.id,
    })

    navigate("/notes")
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

  type TagEvent = string | Tag

  const onTagsChange = (event: React.SyntheticEvent<Element, Event>, values: TagEvent[]) => {
    let newTags = values.map((tag) => {
      const uniqueId = uuid()
      let newTag: Tag

      // This means the tag is created by the user and it has no id
      if (typeof tag === "string") {
        const { utcMilliseconds: timestamp } = getDateDataInUTC()
        newTag = {
          id: `${timestamp}/${uniqueId}`,
          title: tag,
        }
      } else {
        newTag = tag
      }

      return newTag
    })

    setTempTags(newTags)
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
          <InputLabel error={!!titleErr} htmlFor="title">
            {titleErr ? titleErr : main.title}
          </InputLabel>
          <OutlinedInput
            fullWidth
            required
            error={!!titleErr}
            id="title"
            name="title"
            defaultValue={noteData?.title || "Title"}
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
            getOptionLabel={getLabels}
            defaultValue={noteData ? [...noteData.tags] : [tags[0]]}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} variant="outlined" placeholder={noteData ? "" : main.tags} />
            )}
            onChange={onTagsChange}
            renderTags={(tagArr, tagProps) => {
              return tagArr.map((tag, index) => {
                const { onDelete } = tagProps({ index })

                const title = typeof tag === "string" ? tag : tag.title
                return <Chip key={index} label={title} onDelete={onDelete} sx={{ opacity: "1" }} />
              })
            }}
            sx={{
              minWidth: "300px",
              // "& > .MuiFormControl-root > .MuiInputBase-root > .MuiButtonBase-root": {
              //   opacity: "1",
              // },
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
          error={!!markDownErr}
          id="markDown"
          name="markDown"
          defaultValue={noteData?.markdown || "Markdown text"}
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
