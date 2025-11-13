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

    // Check if we're currently on the home page
    const isHomePage = window.location.pathname === '/'

    if (isHomePage) {
      // If on home page, try to scroll to the element
      const element = document.getElementById(elementId)
      if (element) {
        smoothScrollTo(elementId)
      } else {
        // If element doesn't exist, navigate to home page with hash
        window.location.href = '/' + href
      }
    } else {
      // If not on home page, navigate to home page with hash
      window.location.href = '/' + href
    }
  }
}

// Router-aware version for use with Next.js router
export function handleAnchorLinkNavigation(router: any, href: string, e?: React.MouseEvent) {
  if (e) {
    e.preventDefault()
  }

  if (href.startsWith('#')) {
    const elementId = href.substring(1)
    const isHomePage = window.location.pathname === '/'

    if (isHomePage) {
      // If on home page, try smooth scroll
      const element = document.getElementById(elementId)
      if (element) {
        smoothScrollTo(elementId)
      } else {
        // Navigate to home with hash if element doesn't exist
        router.push('/' + href)
      }
    } else {
      // Navigate to home page with hash
      router.push('/' + href)
    }
  }
}
