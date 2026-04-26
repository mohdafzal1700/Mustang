import { useEffect, useRef, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const TOTAL_FRAMES = 250
const FRAME_PATH = (n) => `/frames/ezgif-frame-${String(n).padStart(3, '0')}.png`

const STAGES = [
  {
    tagline: 'THE MUSTANG SHELBY GT500',
    headline: ['Raw Power.', 'Refined Soul.'],
    body: null,
    showCta: true,
  },
  {
    tagline: 'BORN ON THE TRACK',
    headline: ['Built For', 'The Road.'],
    body: "The Shelby GT500 doesn't just move — it commands.",
    showCta: false,
  },
  {
    tagline: 'AMERICAN PERFORMANCE',
    headline: ['760 Horses.', 'One Purpose.'],
    body: 'The Ford Mustang Shelby GT500 is the pinnacle of American performance. With a supercharged 5.2L V8 producing 760 horsepower, it transforms every road into a proving ground.',
    showCta: false,
  },
  {
    tagline: 'A LEGEND REBORN',
    headline: ['Forged In', 'Steel.'],
    body: 'For over six decades, the Mustang has stood as a symbol of freedom, power, and unyielding American spirit. The Shelby GT500 is its ultimate expression.',
    showCta: false,
  },
]

function injectChars(el, text) {
  el.innerHTML = ''
  ;[...text].forEach((ch) => {
    const outer = document.createElement('span')
    outer.className = 'char'
    const inner = document.createElement('span')
    inner.className = 'char-inner'
    inner.textContent = ch === ' ' ? '\u00A0' : ch
    outer.appendChild(inner)
    el.appendChild(outer)
  })
}

function injectWords(el, text) {
  el.innerHTML = ''
  text.split(' ').forEach((word) => {
    const outer = document.createElement('span')
    outer.className = 'word-wrap'
    const inner = document.createElement('span')
    inner.className = 'word-inner'
    inner.textContent = word + '\u00A0'
    outer.appendChild(inner)
    el.appendChild(outer)
  })
}

const transparentCache = new Map()

function getTransparentCanvas(img, threshold = 38) {
  if (transparentCache.has(img.src)) return transparentCache.get(img.src)
  const off = document.createElement('canvas')
  off.width = img.naturalWidth
  off.height = img.naturalHeight
  const offCtx = off.getContext('2d')
  offCtx.drawImage(img, 0, 0)
  const imageData = offCtx.getImageData(0, 0, off.width, off.height)
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    if (r < threshold && g < threshold && b < threshold) {
      d[i + 3] = Math.round((Math.max(r, g, b) / threshold) * 255)
    }
  }
  offCtx.putImageData(imageData, 0, 0)
  transparentCache.set(img.src, off)
  return off
}

// Breakpoint helper
function getBreakpoint() {
  const w = window.innerWidth
  if (w < 480) return 'xs'
  if (w < 768) return 'sm'
  if (w < 1024) return 'md'
  return 'lg'
}

