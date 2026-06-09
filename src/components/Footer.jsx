import { TELEGRAM_URL } from '../data/content';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer__top">
          <a className="footer__brand" href="#top">Аура</a>
          <nav className="footer__nav" aria-label="Подвал">
            <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
              Связаться с нами
            </a>
            <a href="#about">Вакансия</a>
            <a href="#models">Портфолио</a>
            <a href="#offices">Города</a>
            <a href="#contact">Контакты</a>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>© {year} Модельное агентство «Аура». Все права защищены.</span>
          <span className="footer__age" title="Только для лиц старше 18 лет">18+</span>
        </div>
      </div>
    </footer>
  );
}
