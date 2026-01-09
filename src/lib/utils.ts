import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Format as +90 555 123 45 67
    if (cleaned.startsWith('90') && cleaned.length === 12) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
    }

    return phone;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Format time for display
 */
export function formatTime(time: string): string {
    return time; // Already in HH:MM format
}

/**
 * Format currency (Turkish Lira)
 */
export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: string, timeSlot: string): boolean {
    const appointmentDateTime = new Date(`${date}T${timeSlot}:00`);
    return appointmentDateTime <= new Date();
}

/**
 * Generate time slots array
 */
export function generateTimeSlots(
    openTime: string,
    closeTime: string,
    interval: number,
    breakStart?: string,
    breakEnd?: string
): string[] {
    const slots: string[] = [];

    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (
        currentHour < closeHour ||
        (currentHour === closeHour && currentMinute < closeMinute)
    ) {
        const timeSlot = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

        // Skip break time slots
        if (breakStart && breakEnd) {
            if (timeSlot >= breakStart && timeSlot < breakEnd) {
                currentMinute += interval;
                if (currentMinute >= 60) {
                    currentHour += Math.floor(currentMinute / 60);
                    currentMinute = currentMinute % 60;
                }
                continue;
            }
        }

        slots.push(timeSlot);

        currentMinute += interval;
        if (currentMinute >= 60) {
            currentHour += Math.floor(currentMinute / 60);
            currentMinute = currentMinute % 60;
        }
    }

    return slots;
}

/**
 * Validate phone number (Turkish format)
 */
export function isValidPhoneNumber(phone: string): boolean {
    // Turkish phone number: +90 5XX XXX XX XX or 05XX XXX XX XX
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith('90')) {
        return cleaned.length === 12 && cleaned[2] === '5';
    }

    return cleaned.length === 11 && cleaned[0] === '0' && cleaned[1] === '5';
}
