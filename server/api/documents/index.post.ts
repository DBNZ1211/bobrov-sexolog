export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'Нет данных формы' })
  }

  let title = ''
  let linkType: string | null = 'none'
  let linkId: string | null = null
  let published = true
  let filePart: { data: Buffer; filename?: string; type?: string } | null = null

  for (const part of form) {
    if (part.name === 'file' && part.data?.length) {
      filePart = part
    } else if (part.name === 'title') {
      title = part.data.toString('utf8')
    } else if (part.name === 'link_type') {
      linkType = part.data.toString('utf8')
    } else if (part.name === 'link_id') {
      linkId = part.data.toString('utf8') || null
    } else if (part.name === 'published') {
      const v = part.data.toString('utf8')
      published = v !== '0' && v !== 'false'
    }
  }

  if (!filePart?.filename) {
    throw createError({ statusCode: 400, statusMessage: 'Файл не передан' })
  }

  const doc = await createDocument({
    title: title || filePart.filename,
    filename: filePart.filename,
    mime: filePart.type || 'application/octet-stream',
    data: Buffer.from(filePart.data),
    link_type: linkType,
    link_id: linkId,
    published,
  })

  return { document: doc }
})
