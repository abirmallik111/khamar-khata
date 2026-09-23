'use client'

import { useState } from 'react'
import Image, { ImageProps } from 'next/image'

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#e8e8e8" offset="20%" />
      <stop stop-color="#f3f3f3" offset="50%" />
      <stop stop-color="#e8e8e8" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#e8e8e8" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str)

import { ImageIcon } from 'lucide-react'

export function SmartImage(props: ImageProps) {
  const [isLoading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-(--color-surface-high) text-(--color-on-surface-variant)/60 gap-1.5 p-4">
        <ImageIcon className="w-8 h-8 opacity-40" />
        <span className="text-[11px] font-medium tracking-tight opacity-75">No Image Available</span>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-(--color-surface-high)">
      <Image
        {...props}
        placeholder={props.placeholder || `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`}
        className={`${props.className || ''} transition-all duration-1000 ease-out ${
          isLoading ? 'scale-110 blur-2xl' : 'scale-100 blur-0'
        }`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setHasError(true)
        }}
      />
    </div>
  )
}
