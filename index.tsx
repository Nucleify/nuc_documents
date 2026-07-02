'use client'

import type { FileUploadSelectEvent } from 'primereact/fileupload'
import type { JSX } from 'react'
import { useCallback, useState } from 'react'

import type { OutputFormat } from 'nucleify'
import {
  ACCEPTED_EXTENSIONS,
  AdButton,
  AdCard,
  AdFileUpload,
  AdHeading,
  AdSelect,
  convertFileReact,
  DEFAULT_OUTPUT_FORMAT,
  FORMAT_OPTIONS,
  formatBytes,
  normalizeBaseUrl,
} from 'nucleify'

import './_index.scss'

const convertBaseUrl = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_CONVERT_DOCUMENTS_URL ||
    process.env.NUC_CONVERT_DOCUMENTS_URL
)

export function NucDocuments(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>(
    DEFAULT_OUTPUT_FORMAT
  )
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const onFileSelect = useCallback((event: FileUploadSelectEvent): void => {
    setSelectedFile(event.files?.[0] ?? null)
    setErrorMessage('')
    setSuccessMessage('')
  }, [])

  const clearSelection = useCallback((): void => {
    setSelectedFile(null)
    setErrorMessage('')
    setSuccessMessage('')
  }, [])

  const convertFile = useCallback(async (): Promise<void> => {
    await convertFileReact({
      selectedFile,
      selectedFormat,
      convertBaseUrl,
      setIsLoading,
      setErrorMessage,
      setSuccessMessage,
    })
  }, [selectedFile, selectedFormat])

  return (
    <AdCard
      className="settings-card grided-content"
      header={
        <div className="settings-card-header-container">
          <AdHeading tag={4} text="Convert Data" />
        </div>
      }
    >
      <div className="convert-data-content">
        <p className="convert-data-hint">
          Upload one document and choose target format. Converted file downloads
          automatically.
        </p>

        <div className="convert-data-block">
          <span className="convert-data-block-title">1. Upload document</span>
          <div className="convert-data-upload-row">
            <AdFileUpload
              mode="basic"
              name="file"
              chooseLabel="Select file"
              auto={false}
              multiple={false}
              customUpload
              maxFileSize={10485760}
              accept={ACCEPTED_EXTENSIONS}
              className="convert-data-uploader"
              onSelect={onFileSelect}
              onClear={clearSelection}
            />
          </div>

          {selectedFile ? (
            <div className="convert-data-file-meta">
              <span className="convert-data-file-name">
                {selectedFile.name}
              </span>
              <span className="convert-data-file-size">
                {formatBytes(selectedFile.size)}
              </span>
            </div>
          ) : null}
        </div>

        <div className="convert-data-block">
          <label className="convert-data-label" htmlFor="convert-format">
            2. Choose output format
          </label>
          <AdSelect
            nuiType="main"
            inputId="convert-format"
            value={selectedFormat}
            options={FORMAT_OPTIONS}
            optionLabel="label"
            optionValue="value"
            placeholder="Choose output format"
            className="convert-data-select"
            onChange={(event: { value: OutputFormat }) =>
              setSelectedFormat(event.value)
            }
          />
        </div>

        <div className="convert-data-actions">
          <AdButton
            nuiType="main"
            disabled={isLoading || !selectedFile}
            label={isLoading ? 'Converting...' : 'Convert file'}
            className="convert-data-convert-btn"
            type="button"
            onClick={() => void convertFile()}
          />

          {selectedFile && !isLoading ? (
            <AdButton
              severity="danger"
              outlined
              label="Clear selected file"
              type="button"
              onClick={clearSelection}
            />
          ) : null}
        </div>

        {errorMessage ? (
          <p className="convert-data-error">{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className="convert-data-success">{successMessage}</p>
        ) : null}
      </div>
    </AdCard>
  )
}
