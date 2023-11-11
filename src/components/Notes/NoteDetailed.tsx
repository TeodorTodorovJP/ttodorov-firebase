import { useParams } from "react-router-dom"
import { useAppSelector } from "../../app/hooks"
import NoteForm from "./NoteForm"
import { selectNote } from "./notesSlice"

export const EditNote = () => {
  const params = useParams<"id">()
  const noteData = useAppSelector((state) => selectNote(state, params.id!)[0])

  return <NoteForm noteData={noteData} />
}

export default EditNote
