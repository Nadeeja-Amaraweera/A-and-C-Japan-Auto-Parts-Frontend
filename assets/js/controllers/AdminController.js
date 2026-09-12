import { API_CONFIG } from '../api-config.js';
import { apiService } from '../api-service.js';

class AdminController {
    async getDashboard() {
        try {
            const response = await apiService.get('/admin/dashboard');
            if (response && response.status === 0) {
                return response.body;
            }
            return null;
        } catch (error) {
            console.error('getDashboard error:', error);
            return null;
        }
    }

    async getPendingSuppliers() {
        try {
            const response = await apiService.get('/admin/suppliers/pending');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getPendingSuppliers error:', error);
            return [];
        }
    }

    async approveSupplier(supplierId) {
        try {
            const response = await apiService.post(`/admin/suppliers/${supplierId}/approve`, {});
            if (response && response.status === 0) {
                return { success: true, message: 'Supplier approved successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to approve supplier' };
        } catch (error) {
            console.error('approveSupplier error:', error);
            return { success: false, error: error.message };
        }
    }

    async rejectSupplier(supplierId) {
        try {
            const response = await apiService.post(`/admin/suppliers/${supplierId}/reject`, {});
            if (response && response.status === 0) {
                return { success: true, message: 'Supplier rejected successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to reject supplier' };
        } catch (error) {
            console.error('rejectSupplier error:', error);
            return { success: false, error: error.message };
        }
    }

    async getPendingAuctions() {
        try {
            const response = await apiService.get('/admin/auctions/pending');
            if (response && response.status === 0) {
                return response.body || [];
            }
            return [];
        } catch (error) {
            console.error('getPendingAuctions error:', error);
            return [];
        }
    }

    async approveAuction(auctionId) {
        try {
            const response = await apiService.post(`/admin/auctions/${auctionId}/approve`, {});
            if (response && response.status === 0) {
                return { success: true, message: 'Auction approved successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to approve auction' };
        } catch (error) {
            console.error('approveAuction error:', error);
            return { success: false, error: error.message };
        }
    }

    async rejectAuction(auctionId) {
        try {
            const response = await apiService.post(`/admin/auctions/${auctionId}/reject`, {});
            if (response && response.status === 0) {
                return { success: true, message: 'Auction rejected successfully!' };
            }
            return { success: false, error: response?.message || 'Failed to reject auction' };
        } catch (error) {
            console.error('rejectAuction error:', error);
            return { success: false, error: error.message };
        }
    }

    async getSupplierBusinessDocumentBlob(supplierId) {
        try {
            const token = (await import('../utils/storage.js')).storage.getToken();
            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${API_CONFIG.VERSION}/admin/suppliers/${supplierId}/business-document`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let errMsg = `Failed to fetch document (HTTP ${response.status})`;
                try {
                    const errJson = await response.json();
                    errMsg = errJson.message || errMsg;
                } catch(e) {}
                return { success: false, error: errMsg };
            }

            const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
            const blob = await response.blob();
            return { success: true, blob, contentType };
        } catch (error) {
            console.error('getSupplierBusinessDocumentBlob error:', error);
            return { success: false, error: error.message || 'Error fetching document' };
        }
    }
}

export const adminController = new AdminController();
