import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { getPreviewsDir } from './db'

const RASTER_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp'])
const OFFICE_EXTS = new Set(['.doc', '.docx', '.odt'])

let pdfjsConfigured = false

function which(cmd: string): string | null {
  const finder = process.platform === 'win32' ? 'where' : 'which'
  const result = spawnSync(finder, [cmd], { encoding: 'utf8' })
  if (result.status !== 0) return null
  const line = (result.stdout || '').split(/\r?\n/).map((s) => s.trim()).find(Boolean)
  return line || null
}

function findPdftoppm(): string | null {
  const fromPath = which('pdftoppm')
  if (fromPath) return fromPath
  if (process.platform !== 'win32') return null
  return (
    [
      'C:\\Program Files\\poppler\\Library\\bin\\pdftoppm.exe',
      'C:\\Program Files\\poppler\\bin\\pdftoppm.exe',
      'C:\\poppler\\Library\\bin\\pdftoppm.exe',
      'C:\\poppler\\bin\\pdftoppm.exe',
    ].find((p) => existsSync(p)) || null
  )
}

async function writePlaceholder(outPath: string, label: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
      <rect width="800" height="1000" fill="#eef2f7"/>
      <rect x="80" y="120" width="640" height="760" rx="16" fill="#ffffff" stroke="#c5d0de" stroke-width="3"/>
      <text x="400" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#1a365d">${label}</text>
      <text x="400" y="560" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#64748b">Превью недоступно</text>
    </svg>
  `
  await sharp(Buffer.from(svg)).png().toFile(outPath)
}

async function rasterToPreview(sourcePath: string, outPath: string) {
  await sharp(sourcePath)
    .rotate()
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(outPath)
}

async function shrinkPng(sourcePath: string, outPath: string) {
  const tmp = `${outPath}.tmp`
  await sharp(sourcePath)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .png()
    .toFile(tmp)
  copyFileSync(tmp, outPath)
  try {
    rmSync(tmp)
  } catch {
    /* ignore */
  }
}

function pdfToPngWithPoppler(pdfPath: string, outPathWithoutExt: string): boolean {
  const bin = findPdftoppm()
  if (!bin) return false
  const result = spawnSync(
    bin,
    ['-png', '-f', '1', '-singlefile', '-r', '144', pdfPath, outPathWithoutExt],
    { encoding: 'utf8' },
  )
  return result.status === 0 && existsSync(`${outPathWithoutExt}.png`)
}

async function ensurePdfjsConfigured() {
  if (pdfjsConfigured) return
  const { definePDFJSModule } = await import('unpdf')
  await definePDFJSModule(() => import('pdfjs-dist/legacy/build/pdf.mjs'))
  pdfjsConfigured = true
}

/**
 * Pure-JS PDF → PNG via pdf.js + @napi-rs/canvas (no system poppler required).
 */
async function pdfToPngWithPdfjs(pdfPath: string, outPath: string): Promise<boolean> {
  try {
    await ensurePdfjsConfigured()
    const { renderPageAsImage } = await import('unpdf')
    const bytes = new Uint8Array(readFileSync(pdfPath))
    const result = await renderPageAsImage(bytes, 1, {
      canvasImport: () => import('@napi-rs/canvas'),
      scale: 2,
    })
    writeFileSync(outPath, Buffer.from(result))
    return existsSync(outPath)
  } catch (err) {
    console.error('[preview] pdfjs render failed:', err)
    return false
  }
}

async function pdfToPreview(pdfPath: string, outPath: string, tmpBase: string): Promise<boolean> {
  if (pdfToPngWithPoppler(pdfPath, tmpBase)) {
    const generated = `${tmpBase}.png`
    if (generated !== outPath) {
      copyFileSync(generated, outPath)
      try {
        rmSync(generated)
      } catch {
        /* ignore */
      }
    }
    await shrinkPng(outPath, outPath)
    return true
  }

  if (await pdfToPngWithPdfjs(pdfPath, outPath)) {
    await shrinkPng(outPath, outPath)
    return true
  }

  return false
}

function officeToPdf(sourcePath: string, outDir: string): string | null {
  const soffice =
    which('soffice') ||
    which('libreoffice') ||
    (process.platform === 'win32'
      ? [
          'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
          'C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe',
        ].find((p) => existsSync(p)) || null
      : null)

  if (!soffice) return null

  mkdirSync(outDir, { recursive: true })
  const result = spawnSync(
    soffice,
    ['--headless', '--norestore', '--convert-to', 'pdf', '--outdir', outDir, sourcePath],
    { encoding: 'utf8', timeout: 120_000 },
  )
  if (result.status !== 0) return null

  const pdfs = readdirSync(outDir).filter((f) => f.toLowerCase().endsWith('.pdf'))
  if (!pdfs.length) return null
  return join(outDir, pdfs[0])
}

/**
 * Generates `{id}.png` in previews dir. Returns relative filename.
 */
export async function generatePreview(input: {
  id: string
  sourcePath: string
  ext: string
}): Promise<string> {
  const previewsDir = getPreviewsDir()
  const outName = `${input.id}.png`
  const outPath = join(previewsDir, outName)
  const ext = input.ext.toLowerCase().startsWith('.')
    ? input.ext.toLowerCase()
    : `.${input.ext.toLowerCase()}`

  try {
    if (RASTER_EXTS.has(ext)) {
      await rasterToPreview(input.sourcePath, outPath)
      return outName
    }

    if (ext === '.pdf') {
      const tmpBase = join(previewsDir, `${input.id}-pdf`)
      if (await pdfToPreview(input.sourcePath, outPath, tmpBase)) {
        return outName
      }
      await writePlaceholder(outPath, 'PDF')
      return outName
    }

    if (OFFICE_EXTS.has(ext)) {
      const workDir = join(tmpdir(), `doc-preview-${input.id}`)
      mkdirSync(workDir, { recursive: true })
      try {
        const pdfPath = officeToPdf(input.sourcePath, workDir)
        if (pdfPath) {
          const tmpBase = join(workDir, 'page')
          if (await pdfToPreview(pdfPath, outPath, tmpBase)) {
            return outName
          }
        }
      } finally {
        try {
          rmSync(workDir, { recursive: true, force: true })
        } catch {
          /* ignore */
        }
      }
      const label = ext.replace('.', '').toUpperCase()
      await writePlaceholder(outPath, label)
      return outName
    }

    await writePlaceholder(outPath, 'FILE')
    return outName
  } catch (err) {
    console.error('[preview] generatePreview failed:', err)
    try {
      await writePlaceholder(outPath, ext.replace('.', '').toUpperCase() || 'FILE')
      return outName
    } catch {
      const buf = await sharp({
        create: {
          width: 400,
          height: 500,
          channels: 3,
          background: { r: 238, g: 242, b: 247 },
        },
      })
        .png()
        .toBuffer()
      writeFileSync(outPath, buf)
      return outName
    }
  }
}

export function readPreviewBytes(path: string) {
  return readFileSync(path)
}