export default function Hero() {
  const sectionRef  = useRef(null)
  const canvasRef   = useRef(null)
  const carWrapRef  = useRef(null)
  const taglineRef  = useRef(null)
  const line0Ref    = useRef(null)
  const line1Ref    = useRef(null)
  const dividerRef  = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)
  const dotsRef     = useRef(null)

  const [firstFrameDrawn, setFirstFrameDrawn] = useState(false)
  const [bp, setBp] = useState(getBreakpoint())

  const isMobile = bp === 'xs' || bp === 'sm'
  const isTablet = bp === 'md'

  useEffect(() => {
    function handleResize() { setBp(getBreakpoint()) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    canvas.width  = 1920
    canvas.height = 1080

    const images     = new Array(TOTAL_FRAMES).fill(null)
    let canvasSized  = false
    const frameObj   = { val: 0 }
    let currentStage = -1
    let outTL = null
    let inTL  = null
    let rafId = null
    let _firstFrameDrawn = false

    function sizeCanvas(img) {
      if (canvasSized) return
      canvasSized = true
      canvas.width  = img.naturalWidth
      canvas.height = img.naturalHeight
      applyCarSize(img)
    }

    function applyCarSize(img) {
      if (!carWrapRef.current) return
      const bp = getBreakpoint()
      let maxH, maxW

      if (bp === 'xs') {
        // Mobile portrait: car takes full width, constrained height
        maxH = window.innerHeight * 0.48
        maxW = window.innerWidth  * 0.98
      } else if (bp === 'sm') {
        maxH = window.innerHeight * 0.50
        maxW = window.innerWidth  * 0.95
      } else if (bp === 'md') {
        // Tablet: slightly taller than desktop share
        maxH = window.innerHeight * 0.80
        maxW = window.innerWidth  * 0.60
      } else {
        // Desktop
        maxH = window.innerHeight * 0.92
        maxW = window.innerWidth  * 0.70
      }

      const scale = Math.min(maxH / img.naturalHeight, maxW / img.naturalWidth)
      carWrapRef.current.style.width  = `${img.naturalWidth  * scale}px`
      carWrapRef.current.style.height = `${img.naturalHeight * scale}px`
    }

    function updateDots(idx) {
      if (!dotsRef.current) return
      Array.from(dotsRef.current.children).forEach((dot, i) => {
        const active = i === idx
        dot.style.background = active ? '#fff' : 'rgba(255,255,255,0.25)'
        dot.style.transform  = active ? 'scale(1.4)' : 'scale(1)'
        const ping = dot.querySelector('.ping')
        if (ping) ping.style.display = active ? 'block' : 'none'
      })
    }

    function setContent(idx) {
      const s = STAGES[idx]
      if (taglineRef.current) injectChars(taglineRef.current, s.tagline)
      if (line0Ref.current)   injectChars(line0Ref.current, s.headline[0])
      if (line1Ref.current)   injectChars(line1Ref.current, s.headline[1] ?? '')
      if (bodyRef.current) {
        if (s.body) {
          bodyRef.current.style.display = 'block'
          injectWords(bodyRef.current, s.body)
        } else {
          bodyRef.current.style.display = 'none'
          bodyRef.current.innerHTML = ''
        }
      }
      if (ctaRef.current) {
        ctaRef.current.style.display = s.showCta ? 'inline-flex' : 'none'
        gsap.set(ctaRef.current, { opacity: s.showCta ? 0 : 1 })
      }
      updateDots(idx)
    }

    function animateIn(stageIdx) {
      if (inTL) inTL.kill()
      inTL = gsap.timeline()

      const tagChars = taglineRef.current?.querySelectorAll('.char-inner')
      if (tagChars?.length) {
        gsap.set(tagChars, { y: '130%', opacity: 0, rotationZ: 10, transformOrigin: 'left bottom' })
        inTL.to(tagChars, { y: '0%', opacity: 1, rotationZ: 0, duration: 0.65, ease: 'expo.out', stagger: { each: 0.02, from: 'start' } }, 0)
      }

      const h0 = line0Ref.current?.querySelectorAll('.char-inner')
      if (h0?.length) {
        gsap.set(h0, { y: '115%', scaleY: 1.5, skewY: 8, opacity: 0, transformOrigin: 'left bottom' })
        inTL.to(h0, { y: '0%', scaleY: 1, skewY: 0, opacity: 1, duration: 0.82, ease: 'expo.out', stagger: { each: 0.015, from: 'start' } }, 0.07)
      }

      const h1 = line1Ref.current?.querySelectorAll('.char-inner')
      if (h1?.length) {
        gsap.set(h1, { y: '115%', scaleY: 1.5, skewY: 8, opacity: 0, transformOrigin: 'left bottom' })
        inTL.to(h1, { y: '0%', scaleY: 1, skewY: 0, opacity: 1, duration: 0.82, ease: 'expo.out', stagger: { each: 0.015, from: 'start' } }, 0.21)
      }

      if (dividerRef.current) {
        gsap.set(dividerRef.current, { scaleX: 0, opacity: 0, transformOrigin: 'left center' })
        inTL.to(dividerRef.current, { scaleX: 1, opacity: 1, duration: 0.48, ease: 'expo.out' }, 0.38)
      }

      if (STAGES[stageIdx].body) {
        const words = bodyRef.current?.querySelectorAll('.word-inner')
        if (words?.length) {
          gsap.set(words, { y: '112%', opacity: 0, rotationZ: 2, transformOrigin: 'left bottom' })
          inTL.to(words, { y: '0%', opacity: 1, rotationZ: 0, duration: 0.5, ease: 'power3.out', stagger: { each: 0.022, from: 'start' } }, 0.5)
        }
      }

      if (STAGES[stageIdx].showCta && ctaRef.current) {
        gsap.set(ctaRef.current, { opacity: 0, scale: 0.78, rotationZ: -5, y: 22 })
        inTL.to(ctaRef.current, { opacity: 1, scale: 1, rotationZ: 0, y: 0, duration: 0.7, ease: 'back.out(2.4)' }, 0.65)
      }
    }

    function animateOut(onComplete) {
      if (outTL) outTL.kill()
      outTL = gsap.timeline({ onComplete })

      const tagChars = taglineRef.current?.querySelectorAll('.char-inner')
      if (tagChars?.length)
        outTL.to(tagChars, { y: '-140%', opacity: 0, skewY: -6, rotationZ: -8, duration: 0.26, ease: 'power3.in', stagger: { each: 0.011, from: 'end' } }, 0)

      const h1 = line1Ref.current?.querySelectorAll('.char-inner')
      if (h1?.length)
        outTL.to(h1, { y: '-120%', opacity: 0, skewY: -10, scaleY: 0.7, duration: 0.24, ease: 'power3.in', stagger: { each: 0.009, from: 'end' } }, 0)

      const h0 = line0Ref.current?.querySelectorAll('.char-inner')
      if (h0?.length)
        outTL.to(h0, { y: '-120%', opacity: 0, skewY: -10, scaleY: 0.7, duration: 0.24, ease: 'power3.in', stagger: { each: 0.009, from: 'end' } }, 0.05)

      if (dividerRef.current)
        outTL.to(dividerRef.current, { scaleX: 0, opacity: 0, transformOrigin: 'right center', duration: 0.18, ease: 'power3.in' }, 0)

      const words = bodyRef.current?.querySelectorAll('.word-inner')
      if (words?.length)
        outTL.to(words, { y: '-114%', opacity: 0, rotationZ: -2, duration: 0.18, ease: 'power2.in', stagger: { each: 0.007, from: 'start' } }, 0)

      if (ctaRef.current)
        outTL.to(ctaRef.current, { opacity: 0, scale: 0.85, y: -14, rotationZ: 4, duration: 0.15, ease: 'power2.in' }, 0)
    }

    function transitionToStage(newStage) {
      if (newStage === currentStage) return
      const isFirst = currentStage === -1
      currentStage = newStage
      if (isFirst) {
        setContent(newStage); animateIn(newStage)
      } else {
        if (inTL) inTL.kill()
        animateOut(() => { setContent(newStage); animateIn(newStage) })
      }
    }

    function scheduleDraw() {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const idx = Math.round(frameObj.val)
        const img = images[idx]
        const newStage = Math.min(Math.floor(idx / Math.ceil(TOTAL_FRAMES / STAGES.length)), STAGES.length - 1)
        transitionToStage(newStage)
        if (!img?.complete || img.naturalWidth === 0) return
        sizeCanvas(img)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(getTransparentCanvas(img), 0, 0)
        if (!_firstFrameDrawn) {
          _firstFrameDrawn = true
          setFirstFrameDrawn(true)
        }
      })
    }

    function onResize() {
      const img = images[Math.round(frameObj.val)]
      if (img?.complete && img.naturalWidth > 0) applyCarSize(img)
    }

    window.addEventListener('resize', onResize)
    transitionToStage(0)

    function loadFrame(i) {
      const img = new Image()
      img.src = FRAME_PATH(i + 1)
      img.onload = () => {
        images[i] = img
        getTransparentCanvas(img)
        if (Math.abs(i - Math.round(frameObj.val)) <= 3) scheduleDraw()
      }
      images[i] = img
      return img
    }

    const first = new Image()
    first.src = FRAME_PATH(1)
    images[0] = first

    if (first.complete && first.naturalWidth > 0) {
      getTransparentCanvas(first)
      scheduleDraw()
      for (let i = 1; i < TOTAL_FRAMES; i++) loadFrame(i)
    } else {
      first.onload = () => {
        images[0] = first
        getTransparentCanvas(first)
        scheduleDraw()
        for (let i = 1; i < TOTAL_FRAMES; i++) loadFrame(i)
      }
    }

    const tween = gsap.to(frameObj, {
      val: TOTAL_FRAMES - 1,
      ease: 'none',
      onUpdate: scheduleDraw,
      scrollTrigger: {
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=500%',
        scrub: 0.4,
        pin: true,
        anticipatePin: 1,
        fastScrollEnd: true,
        preventOverlaps: true,
      },
    })

    return () => {
      window.removeEventListener('resize', onResize)
      if (rafId) cancelAnimationFrame(rafId)
      tween.kill()
      if (inTL)  inTL.kill()
      if (outTL) outTL.kill()
      ScrollTrigger.getAll().forEach((t) => t.kill())
      transparentCache.clear()
    }
  }, [])

  // ─── Layout values per breakpoint ────────────────────────────────────────────
  const layout = isMobile
    ? {
        sectionDir: 'column',
        textWidth: '100%',
        textPadding: '16vw 5vw 0',
        textJustify: 'flex-start',
        headlineFz: 'clamp(28px, 9vw, 48px)',
        taglineFz: '9px',
        bodyFz: '12px',
        bodyMaxW: '100%',
        carPosition: {
          position: 'relative',
          bottom: 'unset',
          right: 'unset',
          width: '100%',
          height: '50vw',
          maxHeight: '52vh',
          zIndex: 10,
          marginTop: 'auto',
        },
        dotsPosition: {
          position: 'absolute',
          bottom: 'calc(50vw + 12px)',  // just above the car block
          left: '5vw',
        },
        coverBottom: false,
      }
    : isTablet
    ? {
        sectionDir: 'row',
        textWidth: '50%',
        textPadding: '0 0 0 5vw',
        textJustify: 'center',
        headlineFz: 'clamp(30px, 4vw, 56px)',
        taglineFz: '9px',
        bodyFz: '12px',
        bodyMaxW: '340px',
        carPosition: {
          position: 'absolute',
          bottom: '-2%',
          right: '0%',
          width: '55vw',
          height: '80vh',
          zIndex: 10,
          overflow: 'visible',
        },
        dotsPosition: {
          position: 'absolute',
          bottom: '8%',
          left: '5vw',
        },
        coverBottom: true,
      }
    : {
        // Desktop (original)
        sectionDir: 'row',
        textWidth: '46%',
        textPadding: '0 0 0 6vw',
        textJustify: 'center',
        headlineFz: 'clamp(40px, 5.5vw, 76px)',
        taglineFz: '10px',
        bodyFz: '13px',
        bodyMaxW: '380px',
        carPosition: {
          position: 'absolute',
          bottom: '-2%',
          right: '0%',
          width: '60vw',
          height: '92vh',
          zIndex: 10,
          overflow: 'visible',
        },
        dotsPosition: {
          position: 'absolute',
          bottom: '10%',
          left: '6vw',
        },
        coverBottom: true,
      }

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap" />
      <style>{`
        .char       { display:inline-block; overflow:hidden; line-height:1.1; }
        .char-inner { display:inline-block; will-change:transform,opacity; }
        .word-wrap  { display:inline-block; overflow:hidden; vertical-align:bottom; }
        .word-inner { display:inline-block; will-change:transform,opacity; }

        @keyframes dotPing {
          0%   { transform:scale(1);   opacity:.8; }
          100% { transform:scale(2.8); opacity:0;  }
        }
        .ping {
          position:absolute; inset:0; border-radius:50%;
          background:#fff;
          animation:dotPing 1.1s ease-out infinite;
          pointer-events:none;
        }
        @keyframes arrowPulse {
          0%,100% { transform:translateX(0); }
          50%     { transform:translateX(3px); }
        }
        .cta-arrow { animation:arrowPulse 1.5s ease-in-out infinite; }

        /* Fluid car canvas on mobile: fill its wrapper */
        .car-canvas {
          display:block;
          width:100%;
          height:100%;
          object-fit:contain;
        }

        /* On mobile the section is a flex column — text then car */
        @media (max-width: 767px) {
          .hero-section {
            flex-direction: column !important;
          }
          .hero-text-panel {
            width: 100% !important;
            height: auto !important;
            justify-content: flex-start !important;
            padding: 14vw 5vw 0 !important;
          }
          .hero-text-panel p,
          .hero-text-panel div,
          .hero-text-panel a {
            max-width: 100% !important;
          }
        }
      `}</style>

      <section
        ref={sectionRef}
        className="hero-section"
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          background: '#0a0a0a',
          fontFamily: "'Josefin Sans', sans-serif",
          display: 'flex',
          flexDirection: layout.sectionDir,
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        {/* ── TEXT PANEL ──────────────────────────────────────────── */}
        <div
          className="hero-text-panel"
          style={{
            position: 'relative',
            width: layout.textWidth,
            height: isMobile ? 'auto' : '100%',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: layout.textJustify,
            padding: layout.textPadding,
            zIndex: 10,
          }}
        >
          {/* Tagline */}
          <p
            ref={taglineRef}
            style={{
              fontSize: layout.taglineFz,
              fontWeight: 600,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.38)',
              margin: '0 0 clamp(10px,2vh,20px) 0',
              lineHeight: 1,
              minHeight: '13px',
            }}
          />

          {/* Headline line 0 */}
          <div style={{ overflow: 'hidden' }}>
            <div
              ref={line0Ref}
              style={{
                fontSize: layout.headlineFz,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#fff',
                lineHeight: 1.0,
                minHeight: layout.headlineFz,
              }}
            />
          </div>

          {/* Headline line 1 */}
          <div style={{ overflow: 'hidden', marginBottom: 'clamp(14px, 2.5vh, 28px)' }}>
            <div
              ref={line1Ref}
              style={{
                fontSize: layout.headlineFz,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                textTransform: 'uppercase',
                color: '#fff',
                lineHeight: 1.0,
                minHeight: layout.headlineFz,
              }}
            />
          </div>

          {/* Divider */}
          <div
            ref={dividerRef}
            style={{
              width: '40px',
              height: '1px',
              background: 'rgba(255,255,255,0.25)',
              marginBottom: 'clamp(12px, 2vh, 24px)',
              transformOrigin: 'left center',
              opacity: 0,
            }}
          />

          {/* Body */}
          <p
            ref={bodyRef}
            style={{
              fontSize: layout.bodyFz,
              fontWeight: 300,
              letterSpacing: '0.04em',
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.55)',
              margin: '0 0 clamp(18px, 3vh, 36px) 0',
              maxWidth: layout.bodyMaxW,
              display: 'none',
            }}
          />

          {/* CTA */}
          <a
            ref={ctaRef}
            href="#about"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '12px',
              background: '#fff',
              color: '#000',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              padding: '14px 28px',
              borderRadius: '999px',
              width: 'fit-content',
              opacity: 0,
            }}
          >
            Explore Model
            <span
              className="cta-arrow"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#000',
                color: '#fff',
                fontSize: '13px',
              }}
            >→</span>
          </a>

          {/* Stage dots — on mobile, positioned relative to text panel bottom */}
          {isMobile && (
            <div
              ref={dotsRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: 'clamp(14px, 2.5vh, 28px)',
                marginBottom: '10px',
              }}
            >
              {STAGES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: i === 0 ? '#fff' : 'rgba(255,255,255,0.25)',
                    transform: i === 0 ? 'scale(1.4)' : 'scale(1)',
                    transition: 'background 0.4s, transform 0.4s',
                  }}
                >
                  <span className="ping" style={{ display: i === 0 ? 'block' : 'none' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CAR CANVAS ──────────────────────────────────────────── */}
        <div
          ref={carWrapRef}
          style={{
            ...layout.carPosition,
            ...(isMobile
              ? {
                  position: 'relative',
                  width: '100%',
                  height: '48vw',
                  maxHeight: '52vh',
                  flexShrink: 0,
                  zIndex: 10,
                  overflow: 'visible',
                  marginTop: '150px',
                }
              : {}),
          }}
        >
          <canvas
            ref={canvasRef}
            className="car-canvas"
            style={{
              mixBlendMode: firstFrameDrawn ? 'lighten' : 'normal',
            }}
            
          />

              <div style={{
    position: 'absolute',
    bottom: '18%',
    right: '8%',
    width: '60px',
    height: '20px',
    background: '#0a0a0a',
    zIndex: 12,
  }} />
          {/* Cover bottom-right Anthropic/watermark area */}
          {layout.coverBottom && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '140px',
                height: '50px',
                background: '#0a0a0a',
                zIndex: 11,
              }}
            />
          )}
        </div>

        {/* Stage dots — desktop/tablet (absolute positioned) */}
        {!isMobile && (
          <div
            ref={dotsRef}
            style={{
              ...layout.dotsPosition,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              zIndex: 20,
            }}
          >
            {STAGES.map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'relative',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: i === 0 ? '#fff' : 'rgba(255,255,255,0.25)',
                  transform: i === 0 ? 'scale(1.4)' : 'scale(1)',
                  transition: 'background 0.4s, transform 0.4s',
                }}
              >
                <span className="ping" style={{ display: i === 0 ? 'block' : 'none' }} />
              </div>
            ))}
          </div>
        )}

        {/* Top vignette */}
        <div
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: isMobile ? '12%' : '18%',
            background: 'linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />

        {/* Bottom vignette */}
        <div
          style={{
            position: 'absolute',
            bottom: 0, left: 0, right: 0,
            height: isMobile ? '10%' : '20%',
            background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />
      </section>
    </>
  )
}