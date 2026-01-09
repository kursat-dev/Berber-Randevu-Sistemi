// TypeScript interfaces for all data models

export interface IAppointment {
  _id?: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  timeSlot: string;
  serviceId: string;
  status: "pending" | "approved" | "rejected";
  totalPrice: number;
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IService {
  _id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number; // in minutes
  isActive: boolean;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdmin {
  _id?: string;
  username: string;
  passwordHash: string;
  fullName: string;
  email?: string;
  role: "owner" | "staff";
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWorkingHours {
  _id?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  slotInterval: number; // in minutes
  breakStart?: string; // "12:00"
  breakEnd?: string; // "13:00"
  updatedAt?: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Booking form data
export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:MM
  serviceId: string;
  notes?: string;
  recaptchaToken: string;
}

// Available time slots response
export interface TimeSlot {
  time: string;
  available: boolean;
}
