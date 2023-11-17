import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import List from "@mui/material/List"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Dialog from "@mui/material/Dialog"
import RadioGroup from "@mui/material/RadioGroup"
import Radio from "@mui/material/Radio"
import FormControlLabel from "@mui/material/FormControlLabel"
import { Typography } from "@mui/material"
import { useEffect, useState, useRef } from "react"

export interface ModalTexts {
  title: string
  text: string
  ok: string
  cancel: string
}

export interface ModalProps {
  open: boolean
  onUserResponse: (value: string) => void
  texts: ModalTexts
}

export const Modal = (props: ModalProps) => {
  const { onUserResponse, open, ...other } = props

  const handleCancel = () => {
    onUserResponse("cancel")
  }

  const handleOk = () => {
    onUserResponse("ok")
  }

  const handleBackdropClick = () => {
    return
  }

  return (
    <Dialog
      sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
      maxWidth="xs"
      open={open}
      onClose={() => handleBackdropClick()}
      {...other}
    >
      <DialogTitle>{props.texts.title}</DialogTitle>

      <DialogContent dividers>
        <Typography variant="caption">{props.texts.text}</Typography>
      </DialogContent>

      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          {props.texts.cancel}
        </Button>
        <Button onClick={handleOk}>{props.texts.ok}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default Modal
