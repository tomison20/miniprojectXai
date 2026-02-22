import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'payment_locked', 'payment_released', 'refund', 'payout'],
        required: true
    },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    description: { type: String },
    relatedGigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' },
    createdAt: { type: Date, default: Date.now }
});

const walletSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0 // Cannot have negative balance
    },
    lockedFunds: { // Money held in escrow for active gigs
        type: Number,
        default: 0,
        min: 0
    },
    transactions: [transactionSchema]
}, { timestamps: true });

// Helper to check solvency
walletSchema.methods.canAfford = function (amount) {
    return this.balance >= amount;
};

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet;
