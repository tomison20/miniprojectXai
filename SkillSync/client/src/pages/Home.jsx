import { Link } from 'react-router-dom';

const Home = () => {
    // Professional Academic Image (Library / Studying)
    const heroImage = "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80";

    return (
        <div>
            {/* Hero Section with Background */}
            <section style={{
                position: 'relative',
                height: '85vh', // Tall hero
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                color: '#fff'
            }}>
                {/* Background Image & Overlay */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${heroImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 1
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.65)', // Navy overlay #0F172A with opacity
                    zIndex: 2
                }}></div>

                {/* Content */}
                <div className="container" style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: '900px' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: '#E2E8F0',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        marginBottom: '2rem',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        backdropFilter: 'blur(4px)'
                    }}>
                        Connect & Conquer
                    </span>

                    <h1 style={{
                        fontSize: '4.5rem',
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.02em',
                        lineHeight: 1.1,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-serif)',
                        fontWeight: '600'
                    }}>
                        Where Ambition Meets <br /> <span style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Opportunity.</span>
                    </h1>

                    <p style={{
                        fontSize: '1.35rem',
                        color: '#CBD5E1', // Light slate
                        marginBottom: '3.5rem',
                        lineHeight: 1.6,
                        fontWeight: '300',
                        maxWidth: '700px',
                        margin: '0 auto 3.5rem'
                    }}>
                        SkillSync is the premier platform for students to secure freelance work, engage in verified volunteering, and build an institutional portfolio.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <Link to="/signup" className="btn" style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            background: '#fff',
                            color: '#0F172A',
                            fontWeight: '600',
                            border: '1px solid #fff'
                        }}>
                            Join the Network
                        </Link>
                        <Link to="/gigs" className="btn" style={{
                            padding: '1rem 2.5rem',
                            fontSize: '1.1rem',
                            background: 'transparent',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.5)',
                            fontWeight: '500'
                        }}>
                            View Openings
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats / Trust Bar */}
            <div style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', padding: '2rem 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>500+</div>
                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)' }}>Active Students</div>
                    </div>
                    <div style={{ height: '40px', width: '1px', background: '#E2E8F0' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>$12k</div>
                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)' }}>Paid in Gigs</div>
                    </div>
                    <div style={{ height: '40px', width: '1px', background: '#E2E8F0' }}></div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)' }}>50+</div>
                        <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-secondary)' }}>Campus Events</div>
                    </div>
                </div>
            </div>

            {/* Value Preposition */}
            <section style={{ padding: '8rem 0', background: 'white' }}>
                <div className="container">
                    <div className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4rem' }}>
                        <div>
                            <div style={{ width: 50, height: 50, background: '#EFF6FF', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E3A8A' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Secure Escrow Wallet</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Payments are locked in our secure escrow system the moment a gig is assigned, protecting both students and organizers.
                            </p>
                        </div>
                        <div>
                            <div style={{ width: 50, height: 50, background: '#F0FDF4', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14532D' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Verified Experience</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Every completed gig and attended event is cryptographically verified and added to your permanent institutional record.
                            </p>
                        </div>
                        <div>
                            <div style={{ width: 50, height: 50, background: '#FFF7ED', borderRadius: '50%', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C2D12' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Campus Selection</h3>
                            <p style={{ color: '#64748B', lineHeight: 1.7 }}>
                                Access opportunities exclusive to your institution, fostering a trusted local community of high-achieving peers.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
