import * as THREE from 'three'

/**
 * The hero scene: a mesh of nodes with packets travelling between them.
 * `state` is a plain object so GSAP can tween it from scroll position.
 */
export type NetworkState = { x: number; y: number; scale: number; opacity: number }

const RADIUS = 3
const MAX_DPR = 1.5

// Rough device budget: phones and low-core machines draw a thinner mesh so the
// per-frame work stays small. Counts stay high enough to still read as a network.
function budget() {
  const cores = navigator.hardwareConcurrency || 4
  const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false
  if (window.innerWidth < 700 || cores <= 4 || coarse) return { nodes: 55, packets: 18 }
  if (window.innerWidth < 1200 || cores <= 8) return { nodes: 85, packets: 30 }
  return { nodes: 120, packets: 46 }
}

function dot(): THREE.Texture {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.45, 'rgba(255,255,255,.9)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

// Small seeded generator so the mesh looks the same on every visit.
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

export function createNetwork(canvas: HTMLCanvasElement, reducedMotion: boolean) {
  const state: NetworkState = { x: 0, y: 0, scale: 1, opacity: 1 }
  const rand = seeded(7)
  const { nodes: nodeCount, packets: packetCount } = budget()

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
  camera.position.z = 10
  const group = new THREE.Group()
  scene.add(group)

  // Nodes on a jittered sphere, in two loose shells.
  const nodes: THREE.Vector3[] = []
  for (let i = 0; i < nodeCount; i++) {
    const y = 1 - (i / (nodeCount - 1)) * 2
    const r = Math.sqrt(1 - y * y)
    const phi = i * Math.PI * (3 - Math.sqrt(5))
    const shell = rand() < 0.22 ? 0.45 + rand() * 0.2 : 0.9 + rand() * 0.2
    nodes.push(new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).multiplyScalar(RADIUS * shell))
  }

  // Link every node to its three nearest neighbours.
  const edges: [number, number][] = []
  const seen = new Set<string>()
  const adjacency: number[][] = nodes.map(() => [])
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: n.distanceToSquared(m) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (seen.has(key)) return
        seen.add(key)
        adjacency[i].push(edges.length)
        adjacency[j].push(edges.length)
        edges.push([i, j])
      })
  })

  const sprite = dot()
  const linePos = new Float32Array(edges.length * 6)
  edges.forEach(([a, b], k) => {
    nodes[a].toArray(linePos, k * 6)
    nodes[b].toArray(linePos, k * 6 + 3)
  })
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
  const lineMat = new THREE.LineBasicMaterial({ color: 0x8fb8ff, transparent: true, opacity: 0.26 })
  group.add(new THREE.LineSegments(lineGeo, lineMat))

  const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes)
  const nodeMat = new THREE.PointsMaterial({
    color: 0xdfe8ff, size: 0.13, map: sprite, transparent: true, depthWrite: false,
  })
  group.add(new THREE.Points(nodeGeo, nodeMat))

  // Hubs stay at roughly one in eleven of the mesh whatever the tier.
  const hubStep = Math.max(5, Math.round(nodeCount / 11))
  const hubGeo = new THREE.BufferGeometry().setFromPoints(nodes.filter((_, i) => i % hubStep === 0))
  const hubMat = new THREE.PointsMaterial({
    color: 0x8fb8ff, size: 0.34, map: sprite, transparent: true, depthWrite: false,
  })
  group.add(new THREE.Points(hubGeo, hubMat))

  // Packets walk the graph: on arrival each one picks another link from that node.
  const packets = Array.from({ length: packetCount }, () => {
    const edge = Math.floor(rand() * edges.length)
    return { edge, from: edges[edge][0], to: edges[edge][1], t: rand(), speed: 0.25 + rand() * 0.55 }
  })
  const packetPos = new Float32Array(packetCount * 3)
  const packetGeo = new THREE.BufferGeometry()
  packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3))
  const packetMat = new THREE.PointsMaterial({
    color: 0xffb23e, size: 0.2, map: sprite, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  group.add(new THREE.Points(packetGeo, packetMat))

  const tmp = new THREE.Vector3()
  function placePackets(dt: number) {
    packets.forEach((p, i) => {
      p.t += p.speed * dt
      if (p.t >= 1) {
        const options = adjacency[p.to]
        const next = options[Math.floor(Math.random() * options.length)]
        const [a, b] = edges[next]
        p.from = p.to
        p.to = a === p.from ? b : a
        p.edge = next
        p.t = 0
      }
      tmp.lerpVectors(nodes[p.from], nodes[p.to], p.t).toArray(packetPos, i * 3)
    })
    packetGeo.attributes.position.needsUpdate = true
  }

  const pointer = { x: 0, y: 0 }
  const onPointer = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  const resize = () => {
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    // re-read dpr here: the window can be dragged to a display with another one.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_DPR))
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  // resize fires in bursts while dragging, so coalesce to one per frame.
  let resizeFrame = 0
  const onResize = () => {
    if (resizeFrame) return
    resizeFrame = requestAnimationFrame(() => {
      resizeFrame = 0
      resize()
    })
  }
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('resize', onResize)
  resize()

  let last = performance.now()
  let spin = 0
  let frame = 0
  placePackets(0)
  const tick = () => {
    frame = requestAnimationFrame(tick)
    const now = performance.now()
    const dt = Math.min((now - last) / 1000, 0.05)
    last = now
    if (!reducedMotion) {
      spin += dt * 0.07
      placePackets(dt)
      group.rotation.x += (pointer.y * 0.25 - group.rotation.x) * 0.04
    }
    const targetY = spin + (reducedMotion ? 0 : pointer.x * 0.35)
    group.rotation.y += (targetY - group.rotation.y) * 0.06
    group.position.set(state.x, state.y, 0)
    group.scale.setScalar(state.scale)
    lineMat.opacity = 0.26 * state.opacity
    nodeMat.opacity = state.opacity
    hubMat.opacity = 0.9 * state.opacity
    packetMat.opacity = state.opacity
    renderer.render(scene, camera)
  }

  // Nothing worth drawing while the tab is hidden or the canvas is scrolled away.
  let onScreen = true
  const start = () => {
    if (frame) return
    last = performance.now() // otherwise dt jumps by the length of the pause
    frame = requestAnimationFrame(tick)
  }
  const stop = () => {
    cancelAnimationFrame(frame)
    frame = 0
  }
  const sync = () => (!document.hidden && onScreen ? start() : stop())
  document.addEventListener('visibilitychange', sync)
  const io =
    typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          onScreen = entry.isIntersecting
          sync()
        })
  io?.observe(canvas)
  start()

  return {
    state,
    dispose() {
      stop()
      cancelAnimationFrame(resizeFrame)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', sync)
      io?.disconnect()
      ;[lineGeo, nodeGeo, hubGeo, packetGeo, lineMat, nodeMat, hubMat, packetMat, sprite].forEach((o) => o.dispose())
      renderer.dispose()
    },
  }
}
