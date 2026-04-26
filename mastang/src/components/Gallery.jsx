import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 250
const FRAME_PATH   = (n) => `/frames/ezgif-frame-${String(n).padStart(3, '0')}.png`
const FRAME_STEP   = 14

// ─── Breakpoint helper ────────────────────────────────────────────────────────
function getBp() {
  const w = window.innerWidth
  if (w < 480) return 'xs'
  if (w < 768) return 'sm'
  if (w < 1024) return 'md'
  return 'lg'
}

// ─── Transparent-black removal ────────────────────────────────────────────────
const transparentCache = new Map()
function getTransparentCanvas(img, threshold = 38) {
  if (transparentCache.has(img.src)) return transparentCache.get(img.src)
  const off = document.createElement('canvas')
  off.width  = img.naturalWidth
  off.height = img.naturalHeight
  const ctx  = off.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const id = ctx.getImageData(0, 0, off.width, off.height)
  const d  = id.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], b = d[i+2]
    if (r < threshold && g < threshold && b < threshold)
      d[i+3] = Math.round((Math.max(r,g,b) / threshold) * 255)
  }
  ctx.putImageData(id, 0, 0)
  transparentCache.set(img.src, off)
  return off
}

// ─── Per-breakpoint slot configs ─────────────────────────────────────────────
function getSlotConfig(bp) {
  switch (bp) {
    case 'xs': return {
      slots: [0],                          // only center card
      WIDTHS:  [Math.min(window.innerWidth * 0.82, 300)],
      HEIGHTS: [Math.min(window.innerWidth * 0.82 * 1.22, 360)],
      X_GAPS:  [0],
      OPACITIES: [1],
      BLURS:   [0],
    }
    case 'sm': return {
      slots: [-1, 0, 1],                   // center + 1 each side
      WIDTHS:  [240, 300, 240],
      HEIGHTS: [290, 360, 290],
      X_GAPS:  [0, 210, 210],
      OPACITIES: [1, 0.85, 1],
      BLURS:   [0, 0, 0],
    }
    case 'md': return {
      slots: [-2, -1, 0, 1, 2],
      WIDTHS:  [180, 230, 280, 230, 180],
      HEIGHTS: [220, 275, 340, 275, 220],
      X_GAPS:  [0, 215, 400, 215, 0],      // symmetric around center
      OPACITIES: [0.45, 0.75, 1, 0.75, 0.45],
      BLURS:   [1.5, 0.5, 0, 0.5, 1.5],
    }
    default: return {
      slots: [-2, -1, 0, 1, 2],
      WIDTHS:  [210, 255, 320, 255, 210],
      HEIGHTS: [262, 310, 380, 310, 262],
      X_GAPS:  [0, 295, 530, 295, 0],
      OPACITIES: [0.58, 0.82, 1, 0.82, 0.58],
      BLURS:   [0.8, 0, 0, 0, 0.8],
    }
  }
}

