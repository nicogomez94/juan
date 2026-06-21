import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import useFadeIn from '../hooks/useFadeIn'
import { useSiteImages } from '../lib/siteImages'

export function ServiceSection({ number, title, intro, tone = 'light', children }) {
  return (
    <section className={`service-detail__section service-detail__section--${tone}`}>
      <div className="container service-detail__section-inner fade-in">
        <div className="service-detail__section-heading">
          {number && <span className="service-detail__number">{number}</span>}
          <h2>{title}</h2>
        </div>
        {intro && <p className="service-detail__lead">{intro}</p>}
        {children}
      </div>
    </section>
  )
}

export function ServiceList({ items, columns = false }) {
  return (
    <ul className={`service-detail__list${columns ? ' service-detail__list--columns' : ''}`}>
      {items.map(item => {
        const content = typeof item === 'string' ? { text: item } : item
        return (
          <li key={content.title || content.text}>
            <i className={`fas ${content.icon || 'fa-check'}`} aria-hidden="true" />
            <div>
              {content.title && <strong>{content.title}</strong>}
              <span>{content.text}</span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export function ServiceTextBlocks({ items }) {
  return (
    <div className="service-detail__text-blocks">
      {items.map(item => (
        <article key={item.title} className="service-detail__text-block">
          <h3>{item.title}</h3>
          <p>{item.text}</p>
        </article>
      ))}
    </div>
  )
}

export default function ServiceDetailPage({
  eyebrow,
  title,
  subtitle,
  introTitle,
  intro,
  imageKey,
  imageCaption,
  ctaTitle,
  ctaText,
  children,
}) {
  const ref = useFadeIn()
  const { image } = useSiteImages()
  const serviceImage = image(imageKey)

  return (
    <div ref={ref}>
      <Navbar />
      <section className="page-hero service-detail__hero">
        <div className="container page-hero__inner">
          <p className="section-header__tag section-header__tag--light">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>

      <section className="service-detail__intro">
        <div className="container service-detail__intro-inner">
          <div className="service-detail__intro-content fade-in">
            <p className="section-header__tag">Servicio especializado</p>
            <h2>{introTitle}</h2>
            {intro.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <figure className="service-detail__image fade-in">
            <img src={serviceImage.url} alt={serviceImage.alt} />
            <figcaption><i className="fas fa-image" aria-hidden="true" /> {imageCaption}</figcaption>
          </figure>
        </div>
      </section>

      <main>{children}</main>

      <section className="cta-section">
        <div className="container cta-section__inner fade-in">
          <div>
            <h2>{ctaTitle}</h2>
            <p>{ctaText}</p>
          </div>
          <Link to="/contacto" className="btn btn--white btn--lg">Solicitar una reunión</Link>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
