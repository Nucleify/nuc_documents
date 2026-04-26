export function normalizeBaseUrl(value: unknown): string {
  return String(value || '').replace(/\/$/, '')
}
