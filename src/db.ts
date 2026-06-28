import * as fs from 'fs';
import * as path from 'path';
import { Profile, Ad, Transaction } from './types.ts';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

interface DatabaseSchema {
  profiles: Profile[];
  ads: Ad[];
  transactions: Transaction[];
  lastResetDate: string; // YYYY-MM-DD format
}

// Initial seed data for empty database
const INITIAL_DATA: DatabaseSchema = {
  profiles: [
    {
      id: 'dev_user_49',
      email: 'developer49@gmail.com',
      passwordHash: '@Developer49', // Hardcoded as per spec
      coinBalance: 30, // Starts at exactly 30 Coins
      isDeveloper: true,
      createdAt: new Date().toISOString(),
    }
  ],
  ads: [
    // Pre-seed some premium and free ads for a beautiful homepage experience
    {
      id: 'ad_1',
      agentId: 'agent_mumbai',
      agentEmail: 'priya_mumbai@skocha.com',
      category: 'Call Girl',
      title: 'Premium Verified Companion - Priya Sen',
      bio: `Hello gentlemen. I am Priya, an independent companion based in Mumbai. I am an educated, sophisticated, and elegant young lady who enjoys intellectual conversations, fine dining, and intimate encounters. I provide high-class companion services for distinguished clients looking for a discreet and memorable experience. My focus is on mutual comfort, real connections, and memorable dates. I am available for both outcall and incall services in South Mumbai. All my photos are 100% genuine and verified. Please read my attributes and contact me directly for a elite encounter. My service is highly professional, clean, and safe. I speak fluent English and Hindi. Looking forward to your call and spending an unforgettable evening together. Thank you for visiting my verified profile.`,
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800'
      ],
      attributes: {
        eyes: 'Brown',
        chest: '34B',
        height: "5'6\"",
        hair: 'Black',
        figure: 'Slim'
      },
      status: 'active',
      type: 'paid', // Priority
      location: 'Mumbai',
      phone: '+919876543210',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ad_2',
      agentId: 'agent_delhi',
      agentEmail: 'ananya_delhi@skocha.com',
      category: 'Massage',
      title: 'Tantric Massage and Relaxation by Ananya',
      bio: `Welcome to the ultimate relaxation experience in Delhi NCR. I am Ananya, a certified masseuse specializing in traditional tantric and full-body relaxation therapies. My sessions are designed to relieve deep-seated stress, restore physical harmony, and soothe your mind. I operate in a clean, quiet, and fully air-conditioned private spa studio in South Delhi. Every session is personalized to your specific preferences, ensuring a comfortable, respectful, and deeply therapeutic atmosphere. I use high-quality organic herbal oils. Clean towels, refreshments, and shower facilities are fully provided. Please call ahead to secure an appointment. No rush, absolute peace of mind. Available daily from 11:00 AM to 9:00 PM. Look forward to restoring your energies today.`,
      photos: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800'
      ],
      attributes: {
        eyes: 'Hazel',
        chest: '32C',
        height: "5'4\"",
        hair: 'Dark Brown',
        figure: 'Athletic'
      },
      status: 'active',
      type: 'paid', // Priority
      location: 'Delhi NCR',
      phone: '+919876543211',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'ad_3',
      agentId: 'agent_pune',
      agentEmail: 'simran_pune@skocha.com',
      category: 'Call Girl',
      title: 'Discreet and Classy Independent Escort Simran',
      bio: `Greetings. I am Simran, an independent escort providing exceptional, high-end companion services in Pune. I am a warm, open-minded, and attractive lady who believes that companionship is an art form. Whether you need a sophisticated date for a corporate dinner, a relaxed social gathering, or a private cozy evening, I am the perfect match. I am highly respectful of your privacy and ensure absolute discretion. I maintain a clean, luxurious, and safe environment. Let's share some stories, laugh, and enjoy each other's presence. My calendar fills up quickly, so advance bookings are highly appreciated. Outcall services are offered to premium hotels only. Feel free to call or WhatsApp me directly. Let's make tonight special.`,
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=800'
      ],
      attributes: {
        eyes: 'Dark Brown',
        chest: '36B',
        height: "5'7\"",
        hair: 'Blonde',
        figure: 'Curvy'
      },
      status: 'active',
      type: 'free',
      location: 'Pune',
      phone: '+919876543212',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  transactions: [
    {
      id: 'tx_1',
      agentId: 'agent_mumbai',
      agentEmail: 'priya_mumbai@skocha.com',
      utrNumber: '987654321012',
      amount: 1800,
      coins: 50,
      status: 'completed',
      createdAt: new Date().toISOString()
    }
  ],
  lastResetDate: new Date().toISOString().split('T')[0]
};

// Initialize DB file
function ensureDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2));
  }
}

export function readDB(): DatabaseSchema {
  ensureDB();
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(content) as DatabaseSchema;
    
    // Automatically perform the daily 1:00 AM coin reset on read,
    // to keep database state aligned and automated on requests.
    const today = new Date().toISOString().split('T')[0];
    if (db.lastResetDate !== today) {
      // Find developer
      const dev = db.profiles.find(p => p.email === 'developer49@gmail.com');
      if (dev) {
        dev.coinBalance = 30; // Reset to exactly 30 Coins
      }
      db.lastResetDate = today;
      fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
      console.log(`[Auto-Cron] Daily coin balance reset to 30 for developer49@gmail.com on ${today}`);
    }
    
    return db;
  } catch (error) {
    console.error('Error reading database file:', error);
    return INITIAL_DATA;
  }
}

export function writeDB(data: DatabaseSchema) {
  ensureDB();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}
