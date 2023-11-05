import { Langs, langs } from "./notesTexts"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { selectImageBlobUrl, selectUserPreferences, Image } from "../Auth/userSlice"
import useError from "../CustomHooks/useError"
import { FormEvent, useEffect, useRef, useState } from "react"
import { getBlobUrl, getDateDataInUTC } from "../../app/utils"
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Input,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material"
import { Outlet, useNavigate } from "react-router-dom"
import CreatableReactSelect from "react-select/creatable"
import SelectRSCMUI, { SelectTag } from "./SelectRSCMUI"
import { TextareaAutosize as BaseTextareaAutosize } from "@mui/base/TextareaAutosize"
import { NoteData, Tag } from "./Notes"
import { useAddNoteMutation } from "./notesApi"

type AboutButtons = "aboutMe" | "skills" | "experience"

type NoteFormProps = {
  onSubmit: (data: NoteData) => void
}

export const NoteForm = () => {
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const dispatch = useAppDispatch()
  const images = useAppSelector(selectImageBlobUrl)

  const [imageData, setImageData] = useState<Image | null>(null)
  const [openSnack, setOpenSnack] = useState<string | null>(null)
  const [aboutButton, setAboutButton] = useState<AboutButtons>("aboutMe")

  const titleRef = useRef<HTMLInputElement>(null)
  const [titleErr, setTitleErr] = useState<string | null>(null)

  const [tags, setTags] = useState<Tag[]>([])
  const [tagsErr, setTagsErr] = useState<string | null>(null)

  const markDownRef = useRef<HTMLTextAreaElement>(null)
  const [markDownErr, setMarkDownErr] = useState<string | null>(null)

  const { main } = langs[currentLang as keyof Langs]

  // @ts-ignore
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("md"))

  const [addNote] = useAddNoteMutation()

  /** Access Router */
  const navigate = useNavigate()

  const submitHandler = (event: FormEvent) => {
    event.preventDefault()

    const { formattedDate: timestampAsId } = getDateDataInUTC()

    addNote({
      id: timestampAsId,
      title: titleRef.current!.value,
      markdown: markDownRef.current!.value,
      tags: [],
    })
  }

  const handleTagsChange = (tags: SelectTag[]) => {
    setTags(
      tags.map((tag) => {
        return { label: tag.label, id: tag.value }
      })
    )
  }

  return (
    <Box
      component="form"
      onSubmit={submitHandler}
      sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "40px" }}
    >
      <Box sx={{ display: "flex", flexDirection: "row", gap: "10px", minWidth: "60vw", justifyContent: "flex-start" }}>
        <Box>
          <InputLabel error={!!titleErr} htmlFor="title">
            {titleErr ? titleErr : main.title}
          </InputLabel>
          <OutlinedInput
            fullWidth
            required
            error={!!titleErr}
            id="title"
            name="title"
            defaultValue="Title"
            autoFocus
            inputRef={titleRef}
          />
        </Box>
        <Box>
          <InputLabel>{main.tags}</InputLabel>
          <SelectRSCMUI value={tags.map((tag) => ({ label: tag.label, value: tag.id }))} onChange={handleTagsChange} />
        </Box>
      </Box>

      <Box sx={{ minWidth: "60vw", alignSelf: "flex-start" }}>
        <InputLabel>{main.body}</InputLabel>
        <OutlinedInput
          multiline
          required
          rows={15}
          fullWidth
          error={!!markDownErr}
          id="markDown"
          name="markDown"
          defaultValue="Markdown text"
          inputRef={markDownRef}
        />
      </Box>

      <Stack direction="row" justifyContent="space-around" alignItems="flex-start" spacing={2} marginTop="10px">
        <Button variant="contained" type="submit">
          {main.save}
        </Button>

        <Button variant="outlined" type="button" onClick={() => navigate(-1)}>
          {main.cancel}
        </Button>
      </Stack>
    </Box>
  )
}

export default NoteForm
