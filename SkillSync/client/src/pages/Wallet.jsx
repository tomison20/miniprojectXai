import { useEffect, useState } from 'react';
import api from '../api/axios';

const Wallet = () => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const { data } = await api.get('/wallet');
                setWallet(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    const handleDeposit = async () => {
        const amount = prompt("Enter amount to deposit (Simulation):");
        if (amount) {
            try {
                await api.post('/wallet/deposit', { amount });
                window.location.reload();
            } catch (e) { alert(e.message); }
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '4rem 0', maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '2rem' }}>Financial Overview</h1>

            <div className="grid-layout" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                <div className="card" style={{ background: '#F8FAFC', textAlign: 'center', padding: '3rem 2rem' }}>
                    <p className="label">Current Balance</p>
                    <h2 style={{ fontSize: '3.5rem', margin: '1rem 0', color: 'var(--color-primary)' }}>${wallet.balance.toFixed(2)}</h2>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button onClick={handleDeposit} className="btn btn-primary">Deposit Funds</button>
                        <button className="btn btn-secondary">Download Statement</button>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Escrow Status</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        <span style={{ color: 'var(--color-text-muted)' }}>Locked Funds</span>
                        <span style={{ fontWeight: '600' }}>${wallet.lockedFunds.toFixed(2)}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        These funds are currently held in secure escrow for your active gigs. They will be released upon work approval.
                    </p>
                </div>
            </div>

            <section>
                <h3 style={{ marginBottom: '1.5rem' }}>Transaction History</h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#F1F5F9' }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>DATE</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>DESCRIPTION</th>
                                <th style={{ textAlign: 'left', padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>TYPE</th>
                                <th style={{ textAlign: 'right', padding: '1rem', fontSize: '0.85rem', color: '#64748B' }}>AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody>
                            {wallet.transactions.slice().reverse().map((tx, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '1rem' }}>{tx.description}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span className={`badge ${tx.type === 'deposit' || tx.type === 'payment' ? 'badge-success' : 'badge-status'}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: tx.type === 'withdrawal' || tx.type === 'payment_locked' ? '#DC2626' : '#059669' }}>
                                        {tx.type === 'withdrawal' || tx.type === 'payment_locked' ? '-' : '+'}${tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                            {wallet.transactions.length === 0 && (
                                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

export default Wallet;
