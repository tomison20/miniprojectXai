import { useEffect, useState } from 'react';
import api from '../api/axios';

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/auth/profile');
                setUser(data);
            } catch (error) { console.error(error); }
        };
        fetchProfile();
    }, []);

    if (!user) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '900px' }}>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#fff' }}>
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h1 style={{ margin: 0, fontSize: '2rem' }}>{user.name}</h1>
                            <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{user.headline || user.role.toUpperCase()}</p>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {user.isVerified && <span className="badge badge-success">Verified Student</span>}
                                <span className="badge badge-status">{user.email}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                            {user.rating.toFixed(1)}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Based on {user.numReviews} reviews
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>About</h3>
                    <p style={{ lineHeight: 1.6, color: '#334155' }}>
                        {user.bio || 'No bio provided.'}
                    </p>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <h3>Skills</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {user.skills && user.skills.length > 0 ? user.skills.map((skill, i) => (
                            <span key={i} className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>{skill}</span>
                        )) : <p style={{ color: '#999' }}>No skills listed.</p>}
                    </div>
                </div>
            </div>

            <section>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Portfolio</h2>
                <div className="grid-layout">
                    {user.portfolio && user.portfolio.length > 0 ? user.portfolio.map((item, i) => (
                        <div key={i} className="card">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                        </div>
                    )) : (
                        <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: '#999' }}>Portfolio is empty.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Profile;
