import { apiService } from "../api-service.js";
import { API_CONFIG } from "../api-config.js";
import { storage } from "../utils/storage.js";
import { UserDetails } from "../models/UserDetails.js";

class UserController {
    constructor() {
        this.userDetails = null;
    }


    async getUserDetails(userId = null) {
        try {

            if (!userId) {
                const storedUser = storage.getUser();
                console.log("Stored user:", storedUser);
                userId = storedUser?.id || storedUser?.userId;
            }


            const response = await apiService.get(API_CONFIG.ENDPOINTS.USERS.GET_BY_ID.replace('{userId}', userId));
            if (response.status === 0) {
                this.userdetails = UserDetails.fromJSON(response.body);
                return {
                    success: true,
                    userdetails: this.userdetails,
                    message: response.message || 'User details fetched successfully!'
                };
            }
            return { success: false, error: 'User details fetch failed' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export const userController = new UserController();