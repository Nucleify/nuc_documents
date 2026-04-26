import type { Ref } from 'vue'

import type { OutputFormat } from './output-format'

export interface ConvertFileParams {
  selectedFile: Ref<File | null>
  selectedFormat: Ref<OutputFormat>
  convertBaseUrl: string
  isLoading: Ref<boolean>
  errorMessage: Ref<string>
  successMessage: Ref<string>
}
