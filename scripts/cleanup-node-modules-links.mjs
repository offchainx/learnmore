import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const linkPath = path.join(rootDir, 'node_modules', 'node_modules')

function isOutsideProject(targetPath) {
  const relativePath = path.relative(rootDir, targetPath)
  return relativePath.startsWith('..') || path.isAbsolute(relativePath)
}

function main() {
  if (!fs.existsSync(linkPath)) return

  let stat
  try {
    stat = fs.lstatSync(linkPath)
  } catch {
    return
  }

  if (!stat.isSymbolicLink()) return

  let targetPath
  try {
    targetPath = fs.realpathSync(linkPath)
  } catch {
    fs.unlinkSync(linkPath)
    console.log(`[cleanup-node-modules-links] removed broken symlink: ${linkPath}`)
    return
  }

  if (!isOutsideProject(targetPath)) return

  fs.unlinkSync(linkPath)
  console.log(
    `[cleanup-node-modules-links] removed invalid symlink: ${linkPath} -> ${targetPath}`
  )
}

main()
