import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const pnpmDir = path.join(rootDir, 'node_modules', '.pnpm')
const targetFiles = ['dist/index.cjs', 'dist/index.js']
const patchedGuard = 'if(!0)return;'
const warningGuards = [
  'if(n||"undefined"!=typeof process&&process.env&&(process.env.BROWSERSLIST_IGNORE_OLD_DATA||process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA))return;',
  'if(n||"undefined"!==typeof process&&process.env&&(process.env.BROWSERSLIST_IGNORE_OLD_DATA||process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA))return;',
]
const nextCompiledWarningStatements = [
  '1764339020978<(new Date).setMonth((new Date).getMonth()-2)&&console.warn("[baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`");',
]

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return false

  const source = fs.readFileSync(filePath, 'utf8')

  let nextSource = source
  const matchedGuard = warningGuards.find((guard) => source.includes(guard))
  if (matchedGuard && !source.includes(patchedGuard)) {
    nextSource = nextSource.replace(matchedGuard, patchedGuard)
  }

  for (const warningStatement of nextCompiledWarningStatements) {
    if (nextSource.includes(warningStatement)) {
      nextSource = nextSource.replace(warningStatement, '')
    }
  }

  if (nextSource === source) return false

  fs.writeFileSync(filePath, nextSource)
  return true
}

function main() {
  if (!fs.existsSync(pnpmDir)) {
    return
  }

  let patchedCount = 0
  for (const entry of fs.readdirSync(pnpmDir)) {
    if (!entry.startsWith('baseline-browser-mapping@')) continue

    const packageRoot = path.join(
      pnpmDir,
      entry,
      'node_modules',
      'baseline-browser-mapping'
    )

    for (const relativePath of targetFiles) {
      if (patchFile(path.join(packageRoot, relativePath))) {
        patchedCount += 1
      }
    }
  }

  const nextCompiledBrowserslist = path.join(
    rootDir,
    'node_modules',
    'next',
    'dist',
    'compiled',
    'browserslist',
    'index.js'
  )

  if (patchFile(nextCompiledBrowserslist)) {
    patchedCount += 1
  }

  if (patchedCount > 0) {
    console.log(
      `[patch-baseline-browser-mapping] patched ${patchedCount} file(s)`
    )
  }
}

main()
