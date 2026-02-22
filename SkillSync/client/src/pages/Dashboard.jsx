import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user: contextUser, logout } = useAuth();
    const [user, setUser] = useState(contextUser);
    const [wallet, setWallet] = useState(null);
    const [myGigs, setMyGigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // We can use contextUser to start, but let's fetch fresh profile + wallet + gigs
                const [userRes, walletRes, gigsRes] = await Promise.all([
                    api.get('/auth/profile'),
                    api.get('/wallet'),
                    api.get('/gigs')
                ]);

                setUser(userRes.data);
                setWallet(walletRes.data);

                if (userRes.data.role === 'organizer') {
                    setMyGigs(gigsRes.data.filter(g => g.organizer._id === userRes.data._id));
                } else {
                    setMyGigs(gigsRes.data.filter(g => g.assignedTo?._id === userRes.data._id));
                }

                setLoading(false);
            } catch (error) {
                console.error("Dashboard Load Error:", error);

                // Only logout if 401
                if (error.response && error.response.status === 401) {
                    logout();
                }
                // Otherwise just stop loading (UI might show empty state or error message)
                setLoading(false);
            }
        };
        if (contextUser) {
            fetchData();
        }
    }, [contextUser, logout]); // Depend on contextUser

    if (loading) return <div className="container" style={{ padding: '4rem 0' }}>Loading Dashboard...</div>;

    // Header Image Logic
    const headerImage = user.role === 'organizer'
        ? "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" // Meeting/Managment
        : "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"; // Studying/Working

    return (
        <div>
            {/* Dashboard Header */}
            <section style={{
                background: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${headerImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                padding: '4rem 0',
                color: 'white',
                marginBottom: '3rem'
            }}>
                <div className="container">
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '1rem' }}>
                        {user.organization?.name || 'SkillSync'} Portal • {user.role === 'organizer' ? 'Organizer' : 'Student'}
                    </span>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#fff' }}>Welcome, {user.name}</h1>
                    <p style={{ maxWidth: '600px', color: '#E2E8F0' }}>
                        {user.role === 'organizer'
                            ? 'Manage your department\'s events, post new opportunities, and review candidate submissions.'
                            : 'Track your active projects, manage your earnings, and build your professional portfolio.'}
                    </p>
                </div>
            </section>

            <div className="container">
                <div className="grid-layout" style={{ marginBottom: '4rem' }}>
                    {/* Wallet Stats */}
                    <div className="card" style={{ background: '#F8FAFC' }}>
                        <span className="label">Available Balance</span>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                            ${wallet.balance.toFixed(2)}
                        </div>
                        {wallet.lockedFunds > 0 && (
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                Locked in Escrow: <span style={{ fontWeight: '600' }}>${wallet.lockedFunds.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <Link to="/wallet" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>Manage Wallet</Link>
                        </div>
                    </div>

                    {/* Role Specific Actions */}
                    <div className="card">
                        {user.role === 'organizer' ? (
                            <>
                                <span className="label">Quick Actions</span>
                                <h3>Post a New Gig</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                    Find the perfect student for your project needs.
                                </p>
                                <Link to="/gigs/create" className="btn btn-primary">Create Gig</Link>
                            </>
                        ) : (
                            <>
                                <span className="label">Quick Actions</span>
                                <h3>Find Work</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                    Browse open opportunities and submit proposals.
                                </p>
                                <Link to="/gigs" className="btn btn-primary">Browse Gigs</Link>
                            </>
                        )}
                    </div>
                </div>

                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '1.75rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                        {user.role === 'organizer' ? 'Your Posted Gigs' : 'Active Assignments'}
                    </h2>

                    {myGigs.length > 0 ? (
                        <div className="grid-layout">
                            {myGigs.map(gig => (
                                <div key={gig._id} className="card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                        <span className={`badge ${gig.status === 'open' ? 'badge-success' : 'badge-status'}`}>
                                            {gig.status}
                                        </span>
                                        <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>${gig.budget}</span>
                                    </div>
                                    <h3 style={{ fontSize: '1.25rem' }}>{gig.title}</h3>
                                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                        {gig.description.substring(0, 80)}...
                                    </p>
                                    <Link to={`/gigs/${gig._id}`} className="btn btn-secondary" style={{ width: '100%' }}>
                                        {user.role === 'organizer' ? 'Manage Gig' : 'View Details'}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ color: 'var(--color-text-muted)' }}>No active gigs found.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
