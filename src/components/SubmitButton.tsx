'use client'

import { useFormStatus } from 'react-dom'
import { Loader2 } from 'lucide-react'

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loadingText?: string;
  icon?: React.ReactNode;
}

export function SubmitButton({ 
  children, 
  loadingText,
  icon,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={className}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
          {loadingText && <span>{loadingText}</span>}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  )
}
