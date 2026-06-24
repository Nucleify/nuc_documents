import type { Ref } from 'vue'

import type { FileSelectEvent } from 'nucleify'

export function onFileSelect(
  event: FileSelectEvent,
  selectedFile: Ref<File | null>,
  errorMessage: Ref<string>,
  successMessage: Ref<string>
): void {
  selectedFile.value = event.files?.[0] ?? null
  errorMessage.value = ''
  successMessage.value = ''
}
