/**
 * Bid Model
 */

export class Bid {
    constructor(data = {}) {
        this.id = data.id || null;
        this.auctionId = data.auctionId || null;
        this.userId = data.userId || null;
        this.amount = data.amount || 0;
        this.timestamp = data.timestamp || null;
        this.status = data.status || 'ACTIVE'; // ACTIVE, OUTBID, WINNING
    }
}
