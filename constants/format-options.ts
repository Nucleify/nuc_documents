import type { FormatOption } from '../types'

import { FORMATS } from './formats'

export const FORMAT_OPTIONS: FormatOption[] = FORMATS.map((format) => ({
  label: format.toUpperCase(),
  value: format,
}))
