import { Box, useTheme } from "@mui/material"
import CreatableReactSelect from "react-select/creatable"

type SelectType = {
  value: SelectTag[]
  onChange: Function
}

export type SelectTag = {
  label: string
  value: string
}

/**
 * SelectRSCMUI -means Select input field from React-Select/Creatable, styled like MUI
 */
export const SelectRSCMUI = ({ value, onChange }: SelectType) => {
  const { palette } = useTheme()

  return (
    <Box>
      <CreatableReactSelect
        isMulti
        value={value}
        onChange={(tags) => onChange(tags)}
        styles={{
          control: (providedStyles) => ({
            ...providedStyles,
            borderColor: palette.divider,
            background: "none",
            color: palette.text.primary,
            minWidth: "250px",
          }),
          menu: (providedStyles) => ({
            ...providedStyles,
            background: palette.divider,
          }),
          option: (providedStyles) => ({
            ...providedStyles, // To keep the default style
            background: palette.background.default,

            color: palette.text.primary,
          }),
          multiValue: (providedStyles) => ({
            ...providedStyles,
            background: palette.divider,
            color: palette.text.primary,
            "& > div": {
              color: palette.text.primary,
            },
          }),
          input: (providedStyles) => ({
            ...providedStyles,
            color: palette.text.primary,
            lineHeight: "43px",
          }),
        }}
      />
    </Box>
  )
}

export default SelectRSCMUI
