import { useParams } from "react-router-dom"
import { useAppSelector } from "../../app/hooks"
import NoteForm from "./NoteForm"
import { selectNote } from "./notesSlice"

/**
 * EditNote Component
 *
 * Main goal is to wrap the 'NoteForm' Component with data. 
 * Get's the data for a note, based on the id passed to the route params.
 *
 */
export const EditNote = () => {
  const params = useParams<"id">()
  const noteData = useAppSelector((state) => selectNote(state, params.id!)[0])

  return <NoteForm noteData={noteData} />
}

export default EditNote
