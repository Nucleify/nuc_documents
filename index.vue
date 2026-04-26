<template>
  <ad-card class="settings-card grided-content">
    <template #header>
      <div class="settings-card-header-container">
        <ad-heading :tag="4" text="Convert Data" />
      </div>
    </template>

    <template #content>
      <div class="convert-data-content">
        <p class="convert-data-hint">
          Upload one document and choose target format. Converted file downloads
          automatically.
        </p>

        <div class="convert-data-block">
          <span class="convert-data-block-title">1. Upload document</span>
          <div class="convert-data-upload-row">
            <ad-file-upload
              ad-type="main"
              mode="basic"
              name="file"
              choose-label="Select file"
              :auto="false"
              :multiple="false"
              :custom-upload="true"
              :max-file-size="10485760"
              :accept="ACCEPTED_EXTENSIONS"
              class="convert-data-uploader"
              @select="onFileSelect"
              @clear="clearSelection"
            />
          </div>

          <div v-if="selectedFile" class="convert-data-file-meta">
            <span class="convert-data-file-name">{{ selectedFile.name }}</span>
            <span class="convert-data-file-size"
              >{{ formatBytes(selectedFile.size) }}</span
            >
          </div>
        </div>

        <div class="convert-data-block">
          <label class="convert-data-label" for="convert-format">
            2. Choose output format
          </label>
          <ad-select
            ad-type="main"
            id="convert-format"
            v-model="selectedFormat"
            :options="FORMAT_OPTIONS"
            option-label="label"
            option-value="value"
            placeholder="Choose output format"
            class="convert-data-select"
          />
        </div>

        <div class="convert-data-actions">
          <ad-button
            ad-type="main"
            :disabled="isLoading || !selectedFile"
            :label="isLoading ? 'Converting...' : 'Convert file'"
            class="convert-data-convert-btn"
            @click="convertFile"
          />

          <ad-button
            v-if="selectedFile && !isLoading"
            severity="danger"
            outlined
            label="Clear selected file"
            @click="clearSelection"
          />
        </div>

        <p v-if="errorMessage" class="convert-data-error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="convert-data-success">
          {{ successMessage }}
        </p>
      </div>
    </template>
  </ad-card>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { ref } from 'vue'

import {
  clearSelection as clearSelectionAction,
  convertFile as convertFileAction,
  formatBytes,
  normalizeBaseUrl,
  onFileSelect as onFileSelectAction,
} from './utils'
import {
  ACCEPTED_EXTENSIONS,
  DEFAULT_OUTPUT_FORMAT,
  FORMAT_OPTIONS,
} from './constants'
import type { FileSelectEvent, OutputFormat } from './types'

const selectedFile = ref<File | null>(null)
const selectedFormat = ref<OutputFormat>(DEFAULT_OUTPUT_FORMAT)
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const runtimeConfig = useRuntimeConfig()
const convertBaseUrl = normalizeBaseUrl(
  runtimeConfig.public.convertDocumentsUrl
)

function onFileSelect(event: FileSelectEvent): void {
  onFileSelectAction(event, selectedFile, errorMessage, successMessage)
}

function clearSelection(): void {
  clearSelectionAction(selectedFile, errorMessage, successMessage)
}

async function convertFile(): Promise<void> {
  await convertFileAction({
    selectedFile,
    selectedFormat,
    convertBaseUrl,
    isLoading,
    errorMessage,
    successMessage,
  })
}
</script>

<style lang="scss">
@import 'index';
</style>
