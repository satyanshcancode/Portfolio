// One hand-drawn diagram per project. Every box is a component the
// architecture prose in content.ts actually names — nothing invented.
// Geometry is in viewBox units; colour and type live in projects.css.

import type { ReactNode } from 'react'
import type { ProjectId } from '../data/content'

type BoxProps = {
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  /** The piece the prose builds everything else around. */
  accent?: boolean
}

function Box({ x, y, w, h, lines, accent }: BoxProps) {
  const cx = x + w / 2
  const first = y + h / 2 - ((lines.length - 1) * 14) / 2 + 4.5
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={2}
        className={accent ? 'pv2-d-box pv2-d-box--accent' : 'pv2-d-box'}
      />
      {lines.map((t, i) => (
        <text key={t} x={cx} y={first + i * 14} textAnchor="middle" className={i === 0 ? 'pv2-d-label' : 'pv2-d-sub'}>
          {t}
        </text>
      ))}
    </g>
  )
}

/** A connector. `head` adds the arrowhead; busses and stubs go without one. */
function Flow({ points, marker, dashed }: { points: string; marker?: string; dashed?: boolean }) {
  return (
    <polyline
      points={points}
      className={dashed ? 'pv2-d-flow pv2-d-flow--dash' : 'pv2-d-flow'}
      markerEnd={marker ? `url(#${marker})` : undefined}
    />
  )
}

