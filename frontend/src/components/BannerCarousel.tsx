import { useEffect, useRef, useState } from 'react'
import type { Banner } from '../lib/types'

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (banners.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4500)
    return () => clearInterval(t)
  }, [banners.length])

  useEffect(() => {
    trackRef.current?.scrollTo({ left: index * trackRef.current.clientWidth, behavior: 'smooth' })
  }, [index])

  if (!banners.length) return null

  return (
    <div className="relative mx-4 mt-3 overflow-hidden rounded-2xl">
      <div ref={trackRef} className="flex snap-x snap-mandatory overflow-x-hidden scroll-smooth">
        {banners.map((b) => (
          <a
            key={b.id}
            href={b.link_url || undefined}
            target={b.link_url ? '_blank' : undefined}
            rel="noreferrer"
            className="relative aspect-[16/7] w-full flex-shrink-0 snap-start"
          >
            <img src={b.image_url} alt={b.title ?? ''} className="h-full w-full object-cover" />
            {(b.title || b.subtitle) && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 text-white">
                {b.title && <div className="text-sm font-semibold">{b.title}</div>}
                {b.subtitle && <div className="text-xs opacity-90">{b.subtitle}</div>}
              </div>
            )}
          </a>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {banners.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
