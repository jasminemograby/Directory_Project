// HR Landing Page - Redesigned
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const HRLanding = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navigation Bar - Header is now global, this is just navigation */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10,
        marginTop: '64px' // Space for global header
      }}>
        <div style={{ 
          height: '64px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-default)',
          backgroundColor: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              onClick={() => navigate(ROUTES.HOME)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all var(--transition-fast) var(--transition-ease)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-section)';
                e.currentTarget.style.color = 'var(--primary-base)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
            >
              Home
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--gradient-primary)',
        color: 'var(--text-inverse)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: '1.2',
            marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Welcome to Directory
          </h1>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.6',
            marginBottom: '40px',
            opacity: 0.95
          }}>
            Your central hub for managing employees, skills, training, and learning paths. 
            Empower your team with AI-enhanced profiles and comprehensive learning analytics.
          </p>
        </div>
      </section>

      {/* Why Choose Directory Section */}
      <section style={{
        padding: '80px 24px',
        backgroundColor: 'var(--bg-body)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            Why Choose Directory?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px'
          }}>
            {/* Feature 1 */}
            <div style={{
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--transition-normal) var(--transition-ease)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>
                Employee Management
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)'
              }}>
                Easily manage employee profiles, skills, and career paths in one central location. 
                AI-enhanced profiles provide deep insights into each team member's capabilities.
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--transition-normal) var(--transition-ease)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>
                Training Coordination
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)'
              }}>
                Coordinate training requests, manage instructors, and track learning progress. 
                Streamline your organization's learning and development initiatives.
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{
              padding: '32px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all var(--transition-normal) var(--transition-ease)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            >
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: 600,
                marginBottom: '12px',
                color: 'var(--text-primary)'
              }}>
                Learning Analytics
              </h3>
              <p style={{
                fontSize: '16px',
                lineHeight: '1.6',
                color: 'var(--text-secondary)'
              }}>
                Track learning paths, skill development, and training effectiveness. 
                Make data-driven decisions to optimize your team's growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 24px',
        background: 'var(--gradient-primary)',
        color: 'var(--text-inverse)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '16px',
            letterSpacing: '-0.02em',
            color: 'var(--text-inverse)'
          }}>
            Ready to Get Started?
          </h2>
          <p style={{
            fontSize: '20px',
            lineHeight: '1.6',
            marginBottom: '48px',
            opacity: 0.95,
            color: 'var(--text-inverse)'
          }}>
            Register your company today and start managing your team's learning journey.
          </p>
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            alignItems: 'center'
          }}>
            <button
              onClick={() => navigate(ROUTES.COMPANY_REGISTER_STEP1)}
              style={{
                padding: '18px 40px',
                fontSize: '18px',
                fontWeight: 700,
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                background: 'white',
                color: 'var(--primary-base)',
                cursor: 'pointer',
                minWidth: '280px',
                transition: 'all var(--transition-fast) var(--transition-ease)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.backgroundColor = 'white';
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = '3px solid rgba(255, 255, 255, 0.5)';
                e.currentTarget.style.outlineOffset = '2px';
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = 'none';
              }}
            >
              Register Your Company Now
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-inverse)', opacity: 0.9 }}>Already Registered?</span>
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                style={{
                  padding: '18px 36px',
                  fontSize: '18px',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-lg)',
                  border: '3px solid white',
                  background: 'transparent',
                  color: 'white',
                  cursor: 'pointer',
                  minWidth: '140px',
                  transition: 'all var(--transition-fast) var(--transition-ease)',
                  letterSpacing: '0.01em',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.borderColor = 'white';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.outline = '3px solid rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = 'none';
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Process Overview */}
      <section style={{
        padding: '80px 24px',
        backgroundColor: 'var(--bg-body)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '48px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { step: 1, title: 'Basic Information', desc: 'Provide company name, industry, and HR contact information.' },
              { step: 2, title: 'Domain Verification', desc: 'We verify your company domain to ensure legitimacy.' },
              { step: 3, title: 'Verification Result', desc: 'Review verification status and proceed to setup.' },
              { step: 4, title: 'Complete Setup', desc: 'Add employees, departments, teams, and configure settings.' }
            ].map((item) => (
              <div key={item.step} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '20px',
                padding: '24px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--gradient-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '18px',
                  flexShrink: 0
                }}>
                  {item.step}
                </div>
                <div>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--text-primary)'
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    fontSize: '16px',
                    lineHeight: '1.6',
                    color: 'var(--text-secondary)'
                  }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HRLanding;
