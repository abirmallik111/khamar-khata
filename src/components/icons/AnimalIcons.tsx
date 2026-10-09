import React from 'react'

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
}

/**
 * Clean Lucide-styled Goat Icon
 */
export function GoatIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Goat Horns (curved back & up) */}
      <path d="M9 7C8 4.2 8.2 2.5 10 2C11 2.6 11 4.5 10.5 7" />
      <path d="M15 7C16 4.2 15.8 2.5 14 2C13 2.6 13 4.5 13.5 7" />
      {/* Goat Ears */}
      <path d="M7 9.5L2.5 11.5L6.5 13.5" />
      <path d="M17 9.5L21.5 11.5L17.5 13.5" />
      {/* Head shape */}
      <path d="M8 7H16L15 14L12 18L9 14Z" />
      {/* Beard */}
      <path d="M11 18L12 21.5L13 18" />
      {/* Eyes */}
      <circle cx="10" cy="11" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11" r="0.8" fill="currentColor" stroke="none" />
      {/* Muzzle line */}
      <path d="M10.5 15H13.5" />
    </svg>
  )
}

/**
 * Clean Lucide-styled Cow Icon
 */
export function CowIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Cow Horns (curving outward & upward) */}
      <path d="M7 8C5.2 6.2 4.2 4.8 5.2 3.2C6.8 4.2 7.8 6 8.2 8" />
      <path d="M17 8C18.8 6.2 19.8 4.8 18.8 3.2C17.2 4.2 16.2 6 15.8 8" />
      {/* Cow Drooping Ears */}
      <path d="M6 9C3.8 9 2.5 10.8 3.5 12.5C4.8 12.5 6 11.2 6 9Z" />
      <path d="M18 9C20.2 9 21.5 10.8 20.5 12.5C19.2 12.5 18 11.2 18 9Z" />
      {/* Head upper part */}
      <path d="M7 8H17V13H7Z" />
      {/* Eyes */}
      <circle cx="9.5" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="10.5" r="0.8" fill="currentColor" stroke="none" />
      {/* Big Muzzle / Snout */}
      <rect x="6" y="13" width="12" height="7.5" rx="3.75" />
      {/* Nostrils */}
      <circle cx="9.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
