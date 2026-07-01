export interface Profile {
  id: string;
  email: string;
  passwordHash: string;
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
  category: string;
  title: string;
  bio: string;
  photos: string[];
  attributes: AdAttributes;
  status: 'active' | 'expired';
  type: 'free' | 'paid';
  location: string;
  area: string;
  postalCode: string;
  phone: string;
  whatsapp: boolean;
  createdAt: string;
  expiresAt: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  agentEmail: string;
  utrNumber: string;
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

// India Cities → Areas mapping
export const INDIA_CITY_AREAS: Record<string, string[]> = {
  'Mumbai, India': ['Andheri', 'Bandra', 'Juhu', 'Colaba', 'Dadar', 'Borivali', 'Malad', 'Goregaon', 'Kandivali', 'Powai', 'Thane', 'Navi Mumbai', 'Kurla', 'Ghatkopar', 'Vikhroli', 'Mulund', 'Worli', 'Lower Parel', 'Churchgate', 'Marine Lines', 'Dharavi', 'Sion', 'Matunga', 'Chembur', 'Dombivli', 'Kalyan', 'Mira Road', 'Vasai', 'Virar'],
  'Delhi, India': ['Connaught Place', 'Karol Bagh', 'Lajpat Nagar', 'South Extension', 'Saket', 'Dwarka', 'Rohini', 'Pitampura', 'Janakpuri', 'Rajouri Garden', 'Punjabi Bagh', 'Model Town', 'Civil Lines', 'Vasant Kunj', 'Greater Kailash', 'Hauz Khas', 'Malviya Nagar', 'Nehru Place', 'Okhla', 'Noida Sector 18', 'Noida Sector 62', 'Gurugram', 'Faridabad', 'Ghaziabad'],
  'Bengaluru, India': ['Koramangala', 'Indiranagar', 'Whitefield', 'Electronic City', 'Jayanagar', 'JP Nagar', 'Marathahalli', 'HSR Layout', 'BTM Layout', 'Bannerghatta Road', 'MG Road', 'Brigade Road', 'Ulsoor', 'Hebbal', 'Yelahanka', 'Rajajinagar', 'Malleshwaram', 'Basavanagudi', 'Bellandur', 'Sarjapur'],
  'Hyderabad, India': ['Banjara Hills', 'Jubilee Hills', 'Madhapur', 'Gachibowli', 'Hitech City', 'Kondapur', 'Kukatpally', 'Secunderabad', 'Begumpet', 'Ameerpet', 'Dilsukhnagar', 'LB Nagar', 'Uppal', 'Charminar', 'Mehdipatnam', 'Miyapur', 'Bachupally', 'Kompally', 'Shamshabad'],
  'Pune, India': ['Koregaon Park', 'Kalyani Nagar', 'Viman Nagar', 'Baner', 'Hinjewadi', 'Kothrud', 'Deccan', 'Aundh', 'Wakad', 'Pimple Saudagar', 'Hadapsar', 'Magarpatta', 'Camp', 'Shivajinagar', 'Kharadi', 'Wadgaon Sheri', 'Kondhwa', 'Bibwewadi', 'Swargate', 'Katraj'],
  'Chennai, India': ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'OMR', 'ECR', 'Porur', 'Ambattur', 'Perambur', 'Egmore', 'Nungambakkam', 'Mylapore', 'Besant Nagar', 'Thiruvanmiyur', 'Sholinganallur', 'Chromepet', 'Tambaram', 'Pallavaram', 'Guduvanchery', 'Perungudi'],
  'Kolkata, India': ['Park Street', 'Salt Lake', 'New Town', 'Rajarhat', 'Howrah', 'Dum Dum', 'Behala', 'Jadavpur', 'Tollygunge', 'Gariahat', 'Ballygunge', 'Alipore', 'Shyambazar', 'Ultadanga', 'Lake Town', 'Barasat', 'Barrackpore', 'Serampore', 'Khardah'],
  'Goa, India': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Calangute', 'Baga', 'Anjuna', 'Vagator', 'Candolim', 'Sinquerim', 'Palolem', 'Colva', 'Benaulim', 'Morjim', 'Ashwem', 'Arambol', 'Chapora', 'Ponda', 'Cortalim', 'Old Goa'],
  'Jaipur, India': ['Malviya Nagar', 'Vaishali Nagar', 'C Scheme', 'MI Road', 'Tonk Road', 'Ajmer Road', 'Sikar Road', 'Mansarovar', 'Sanganer', 'Jagatpura', 'Pratap Nagar', 'Shyam Nagar', 'Bani Park', 'Civil Lines', 'Raja Park', 'Tilak Nagar', 'Gopalpura', 'Bapu Nagar', 'Lal Kothi'],
  'Ahmedabad, India': ['Navrangpura', 'Satellite', 'Prahlad Nagar', 'SG Highway', 'Bodakdev', 'Vastrapur', 'Thaltej', 'Maninagar', 'Naroda', 'Chandkheda', 'Gota', 'Motera', 'Memnagar', 'Ellisbridge', 'Paldi', 'Vejalpur', 'Bopal', 'South Bopal', 'Shela', 'Ambawadi'],
  'Surat, India': ['Adajan', 'Vesu', 'Pal', 'Althan', 'Citylight', 'Athwa', 'Katargam', 'Udhna', 'Varachha', 'Piplod', 'Dumas', 'Bhatar', 'Rander', 'Sachin', 'Kim', 'Bardoli'],
  'Lucknow, India': ['Hazratganj', 'Gomti Nagar', 'Aliganj', 'Indira Nagar', 'Mahanagar', 'Vikas Nagar', 'Alambagh', 'Charbagh', 'Chinhat', 'Faizabad Road', 'Jankipuram', 'Nishatganj', 'Rajajipuram', 'Aminabad'],
  'Nagpur, India': ['Sitabuldi', 'Dharampeth', 'Ramdaspeth', 'Sadar', 'Civil Lines', 'Wardha Road', 'Amravati Road', 'Manish Nagar', 'Hingna Road', 'Koradi Road', 'Kamptee Road', 'Itwari', 'Mahal', 'Gandhibagh'],
  'Indore, India': ['Vijay Nagar', 'Palasia', 'MG Road', 'Rajwada', 'Sapna Sangeeta', 'AB Road', 'Bhawarkua', 'Bicholi Mardana', 'Nipania', 'Super Corridor', 'Rau', 'Mhow', 'Pithampur', 'Dewas Naka'],
  'Bhopal, India': ['MP Nagar', 'New Market', 'Arera Colony', 'Hoshangabad Road', 'Kolar Road', 'Misrod', 'Bairagarh', 'Berasia Road', 'Govindpura', 'Habibganj', 'Shymala Hills', 'Idgah Hills', 'TT Nagar'],
  'Patna, India': ['Boring Road', 'Fraser Road', 'Kankarbagh', 'Rajendra Nagar', 'Bailey Road', 'Dak Bungalow', 'Patna Sahib', 'Gardanibagh', 'Bankipur', 'Phulwari Sharif', 'Danapur', 'Khagaul'],
  'Chandigarh, India': ['Sector 17', 'Sector 22', 'Sector 35', 'Sector 43', 'Mohali', 'Panchkula', 'Zirakpur', 'Dera Bassi', 'Kharar', 'Kurali'],
  'Coimbatore, India': ['RS Puram', 'Gandhipuram', 'Peelamedu', 'Singanallur', 'Saravanampatti', 'Tidel Park', 'Hopes College', 'Town Hall', 'Kavundampalayam', 'Kuniyamuthur'],
  'Visakhapatnam, India': ['Gajuwaka', 'MVP Colony', 'Dwaraka Nagar', 'Steel Plant', 'Rushikonda', 'Maddilapalem', 'Seethammadhara', 'Akkayyapalem', 'Jagadamba', 'Kommadi'],
  'Kochi, India': ['Ernakulam', 'Fort Kochi', 'Kakkanad', 'Edapally', 'Aluva', 'Tripunithura', 'Thrikkakara', 'Kalamassery', 'Perumbavoor', 'Angamaly'],
  'Thiruvananthapuram, India': ['Kowdiar', 'Vazhuthacaud', 'Pattom', 'Ulloor', 'Vellayambalam', 'Nalanchira', 'Kesavadasapuram', 'Kazhakkoottam', 'Technopark', 'Sreekaryam'],
  'Vadodara, India': ['Alkapuri', 'Fatehgunj', 'Manjalpur', 'Waghodia Road', 'Gotri', 'Makarpura', 'Vasna', 'Ajwa Road', 'Harni', 'Sama'],
  'Rajkot, India': ['Kalawad Road', 'Gondal Road', 'Bhavnagar Road', 'Kuvadava Road', 'Kothariya Road', 'Mavdi', 'Karanpara', 'Raiya Road', 'Pedak Road', 'University Road'],
  'Amritsar, India': ['Golden Temple', 'Hall Bazaar', 'Lawrence Road', 'GT Road', 'Ranjit Avenue', 'Model Town', 'Majitha Road', 'Batala Road', 'Pathankot Road', 'Airport Road'],
  'Varanasi, India': ['Godaulia', 'Lanka', 'Sunderpur', 'Sigra', 'Cantonment', 'Paharia', 'Shivpur', 'Sarnath', 'BHU', 'Nadesar'],
  'Agra, India': ['Taj Ganj', 'Civil Lines', 'Sikandra', 'Fatehabad Road', 'MG Road', 'Kamla Nagar', 'Dayalbagh', 'Bodla', 'Khandari', 'Shamshabad Road'],
};