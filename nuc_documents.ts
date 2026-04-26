import type { App } from 'vue'

import { NucDocuments } from '.'

export function registerNucDocuments(app: App<Element>): void {
  app.component('nuc-documents', NucDocuments)
}
