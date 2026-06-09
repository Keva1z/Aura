import { CITIES, TELEGRAM_URL } from '../data/content';
import Reveal from './Reveal';

export default function Offices() {
  return (
    <section className="section offices" id="offices">
      <div className="container">
        <div className="offices__grid">
          <Reveal>
            <p className="eyebrow">География</p>
            <h2 className="offices__title">Офисы по&nbsp;всей России</h2>
            <p className="offices__text">
              У&nbsp;нас есть офисы в&nbsp;разных городах России — выбирайте удобный для&nbsp;вас.
            </p>
            <ul className="offices__cities">
              {CITIES.map((city) => (
                <li key={city}>{city}</li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="offices__cta">
              <h3>Готовы начать?</h3>
              <p>Напишите нам в&nbsp;Telegram — ответим и&nbsp;расскажем детали.</p>
              <a
                className="btn btn--block"
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Работать с нами
                <span className="btn__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
