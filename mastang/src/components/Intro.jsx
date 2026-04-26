import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function Intro() {
  const sectionRef = useRef(null)
  const titleRef   = useRef(null)
  const subRef     = useRef(null)
  const lineRef    = useRef(null)
  const yearRef    = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const ctx = gsap.context(() => {

      // ── Entry animation (page load) ──────────────────────────────────
      const entryTL = gsap.timeline({ delay: 0.2 })

      // Letters split for MUSTANG
      const letters = titleRef.current?.querySelectorAll('.intro-letter')
      if (letters?.length) {
        gsap.set(letters, { y: '120%', opacity: 0, rotationZ: 4, skewY: 6 })
        entryTL.to(letters, {
          y: '0%', opacity: 1, rotationZ: 0, skewY: 0,
          duration: 1.1, ease: 'expo.out',
          stagger: { each: 0.06, from: 'start' },
        }, 0)
      }

      if (subRef.current) {
        gsap.set(subRef.current, { y: 30, opacity: 0 })
        entryTL.to(subRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out' }, 0.55)
      }

      if (lineRef.current) {
        gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' })
        entryTL.to(lineRef.current, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, 0.65)
      }

      if (yearRef.current) {
        gsap.set(yearRef.current, { y: 20, opacity: 0 })
        entryTL.to(yearRef.current, { y: 0, opacity: 1, duration: 0.6, ease: 'expo.out' }, 0.75)
      }

      // ── Scroll-out: section collapses as user scrolls down into Hero ──
      gsap.to(section, {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })

      // Title scales + fades on scroll
      if (titleRef.current) {
        gsap.to(titleRef.current, {
          scale: 1.08,
          opacity: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '60% top',
            scrub: 0.6,
          },
        })
      }

      // Overlay fades in (darkens) as we scroll out
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const LETTERS = 'MUSTANG'.split('')

  return (
    <>
      {/* Google Fonts — Bebas Neue for the big wavy display look */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Josefin+Sans:wght@300;400;600;700&display=swap"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');

        .intro-section {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #080808;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 1;
        }

        /* Noise texture overlay */
        .intro-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.6;
        }

        /* Gradient radial glow behind text */
        .intro-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 70vw;
          height: 50vh;
          background: radial-gradient(ellipse at center,
            rgba(255,255,255,0.045) 0%,
            transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        /* Scroll-out dark overlay */
        .intro-overlay {
          position: absolute;
          inset: 0;
          background: #080808;
          opacity: 0;
          pointer-events: none;
          z-index: 5;
        }

        /* ── Main title ── */
        .intro-title {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: flex-end;
          gap: 0;
          line-height: 0.88;
          margin-bottom: 28px;
          overflow: visible;
        }

        .intro-letter-wrap {
          display: inline-block;
          overflow: hidden;
          line-height: 0.92;
        }

        .intro-letter {
          display: inline-block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(100px, 18vw, 260px);
          font-weight: 400;
          letter-spacing: -0.01em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.92);
          will-change: transform, opacity;
          line-height: 0.92;
          /* Wavy baseline — each letter slightly different vertical offset */
        }

        /* Wavy baseline per letter */
        .intro-letter:nth-child(1) { transform-origin: bottom center; margin-bottom:  0px; }
        .intro-letter:nth-child(2) { margin-bottom:  8px; }
        .intro-letter:nth-child(3) { margin-bottom: -4px; }
        .intro-letter:nth-child(4) { margin-bottom: 10px; }
        .intro-letter:nth-child(5) { margin-bottom: -2px; }
        .intro-letter:nth-child(6) { margin-bottom:  6px; }
        .intro-letter:nth-child(7) { margin-bottom: -6px; }

        /* Alternate letters get a subtle filled look */
        .intro-letter:nth-child(odd) {
          color: #fff;
          -webkit-text-stroke: 0px;
        }
        .intro-letter:nth-child(even) {
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(255,255,255,0.75);
        }

        /* ── Sub line ── */
        .intro-sub {
          position: relative;
          z-index: 2;
          font-family: 'Josefin Sans', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.52em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          margin-bottom: 20px;
        }

        /* ── Divider ── */
        .intro-line {
          position: relative;
          z-index: 2;
          width: 48px;
          height: 1px;
          background: rgba(255,255,255,0.18);
          margin-bottom: 20px;
        }

        /* ── Year stamp ── */
        .intro-year {
          position: absolute;
          bottom: 8%;
          left: 50%;
          transform: translateX(-50%);
          font-family: 'Josefin Sans', sans-serif;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.44em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.14);
          z-index: 2;
          white-space: nowrap;
        }

        /* ── Scroll cue ── */
        .intro-scroll {
          position: absolute;
          bottom: 7%;
          right: 5%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .intro-scroll-label {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 8px;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.15);
          writing-mode: vertical-rl;
        }
        @keyframes bob {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(5px); }
        }
        .intro-scroll-arrow {
          color: rgba(255,255,255,0.2);
          font-size: 12px;
          animation: bob 2s ease-in-out infinite;
        }

        /* ── Side stamps ── */
        .intro-stamp {
          position: absolute;
          font-family: 'Josefin Sans', sans-serif;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.1);
          z-index: 2;
        }
        .intro-stamp-left {
          left: 5%;
          top: 50%;
          transform: translateY(-50%) rotate(-90deg);
          transform-origin: center center;
        }
        .intro-stamp-right {
          right: 5%;
          top: 50%;
          transform: translateY(-50%) rotate(90deg);
          transform-origin: center center;
        }

        /* ── Corner dots ── */
        .intro-dot {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          z-index: 2;
        }
        .intro-dot-tl { top: 10%; left: 5%; }
        .intro-dot-tr { top: 10%; right: 5%; }
        .intro-dot-bl { bottom: 10%; left: 5%; }
        .intro-dot-br { bottom: 10%; right: 5%; }
      `}</style>

      <section ref={sectionRef} className="intro-section">
        {/* Glow */}
        <div className="intro-glow" />

        {/* Scroll-out overlay */}
        <div ref={overlayRef} className="intro-overlay" />

        {/* Side stamps */}
        <span className="intro-stamp intro-stamp-left">Shelby GT500 · Heritage Edition</span>
        <span className="intro-stamp intro-stamp-right">American Performance · Since 1967</span>

        {/* Corner dots */}
        <div className="intro-dot intro-dot-tl" />
        <div className="intro-dot intro-dot-tr" />
        <div className="intro-dot intro-dot-bl" />
        <div className="intro-dot intro-dot-br" />

        {/* Eyebrow */}
        <p ref={subRef} className="intro-sub">Ford Shelby GT500</p>

        {/* BIG MUSTANG letters */}
        <div ref={titleRef} className="intro-title">
          {LETTERS.map((letter, i) => (
            <div key={i} className="intro-letter-wrap">
              <span className="intro-letter">{letter}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div ref={lineRef} className="intro-line" />

        {/* Year */}
        <div ref={yearRef} className="intro-year">Est. 1967 · 760 HP · Supercharged V8</div>

        {/* Scroll cue */}
        <div className="intro-scroll">
          <span className="intro-scroll-label">Scroll</span>
          <span className="intro-scroll-arrow">↓</span>
        </div>
      </section>
    </>
  )
}