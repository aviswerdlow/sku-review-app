"use client"

import { cn } from "@/lib/utils"

interface AnimateProps {
  children: React.ReactNode
  className?: string
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn'
  delay?: number
}

export function Animate({ 
  children, 
  className,
  animation = 'fadeIn',
  delay = 0 
}: AnimateProps) {
  const animations = {
    fadeIn: 'animate-in fade-in duration-500',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-500',
    scaleIn: 'animate-in zoom-in-95 duration-300'
  }
  
  return (
    <div 
      className={cn(animations[animation], className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}