export default function ArchDiagram({ id }: { id: ProjectId }) {
  const titleId = `arch-${id}-title`
  const m = `arch-${id}-head`

  const frame = (height: number, title: string, body: ReactNode) => (
    <div className="pv2-diagram">
      <svg
        viewBox={`0 0 360 ${height}`}
        preserveAspectRatio="xMidYMin meet"
        width="100%"
        role="img"
        aria-labelledby={titleId}
      >
        <title id={titleId}>{title}</title>
        <defs>
          <marker id={m} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" className="pv2-d-head" />
          </marker>
        </defs>
        <g aria-hidden="true">{body}</g>
      </svg>
    </div>
  )

  if (id === 'iam') {
    return frame(
      276,
      'The Typer CLI and the FastAPI service both enter one shared audit engine. The engine calls AWS IAM through a boto3 client and hands its result to the JSON, CSV and SARIF exporters.',
      <>
        <Box x={10} y={8} w={164} h={34} lines={['Typer CLI']} />
        <Box x={186} y={8} w={164} h={34} lines={['FastAPI service']} />
        <Flow points="92,42 92,74" marker={m} />
        <Flow points="268,42 268,74" marker={m} />
        <Box x={10} y={74} w={340} h={46} lines={['Audit engine', 'iam_audit — Pydantic models']} accent />
        <Flow points="92,120 92,152" marker={m} />
        <Flow points="268,120 268,152" marker={m} />
        <Box x={10} y={152} w={164} h={46} lines={['boto3 client', 'aws/']} />
        <Box x={186} y={152} w={164} h={46} lines={['Exporters', 'JSON · CSV · SARIF']} />
        <Flow points="92,198 92,230" marker={m} />
        <Box x={10} y={230} w={164} h={34} lines={['AWS IAM']} />
      </>,
    )
  }

  if (id === 'session') {
    return frame(
      462,
      'A client calls through telemetry middleware. A sliding window turns the measurements into features, a prediction engine scores stability with a model and a rule fallback, and a state machine picks one of three execution strategies in front of the FastAPI backend.',
      <>
        <Box x={10} y={8} w={340} h={30} lines={['Client']} />
        <Flow points="180,38 180,62" marker={m} />
        <Box x={10} y={62} w={340} h={46} lines={['Telemetry middleware', 'latency · retries · timeouts · status']} />
        <Flow points="180,108 180,132" marker={m} />
        <Box x={10} y={132} w={340} h={46} lines={['Sliding window', 'ten features']} />
        <Flow points="180,178 180,202" marker={m} />
        <Box
          x={10}
          y={202}
          w={340}
          h={58}
          lines={['Prediction engine', 'gradient-boosted model', 'rule-based fallback']}
          accent
        />
        <Flow points="180,260 180,284" marker={m} />
        <Box x={10} y={284} w={340} h={46} lines={['Session state machine', 'Normal · Degraded · Critical']} />
        <Flow points="180,330 180,346 65,346" />
        <Flow points="180,346 295,346" />
        <Flow points="65,346 65,360" marker={m} />
        <Flow points="180,346 180,360" marker={m} />
        <Flow points="295,346 295,360" marker={m} />
        <Box x={10} y={360} w={110} h={34} lines={['Granular']} />
        <Box x={125} y={360} w={110} h={34} lines={['Batched']} />
        <Box x={240} y={360} w={110} h={34} lines={['Async queue']} />
        <Flow points="65,394 65,408 295,408" />
        <Flow points="295,394 295,408" />
        <Flow points="180,394 180,408" />
        <Flow points="180,408 180,422" marker={m} />
        <Box x={10} y={422} w={340} h={30} lines={['FastAPI backend']} />
      </>,
    )
  }

  if (id === 'allocademy') {
    return frame(
      232,
      'A React SPA calls an Express API layered middleware, routes, controllers, services and repositories, over PostgreSQL 16 where constraints, triggers and locks enforce the rules. The pure allocation engine sits to one side and runs on a stored input snapshot.',
      <>
        <Box x={10} y={8} w={200} h={30} lines={['React 19 SPA']} />
        <Flow points="110,38 110,62" marker={m} />
        <Box
          x={10}
          y={62}
          w={200}
          h={76}
          lines={['Express 5 API', 'middleware → routes', 'controllers → services', 'repositories']}
        />
        <Flow points="110,138 110,162" marker={m} />
        <Box
          x={10}
          y={162}
          w={200}
          h={58}
          lines={['PostgreSQL 16', 'constraints · triggers', 'row + advisory locks']}
          accent
        />
        <Box x={226} y={78} w={124} h={64} lines={['Allocation engine', 'pure: no db,', 'no clock, no random']} />
        <Flow points="210,191 288,191 288,142" marker={m} dashed />
        <text x={288} y={207} textAnchor="middle" className="pv2-d-edge">
          input snapshot
        </text>
      </>,
    )
  }

  return frame(
    320,
    'Four Solidity contracts on the EVM chain. A Node.js indexer replays their events into a SQLite store, a rule-based detector reads that log, and two front ends read the indexed data — the React app with a wallet, the public verify page without one.',
    <>
      <rect x={10} y={8} width={340} height={92} rx={2} className="pv2-d-group" />
      <text x={180} y={27} textAnchor="middle" className="pv2-d-edge">
        Solidity contracts — EVM chain
      </text>
      <Box x={18} y={36} w={160} h={26} lines={['RoleRegistry']} />
      <Box x={182} y={36} w={160} h={26} lines={['IdentityRegistry']} />
      <Box x={18} y={66} w={160} h={26} lines={['AssetNFT (ERC-721)']} />
      <Box x={182} y={66} w={160} h={26} lines={['ApprovalRegistry']} />
      <Flow points="110,100 110,126" marker={m} />
      <text x={120} y={117} className="pv2-d-edge">
        events
      </text>
      <Box x={10} y={126} w={200} h={46} lines={['Node.js indexer', 'replays from checkpoint']} accent />
      <Flow points="110,172 110,196" marker={m} />
      <Box x={10} y={196} w={200} h={34} lines={['SQLite event store']} />
      <Flow points="210,213 226,213" marker={m} />
      <Box x={226} y={190} w={124} h={46} lines={['Anomaly detector', 'rule-based']} />
      <Flow points="110,230 110,248 92,248" />
      <Flow points="110,248 268,248" />
      <Flow points="92,248 92,262" marker={m} />
      <Flow points="268,248 268,262" marker={m} />
      <Box x={10} y={262} w={164} h={46} lines={['React front end', 'wallet']} />
      <Box x={186} y={262} w={164} h={46} lines={['Public verify page', 'no wallet imports']} />
    </>,
  )
}
