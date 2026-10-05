// The Projects section. Content comes from data/content.ts; the only
// decisions made here are what gets a heading and what gets left out.

import ArchDiagram from './ArchDiagram'
import { projects, type Project } from '../data/content'
import './projects.css'

function Card({ p }: { p: Project }) {
  // Nothing in `evidence` is guaranteed, so pull the parts apart once and
  // let each block decide whether it has anything to say.
  const { pipeline, containers, excerpt } = p.evidence ?? {}
  const hasEvidence = Boolean(pipeline || containers || excerpt)

  return (
    <article className="pv2-card">
      <header className="pv2-head">
        <h3>{p.title}</h3>
        <p className="muted pv2-when">{p.when}</p>
        {p.context && <p className="pv2-context">{p.context}</p>}
        <ul className="tags" aria-label="Built with">
          {p.tech.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="pv2-actions">
          <a className="link" href={p.repo} target="_blank" rel="noreferrer">
            View the code on GitHub
          </a>
          {p.demo && (
            <a className="pv2-demo" href={p.demo} target="_blank" rel="noreferrer">
              Live demo
            </a>
          )}
        </p>
      </header>

      <div className="pv2-body">
        <div className="pv2-block">
          <h4>Problem</h4>
          <p>{p.problem}</p>
        </div>

        {/* The detail is a native <details>: keyboard accessible, no state to keep. */}
        <details className="pv2-more">
          <summary>
            Know more
            <span className="pv2-vh"> about {p.title}</span>
          </summary>
          <div className="pv2-more__inner">
        <div className="pv2-block">
          <h4>How it’s built</h4>
          <p>{p.architecture}</p>
          <ArchDiagram id={p.id} />
        </div>

        <div className="pv2-block">
          <h4>Key features</h4>
          <ul className="pv2-bullets">
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        {hasEvidence && (
          <div className="pv2-block pv2-evidence">
            <h4>Evidence</h4>

            {pipeline && (
              <div className="pv2-sub">
                <h5>Pipeline</h5>
                <ol className="pv2-pipeline">
                  {pipeline.stages.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <p className="muted">{pipeline.note}</p>
              </div>
            )}

            {containers && (
              <div className="pv2-sub">
                <h5>Containers</h5>
                <p className="muted">{containers}</p>
              </div>
            )}

            {excerpt && (
              <figure className="pv2-excerpt">
                <figcaption>{excerpt.file}</figcaption>
                <pre>
                  <code>{excerpt.code}</code>
                </pre>
                <a className="link" href={excerpt.url} target="_blank" rel="noreferrer">
                  View this file on GitHub
                </a>
              </figure>
            )}
          </div>
        )}
          </div>
        </details>
      </div>
    </article>
  )
}

export default function Projects() {
  return (
    <section id="work" className="section projects-v2">
      <h2>Projects</h2>
      <div className="pv2-list">
        {projects.map((p) => (
          <Card key={p.id} p={p} />
        ))}
      </div>
    </section>
  )
}
