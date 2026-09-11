export class UserDetails {

    constructor(data = {}) {
        this.userId = data.userId || 0;
        this.userStringId = data.userStringId || '';
        this.userName = data.userName || '';
        this.userEmail = data.userEmail || '';
        this.userPhone = data.userPhone || '';
        this.userAddress = data.userAddress || '';
        this.userRole = data.userRole || '';
        this.userStatus = data.userStatus || '';
    }

    getUserId() {
        return this.userId;
    }

    getUserStringId() {
        return this.userStringId;
    }

    getUserName() {
        return this.userName;
    }

    getUserEmail() {
        return this.userEmail;
    }

    getUserPhone() {
        return this.userPhone;
    }

    getUserAddress() {
        return this.userAddress;
    }

    getUserRole() {
        return this.userRole;
    }

    getUserStatus() {
        return this.userStatus;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    setUserStringId(userStringId) {
        this.userStringId = userStringId;
    }

    setUserName(userName) {
        this.userName = userName;
    }

    setUserEmail(userEmail) {
        this.userEmail = userEmail;
    }

    setUserPhone(userPhone) {
        this.userPhone = userPhone;
    }

    setUserAddress(userAddress) {
        this.userAddress = userAddress;
    }

    setUserRole(userRole) {
        this.userRole = userRole;
    }

    setUserStatus(userStatus) {
        this.userStatus = userStatus;
    }

    toJSON() {
        return {
            userId: this.userId,
            userStringId: this.userStringId,
            userName: this.userName,
            userEmail: this.userEmail,
            userPhone: this.userPhone,
            userAddress: this.userAddress,
            userRole: this.userRole,
            userStatus: this.userStatus
        };
    }

    toString() {
        return JSON.stringify(this.toJSON());
    }

    static fromJSON(data) {
        return new UserDetails(data);
    }
}