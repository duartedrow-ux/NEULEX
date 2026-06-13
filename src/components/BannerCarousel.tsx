import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'

export type BannerSlide = {
  id: string
  eyebrow: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaTo: string
  theme: 'lila' | 'verde' | 'neutral'
}

export function BannerCarousel() {
  const slides = useMemo<BannerSlide[]>(
    () => [
      {
        id: 'rutina',
        eyebrow: 'Skincare',
        title: 'Rutina simple, piel radiante',
        subtitle: 'Elegí tu tratamiento y armá tu pedido en segundos.',
        ctaLabel: 'Explorar skincare',
        ctaTo: '/productos',
        theme: 'lila',
      },
      {
        id: 'jabones',
        eyebrow: 'Jabones',
        title: 'Aromas que dan ganas de repetir',
        subtitle: 'Jabones artesanales para el día a día.',
        ctaLabel: 'Ver jabones',
        ctaTo: '/productos',
        theme: 'verde',
      },
      {
        id: 'sets',
        eyebrow: 'Sets',
        title: 'Regalá cuidado (o regalate)',
        subtitle: 'Combos listos para una rutina completa.',
        ctaLabel: 'Ver sets',
        ctaTo: '/productos',
        theme: 'neutral',
      },
    ],
    [],
  )

  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length)
    }, 6500)
    return () => window.clearInterval(id)
  }, [slides.length])

  const current = slides[active]

  return (
    <section className="banner" aria-label="Banners">
      <div className={`bannerInner bannerTheme-${current.theme}`}>
        <div className="bannerText">
          <div className="bannerEyebrow">{current.eyebrow}</div>
          <div className="bannerTitle">{current.title}</div>
          <div className="bannerSubtitle">{current.subtitle}</div>
          <div className="bannerCtas">
            <Link to={current.ctaTo} className="button buttonPrimary">
              {current.ctaLabel}
            </Link>
            <Link to="/contacto" className="button buttonGhost">
              Consultar
            </Link>
          </div>
          <div className="bannerDots" role="tablist" aria-label="Cambiar banner">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                className={idx === active ? 'dot active' : 'dot'}
                onClick={() => setActive(idx)}
                aria-label={`Banner: ${s.title}`}
              />
            ))}
          </div>
        </div>

        <div className="bannerMedia" aria-hidden="true">
          <div className="bannerMediaFrame">
            <img className="bannerMediaImg" src={heroImg} alt="" />
            <div className="bannerMediaGlow" />
          </div>
        </div>
      </div>
    </section>
  )
}
