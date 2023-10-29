import { Button, Snackbar } from "@mui/material"
import { useState, ReactElement } from "react"

interface ButtonProps {
  text: String
  styles: any
}

export const CopyToClipboard = ({ text, styles }: ButtonProps): ReactElement => {
  const [open, setOpen] = useState<boolean>(false)
  const handleClick = () => {
    setOpen(true)
    navigator.clipboard.writeText(window.location.toString())
  }

  return (
    <>
      <Button onClick={handleClick} {...styles}>
        {text}
      </Button>
      <Snackbar open={open} onClose={() => setOpen(false)} autoHideDuration={2000} message="Copied to clipboard" />
    </>
  )
}

export default CopyToClipboard
