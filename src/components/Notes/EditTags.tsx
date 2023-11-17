import { Box, Button, Chip, CircularProgress, Stack, Typography } from "@mui/material"
import { useState } from "react"
import { langs, Langs } from "./notesTexts"
import { useAppSelector } from "../../app/hooks"
import { selectUserData, selectUserPreferences } from "../Auth/userSlice"
import { useDeleteTagMutation, useGetTagsQuery } from "./notesApi"
import { selectTags } from "./notesSlice"
import DeleteIcon from "@mui/icons-material/Delete"
import { Link as RouterLink } from "react-router-dom"
import Modal from "../Modal/Modal"

/**
 * EditTags Component
 *
 * Main goal is to present all note tags available to the user and allow deletion.
 *
 */
export const EditTags = () => {
  const { lang } = useAppSelector(selectUserPreferences)
  const currentUser = useAppSelector(selectUserData)
  const tags = useAppSelector(selectTags)

  useGetTagsQuery(currentUser.id)
  const [deleteTag] = useDeleteTagMutation()

  const [openConfirmDeleteModal, setOpenConfirmDeleteModal] = useState<boolean>(false)
  const [tagForDeletion, setTagForDeletion] = useState<string | null>(null)

  const { main, error, onDeleteTag } = langs[lang as keyof Langs]

  /** On user clicking the delete icon on a tag. */
  const handleDelete = (tag: string) => {
    setOpenConfirmDeleteModal(true)
    /** Prepares the tag locally */
    setTagForDeletion(tag)
  }

  /** On user responding the deletion of a tag. */
  const deleteModalHandler = (userResponse: string) => {
    // If the response is OK and we have a prepared tag
    if (userResponse === "ok" && tagForDeletion) {
      deleteTag({ userId: currentUser.id, tag: tagForDeletion })
    }
    /** Clear the tag preparation */
    setTagForDeletion(null)
    setOpenConfirmDeleteModal(false)
  }

  /** If tags take a while to load */
  if (!tags) {
    return (
      <Box sx={{ display: "flex" }}>
        <CircularProgress />
      </Box>
    )
  }

  /** If tags loaded but the user has none. */
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
            label={tag}
            key={tag}
            onDelete={() => handleDelete(tag)}
            deleteIcon={<DeleteIcon />}
            variant="filled"
            sx={{ padding: "15px" }}
          />
        ))}
      </Stack>
      <Button variant="contained" type="button" component={RouterLink} to="..">
        {main.cancel}
      </Button>

      <Modal
        open={openConfirmDeleteModal}
        onUserResponse={deleteModalHandler}
        texts={{ ok: onDeleteTag.ok, cancel: onDeleteTag.cancel, text: onDeleteTag.text, title: onDeleteTag.title }}
      />
    </Box>
  )
}

export default EditTags
