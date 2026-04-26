import type { ConvertFileParams } from '../types'

import { getDownloadName } from './get-download-name'

export async function convertFile({
  selectedFile,
  selectedFormat,
  convertBaseUrl,
  isLoading,
  errorMessage,
  successMessage,
}: ConvertFileParams): Promise<void> {
  if (!selectedFile.value) {
    errorMessage.value = 'Select a file first.'
    return
  }

  if (!convertBaseUrl) {
    errorMessage.value = 'NUC_CONVERT_DOCUMENTS_URL is not configured.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    const response = await fetch(
      `${convertBaseUrl}/?format=${selectedFormat.value}`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const details = await response.text()
      throw new Error(details || 'Conversion failed.')
    }

    const blob = await response.blob()
    const downloadName = getDownloadName(
      selectedFile.value.name,
      selectedFormat.value
    )
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = downloadName
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
    successMessage.value = `Converted successfully to ${selectedFormat.value.toUpperCase()}.`
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unexpected error during conversion.'
  } finally {
    isLoading.value = false
  }
}
