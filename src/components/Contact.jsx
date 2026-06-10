import { EMAIL } from '../data/content';
import Reveal from './Reveal';

export default function Contact() {
  return (
    <section className="section contact" id="contact">
      <div className="container">
        <div className="contact__grid">
          <Reveal className="contact__item">
            <p className="label">Почта</p>
            <a className="contact__value" href={`mailto:${EMAIL}`}>
              {EMAIL}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
