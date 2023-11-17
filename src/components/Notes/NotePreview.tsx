import { useNavigate, useParams, Link as RouterLink } from "react-router-dom"
import { useAppSelector } from "../../app/hooks"
import { selectNote } from "./notesSlice"
import ReactMarkdown from "react-markdown"
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material"
import { selectUserData, selectUserPreferences } from "../Auth/userSlice"
import { Langs, langs } from "./notesTexts"
import { useState } from "react"
import { useDeleteNoteMutation } from "./notesApi"
import Modal from "../Modal/Modal"

/**
 * NotePreview Component
 *
 * Main goal is to present a note in a detailed an presentable way.
 * It includes Markdown syntax.
 *
 */
export const NotePreview = () => {
  const params = useParams<"id">()
  const { id, markdown, tags, title } = useAppSelector((state) => selectNote(state, params.id!)[0])
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)

  const [deleteNote] = useDeleteNoteMutation()
  const navigate = useNavigate()

  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState<boolean>(false)

  const { main, onDeleteNote } = langs[currentLang as keyof Langs]

  /** On user responding the deletion of a Note. */
  const deleteModalHandler = (value: string) => {
    if (value === "ok") deleteNoteHandler()
    if (value === "cancel") setOpenConfirmDeleteModal(false)
  }

  /** On user confirming the deletion of a Note. */
  const deleteNoteHandler = () => {
    deleteNote({
      userId: currentUser.id,
      noteId: params.id!,
    })

    navigate("/notes")
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        justifyContent: "flex-start",
        paddingTop: { xs: "0vh", md: "2vh" },
        paddingLeft: "2vh",
        paddingRight: "2vh",
        gap: "1vh",
      }}
    >
      <Typography variant="h3">{title}</Typography>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" type="button" component={RouterLink} to={`/notes/${id}/edit`}>
          {main.edit}
        </Button>

        <Button variant="contained" type="button" component={RouterLink} to="..">
          {main.cancel}
        </Button>

        <Button variant="contained" color="error" type="button" onClick={() => setOpenConfirmDeleteModal(true)}>
          {main.delete}
        </Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        {tags.map((tag) => (
          <Chip label={tag} key={tag} variant="filled" sx={{ padding: "15px" }} />
        ))}
      </Stack>
      <Paper variant="elevation" elevation={10} sx={{ padding: "15px", "& > p": { textAlign: "center" } }}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </Paper>

      <Modal
        open={openConfirmDeleteModal}
        onUserResponse={deleteModalHandler}
        texts={{ ok: onDeleteNote.ok, cancel: onDeleteNote.cancel, text: onDeleteNote.text, title: onDeleteNote.title }}
      />
    </Box>
  )
}

export default NotePreview
