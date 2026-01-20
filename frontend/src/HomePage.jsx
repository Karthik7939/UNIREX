import React from 'react';
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AnoAI from './components/ui/animated-shader-background';
import RadialOrbitalTimeline from './components/ui/RadialOrbitalTimeline';

function HomePage() {
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });

  const handlePanelMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -8; // tilt up/down
    const rotateY = ((x - centerX) / centerX) * 8; // tilt left/right

    setTilt({ x: rotateY, y: rotateX });
  };

  const handlePanelMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <>
      <Container
        fluid
        className="px-4 py-5 d-flex align-items-center justify-content-center home-hero-container"
      >
        <AnoAI />
        <div className="home-page-shell">
          <div className="home-hero-grid">
            {/* Left: Text + CTAs */}
            <div className="home-hero-left">
              <div className="home-badge">A Recommender System for Multi-Domain Entertainment</div>

              <h1 className="home-title">Find your next favorite story in seconds.</h1>

              <p className="home-subtitle">
                One smart hub for <strong>movies</strong>, <strong>web series</strong>, <strong>anime</strong>,
                {' '}and <strong>manga</strong>. Start with a title you love and we surface similar
                worlds, characters, and vibes across formats.
              </p>

              <div className="home-cta-row">
                <Link to="/movies" className="home-primary-cta">
                  <span>Start with Movies</span>
                </Link>

                <div className="home-secondary-ctas">
                  <Link to="/webseries" className="home-secondary-cta">
                    📺 Web Series
                  </Link>
                  <Link to="/anime" className="home-secondary-cta">
                    🌀 Anime
                  </Link>
                  <Link to="/manga" className="home-secondary-cta">
                    📚 Manga
                  </Link>
                </div>
              </div>

              <div className="home-meta-row">
                <span className="home-meta-dot" />
                {/* <span className="home-meta-text">Real-time data from TMDB and curated similarity scores.</span> */}
              </div>
            </div>

            {/* Right: Radial orbital timeline visualization */}
            <div className="home-hero-right" style={{ marginTop: '3rem', width: '100%' }}>
              <div style={{ maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
                <RadialOrbitalTimeline />
              </div>
            </div>
          </div>

          <div className="home-metrics-strip">
          <div className="home-metric">
            <span className="home-metric-label">Titles indexed</span>
            <span className="home-metric-value">120K+</span>
          </div>
          <div className="home-metric">
            <span className="home-metric-label">Similarity signals</span>
            <span className="home-metric-value">40M+</span>
          </div>
          <div className="home-metric">
            <span className="home-metric-label">Domains covered</span>
            <span className="home-metric-value">4</span>
          </div>
          <div className="home-metric">
            <span className="home-metric-label">Recommendations in ms</span>
            <span className="home-metric-value">&lt; 200</span>
          </div>
        </div>

        <div className="home-secondary-row">
          <section className="home-trending">
            <div className="home-section-header">
              <h2 className="home-section-title">Now trending across domains</h2>
              <p className="home-section-subtitle">Jump into a curated set of worlds the model is loving right now.</p>
            </div>

            <div className="home-trending-grid">
              <Link to="/movies" className="home-trending-card">
                <div className="home-trending-card-tag">Movies</div>
                <h3 className="home-trending-card-title">Cinematic universes mapped to your taste graph</h3>
                <p className="home-trending-card-body">Start with a film and we project similar pacing, tone, and character arcs.</p>
              </Link>

              <Link to="/webseries" className="home-trending-card">
                <div className="home-trending-card-tag">Web series</div>
                <h3 className="home-trending-card-title">Bingeable shows across platforms</h3>
                <p className="home-trending-card-body">Discover long-form stories that match your favorite hooks and cliffhangers.</p>
              </Link>

              <Link to="/anime" className="home-trending-card">
                <div className="home-trending-card-tag">Anime &amp; manga</div>
                <h3 className="home-trending-card-title">From shonen epics to quiet slice-of-life</h3>
                <p className="home-trending-card-body">Bridge animated and printed universes with shared themes and archetypes.</p>
              </Link>
            </div>
          </section>

          <section className="home-how-it-works">
            <div className="home-section-header">
              <h2 className="home-section-title">How it works</h2>
              <p className="home-section-subtitle">Three simple steps from a single title to a multi-domain watchlist.</p>
            </div>

            <ol className="home-steps-list">
              <li className="home-step-item">
                <span className="home-step-index">1</span>
                <div className="home-step-copy">
                  <h3 className="home-step-title">Pick a title you already love</h3>
                  <p className="home-step-text">Search for any movie, series, anime, or manga that feels like "you".</p>
                </div>
              </li>
              <li className="home-step-item">
                <span className="home-step-index">2</span>
                <div className="home-step-copy">
                  <h3 className="home-step-title">We decode its narrative DNA</h3>
                  <p className="home-step-text">Our multi-domain model tracks structure, vibes, pacing, and character dynamics.</p>
                </div>
              </li>
              <li className="home-step-item">
                <span className="home-step-index">3</span>
                <div className="home-step-copy">
                  <h3 className="home-step-title">You get a living recommendation map</h3>
                  <p className="home-step-text">Explore adjacent worlds with instant recommendations that adapt as you browse.</p>
                </div>
              </li>
            </ol>
          </section>
        </div>
      </div>
      </Container>
    </>
  );
}

export default HomePage;
