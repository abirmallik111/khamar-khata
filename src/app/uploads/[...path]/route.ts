import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await props.params
    const pathSegments = params.path

    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('File not found', { status: 404 })
    }

    const relativePath = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments

    // Prevent directory traversal attacks
    const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '')
    if (safePath.includes('..')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Determine target upload directory
    const defaultUploadDir = path.join(/*turbopackIgnore: true*/ process.cwd(), 'public', 'uploads')
    const uploadDir = process.env.UPLOAD_DIR || defaultUploadDir
    let fullPath = path.join(uploadDir, safePath)

    // Fallback check in process.cwd()/public/uploads if UPLOAD_DIR is custom
    if (!fs.existsSync(fullPath)) {
      const fallbackPath = path.join(defaultUploadDir, safePath)
      if (fs.existsSync(fallbackPath)) {
        fullPath = fallbackPath
      } else {
        return new NextResponse('File not found', { status: 404 })
      }
    }

    const stat = fs.statSync(fullPath)
    if (!stat.isFile()) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Determine Content-Type based on extension
    const ext = path.extname(fullPath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.blob': 'image/jpeg',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    const fileBuffer = fs.readFileSync(fullPath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving upload:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
