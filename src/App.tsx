import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { NetworkState } from './scene/network'
import MobileNav from './components/MobileNav'
import Projects from './components/Projects'
import TechStrip from './components/TechStrip'
import './components/chrome.css'
import {
  certificates,
  contactLinks,
  education,
  focus,
  navLinks,
  profile,
  stack,
  training,
} from './data/content'

gsap.registerPlugin(ScrollTrigger)

const year = new Date().getFullYear()

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null)

  // three.js is the heaviest thing on the page, so it loads as its own chunk
  // after first paint. The page reads fine in the meantime.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let net: { state: NetworkState; dispose(): void } | undefined
    let mm: ReturnType<typeof gsap.matchMedia> | undefined
    let cancelled = false

    import('./scene/network').then(({ createNetwork }) => {
      if (cancelled || !canvas.current) return
      try {
        net = createNetwork(canvas.current, reduce)
      } catch {
        return // No WebGL: the page works without the scene.
      }
      const s = net.state
      mm = gsap.matchMedia()

      mm.add({ wide: '(min-width: 900px)', narrow: '(max-width: 899px)' }, (ctx) => {
        const wide = !!ctx.conditions?.wide
        // Narrow screens keep the mesh dimmer: the text sits right on top of it.
        const hero = wide ? { x: 3.1, y: 0.2, scale: 1, opacity: 1 } : { x: 0, y: 1.9, scale: 0.6, opacity: 0.5 }
        gsap.set(s, hero)

        if (!reduce) gsap.from(s, { scale: hero.scale * 0.55, opacity: 0, duration: 1.8, ease: 'power3.out' })

        // Scrolling past the hero pushes the mesh back to become the page's backdrop.
        gsap.to(s, {
          x: 0, y: 0, scale: wide ? 2.1 : 1.5, opacity: wide ? 0.14 : 0.08, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'top 25%', scrub: true },
        })
        // Starts at 'top 55%', not 'top bottom': brightening any earlier puts the
        // mesh at full strength behind the tools/certificates text above it.
        gsap.to(s, {
          x: wide ? 3.4 : 0, scale: wide ? 1.2 : 1.1, opacity: wide ? 0.5 : 0.16, ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: '#contact', start: 'top 55%', end: 'bottom bottom', scrub: true },
        })
      })
    })

    return () => {
      cancelled = true
      mm?.revert()
      net?.dispose()
    }
  }, [])

  const [first, last] = profile.name.split(' ')

  return (
    <>
      <a className="skip" href="#about">Skip to content</a>
      <canvas ref={canvas} className="scene" aria-hidden="true" />

      <header className="nav">
        <a className="nav__name" href="#top">{profile.name}</a>
        <nav className="nav__links" aria-label="Sections">
          {navLinks.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </nav>
        <MobileNav links={[...navLinks]} />
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__text">
            <h1 className="hero__name" aria-label={profile.name}>
              <span className="hero__line" aria-hidden="true"><span>{first}</span></span>
              <span className="hero__line" aria-hidden="true"><span>{last}</span></span>
            </h1>
            {/* hand-drawn underline, picked up from the reference */}
            <svg className="hero__squiggle hero__fade" viewBox="0 0 320 24" fill="none" aria-hidden="true" focusable="false">
              <path d="M6 15c38-9 64-6 96 1 10 2 18 2 24-2" stroke="var(--packet)" strokeWidth="5" strokeLinecap="round" />
              <path d="M150 17c40-10 68-7 102 0 11 2 20 2 26-3" stroke="var(--packet)" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <p className="hero__role hero__fade">{profile.role}</p>
            <p className="hero__place hero__fade">{profile.place}</p>
            <div className="hero__actions hero__fade">
              <a className="button" href="#work">See projects</a>
              <a className="button button--quiet" href={`mailto:${profile.email}`}>Email me</a>
            </div>
          </div>

          <div className="hero__portrait hero__fade">
            {/* The cutout already carries its cream/gold outline in the alpha,
                so CSS adds only depth and rim light - never a second outline. */}
            <picture>
              <source media="(max-width: 700px)" srcSet="./portrait-sm.webp" />
              <img
                src="./portrait.webp"
                width={914}
                height={781}
                alt={profile.name}
                decoding="async"
                fetchPriority="high"
              />
            </picture>
            {/* Two separately anchored clusters. A single stretched SVG does not
                work here: a square viewBox has a 1:1 intrinsic ratio, so with a
                definite height it collapses to a square and ignores the left/right
                insets, which left these marks stranded beside the portrait. */}
            <span className="hero__mark hero__mark--left" aria-hidden="true">
              <svg viewBox="0 0 44 64" fill="none" focusable="false">
                <g stroke="var(--packet)" strokeWidth="7" strokeLinecap="round">
                  <path d="M6 8l28 14" />
                  <path d="M4 30l32 6" />
                  <path d="M8 54l28-8" />
                </g>
              </svg>
            </span>
            <span className="hero__mark hero__mark--right" aria-hidden="true">
              <svg viewBox="0 0 44 64" fill="none" focusable="false">
                <g stroke="var(--packet)" strokeWidth="7" strokeLinecap="round">
                  <path d="M38 8L10 22" />
                  <path d="M40 30L8 36" />
                  <path d="M36 54L8 46" />
                </g>
              </svg>
            </span>
          </div>
        </section>

        <TechStrip />

        <section id="about" className="section about">
          <h2>About</h2>
          <div className="about__text">
            {profile.about.map((p, i) => (
              <p key={i} className={i === 0 ? 'lead' : undefined}>{p}</p>
            ))}
          </div>
        </section>

        <Projects />

        <section className="section">
          <h2>What I work on</h2>
          <div className="focus">
            {focus.map((f) => (
              <div key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <p className="muted">{f.tools}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="education" className="section">
          <h2>Education</h2>
          <ol className="path">
            {education.map((s) => (
              <li key={s.title}>
                <p className="path__when">{s.when}</p>
                <div>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.where}</p>
                  {s.body && <p>{s.body}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="training" className="section">
          <h2>Training</h2>
          <ol className="path">
            {training.map((s) => (
              <li key={s.title}>
                <p className="path__when">{s.when}</p>
                <div>
                  <h3>{s.title}</h3>
                  <p className="muted">{s.where}</p>
                  {s.body && <p>{s.body}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section split">
          <div>
            <h2>Tools</h2>
            <dl className="stack">
              {stack.map((g) => (
                <div key={g.group}>
                  <dt>{g.group}</dt>
                  <dd>{g.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2>Certificates</h2>
            <ul className="certs">
              {certificates.map((c) => (
                <li key={c.title}>
                  <span>{c.title}</span>
                  <span className="muted">{c.by}, {c.when}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="section contact">
          <h2>Contact</h2>
          <p className="contact__line">
            For internships, projects or a conversation about cloud and security.
          </p>
          <a className="contact__email" href={`mailto:${profile.email}`}>{profile.email}</a>
          <ul className="contact__links">
            {contactLinks.filter((l) => l.label !== 'Email').map((l) => (
              <li key={l.label}>
                <a className="link" href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__links">
          {contactLinks.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer">{l.label}</a>
          ))}
        </div>
        <div className="footer__meta">
          <span>© {year} {profile.name}</span>
          <a href="#top">Back to top</a>
        </div>
      </footer>
    </>
  )
}
