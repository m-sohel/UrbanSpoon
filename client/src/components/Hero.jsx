import { Link } from 'react-router-dom';
import heroImage from '../assets/hero.jpg';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="hero">
      <div className="hero__bg">
        <img src={heroImage} alt="Gourmet dish" className="hero__bg-image" />
        <div className="hero__overlay"></div>
      </div>

      <div className="container hero__content">
        <div className="hero__text animate-fade-in-up">
          <span className="hero__label">Est. 2020</span>
          <h1 className="hero__title">
            Urban<br />
            <span className="text-accent">Spoon</span>
          </h1>
          <p className="hero__tagline">
            Where culinary artistry meets a warm, unforgettable atmosphere.
            Every dish tells a story — come taste ours.
          </p>
          <div className="hero__actions">
            <Link to="/menu" className="btn btn--primary btn--lg" id="hero-cta-menu">
              Explore Our Menu
            </Link>
            <Link to="/contact" className="btn btn--outline btn--lg" id="hero-cta-reserve">
              Reserve a Table
            </Link>
          </div>
        </div>

        <div className="hero__scroll-indicator" aria-hidden="true">
          <span>Scroll</span>
          <div className="hero__scroll-line"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
