import { supabase } from './supabase';

export type Location = {
    id: string;
    name: string;
    state: string;
    description: string;
    image_url: string;
};

export type Property = {
    id: string;
    location_id: string;
    name: string;
    description: string;
    address: string;
    category: 'Standard' | 'Premium' | 'Luxury';
    price: number;
    discount_label?: string;
    discount_percent?: number;
    max_guests: number;
    amenities: string[];
    images: string[];
    guest_prices?: {
        one?: number;
        two?: number;
        extra?: number;
    };
    total_rooms: number;
    stay_category: 'Mountain View' | 'River Side' | 'Tea Estate' | 'Heritage Stays' | 'Offbeat Stays' | 'Workstation';
    created_at?: string;
};

export type Hotel = {
    id: string;
    location_id: string;
    name: string;
    description: string;
    address: string;
    category: 'Standard' | 'Premium' | 'Luxury';
    price: number; // Lead price
    discount_percent?: number;
    amenities: string[];
    images: string[];
    total_rooms: number;
    created_at?: string;
};

export type HotelRoom = {
    id: string;
    hotel_id: string;
    type: string;
    max_guests: number;
    bed_count: number;
    is_ac: boolean;
    inventory_count: number;
    price_one_guest: number;
    price_two_guests: number;
    price_three_plus_guests: number;
    amenities?: string[];
    images?: string[];
    created_at?: string;
};

// Legacy Room type (for homestays if still used, or can be removed if hotels use HotelRoom)
export type Room = {
    id: string;
    property_id: string;
    type: string;
    max_guests: number;
    price_one_guest: number;
    price_two_plus_guests: number;
    amenities?: string[];
    images?: string[];
    created_at?: string;
};

export type Tour = {
    id: string;
    name: string;
    description: string;
    category: 'Domestic Tour' | 'International Tour' | 'Adventure Tour' | 'Educational Tour' | 'Religious Tour';
    badge?: string;
    images: string[];
    amenities: string[];
    locations: string[];
    itinerary: { day: number; title: string; activities: string[] }[];
    package_includes: string[];
    price: number;
    discount_percent?: number;
    guest_prices?: {
        one?: number;
        two?: number;
        extra?: number;
    };
    difficulty: string;
    duration: string;
    created_at?: string;
};

export type Contact = {
    id: string;
    full_name: string;
    phone_number: string;
    message: string;
    created_at: string;
};

