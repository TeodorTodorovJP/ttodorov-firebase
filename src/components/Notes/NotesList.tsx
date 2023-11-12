import { Box, Stack, Typography } from "@mui/material"
import { memo } from "react"
import Note from "./Note"
import { langs, Langs } from "./notesTexts"
import { useAppSelector } from "../../app/hooks"
import { selectUserPreferences } from "../Auth/userSlice"
import { NoteData } from "./notesSlice"

type NoteListType = {
  notes: NoteData[]
}

/**
 * NotesList Component
 *
 * Main goal is to present all notes in a compact way.
 *
 */
export const NotesList = memo(({ notes }: NoteListType) => {
  // For the translates
  const { lang } = useAppSelector(selectUserPreferences)

  const { error } = langs[lang as keyof Langs]

  /** Displays a message when the user has no Notes. */
  if (!!notes && notes.length < 1) {
    return (
      <Box sx={{ display: "flex", width: "100vw", alignItems: "center", justifyContent: "center", marginTop: "5vh" }}>
        <Typography sx={{ textAlign: "center" }}> {error.noNotes} </Typography>
      </Box>
    )
  }

  return (
    <Stack
      spacing={{ xs: 1, sm: 2 }}
      direction="row"
      useFlexGap
      flexWrap="wrap"
      sx={{
        width: "100vw",

        justifyContent: "center",
        alignItems: "center",
        alignSelf: "flex-start",

        maxHeight: "63vh",
        overflowY: "scroll",

        marginBottom: "5vh",
        marginTop: "2vh",
        paddingLeft: "1vh",
        paddingTop: "10px",

        "&::-webkit-scrollbar": {
          width: "0.4em",
        },
        "&::-webkit-scrollbar-track": {
          webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "primary",
          outline: "1px solid slategrey",
          borderRadius: "8px",
        },
      }}
    >
      {notes.map((note) => (
        <Note key={note.id} {...note} />
      ))}
    </Stack>
  )
})

export default NotesList
