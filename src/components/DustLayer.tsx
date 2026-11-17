import type { CSSProperties } from 'react'

const PARTICLES = Array.from({ length: 18 }, (_, index) => ({
  left: `${(index * 37 + 11) % 100}%`,
  size: 2 + (index % 3),
  duration: 30 + (index % 5) * 7,
  delay: -(index * 4.3),
  drift: `${(index % 2 === 0 ? 1 : -1) * (12 + ((index * 13) % 34))}px`,
}))

export default function DustLayer() {
  return (
    <div className="dust-layer" aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <span
          key={index}
          className="dust"
          style={
            {
              left: particle.left,
              '--size': `${particle.size}px`,
              '--dur': `${particle.duration}s`,
              '--delay': `${particle.delay}s`,
              '--drift': particle.drift,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}
