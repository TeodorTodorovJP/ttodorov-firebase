import { useNavigate, useParams } from "react-router-dom"
import { useAppSelector } from "../../app/hooks"
import NoteForm from "./NoteForm"
import { selectNote } from "./notesSlice"
import ReactMarkdown from "react-markdown"
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material"
import { selectUserData, selectUserPreferences } from "../Auth/userSlice"
import { Langs, langs } from "./notesTexts"
import { useEffect, useRef, useState, useMemo } from "react"
import DialogConfirm from "../Modal/DialogConfirm"
import { useDeleteNoteMutation } from "./notesApi"

export const NotePreview = () => {
  const params = useParams<"id">()
  const { id, markdown, tags, title } = useAppSelector((state) => selectNote(state, params.id!)[0])
  const { lang: currentLang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)

  const [deleteNote] = useDeleteNoteMutation()

  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState<boolean>(false)

  /** Access Router */
  const navigate = useNavigate()

  const { main, error, onDeleteNote } = langs[currentLang as keyof Langs]

  const deleteModalHandler = (value: string) => {
    if (value === "ok") deleteNoteHandler()
    if (value === "cancel") setOpenConfirmDeleteModal(false)
  }

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
        <Button variant="contained" type="button" onClick={() => navigate(`/notes/${id}/edit`)}>
          {main.edit}
        </Button>

        <Button variant="contained" type="button" onClick={() => navigate("/notes")}>
          {main.cancel}
        </Button>

        <Button variant="contained" color="error" type="button" onClick={() => setOpenConfirmDeleteModal(true)}>
          {main.delete}
        </Button>
      </Stack>

      <Stack direction="row" spacing={2}>
        {tags.map((tag) => (
          <Chip label={tag.title} key={tag.id} variant="filled" sx={{ padding: "15px" }} />
        ))}
      </Stack>
      <Paper variant="elevation" elevation={10} sx={{ padding: "15px", "& > p": { textAlign: "center" } }}>
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </Paper>

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

export default NotePreview