export const homestayService = {
    // --- Locations ---
    async getLocations() {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as Location[];
    },

    // --- Properties ---
    async getProperties(locationId?: string) {
        let query = supabase.from('properties').select('*');
        if (locationId) {
            query = query.eq('location_id', locationId);
        }
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data as Property[];
    },

    async getPropertyById(id: string) {
        const { data, error } = await supabase
            .from('properties')
            .select('*, locations(*)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // --- Rooms ---
    // --- Hotel Rooms ---
    async getRoomsByHotel(hotelId: string) {
        const { data, error } = await supabase
            .from('hotel_rooms')
            .select('*')
            .eq('hotel_id', hotelId);
        if (error) throw error;
        return data as HotelRoom[];
    },

    async createHotelRoom(room: Omit<HotelRoom, 'id'>) {
        const { data, error } = await supabase.from('hotel_rooms').insert([room]).select().single();
        if (error) throw error;
        return data as HotelRoom;
    },

    async updateHotelRoom(id: string, room: Partial<HotelRoom>) {
        const { data, error } = await supabase.from('hotel_rooms').update(room).eq('id', id).select().single();
        if (error) throw error;
        return data as HotelRoom;
    },

    async deleteHotelRoom(id: string) {
        const { error } = await supabase.from('hotel_rooms').delete().eq('id', id);
        if (error) throw error;
    },

    // Legacy Room functions (redirecting to hotel_rooms or kept for properties)
    async getRoomsByProperty(propertyId: string) {
        const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('property_id', propertyId);
        if (error) throw error;
        return data as Room[];
    },

    async createRoom(room: Omit<Room, 'id'>) {
        const { data, error } = await supabase.from('rooms').insert([room]).select().single();
        if (error) throw error;
        return data as Room;
    },

    async updateRoom(id: string, room: Partial<Room>) {
        const { data, error } = await supabase.from('rooms').update(room).eq('id', id).select().single();
        if (error) throw error;
        return data as Room;
    },

    async deleteRoom(id: string) {
        const { error } = await supabase.from('rooms').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Availability ---
    async checkAvailability(id: string, checkIn: string, checkOut: string, isHotel: boolean = false, roomTypeId?: string) {
        let inventoryCount = 1;

        if (isHotel && roomTypeId) {
            // Hotel Logic: Check specific Room Type Inventory
            const { data: room, error: roomError } = await supabase
                .from('hotel_rooms')
                .select('inventory_count')
                .eq('id', roomTypeId)
                .single();

            if (roomError) throw roomError;
            inventoryCount = room?.inventory_count || 1;
        } else {
            // Homestay Logic: Total Property Rooms
            const table = isHotel ? 'hotels' : 'properties';
            const { data: entity, error: entityError } = await supabase
                .from(table)
                .select('total_rooms')
                .eq('id', id)
                .single();

            if (entityError) throw entityError;
            inventoryCount = entity?.total_rooms || 1;
        }

        // 2. Get all confirmed bookings that overlap the range
        let query = supabase
            .from('bookings')
            .select('check_in, check_out')
            .eq('status', 'confirmed')
            .lt('check_in', checkOut)
            .gt('check_out', checkIn);

        if (isHotel && roomTypeId) {
            query = query.eq('room_id', roomTypeId);
        } else {
            query = query.eq(isHotel ? 'hotel_id' : 'property_id', id);
        }

        const { data: bookings, error: bookingsError } = await query;
        if (bookingsError) throw bookingsError;

        // 3. Day-by-day check
        const start = new Date(checkIn);
        const end = new Date(checkOut);

        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const concurrentBookings = (bookings || []).filter(b => b.check_in <= dateStr && b.check_out > dateStr).length;
            if (concurrentBookings >= inventoryCount) return false;
        }

        return true;
    },

    async getBookedDates(id: string, isHotel: boolean = false, roomTypeId?: string) {
        let inventoryCount = 1;

        if (isHotel && roomTypeId) {
            const { data: room } = await supabase
                .from('hotel_rooms')
                .select('inventory_count')
                .eq('id', roomTypeId)
                .single();
            inventoryCount = room?.inventory_count || 1;
        } else {
            const table = isHotel ? 'hotels' : 'properties';
            const { data: entity } = await supabase
                .from(table)
                .select('total_rooms')
                .eq('id', id)
                .single();
            inventoryCount = entity?.total_rooms || 1;
        }

        // 2. Get all confirmed bookings from today onwards
        const today = new Date().toISOString().split('T')[0];
        let query = supabase
            .from('bookings')
            .select('check_in, check_out')
            .eq('status', 'confirmed')
            .gte('check_out', today);

        if (isHotel && roomTypeId) {
            query = query.eq('room_id', roomTypeId);
        } else {
            query = query.eq(isHotel ? 'hotel_id' : 'property_id', id);
        }

        const { data: bookings } = await query;

        if (!bookings) return [];

        // 3. Aggregate by date
        const dateCounts: Record<string, number> = {};
        bookings.forEach(b => {
            const start = new Date(b.check_in);
            const end = new Date(b.check_out);
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
            }
        });

        return Object.keys(dateCounts).filter(date => dateCounts[date] >= inventoryCount).sort();
    },

    // --- Bookings ---
    async getBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                token_amount,
                rooms (
                    type,
                    properties (
                        name
                    )
                ),
                properties (
                    name
                )
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async updateBookingStatus(id: string, status: 'confirmed' | 'cancelled') {
        const { data, error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async createBooking(bookingData: any) {
        const { data, error } = await supabase
            .from('bookings')
            .insert([bookingData]);
        if (error) throw error;
        return data;
    },

    async deleteBooking(id: string) {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Admin CRUD: Locations ---
    async createLocation(location: Omit<Location, 'id'>) {
        const { data, error } = await supabase.from('locations').insert([location]).select().single();
        if (error) throw error;
        return data as Location;
    },
    async updateLocation(id: string, location: Partial<Location>) {
        const { data, error } = await supabase.from('locations').update(location).eq('id', id).select().single();
        if (error) throw error;
        return data as Location;
    },
    async deleteLocation(id: string) {
        const { error } = await supabase.from('locations').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Admin CRUD: Properties (Homestays) ---
    async createProperty(property: Omit<Property, 'id'>) {
        const { data, error, status } = await supabase.from('properties').insert([property]).select().single();
        if (error) throw error;
        return data as Property;
    },
    async updateProperty(id: string, property: Partial<Property>) {
        const { data, error, status } = await supabase.from('properties').update(property).eq('id', id).select().single();
        if (error) throw error;
        return data as Property;
    },
    async deleteProperty(id: string) {
        const { error } = await supabase.from('properties').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Admin CRUD: Hotels ---
    async getHotels(locationId?: string) {
        let query = supabase.from('hotels').select('*');
        if (locationId) {
            query = query.eq('location_id', locationId);
        }
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data as Hotel[];
    },
    async getHotelById(id: string) {
        const { data, error } = await supabase
            .from('hotels')
            .select('*, locations(*)')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },
    async createHotel(hotel: Omit<Hotel, 'id'>) {
        const { data, error } = await supabase.from('hotels').insert([hotel]).select().single();
        if (error) throw error;
        return data as Hotel;
    },
    async updateHotel(id: string, hotel: Partial<Hotel>) {
        const { data, error } = await supabase.from('hotels').update(hotel).eq('id', id).select().single();
        if (error) throw error;
        return data as Hotel;
    },
    async deleteHotel(id: string) {
        const { error } = await supabase.from('hotels').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Tours ---
    async getTours(category?: string) {
        let query = supabase.from('tours').select('*');
        if (category) {
            query = query.eq('category', category);
        }
        query = query.order('created_at', { ascending: false });
        const { data, error } = await query;
        if (error) throw error;
        return data as Tour[];
    },

    async getTourById(id: string) {
        const { data, error } = await supabase
            .from('tours')
            .select('*')
            .eq('id', id)
            .single();
        if (error) throw error;
        return data as Tour;
    },

    async createTour(tour: Omit<Tour, 'id'>) {
        const { data, error } = await supabase
            .from('tours')
            .insert([tour])
            .select()
            .single();
        if (error) throw error;
        return data as Tour;
    },

    async updateTour(id: string, tour: Partial<Tour>) {
        const { data, error } = await supabase
            .from('tours')
            .update(tour)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as Tour;
    },

    async deleteTour(id: string) {
        const { error } = await supabase
            .from('tours')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Auth & Profiles ---
    async getProfile(userId: string) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
        if (error) return null;
        return data;
    },

    async uploadPropertyImage(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async deletePropertyImage(url: string) {
        try {
            // Extract file path from URL
            // Expected format: .../property-images/filename.ext
            const path = url.split('/property-images/').pop();
            if (!path) return;

            // Decode URI component in case of special characters
            const decodedPath = decodeURIComponent(path);

            const { error } = await supabase.storage
                .from('property-images')
                .remove([decodedPath]);

            if (error) {
                console.error('Error deleting image from storage:', error);
            }
        } catch (error) {
            console.error('Error in deletePropertyImage:', error);
        }
    }
};

export const contactService = {
    async getContacts() {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data as Contact[];
    },

    async createContact(contact: Omit<Contact, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('contacts')
            .insert([contact])
            .select()
            .single();
        if (error) throw error;
        return data as Contact;
    },

    async deleteContact(id: string) {
        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);
        if (error) throw error;
    }
};
