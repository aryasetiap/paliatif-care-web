import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Smooth scroll function for anchor links with offset for sticky header
export function smoothScrollTo(elementId: string, offset?: number) {
  const element = document.getElementById(elementId)
  if (element) {
    // Get current header height from the state or use default
    const headerElement = document.querySelector('header')
    const currentHeaderHeight = headerElement ? headerElement.offsetHeight : 88
    const finalOffset = offset !== undefined ? offset : currentHeaderHeight + 20

    const elementPosition = element.offsetTop - finalOffset
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    })
  }
}

// Utility to handle anchor link clicks with sticky header offset
export function handleAnchorLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (href.startsWith('#')) {
    e.preventDefault()
    const elementId = href.substring(1)
    smoothScrollTo(elementId)
  }
}
