import type { OutputFormat } from 'nucleify'
import { getDownloadName } from 'nucleify'

export interface ConvertFileReactParams {
  selectedFile: File | null
  selectedFormat: OutputFormat
  convertBaseUrl: string
  setIsLoading: (value: boolean) => void
  setErrorMessage: (value: string) => void
  setSuccessMessage: (value: string) => void
}

export async function convertFileReact({
  selectedFile,
  selectedFormat,
  convertBaseUrl,
  setIsLoading,
  setErrorMessage,
  setSuccessMessage,
}: ConvertFileReactParams): Promise<void> {
  if (!selectedFile) {
    setErrorMessage('Select a file first.')
    return
  }

  if (!convertBaseUrl) {
    setErrorMessage('NUC_CONVERT_DOCUMENTS_URL is not configured.')
    return
  }

  setIsLoading(true)
  setErrorMessage('')
  setSuccessMessage('')

  try {
    const formData = new FormData()
    formData.append('file', selectedFile)

    const response = await fetch(
      `${convertBaseUrl}/?format=${selectedFormat}`,
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
    const downloadName = getDownloadName(selectedFile.name, selectedFormat)
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = downloadName
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
    setSuccessMessage(
      `Converted successfully to ${selectedFormat.toUpperCase()}.`
    )
  } catch (error) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : 'Unexpected error during conversion.'
    )
  } finally {
    setIsLoading(false)
  }
}
