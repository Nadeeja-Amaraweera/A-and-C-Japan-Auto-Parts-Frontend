/**
 * Vehicle Model
 * Represents a vehicle listing
 */

export class Vehicle {
    constructor(data = {}) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.brand = data.brand || '';
        this.model = data.model || '';
        this.year = data.year || new Date().getFullYear();
        this.mileage = data.mileage || 0;
        this.price = data.price || 0;
        this.currency = data.currency || 'USD';
        this.condition = data.condition || 'USED'; // NEW, USED, CERTIFIED
        this.transmission = data.transmission || 'AUTOMATIC'; // AUTOMATIC, MANUAL, CVT
        this.fuelType = data.fuelType || 'GASOLINE'; // GASOLINE, DIESEL, HYBRID, ELECTRIC
        this.engineSize = data.engineSize || '';
        this.enginePower = data.enginePower || '';
        this.color = data.color || '';
        this.interiorColor = data.interiorColor || '';
        this.seats = data.seats || 5;
        this.doors = data.doors || 4;
        this.drivetrain = data.drivetrain || 'FWD'; // FWD, RWD, AWD, 4WD
        this.description = data.description || '';
        this.features = data.features || [];
        this.specifications = data.specifications || {};
        this.images = data.images || [];
        this.thumbnail = data.thumbnail || '';
        this.videoUrl = data.videoUrl || '';
        this.location = data.location || {
            address: '',
            city: '',
            state: '',
            country: 'Japan',
            zipCode: '',
            lat: null,
            lng: null
        };
        this.status = data.status || 'PENDING'; // PENDING, APPROVED, REJECTED, SOLD
        this.userId = data.userId || null;
        this.categoryId = data.categoryId || null;
        this.auctionId = data.auctionId || null;
        this.views = data.views || 0;
        this.wishlistCount = data.wishlistCount || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.approvedAt = data.approvedAt || null;
        this.soldAt = data.soldAt || null;
        this.vin = data.vin || '';
        this.licensePlate = data.licensePlate || '';
        this.serviceHistory = data.serviceHistory || [];
        this.accidentHistory = data.accidentHistory || [];
        this.ownershipHistory = data.ownershipHistory || [];
        this.insuranceHistory = data.insuranceHistory || [];
        this.registrationExpiry = data.registrationExpiry || null;
        this.inspectionDate = data.inspectionDate || null;
        this.inspectionResult = data.inspectionResult || null;
        this.warranty = data.warranty || {
            hasWarranty: false,
            expiryDate: null,
            description: ''
        };
        this.financingOptions = data.financingOptions || {
            available: false,
            options: []
        };
        this.shipping = data.shipping || {
            available: false,
            cost: 0,
            deliveryTime: '',
            shippingLocations: []
        };
    }

    /**
     * Get full title with brand and model
     */
    getFullTitle() {
        return `${this.brand} ${this.model} ${this.year}`;
    }

    /**
     * Get display price with currency
     */
    getDisplayPrice() {
        return `${this.currency} ${this.price.toLocaleString()}`;
    }

    /**
     * Get price in specific currency
     */
    getPriceInCurrency(currency, rate) {
        return this.price * rate;
    }

    /**
     * Check if vehicle is new
     */
    isNew() {
        return this.condition === 'NEW';
    }

    /**
     * Check if vehicle is available
     */
    isAvailable() {
        return this.status === 'APPROVED' || this.status === 'PENDING';
    }

    /**
     * Get age of vehicle
     */
    getAge() {
        return new Date().getFullYear() - this.year;
    }

    /**
     * Get main image
     */
    getMainImage() {
        return this.images.length > 0 ? this.images[0] : this.thumbnail || '/assets/images/default-vehicle.jpg';
    }

    /**
     * Get all images
     */
    getImages() {
        return this.images.length > 0 ? this.images : [this.thumbnail];
    }

    /**
     * Convert to JSON
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            brand: this.brand,
            model: this.model,
            year: this.year,
            mileage: this.mileage,
            price: this.price,
            currency: this.currency,
            condition: this.condition,
            transmission: this.transmission,
            fuelType: this.fuelType,
            engineSize: this.engineSize,
            enginePower: this.enginePower,
            color: this.color,
            interiorColor: this.interiorColor,
            seats: this.seats,
            doors: this.doors,
            drivetrain: this.drivetrain,
            description: this.description,
            features: this.features,
            specifications: this.specifications,
            images: this.images,
            thumbnail: this.thumbnail,
            videoUrl: this.videoUrl,
            location: this.location,
            status: this.status,
            userId: this.userId,
            categoryId: this.categoryId,
            auctionId: this.auctionId,
            views: this.views,
            wishlistCount: this.wishlistCount,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            approvedAt: this.approvedAt,
            soldAt: this.soldAt,
            vin: this.vin,
            licensePlate: this.licensePlate,
            serviceHistory: this.serviceHistory,
            accidentHistory: this.accidentHistory,
            ownershipHistory: this.ownershipHistory,
            insuranceHistory: this.insuranceHistory,
            registrationExpiry: this.registrationExpiry,
            inspectionDate: this.inspectionDate,
            inspectionResult: this.inspectionResult,
            warranty: this.warranty,
            financingOptions: this.financingOptions,
            shipping: this.shipping
        };
    }

    /**
     * Create from JSON
     */
    static fromJSON(data) {
        return new Vehicle(data);
    }

    /**
     * Validate vehicle data
     */
    validate() {
        const errors = {};

        if (!this.brand) {
            errors.brand = 'Brand is required';
        }

        if (!this.model) {
            errors.model = 'Model is required';
        }

        if (!this.year || this.year < 1900 || this.year > new Date().getFullYear() + 1) {
            errors.year = 'Valid year is required';
        }

        if (this.price <= 0) {
            errors.price = 'Price must be greater than 0';
        }

        if (!this.description || this.description.length < 10) {
            errors.description = 'Description must be at least 10 characters';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
}