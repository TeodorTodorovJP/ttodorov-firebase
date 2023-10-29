import { Avatar, Box, Typography } from "@mui/material"
import { memo } from "react"

/**
 * GenerateProfilePic Component
 *
 * A functional React component that generates profile picture initials based on a given name or email.
 *
 * Props - description of all props in this format.
 * - names: A string input that accepts a name or email. The component splits the string and uses the initials for the profile picture.
 * - className (optional): A string to apply custom CSS classes.
 *
 */
export const GenerateProfilePic = (props: { names: string }) => {
  const names = props.names
  const nameType = +names.indexOf(".") === -1 ? "name" : "email"

  let firstName = ""
  let secondName = ""
  if (nameType === "name") {
    const namesArr = names.split(" ")
    firstName = namesArr[0]
    secondName = namesArr[namesArr.length - 1] && namesArr[namesArr.length - 1]
  }
  if (nameType === "email") {
    ;[firstName, secondName] = names.split(".")
  }

  const firstLetter = firstName.charAt(0).toUpperCase()
  const secondLetter = secondName.charAt(0).toUpperCase()

  return <Avatar>{`${firstLetter} ${secondLetter}`}</Avatar>
}

export default memo(GenerateProfilePic)
