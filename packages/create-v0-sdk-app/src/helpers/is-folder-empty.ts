import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { red } from 'picocolors'

const VALID_FILES = [
  '.DS_Store',
  '.git',
  '.gitattributes',
  '.gitignore',
  '.gitlab-ci.yml',
  '.hg',
  '.hgcheck',
  '.hgignore',
  'docs',
  'LICENSE',
  'README.md',
  'mkdocs.yml',
  'Thumbs.db',
]

export function isFolderEmpty(root: string, name: string): boolean {
  const validFiles = VALID_FILES

  let conflicts: string[] = []
  try {
    conflicts = readdirSync(root).filter(
      (file) =>
        !validFiles.includes(file) &&
        // Support IntelliJ IDEA-based editors
        !file.startsWith('.idea'),
    )
  } catch {
    return true
  }

  if (conflicts.length > 0) {
    console.log(
      `The directory ${red(name)} contains files that could conflict:`,
    )
    console.log()
    for (const file of conflicts) {
      try {
        const stats = readdirSync(resolve(root, file))
        if (stats.length > 0) {
          console.log(`  ${file}/`)
        } else {
          console.log(`  ${file}`)
        }
      } catch {
        console.log(`  ${file}`)
      }
    }
    console.log()
    console.log(
      'Either try using a new directory name, or remove the files listed above.',
    )
    console.log()
    return false
  }

  return true
}
