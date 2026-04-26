export function getDownloadName(
  filename: string,
  outputFormat: string
): string {
  const safeName = filename.replace(/\.[^.]+$/, '')
  return `${safeName}.${outputFormat}`
}
