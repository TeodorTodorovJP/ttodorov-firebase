import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { langs, Langs } from "./notesTexts"
import { useAppSelector } from "../../app/hooks"
import { selectUserData, selectUserPreferences } from "../Auth/userSlice"
import { useDeleteTagMutation, useGetTagsQuery } from "./notesApi"
import { selectTags } from "./notesSlice"
import DeleteIcon from "@mui/icons-material/Delete"
import { useNavigate, Link as RouterLink } from "react-router-dom"
import DialogConfirm from "../Modal/DialogConfirm"

export const EditTags = () => {
  // For the translates
  const { lang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)
  const tags = useAppSelector(selectTags)

  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState<boolean>(false)

  const [tagForDeletion, setTagForDeletion] = useState<string | null>(null)

  const { main, error, onDeleteTag } = langs[lang as keyof Langs]

  /** Access Router */
  const navigate = useNavigate()

  useGetTagsQuery(currentUser.id)
  const [deleteTag] = useDeleteTagMutation()

  const deleteModalHandler = (value: string) => {
    if (value === "ok" && tagForDeletion) {
      deleteTag({ userId: currentUser.id, tagId: tagForDeletion })
    }

    setTagForDeletion(null)
    setOpenConfirmDeleteModal(false)
  }

  const handleDelete = (id: string) => {
    setOpenConfirmDeleteModal(true)
    setTagForDeletion(id)
  }

  if (!tags) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!!tags && tags.length < 1) {
    return (
      <Box sx={{ display: "flex" }}>
        <Typography> {error.noTags} </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "flex-start",
        gap: "5vh",
        top: "10vh",
      }}
    >
      <Typography variant="h3"> {main.editTags} </Typography>
      <Typography align="center"> {main.editTagsDesc} </Typography>
      <Stack
        spacing={{ xs: 1, sm: 2 }}
        direction="row"
        useFlexGap
        flexWrap="wrap"
        sx={{
          maxWidth: "100vw",
          minWidth: "100vw",
          marginBottom: "5vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {tags.map((tag) => (
          <Chip
            label={tag.title}
            key={tag.id}
            onDelete={() => handleDelete(tag.id)}
            deleteIcon={<DeleteIcon />}
            variant="filled"
            sx={{ padding: "15px" }}
          />
        ))}
      </Stack>
      <Button variant="contained" type="button" component={RouterLink} to="..">
        {main.cancel}
      </Button>

      <DialogConfirm
        id="delete-confirm"
        keepMounted
        open={openConfirmDeleteModal}
        userResponse={deleteModalHandler}
        texts={{ ok: onDeleteTag.ok, cancel: onDeleteTag.cancel, text: onDeleteTag.text, title: onDeleteTag.title }}
      />
    </Box>
  )
}

export default EditTags
