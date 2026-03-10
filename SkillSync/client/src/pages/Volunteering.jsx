import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Volunteering = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events');
                setEvents(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="container" style={{ padding: '4rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Volunteer Opportunities</h1>
                {(user?.role === 'organizer' || user?.role === 'admin') && (
                    <button className="btn btn-primary" onClick={() => navigate('/volunteering/create')}>Create Event</button>
                )}
            </div>

            <div className="grid-layout">
                {events.map(event => (
                    <div key={event._id} className="card">
                        <h3>{event.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{event.description}</p>
                        <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMapMarkerAlt /> {event.location}</p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}</p>
                        </div>
                        <Link to={`/volunteering/${event._id}`} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>View Roles</Link>
                    </div>
                ))}
                {events.length === 0 && <p>No upcoming volunteer events.</p>}
            </div>
        </div>
    );
};

export default Volunteering;
