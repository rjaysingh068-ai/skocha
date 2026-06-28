export interface Profile {
  id: string;
  email: string;
  passwordHash: string; // Stored in plain text or simple hash for preview purposes
  coinBalance: number;
  isDeveloper: boolean;
  createdAt: string;
}

export interface AdAttributes {
  eyes: string;
  chest: string;
  height: string;
  hair: string;
  figure: string;
}

export interface Ad {
  id: string;
  agentId: string;
  agentEmail: string;
  category: string; // Call Girl, Massage, Adult Meeting, Transsexual, Male Escort
  title: string;
  bio: string; // Minimum 300 words validation
  photos: string[]; // Base64 or URL strings
  attributes: AdAttributes;
  status: 'active' | 'expired';
  type: 'free' | 'paid'; // Free Ad = 3 days, Paid Ad = 7 days (4 coins cost, priority for 6 hours daily)
  location: string;
  phone: string;
  createdAt: string;
  expiresAt: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  agentEmail: string;
  utrNumber: string; // 12-digit UPI reference number
  amount: number;
  coins: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  coins: number;
  price: number;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pack_1', coins: 10, price: 400 },
  { id: 'pack_2', coins: 25, price: 950 },
  { id: 'pack_3', coins: 50, price: 1800 },
  { id: 'pack_4', coins: 100, price: 3200 },
];

export const CATEGORIES = [
  'Call Girl',
  'Massage',
  'Adult Meeting',
  'Transsexual',
  'Male Escort'
];

export const LOCATIONS = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Kolkata',
  'Goa',
  'Jaipur',
  'Ahmedabad'
];