// ─── Single card ──────────────────────────────────────────────────────────────
function GalleryCard({ offset, slotIndex, frameIndex, imagesRef, config }) {
  const canvasRef = useRef(null)
  const isCenter  = offset === 0
  const abs       = Math.abs(offset)

  const cardW  = config.WIDTHS[slotIndex]
  const cardH  = config.HEIGHTS[slotIndex]

  // Build X transform: center slot is at 0, others fan out
  const centerSlotIdx = Math.floor(config.slots.length / 2)
  const sign = offset < 0 ? -1 : offset > 0 ? 1 : 0
  const xGapIdx = Math.min(abs, config.X_GAPS.length - 1)
  const translateX = sign * config.X_GAPS[xGapIdx]

  const rotateY    = offset * -14
  const translateZ = -abs * 90
  const translateY = abs * 18
  const opacity    = config.OPACITIES[slotIndex]
  const blur       = config.BLURS[slotIndex]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    function draw() {
      const img = imagesRef.current[frameIndex]
      if (img?.complete && img.naturalWidth > 0) {
        if (canvas.width !== img.naturalWidth) {
          canvas.width  = img.naturalWidth
          canvas.height = img.naturalHeight
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(getTransparentCanvas(img), 0, 0)
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [frameIndex, imagesRef])

  const frameNum = String(frameIndex + 1).padStart(3, '0')
  const ANGLES   = { '-2': 'Rear ¾', '-1': 'Side', '0': 'Front', '1': 'Side', '2': 'Rear ¾' }
  const angleLabel = ANGLES[String(offset)] ?? ''

  return (
    <div style={{
      position:   'absolute',
      width:      cardW,
      height:     cardH,
      transform:  `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`,
      opacity,
      filter:     blur > 0 ? `blur(${blur}px)` : 'none',
      zIndex:     10 - abs,
      willChange: 'transform, opacity',
      transition: 'transform 0.05s linear, opacity 0.05s linear',
      borderRadius: isCenter ? 20 : 16,
      overflow:   'hidden',
      background: isCenter
        ? 'linear-gradient(160deg, #1a1a1e 0%, #0f0f12 100%)'
        : 'linear-gradient(160deg, #141416 0%, #0c0c0e 100%)',
      boxShadow:  isCenter
        ? '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.10)'
        : '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
      cursor:     isCenter ? 'default' : 'pointer',
    }}>

      {/* Image area */}
      <div style={{
        position:     'relative',
        width:        '100%',
        height:       '65%',
        overflow:     'hidden',
        background:   '#0a0a0c',
        borderRadius: isCenter ? '20px 20px 0 0' : '16px 16px 0 0',
      }}>
        <div style={{
          position:     'absolute', inset: 0,
          background:   'linear-gradient(to bottom, transparent 50%, rgba(15,15,18,0.95) 100%)',
          zIndex:       2,
          borderRadius: isCenter ? '20px 20px 0 0' : '16px 16px 0 0',
        }} />
        <canvas ref={canvasRef} style={{
          display:      'block',
          width:        '100%',
          height:       '100%',
          objectFit:    'contain',
          mixBlendMode: 'lighten',
        }} />
        {isCenter && (
          <div style={{
            position:      'absolute', top: 12, right: 12,
            background:    'rgba(255,255,255,0.10)',
            backdropFilter:'blur(8px)',
            border:        '1px solid rgba(255,255,255,0.14)',
            borderRadius:  20,
            padding:       '4px 10px',
            fontSize:      9, fontWeight: 600,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color:         'rgba(255,255,255,0.7)',
            zIndex:        3,
          }}>Live</div>
        )}
      </div>

      {/* Card content */}
      <div style={{
        padding:       isCenter ? '16px 20px 18px' : '10px 12px 12px',
        display:       'flex',
        flexDirection: 'column',
        gap:           5,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontSize:      isCenter ? 14 : 10,
              fontWeight:    700, letterSpacing: '0.01em',
              color:         '#fff', lineHeight: 1.2,
            }}>Shelby GT500</div>
            <div style={{
              fontSize:      isCenter ? 10 : 8,
              fontWeight:    400, letterSpacing: '0.06em',
              color:         'rgba(255,255,255,0.38)',
              marginTop:     3, textTransform: 'uppercase',
            }}>{angleLabel}</div>
          </div>
          {isCenter && (
            <div style={{
              fontSize: 12, fontWeight: 700,
              color: 'rgba(255,255,255,0.55)', letterSpacing: '0.04em',
            }}>#{frameNum}</div>
          )}
        </div>

        {isCenter && (
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            {['760 HP', 'V8', '3.3s 0–60'].map((tag) => (
              <span key={tag} style={{
                fontSize: 9, fontWeight: 600, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 20, padding: '3px 9px',
              }}>{tag}</span>
            ))}
          </div>
        )}

        {isCenter && (
          <div style={{
            marginTop: 8, background: '#fff', borderRadius: 12,
            padding: '10px 0', textAlign: 'center',
            fontSize: 10, fontWeight: 700,
            letterSpacing: '0.22em', textTransform: 'uppercase',
            color: '#0a0a0a', cursor: 'pointer',
          }}>Explore Model</div>
        )}
      </div>
    </div>
  )
}

// ─── Main Gallery ─────────────────────────────────────────────────────────────
export default function Gallery() {
  const sectionRef = useRef(null)
  const imagesRef  = useRef(new Array(TOTAL_FRAMES).fill(null))
  const [centerFrame, setCenterFrame] = useState(0)
  const [ready, setReady]             = useState(false)
  const [bp, setBp]                   = useState(getBp())

  // Track breakpoint
  useEffect(() => {
    function onResize() { setBp(getBp()) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Load frames + ScrollTrigger
  useEffect(() => {
    const images = imagesRef.current
    let loadedCount = 0
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = FRAME_PATH(i + 1)
      img.onload = () => {
        images[i] = img
        getTransparentCanvas(img)
        loadedCount++
        if (loadedCount >= 20) setReady(true)
      }
      images[i] = img
    }

    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: TOTAL_FRAMES - 1,
      ease: 'none',
      onUpdate() { setCenterFrame(Math.round(obj.val)) },
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=350%',
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      },
    })

    return () => {
      tween.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
      transparentCache.clear()
    }
  }, [])

  const config   = getSlotConfig(bp)
  const progress = ((centerFrame + 1) / TOTAL_FRAMES) * 100
  const isMobile = bp === 'xs' || bp === 'sm'

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap" />
      <style>{`
        .gl-section {
          position: relative;
          width: 100%;
          height: 100vh;
          overflow: hidden;
          background: #0a0a0a;
          font-family: 'Josefin Sans', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* Header */
        .gl-header {
          position: absolute;
          top: clamp(24px, 6%, 56px);
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 40;
          pointer-events: none;
          white-space: nowrap;
        }
        .gl-eyebrow {
          font-size: clamp(7px, 1.2vw, 9px);
          font-weight: 600;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin: 0 0 8px;
        }
        .gl-title {
          font-size: clamp(16px, 3.5vw, 42px);
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.45em;
          line-height: 1;
        }
        .gl-title-sep {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: rgba(255,255,255,0.25);
          display: inline-block;
          flex-shrink: 0;
        }

        /* 3-D stage */
        .gl-stage {
          position: relative;
          width: 100%;
          height: 65vh;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        /* Progress bar */
        .gl-bar-wrap {
          position: absolute;
          bottom: clamp(24px, 6%, 52px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 40;
        }
        .gl-bar-num {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.2);
          min-width: 24px;
          text-align: center;
        }
        .gl-bar {
          width: clamp(90px, 20vw, 160px);
          height: 1px;
          background: rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
          border-radius: 1px;
        }
        .gl-bar-fill {
          position: absolute;
          top: 0; left: 0;
          height: 100%;
          background: rgba(255,255,255,0.45);
          border-radius: 1px;
        }

        /* Scroll hint */
        .gl-hint {
          position: absolute;
          bottom: clamp(14px, 3.5%, 28px);
          right: clamp(16px, 4%, 40px);
          display: flex;
          align-items: center;
          gap: 8px;
          z-index: 40;
        }
        .gl-hint-text {
          font-size: clamp(6px, 1vw, 8px);
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.13);
        }
        @keyframes slideRight {
          0%,100% { transform: translateX(0); }
          50%      { transform: translateX(4px); }
        }
        .gl-hint-arr {
          color: rgba(255,255,255,0.16);
          animation: slideRight 2s ease-in-out infinite;
          font-size: 11px;
        }

        /* Vignettes */
        .gl-vig { position: absolute; pointer-events: none; z-index: 30; }
        .gl-vig-l { top:0; left:0;   width:clamp(30px,6%,80px);  height:100%; background: linear-gradient(to right, #0a0a0a 0%, transparent 100%); }
        .gl-vig-r { top:0; right:0;  width:clamp(30px,6%,80px);  height:100%; background: linear-gradient(to left,  #0a0a0a 0%, transparent 100%); }
        .gl-vig-t { top:0; left:0; right:0; height:clamp(60px,14%,120px); background: linear-gradient(to bottom, #0a0a0a 0%, transparent 100%); }
        .gl-vig-b { bottom:0; left:0; right:0; height:clamp(60px,14%,120px); background: linear-gradient(to top, #0a0a0a 0%, transparent 100%); }

        /* Mobile: tighten stage height */
        @media (max-width: 767px) {
          .gl-stage { height: 70vh; }
          .gl-hint  { display: none; }
        }
      `}</style>

      <section ref={sectionRef} className="gl-section" id="gallery">

        {/* Header */}
        <div className="gl-header">
          <p className="gl-eyebrow">Frame Gallery · Shelby GT500</p>
          <h2 className="gl-title">
            Every Angle
            <span className="gl-title-sep" />
            Every Frame
          </h2>
        </div>

        {/* 3-D card strip */}
        <div className="gl-stage">
          {ready && config.slots.map((offset, slotIndex) => {
            const frameIndex = Math.max(0, Math.min(
              TOTAL_FRAMES - 1,
              centerFrame + offset * FRAME_STEP
            ))
            return (
              <GalleryCard
                key={offset}
                offset={offset}
                slotIndex={slotIndex}
                frameIndex={frameIndex}
                imagesRef={imagesRef}
                config={config}
              />
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="gl-bar-wrap">
          <span className="gl-bar-num">001</span>
          <div className="gl-bar">
            <div className="gl-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="gl-bar-num">250</span>
        </div>

        {/* Scroll hint */}
        <div className="gl-hint">
          <span className="gl-hint-text">Scroll to explore</span>
          <span className="gl-hint-arr">→</span>
        </div>

        {/* Vignettes */}
        <div className="gl-vig gl-vig-l" />
        <div className="gl-vig gl-vig-r" />
        <div className="gl-vig gl-vig-t" />
        <div className="gl-vig gl-vig-b" />

      </section>
    </>
  )
}