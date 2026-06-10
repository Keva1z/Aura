import { useRef, useState, useEffect, useCallback } from 'react';
import { MODELS } from '../data/content';

export default function Gallery() {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const scrollToIndex = useCallback((index) => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[index];
    if (!slide) return;
    const target = slide.offsetLeft + slide.clientWidth / 2 - track.clientWidth / 2;
    track.scrollTo({ left: target, behavior: 'smooth' });
  }, []);

  const handlePrev = () => scrollToIndex(Math.max(0, active - 1));
  const handleNext = () => scrollToIndex(Math.min(MODELS.length - 1, active + 1));

  // Отслеживаем ближайший к центру слайд, чтобы подсвечивать точки.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = track.scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let min = Infinity;
        Array.from(track.children).forEach((child, i) => {
          const childCenter = child.offsetLeft + child.clientWidth / 2;
          const dist = Math.abs(center - childCenter);
          if (dist < min) {
            min = dist;
            closest = i;
          }
        });
        setActive(closest);
      });
    };

    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="section gallery" id="models">
      <div className="container gallery__head">
        <p className="eyebrow">Портфолио</p>
        <h2>Наши модели</h2>
      </div>

      <div className="gallery__viewport">
        <div className="gallery__track" ref={trackRef}>
          {MODELS.map((model, i) => (
            <figure className="gallery__slide" key={model.src} data-index={i + 1}>
              <img
                src={model.src}
                alt={model.alt}
                loading="lazy"
                draggable="false"
                onError={(e) => e.currentTarget.classList.add('is-broken')}
              />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="gallery__btn gallery__btn--prev"
          onClick={handlePrev}
          aria-label="Предыдущее фото"
          disabled={active === 0}
        >
          ‹
        </button>
        <button
          type="button"
          className="gallery__btn gallery__btn--next"
          onClick={handleNext}
          aria-label="Следующее фото"
          disabled={active === MODELS.length - 1}
        >
          ›
        </button>
      </div>

      <div className="gallery__dots" role="group" aria-label="Навигация по фото">
        {MODELS.map((_, i) => (
          <button
            type="button"
            key={i}
            className={`gallery__dot ${active === i ? 'is-active' : ''}`}
            onClick={() => scrollToIndex(i)}
            aria-label={`Перейти к фото ${i + 1}`}
            aria-current={active === i}
          />
        ))}
      </div>
    </section>
  );
}
