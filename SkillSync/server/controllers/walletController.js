import Wallet from '../models/Wallet.js';

// @desc    Get user wallet
// @route   GET /api/wallet
// @access  Private
export const getWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ user: req.user._id });
        if (!wallet) {
            wallet = await Wallet.create({ user: req.user._id });
        }
        res.json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deposit Funds (Simulated)
// @route   POST /api/wallet/deposit
// @access  Private
export const depositFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            res.status(400);
            throw new Error('Invalid amount');
        }

        const wallet = await Wallet.findOne({ user: req.user._id });

        wallet.balance += Number(amount);
        wallet.transactions.push({
            amount: Number(amount),
            type: 'deposit',
            description: 'Funds added via bank transfer',
            status: 'completed'
        });

        await wallet.save();
        res.json(wallet);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Internal helper for Escrow Locking
export const lockFunds = async (userId, amount, gigId) => {
    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient funds');
    }

    wallet.balance -= amount;
    wallet.lockedFunds += amount;
    wallet.transactions.push({
        amount: amount,
        type: 'payment_locked',
        description: 'Funds locked for Gig Escrow',
        relatedGigId: gigId,
        status: 'completed'
    });

    await wallet.save();
    return true;
};

// Internal helper for Releasing Funds
export const releaseFunds = async (payerId, payeeId, amount, gigId) => {
    const payerWallet = await Wallet.findOne({ user: payerId });
    const payeeWallet = await Wallet.findOne({ user: payeeId });

    if (!payerWallet || payerWallet.lockedFunds < amount) {
        throw new Error('Escrow logic error: Funds not found in locked state');
    }

    // Deduct from locked
    payerWallet.lockedFunds -= amount;
    payerWallet.transactions.push({
        amount: amount,
        type: 'payment_released',
        description: 'Funds released to freelancer',
        relatedGigId: gigId,
        status: 'completed'
    });
    await payerWallet.save();

    // Add to payee
    payeeWallet.balance += amount;
    payeeWallet.transactions.push({
        amount: amount,
        type: 'payment',
        description: 'Payment received for completed Gig',
        relatedGigId: gigId,
        status: 'completed'
    });
    await payeeWallet.save();

    return true;
};
