import Hero from '../components/Hero';
import AboutSection from '../components/AboutSection';
import './Home.css';

const Home = () => {
  return (
    <div className="page" id="page-home">
      <Hero />

      {/* Welcome Section */}
      <section className="welcome section" id="welcome">
        <div className="container">
          <div className="welcome__inner">
            <div className="welcome__content animate-fade-in-up">
              <span className="section__label">Welcome</span>
              <h2 className="section__title">
                Discover the Art of <span className="text-accent">Fine Dining</span>
              </h2>
              <div className="divider"></div>
              <p className="welcome__text">
                At Urban Spoon, we believe great food is more than sustenance — it&rsquo;s an experience. Our carefully curated menu blends global flavors with local ingredients, creating dishes that are as beautiful as they are delicious.
              </p>
              <p className="welcome__text">
                Whether you&rsquo;re craving a perfectly seared steak, a comforting bowl of pasta, or a refreshing craft beverage, our kitchen delivers excellence on every plate.
              </p>
            </div>

            <div className="welcome__features stagger-children">
              <div className="welcome__feature">
                <div className="welcome__feature-icon">🍳</div>
                <h3 className="welcome__feature-title">Farm Fresh</h3>
                <p className="welcome__feature-text">Locally sourced, seasonal ingredients</p>
              </div>
              <div className="welcome__feature">
                <div className="welcome__feature-icon">👨‍🍳</div>
                <h3 className="welcome__feature-title">Expert Chefs</h3>
                <p className="welcome__feature-text">Crafted by award-winning culinary artists</p>
              </div>
              <div className="welcome__feature">
                <div className="welcome__feature-icon">🕯️</div>
                <h3 className="welcome__feature-title">Warm Ambiance</h3>
                <p className="welcome__feature-text">Elegant setting for every occasion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <AboutSection />
    </div>
  );
};

export default Home;
