import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * Animated Three.js molecular network background.
 * Renders 70 drifting nodes with dynamic connection lines.
 * Mouse parallax rotates the scene gently.
 *
 * Returns:
 *   A full-bleed absolute-positioned div with a Three.js canvas inside.
 *   pointer-events: none so it never blocks UI interactions.
 */
export function MolecularBackground() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // ── Nodes ──────────────────────────────────────────────────────────────
    // Three color buckets: teal (30%), cool-blue (20%), near-black (50%)
    // Colors aligned with new design tokens: --accent #7DF0C8, --accent-cool #7ABFFF, --bg-soft #0E1116
    const NODE_COUNT = 70
    const nodeColors = [0x7DF0C8, 0x7ABFFF, 0x0E1116]
    const nodes: THREE.Mesh[] = []
    const velocities = new Float32Array(NODE_COUNT * 3)

    const geo = new THREE.SphereGeometry(0.05, 8, 8)

    for (let i = 0; i < NODE_COUNT; i++) {
      const r = Math.random()
      const color = r < 0.3 ? nodeColors[0] : r < 0.5 ? nodeColors[1] : nodeColors[2]
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 })
      const mesh = new THREE.Mesh(geo, mat)
      const x = (Math.random() - 0.5) * 8
      const y = (Math.random() - 0.5) * 8
      const z = (Math.random() - 0.5) * 4
      mesh.position.set(x, y, z)
      // Slow random drift velocities
      velocities[i * 3]     = (Math.random() - 0.5) * 0.004
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.004
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002
      scene.add(mesh)
      nodes.push(mesh)
    }

    // ── Connection lines ───────────────────────────────────────────────────
    // Pre-allocate enough space for MAX_LINES segments (2 verts × 3 floats each)
    const MAX_LINES = 150
    const linePositions = new Float32Array(MAX_LINES * 6)
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    const lineMat = new THREE.LineBasicMaterial({
      // Connection line color aligned with new --accent token (#7DF0C8)
      color: 0x7DF0C8,
      transparent: true,
      opacity: 0.08,
    })
    const lineSegments = new THREE.LineSegments(lineGeo, lineMat)
    scene.add(lineSegments)

    // ── Mouse parallax ─────────────────────────────────────────────────────
    let mouseX = 0
    let mouseY = 0
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    // ── Resize ─────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!mount) return
      renderer.setSize(mount.clientWidth, mount.clientHeight)
      camera.aspect = mount.clientWidth / mount.clientHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // ── Animation loop ─────────────────────────────────────────────────────
    let frameId: number
    const DIST_THRESHOLD = 2.5

    const animate = () => {
      frameId = requestAnimationFrame(animate)

      // Drift each node, bounce off bounding box walls
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes[i].position.x += velocities[i * 3]
        nodes[i].position.y += velocities[i * 3 + 1]
        nodes[i].position.z += velocities[i * 3 + 2]
        if (Math.abs(nodes[i].position.x) > 4) velocities[i * 3]     *= -1
        if (Math.abs(nodes[i].position.y) > 4) velocities[i * 3 + 1] *= -1
        if (Math.abs(nodes[i].position.z) > 2) velocities[i * 3 + 2] *= -1
      }

      // Rebuild connection lines for every frame (only pairs within threshold)
      let lineCount = 0
      for (let i = 0; i < NODE_COUNT && lineCount < MAX_LINES; i++) {
        for (let j = i + 1; j < NODE_COUNT && lineCount < MAX_LINES; j++) {
          const dx = nodes[i].position.x - nodes[j].position.x
          const dy = nodes[i].position.y - nodes[j].position.y
          const dz = nodes[i].position.z - nodes[j].position.z
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
          if (dist < DIST_THRESHOLD) {
            linePositions[lineCount * 6]     = nodes[i].position.x
            linePositions[lineCount * 6 + 1] = nodes[i].position.y
            linePositions[lineCount * 6 + 2] = nodes[i].position.z
            linePositions[lineCount * 6 + 3] = nodes[j].position.x
            linePositions[lineCount * 6 + 4] = nodes[j].position.y
            linePositions[lineCount * 6 + 5] = nodes[j].position.z
            lineCount++
          }
        }
      }
      // Only render the populated segment range
      lineGeo.setDrawRange(0, lineCount * 2)
      lineGeo.attributes.position.needsUpdate = true

      // Smooth lerp toward mouse position for parallax
      scene.rotation.y += (mouseX * 0.3 - scene.rotation.y) * 0.03
      scene.rotation.x += (-mouseY * 0.2 - scene.rotation.x) * 0.03

      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
