import type { Ref } from 'vue'

export function clearSelection(
  selectedFile: Ref<File | null>,
  errorMessage: Ref<string>,
  successMessage: Ref<string>
): void {
  selectedFile.value = null
  errorMessage.value = ''
  successMessage.value = ''
}
