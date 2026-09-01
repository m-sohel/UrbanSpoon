import aboutImage from '../assets/about.jpg';
import './AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about section" id="about">
      <div className="container about__inner">
        <div className="about__image-col animate-fade-in-up">
          <div className="about__image-wrapper">
            <img src={aboutImage} alt="Urban Spoon interior" className="about__image" />
            <div className="about__image-accent"></div>
          </div>
          <div className="about__stats">
            <div className="about__stat">
              <span className="about__stat-number">6+</span>
              <span className="about__stat-label">Years of Excellence</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">50+</span>
              <span className="about__stat-label">Signature Dishes</span>
            </div>
            <div className="about__stat">
              <span className="about__stat-number">10K+</span>
              <span className="about__stat-label">Happy Guests</span>
            </div>
          </div>
        </div>

        <div className="about__content animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <span className="section__label">Our Story</span>
          <h2 className="section__title">
            A Passion for <span className="text-accent">Flavor</span>
          </h2>
          <div className="divider"></div>
          <p className="about__text">
            Founded in 2020, Urban Spoon was born from a simple belief: great food has the power to bring people together. Nestled in the heart of Mumbai, our restaurant blends contemporary culinary techniques with the rich, vibrant flavors of global cuisine.
          </p>
          <p className="about__text">
            Our chefs draw inspiration from farm-fresh, locally sourced ingredients to create dishes that surprise and delight. From our hand-rolled pastas to our signature grilled specialties, every plate is crafted with care, creativity, and a deep respect for tradition.
          </p>
          <p className="about__text">
            Whether you&rsquo;re here for a casual weeknight dinner or a celebration with loved ones, Urban Spoon offers an experience that goes beyond the plate — warm hospitality, an inviting ambiance, and flavors that stay with you.
          </p>
          <div className="about__cuisine-tags">
            <span className="badge">Continental</span>
            <span className="badge">Italian</span>
            <span className="badge">Indian Fusion</span>
            <span className="badge">Grills &amp; BBQ</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
