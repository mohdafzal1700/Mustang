import { useEffect, useState, useRef } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled]             = useState(false)
  const [active, setActive]                 = useState('Home')
  const [menuOpen, setMenuOpen]             = useState(false)
  const [indicatorStyle, setIndicatorStyle] = useState({})
  const linksRef = useRef({})

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const el = linksRef.current[active]
    if (!el) return
    const { offsetLeft, offsetWidth } = el
    setIndicatorStyle({ left: offsetLeft, width: offsetWidth })
  }, [active])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const links = ['Home', 'About', 'Gallery']

  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600;700&display=swap" />
      <style>{`
        :root {
          --nb-h: 68px;
          --nb-bg-scrolled: rgba(5,5,7,0.82);
          --text-dim: rgba(255,255,255,0.42);
          --text-mid: rgba(255,255,255,0.72);
          --text-bright: #ffffff;
        }

        /* ── NAV SHELL — 3-col grid: logo | links | cta ─── */
        /* This is the root fix — grid guarantees the center   */
        /* column is truly centered and can never overlap the  */
        /* logo or CTA regardless of their widths.             */
        .nb {
          font-family: 'Josefin Sans', sans-serif;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
          height: var(--nb-h);
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 0 clamp(20px, 4vw, 48px);
          transition: background 0.45s cubic-bezier(0.4,0,0.2,1),
                      box-shadow 0.45s ease,
                      backdrop-filter 0.45s ease;
        }
        .nb.scrolled {
          background: var(--nb-bg-scrolled);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          box-shadow: 0 1px 0 rgba(255,255,255,0.05),
                      0 16px 40px rgba(0,0,0,0.55);
        }

        /* ── Col 1: LOGO ─────────────────────────────────── */
        .nb-logo {
          justify-self: start;
          font-size: clamp(13px, 1.2vw, 17px);
          font-weight: 700;
          letter-spacing: 0.55em;
          text-transform: uppercase;
          cursor: default;
          user-select: none;
          background: linear-gradient(90deg,
            rgba(255,255,255,1) 0%,
            rgba(190,190,190,0.8) 50%,
            rgba(255,255,255,1) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logo-shine 4s linear infinite;
        }
        @keyframes logo-shine {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* ── Col 2: CENTER LINKS ─────────────────────────── */
        .nb-links {
          position: relative;
          display: flex;
          align-items: center;
          gap: clamp(24px, 3vw, 48px);
        }
        .nb-link-wrap { position: relative; }
        .nb-link {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--text-dim);
          text-decoration: none;
          cursor: pointer;
          transition: color 0.22s ease;
          white-space: nowrap;
          padding-bottom: 2px;
          display: block;
        }
        .nb-link:hover  { color: var(--text-mid); }
        .nb-link.active { color: var(--text-bright); }

        .nb-indicator {
          position: absolute;
          bottom: -6px;
          height: 1px;
          background: rgba(255,255,255,0.55);
          transition: left 0.38s cubic-bezier(0.4,0,0.2,1),
                      width 0.38s cubic-bezier(0.4,0,0.2,1);
          pointer-events: none;
        }

        /* ── Col 3: RIGHT (CTA + burger wrapper) ─────────── */
        .nb-right {
          justify-self: end;
          display: flex;
          align-items: center;
        }

        .nb-cta {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          cursor: pointer;
          border: 1px solid rgba(255,255,255,0.18);
          padding: 8px 18px;
          border-radius: 999px;
          transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease;
          white-space: nowrap;
        }
        .nb-cta:hover { color: #000; background: #fff; border-color: #fff; }

        /* ── HAMBURGER ───────────────────────────────────── */
        .nb-burger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 36px;
          height: 36px;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          z-index: 1002;
        }
        .nb-burger span {
          display: block;
          width: 22px;
          height: 1.5px;
          background: #fff;
          transition: transform 0.32s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.22s ease, width 0.22s ease;
          transform-origin: center;
        }
        .nb-burger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nb-burger.open span:nth-child(2) { opacity: 0; width: 0; }
        .nb-burger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── MOBILE DRAWER ───────────────────────────────── */
        .nb-drawer {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 999;
          background: rgba(5,5,7,0.97);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          flex-direction: column;
          align-items: center;
          justify-content: center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.35s ease;
        }
        .nb-drawer.open { opacity: 1; pointer-events: all; }

        .nb-drawer-link {
          font-size: clamp(28px, 8vw, 44px);
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.22);
          text-decoration: none;
          cursor: pointer;
          padding: 14px 0;
          transition: color 0.22s ease, transform 0.22s ease;
          display: block;
          text-align: center;
        }
        .nb-drawer-link:hover,
        .nb-drawer-link.active { color: #fff; transform: translateX(6px); }

        .nb-drawer-divider {
          width: 1px; height: 28px;
          background: rgba(255,255,255,0.1);
          margin: 4px auto;
        }

        .nb-drawer-cta {
          margin-top: 40px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 12px 32px; border-radius: 999px;
          transition: color 0.22s, background 0.22s, border-color 0.22s;
        }
        .nb-drawer-cta:hover { color: #000; background: #fff; border-color: #fff; }

        /* ── RESPONSIVE ──────────────────────────────────── */
        @media (max-width: 767px) {
          /* 2-col on mobile: logo | burger */
          .nb { grid-template-columns: 1fr auto; }
          .nb-links { display: none; }
          .nb-cta   { display: none; }
          .nb-burger { display: flex; }
          .nb-drawer { display: flex; }
        }

        .nb-drawer.open .nb-drawer-link {
          animation: drawerLinkIn 0.45s cubic-bezier(0.22,1,0.36,1) both;
        }
        .nb-drawer.open .nb-drawer-link:nth-child(1) { animation-delay: 0.05s; }
        .nb-drawer.open .nb-drawer-link:nth-child(3) { animation-delay: 0.12s; }
        .nb-drawer.open .nb-drawer-link:nth-child(5) { animation-delay: 0.19s; }
        .nb-drawer.open .nb-drawer-cta {
          animation: drawerLinkIn 0.45s 0.28s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes drawerLinkIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className={`nb ${scrolled ? 'scrolled' : ''}`}>

        {/* Col 1 — Logo */}
        <span className="nb-logo">Mustang</span>

        {/* Col 2 — Center links */}
        <div className="nb-links">
          <div className="nb-indicator" style={indicatorStyle} />
          {links.map((item) => (
            <div className="nb-link-wrap" key={item}>
              <a
                ref={(el) => { if (el) linksRef.current[item] = el }}
                href="#"
                className={`nb-link ${active === item ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setActive(item) }}
              >
                {item}
              </a>
            </div>
          ))}
        </div>

        {/* Col 3 — CTA (desktop) + burger (mobile) */}
        <div className="nb-right">
          <a href="#" className="nb-cta">Contact</a>
          <button
            className={`nb-burger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

      </nav>

      {/* ── MOBILE DRAWER ──────────────────────────────────── */}
      <div className={`nb-drawer ${menuOpen ? 'open' : ''}`}>
        {links.map((item, i) => (
          <div key={item} style={{ width: '100%', textAlign: 'center' }}>
            {i > 0 && <div className="nb-drawer-divider" />}
            <a
              href="#"
              className={`nb-drawer-link ${active === item ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActive(item); setMenuOpen(false) }}
            >
              {item}
            </a>
          </div>
        ))}
        <a
          href="#"
          className="nb-drawer-cta"
          onClick={(e) => { e.preventDefault(); setMenuOpen(false) }}
        >
          Contact
        </a>
      </div>
    </>
  )
}