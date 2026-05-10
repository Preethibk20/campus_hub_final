import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Briefcase } from 'lucide-react'
import '../styles/landing.css'

const LandingPage: React.FC = () => {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-logo">
            <div className="nav-logo-mark">CH</div>
            <div className="nav-logo-text">Campus Hub</div>
          </div>
          <div className="nav-links">
            <a href="#how">How it works</a>
            <a href="#categories">Categories</a>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="nav-login">Log in</Link>
            <Link to="/register" className="nav-register">Sign up</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="tag">✨ For students, by students</span>
            </div>
            <h1 className="hero-headline">
              Your campus.<br />
              Your skills.<br />
              <span className="highlight">Your community.</span>
            </h1>
            <p className="hero-sub">Connect with peers, find mentors, build projects, and grow together — real collaboration for real campus life.</p>
            <div className="hero-ctas">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join CampusHub →
              </Link>
              <a href="#categories" className="btn btn-outline btn-lg">Browse skills</a>
            </div>
            <div className="hero-trust">
              <div style={{ display: 'flex' }}>
                <div className="hero-trust-dot" style={{ marginLeft: 0 }}>🧑‍💻</div>
                <div className="hero-trust-dot">🎨</div>
                <div className="hero-trust-dot">🚀</div>
                <div className="hero-trust-dot">💡</div>
              </div>
              <span>Built for campus communities — join and be among the first</span>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="hcard hcard-1">
                <div className="hcard-icon" style={{ background: '#EEF2FF' }}>🏆</div>
                <div className="hcard-title">Find Hackathon Teammates</div>
                <div className="hcard-meta">Connect with skilled builders</div>
                <div className="hcard-badge badge-open">● Join</div>
              </div>
              <div className="hcard hcard-2">
                <div className="hcard-icon" style={{ background: '#FFF0F3' }}>🎓</div>
                <div className="hcard-title">Connect with Alumni</div>
                <div className="hcard-meta">Mentorship & Career Advice</div>
                <div className="hcard-badge badge-collab">🤝 Guidance</div>
              </div>
              <div className="hcard hcard-3">
                <div className="hcard-icon" style={{ background: '#F5F0FF' }}>🤝</div>
                <div className="hcard-title">Find a Co-Founder</div>
                <div className="hcard-meta">Turn ideas into startups</div>
                <div className="hcard-badge badge-tutor">💡 Build</div>
              </div>
              <div className="hcard hcard-4">
                <div className="hcard-icon" style={{ background: '#F0FFF4' }}>💻</div>
                <div className="hcard-title">DSA & Coding Help</div>
                <div className="hcard-meta">Personalized tutoring</div>
                <div className="hcard-badge badge-looking">🎯 Learn</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="marquee-section">
        <div className="marquee-track">
          <div className="marquee-item"><span>Hackathon Teams</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Alumni Mentorship</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Co-Founders</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>DSA Help</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Coding Tutoring</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Skill Exchange</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Project Ideas</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Career Guidance</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Startup Support</span><span className="marquee-dot"></span></div>
          {/* Duplicate for seamless loop */}
          <div className="marquee-item"><span>Hackathon Teams</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Alumni Mentorship</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Co-Founders</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>DSA Help</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Coding Tutoring</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Skill Exchange</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Project Ideas</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Career Guidance</span><span className="marquee-dot"></span></div>
          <div className="marquee-item"><span>Startup Support</span><span className="marquee-dot"></span></div>
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-block">
              <div className="stat-num" style={{ color: 'var(--blue)' }}>New</div>
              <div className="stat-label">platform launching soon</div>
              <div className="stat-accent">🚀</div>
            </div>
            <div className="stat-block">
              <div className="stat-num" style={{ color: 'var(--lime-dark)' }}>10+</div>
              <div className="stat-label">skill categories on campus</div>
              <div className="stat-accent">🧩</div>
            </div>
            <div className="stat-block">
              <div className="stat-num" style={{ color: 'var(--rose)' }}>100%</div>
              <div className="stat-label">verified college students only</div>
              <div className="stat-accent">🎓</div>
            </div>
            <div className="stat-block">
              <div className="stat-num" style={{ color: 'var(--violet)' }}>Secure</div>
              <div className="stat-label">verified student community</div>
              <div className="stat-accent">🔒</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how" id="how">
        <div className="container">
          <div className="how-header">
            <span className="tag" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.5)', marginBottom: '16px', display: 'inline-block' }}>HOW IT WORKS</span>
            <h2 className="section-title" style={{ color: '#fff' }}>Three steps to your<br />campus network</h2>
            <p>No friction, no fake profiles. Real students, real skills.</p>
          </div>
          <div className="how-steps">
            <div className="step">
              <div className="step-num">STEP 01</div>
              <div className="step-icon s1">📧</div>
              <h3>Sign up with your college email</h3>
              <p>We verify your college email with an OTP — keeping CampusHub exclusive to real students at your institution.</p>
            </div>
            <div className="step">
              <div className="step-num">STEP 02</div>
              <div className="step-icon s2">📝</div>
              <h3>Post what you need or offer your skills</h3>
              <p>Looking for a hackathon partner? Need DSA help? Or want to help others through tutoring or mentoring? Post a request in minutes.</p>
            </div>
            <div className="step">
              <div className="step-num">STEP 03</div>
              <div className="step-icon s3">💸</div>
              <h3>Connect, collaborate & grow together</h3>
              <p>Chat in real-time, agree on project goals, and build amazing things together — all within your trusted campus community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories" id="categories">
        <div className="container">
          <div className="cat-header">
            <div>
              <span className="tag light" style={{ marginBottom: '12px', display: 'inline-block' }}>EXPLORE BY SKILL</span>
              <h2 className="section-title">What's on campus</h2>
            </div>
            <button className="btn btn-outline" onClick={() => window.location.href = '/register'}>Browse all →</button>
          </div>
          <div className="cat-grid">
            <div className="cat-card c-code" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">💻</span>
              <div className="cat-name">Coding & Dev</div>
              <div className="cat-count">Web · App · Backend</div>
            </div>
            <div className="cat-card c-design" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">🎨</span>
              <div className="cat-name">Design</div>
              <div className="cat-count">UI/UX · Graphic · Branding</div>
            </div>
            <div className="cat-card c-write" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">✍️</span>
              <div className="cat-name">Writing</div>
              <div className="cat-count">Content · Editing · Blogs</div>
            </div>
            <div className="cat-card c-tutor" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">📚</span>
              <div className="cat-name">Tutoring</div>
              <div className="cat-count">DSA · Maths · Physics</div>
            </div>
            <div className="cat-card c-video" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">🎬</span>
              <div className="cat-name">Video</div>
              <div className="cat-count">Editing · Animation · Reels</div>
            </div>
            <div className="cat-card c-music" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">🎵</span>
              <div className="cat-name">Music</div>
              <div className="cat-count">Production · Mixing · Vocals</div>
            </div>
            <div className="cat-card c-marketing" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">📣</span>
              <div className="cat-name">Marketing</div>
              <div className="cat-count">Social · SEO · Ads</div>
            </div>
            <div className="cat-card c-photo" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">📸</span>
              <div className="cat-name">Photography</div>
              <div className="cat-count">Events · Portraits · Products</div>
            </div>
            <div className="cat-card c-translate" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">🌐</span>
              <div className="cat-name">Translation</div>
              <div className="cat-count">Kannada · Hindi · English</div>
            </div>
            <div className="cat-card c-hack" onClick={() => window.location.href = '/register'}>
              <span className="cat-emoji">⚡</span>
              <div className="cat-name">Hackathons</div>
              <div className="cat-count">Partners · Teams · Ideas</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="why">
        <div className="container">
          <div className="why-grid">
            <div className="why-visual">
              <div className="why-card-main">
                <div className="why-card-main-title">Built for trust on campus 🏫</div>
                <div className="feature-list">
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <div className="feature-text">
                      <strong>OTP email verification</strong>
                      <span>A quick one-time code confirms you're a real person — no bots, no fake accounts</span>
                    </div>
                  </div>
                    <div className="feature-item">
                      <div className="feature-check">✓</div>
                      <div className="feature-text">
                        <strong>Safe & trusted platform</strong>
                        <span>Verified students only with secure messaging</span>
                      </div>
                    </div>
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <div className="feature-text">
                      <strong>Dispute resolution</strong>
                      <span>Our team mediates if there's ever a disagreement</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <div className="feature-text">
                      <strong>Real-time messaging</strong>
                      <span>Chat and collaborate before committing — no payment needed</span>
                    </div>
                  </div>
                  <div className="feature-item">
                    <div className="feature-check">✓</div>
                    <div className="feature-text">
                      <strong>Verified reviews (coming soon)</strong>
                      <span>Reviews only from verified orders — no fake testimonials</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="why-pill why-pill-1">
                <span className="why-pill-emoji">🔒</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>Safe platform</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>Built for students</div>
                </div>
              </div>
              <div className="why-pill why-pill-2">
                <span className="why-pill-emoji">🎓</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700' }}>Students & alumni</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)' }}>Real campus community</div>
                </div>
              </div>
            </div>
            <div className="why-content">
              <span className="tag light" style={{ marginBottom: '16px', display: 'inline-block' }}>WHY CAMPUSHUB</span>
              <h2 className="section-title">Your campus community, supercharged</h2>
              <p>CampusHub isn't just a freelance platform — it's your college's professional network, skill exchange, and collaboration hub all in one.</p>
              <div className="why-perks">
                <div className="perk">
                  <div className="perk-icon p1">🤝</div>
                  <div className="perk-body">
                    <strong>Hackathon team matching</strong>
                    <span>Find the missing piece for your team — or join one that needs your skill set</span>
                  </div>
                </div>
                <div className="perk">
                  <div className="perk-icon p2">📈</div>
                  <div className="perk-body">
                    <strong>Build your campus reputation</strong>
                    <span>Earn badges, collect reviews, climb the leaderboard — your track record travels</span>
                  </div>
                </div>
                <div className="perk">
                  <div className="perk-icon p3">🤝</div>
                  <div className="perk-body">
                    <strong>Alumni connections</strong>
                    <span>Connect with seniors and alumni for mentorship and guidance</span>
                  </div>
                </div>
                <div className="perk">
                  <div className="perk-icon p4">🧠</div>
                  <div className="perk-body">
                    <strong>Skill exchange — no money needed</strong>
                    <span>Trade skills directly. Teach Python, learn Figma. No rupees required.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REGISTRATION SECTION */}
      <section className="register-section" id="register">
        <div className="register-inner">
          <div className="register-left">
            <span className="tag" style={{ marginBottom: '18px', display: 'inline-block' }}>JOIN CAMPUSHUB</span>
            <h2 className="section-title">Be among the<br />first on campus</h2>
            <p>Sign up in under 2 minutes. All you need is any email address. Your profile is your campus presence — build it from day one.</p>
            <div className="reg-steps">
              <div className="reg-step">
                <div className="reg-step-num">1</div>
                <div className="reg-step-body">
                  <strong>Enter your email</strong>
                  <span>Use any email — Gmail, Outlook, or your college email, totally your choice</span>
                </div>
              </div>
              <div className="reg-step">
                <div className="reg-step-num">2</div>
                <div className="reg-step-body">
                  <strong>Verify with 6-digit OTP</strong>
                  <span>Check your inbox and enter the code — it's valid for 5 minutes</span>
                </div>
              </div>
              <div className="reg-step">
                <div className="reg-step-num">3</div>
                <div className="reg-step-body">
                  <strong>Set up your profile</strong>
                  <span>Add your name, course, skills, and a short bio — make a great first impression</span>
                </div>
              </div>
            </div>
          </div>

          {/* REGISTRATION FORM */}
          <div className="reg-form-box">
            <div className="reg-form-decor">
              <Zap className="w-12 h-12 text-[#C8F53C] opacity-20 absolute -top-4 -right-4 rotate-12" />
              <Briefcase className="w-16 h-16 text-[#C8F53C] opacity-10 absolute -bottom-6 -left-6 -rotate-12" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Ready to level up?</h3>
            <Link to="/register" className="btn btn-primary btn-lg mb-4">
              Join CampusHub <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <p className="subtitle">
              Start your campus journey today
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="nav-logo-mark">CH</div>
                <div className="nav-logo-text">Campus Hub</div>
              </div>
              <p>Building the largest campus talent network where students can collaborate, learn, and grow together.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">About</a>
              <a href="#">Success Stories</a>
              <a href="#">FAQ</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Campus Hub. All rights reserved.</p>
            <div className="footer-built">
              Built with <span className="footer-lime">❤️</span> for students, by students
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default LandingPage
