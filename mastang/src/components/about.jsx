import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import WhiteGt from '../assets/WhiteGt.png'

gsap.registerPlugin(ScrollTrigger)

const SPECS = [
  { label: 'Engine',    value: 'Supercharged 5.2L V8' },
  { label: 'Power',     value: '760 HP' },
  { label: 'Torque',    value: '625 lb-ft' },
  { label: '0 – 60',    value: '3.3 sec' },
  { label: 'Top Speed', value: '180 mph' },
]

function injectChars(el, text) {
  el.innerHTML = ''
  ;[...text].forEach((ch) => {
    const outer = document.createElement('span')
    outer.className = 'ab-char'
    const inner = document.createElement('span')
    inner.className = 'ab-char-inner'
    inner.textContent = ch === ' ' ? '\u00A0' : ch
    outer.appendChild(inner)
    el.appendChild(outer)
  })
}

function injectWords(el) {
  const text = el.textContent.trim()
  el.innerHTML = ''
  text.split(' ').forEach((word) => {
    const outer = document.createElement('span')
    outer.className = 'ab-word'
    const inner = document.createElement('span')
    inner.className = 'ab-word-inner'
    inner.textContent = word + '\u00A0'
    outer.appendChild(inner)
    el.appendChild(outer)
  })
}

export default function About() {
  const sectionRef  = useRef(null)
  const leftRef     = useRef(null)
  const eyebrowRef  = useRef(null)
  const titleRef    = useRef(null)
  const subtitleRef = useRef(null)
  const dividerRef  = useRef(null)
  const bodyRef     = useRef(null)
  const specsRef    = useRef(null)
  const ctaRef      = useRef(null)

  useEffect(() => {
    const section = sectionRef.current

    if (eyebrowRef.current)  injectChars(eyebrowRef.current, eyebrowRef.current.textContent)
    if (subtitleRef.current) injectChars(subtitleRef.current, subtitleRef.current.textContent)
    if (bodyRef.current)     injectWords(bodyRef.current)

    if (titleRef.current) {
      titleRef.current.querySelectorAll('.ab-title-line').forEach((line) => {
        injectChars(line, line.dataset.text)
      })
    }

    const ctx = gsap.context(() => {
      const st = {
        trigger: section,
        start: 'top 75%',
        toggleActions: 'play reverse play reverse',
      }

      gsap.fromTo(leftRef.current,
        { x: -80, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.3, ease: 'expo.out', scrollTrigger: st }
      )

      gsap.fromTo(
        eyebrowRef.current?.querySelectorAll('.ab-char-inner'),
        { y: '110%', opacity: 0, rotationZ: 6 },
        { y: '0%', opacity: 1, rotationZ: 0, duration: 0.6, ease: 'expo.out', stagger: { each: 0.018 }, scrollTrigger: st }
      )

      titleRef.current?.querySelectorAll('.ab-title-line').forEach((line, li) => {
        gsap.fromTo(
          line.querySelectorAll('.ab-char-inner'),
          { y: '115%', scaleY: 1.4, skewY: 6, opacity: 0, transformOrigin: 'left bottom' },
          { y: '0%', scaleY: 1, skewY: 0, opacity: 1, duration: 0.85, ease: 'expo.out', stagger: { each: 0.014 }, delay: li * 0.12, scrollTrigger: st }
        )
      })

      gsap.fromTo(
        subtitleRef.current?.querySelectorAll('.ab-char-inner'),
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.55, ease: 'power3.out', stagger: { each: 0.016 }, delay: 0.22, scrollTrigger: st }
      )

      gsap.fromTo(dividerRef.current,
        { scaleX: 0, opacity: 0, transformOrigin: 'left center' },
        { scaleX: 1, opacity: 1, duration: 0.55, ease: 'expo.out', delay: 0.32, scrollTrigger: st }
      )

      gsap.fromTo(
        bodyRef.current?.querySelectorAll('.ab-word-inner'),
        { y: '110%', opacity: 0, rotationZ: 2, transformOrigin: 'left bottom' },
        { y: '0%', opacity: 1, rotationZ: 0, duration: 0.55, ease: 'power3.out', stagger: { each: 0.02 }, delay: 0.38, scrollTrigger: st }
      )

      gsap.fromTo(
        specsRef.current?.querySelectorAll('.ab-row'),
        { y: 28, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.09, delay: 0.48, scrollTrigger: st }
      )

      gsap.fromTo(
        specsRef.current?.querySelectorAll('.ab-value'),
        { scaleX: 0.6, opacity: 0, transformOrigin: 'left center' },
        { scaleX: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.8)', stagger: 0.09, delay: 0.56, scrollTrigger: st }
      )

      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 20, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(2)', delay: 0.72, scrollTrigger: st }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap" />
      <style>{`
        .ab-char       { display:inline-block; overflow:hidden; line-height:1.15; }
        .ab-char-inner { display:inline-block; will-change:transform,opacity; }
        .ab-word       { display:inline-block; overflow:hidden; vertical-align:bottom; }
        .ab-word-inner { display:inline-block; will-change:transform,opacity; }

        /* ── SECTION SHELL ───────────────────────────────────── */
        .ab {
          width: 100%;
          min-height: 100vh;
          background: #0a0a0a;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Josefin Sans', sans-serif;
          overflow: hidden;
          position: relative;
          z-index: 10;
        }

        /* ── LEFT (image) ────────────────────────────────────── */
        .ab-left {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 40px 60px 72px;
        }

        .ab-img-wrap {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .ab-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center center;
          display: block;
        }

        .ab-img-wrap::before, .ab-img-wrap::after, .ab-corner-bl, .ab-corner-br {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          z-index: 2;
        }
        .ab-img-wrap::before { top:0;    left:0;  border-top:1px solid rgba(255,255,255,0.3);    border-left:1px solid rgba(255,255,255,0.3);  }
        .ab-img-wrap::after  { top:0;    right:0; border-top:1px solid rgba(255,255,255,0.3);    border-right:1px solid rgba(255,255,255,0.3); }
        .ab-corner-bl        { bottom:0; left:0;  border-bottom:1px solid rgba(255,255,255,0.3); border-left:1px solid rgba(255,255,255,0.3);  }
        .ab-corner-br        { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.3); border-right:1px solid rgba(255,255,255,0.3); }

        .ab-badge {
          position: absolute;
          bottom: -1px;
          left: 0;
          background: #fff;
          color: #0a0a0a;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          padding: 8px 16px;
        }

        /* ── RIGHT (text) ────────────────────────────────────── */
        .ab-right {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 72px 80px 48px;
          gap: 0;
        }

        .ab-eyebrow {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.38em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin: 0 0 16px 0;
          overflow: hidden;
        }

        .ab-title-wrap { margin: 0 0 6px 0; }

        .ab-title-line {
          display: block;
          overflow: hidden;
          font-size: clamp(28px, 3vw, 48px);
          font-weight: 700;
          letter-spacing: -0.01em;
          text-transform: uppercase;
          color: #fff;
          line-height: 1.0;
        }

        .ab-subtitle {
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.18);
          margin: 0 0 24px 0;
          overflow: hidden;
        }

        .ab-divider {
          width: 36px;
          height: 1px;
          background: rgba(255,255,255,0.2);
          margin-bottom: 22px;
        }

        .ab-body {
          font-size: 12px;
          font-weight: 300;
          line-height: 1.85;
          letter-spacing: 0.03em;
          color: rgba(255,255,255,0.38);
          margin: 0 0 32px 0;
          max-width: 360px;
        }

        .ab-specs {
          margin-bottom: 32px;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .ab-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .ab-row:first-child {
          border-top: 1px solid rgba(255,255,255,0.05);
        }

        .ab-label {
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.32em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
          flex-shrink: 0;
          min-width: 80px;
        }

        .ab-value {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.88);
          text-align: right;
        }

        .ab-cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          color: #fff;
          font-family: 'Josefin Sans', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 13px 28px;
          border: 1px solid rgba(255,255,255,0.14);
          width: fit-content;
          transition: all 0.22s ease;
          background: transparent;
        }

        .ab-cta:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.32);
          gap: 20px;
        }

        .ab-cta-line {
          width: 18px;
          height: 1px;
          background: rgba(255,255,255,0.4);
          transition: width 0.22s ease;
          flex-shrink: 0;
        }

        .ab-cta:hover .ab-cta-line { width: 28px; }

        /* ── TABLET ──────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .ab-left  { padding: 48px 24px 48px 40px; }
          .ab-right { padding: 60px 40px 60px 32px; }
          .ab-body  { max-width: 100%; }
        }

        /* ── MOBILE: stack vertically ────────────────────────── */
        @media (max-width: 767px) {
          .ab {
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            min-height: unset;
          }

          /* IMAGE BLOCK */
          .ab-left {
            padding: 32px 24px 24px;
            min-height: unset;
            height: auto;
          }

          .ab-img-wrap {
            width: 100%;
            height: auto;
            aspect-ratio: 16/9;
          }

          .ab-img-wrap img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .ab-badge {
            font-size: 7px;
            padding: 6px 12px;
            letter-spacing: 0.18em;
          }

          /* TEXT BLOCK */
          .ab-right {
            padding: 28px 24px 40px;
          }

          .ab-eyebrow {
            font-size: 8px;
            letter-spacing: 0.28em;
            margin-bottom: 10px;
          }

          .ab-title-line {
            font-size: clamp(26px, 8vw, 40px);
          }

          .ab-subtitle {
            font-size: 9px;
            letter-spacing: 0.18em;
            margin-bottom: 16px;
          }

          .ab-divider {
            margin-bottom: 14px;
          }

          .ab-body {
            font-size: 11px;
            line-height: 1.75;
            margin-bottom: 20px;
            max-width: 100%;
          }

          .ab-specs {
            margin-bottom: 24px;
          }

          /* Fix spec rows — prevent overflow */
          .ab-row {
            padding: 9px 0;
            gap: 8px;
          }

          .ab-label {
            font-size: 8px;
            letter-spacing: 0.22em;
            min-width: 70px;
            flex-shrink: 0;
          }

          .ab-value {
            font-size: 9px;
            letter-spacing: 0.1em;
            text-align: right;
            flex: 1;
            /* prevent long values from overflowing */
            word-break: break-word;
            hyphens: auto;
          }

          .ab-cta {
            font-size: 8px;
            padding: 11px 20px;
            gap: 10px;
          }
        }

        /* ── EXTRA SMALL ─────────────────────────────────────── */
        @media (max-width: 380px) {
          .ab-title-line {
            font-size: clamp(22px, 8.5vw, 32px);
          }

          .ab-left {
            padding: 24px 16px 20px;
          }

          .ab-right {
            padding: 20px 16px 32px;
          }

          .ab-label {
            font-size: 7.5px;
            min-width: 60px;
          }

          .ab-value {
            font-size: 8px;
          }
        }
      `}</style>

      <section ref={sectionRef} className="ab" id="about">

        {/* ── IMAGE ───────────────────────────────────────────── */}
        <div ref={leftRef} className="ab-left">
          <div className="ab-img-wrap">
            <img src={WhiteGt} alt="Shelby GT500" />
            <div className="ab-corner-bl" />
            <div className="ab-corner-br" />
            <div className="ab-badge">Shelby GT500 · Heritage Edition</div>
          </div>
        </div>

        {/* ── TEXT ────────────────────────────────────────────── */}
        <div className="ab-right">
          <p ref={eyebrowRef} className="ab-eyebrow">American Performance · Since 1967</p>

          <div ref={titleRef} className="ab-title-wrap">
            <span className="ab-title-line" data-text="The Ultimate">The Ultimate</span>
            <span className="ab-title-line" data-text="Mustang">Mustang</span>
          </div>

          <p ref={subtitleRef} className="ab-subtitle">Ford Shelby GT500</p>

          <div ref={dividerRef} className="ab-divider" />

          <p ref={bodyRef} className="ab-body">
            The GT500 is the apex of the Mustang lineage — a hand-built supercharged beast with a 5.2L flat-plane Predator V8 screaming to 7,500 rpm. 760 horsepower. One purpose.
          </p>

          <div ref={specsRef} className="ab-specs">
            {SPECS.map(({ label, value }) => (
              <div key={label} className="ab-row">
                <span className="ab-label">{label}</span>
                <span className="ab-value">{value}</span>
              </div>
            ))}
          </div>

          <a ref={ctaRef} href="#" className="ab-cta">
            Explore Full Specs
            <span className="ab-cta-line" />
          </a>
        </div>

      </section>
    </>
  )
}