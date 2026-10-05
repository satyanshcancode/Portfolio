import { useEffect, useRef, useState } from 'react'

export type NavLink = { label: string; href: string }

/**
 * The small-screen menu. Hidden above 560px in chrome.css, where the header
 * shows the links inline instead.
 */
export default function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      button.current?.focus() // escape should land you back on the trigger
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className={`mobilenav${open ? ' mobilenav--open' : ''}`}>
      <button
        ref={button}
        type="button"
        className="mobilenav__trigger"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? 'Close menu' : 'Menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          width="1.5em"
          height="1.5em"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
          focusable="false"
        >
          {open ? (
            <>
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {/* display:none while closed, so the links stay out of the tab order. */}
      <div id="mobile-nav-panel" className="mobilenav__panel">
        <nav aria-label="Sections">
          {links.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
