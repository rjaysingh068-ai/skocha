import React, { useState, useEffect } from 'react';
import { Search, MapPin, Heart, Coins, ShieldAlert, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { Profile, Ad, CATEGORIES, LOCATIONS } from './types.ts';
import Header from './components/Header.tsx';
import LoginModal from './components/LoginModal.tsx';
import AdCard from './components/AdCard.tsx';
import AdPostForm from './components/AdPostForm.tsx';
import PaymentModal from './components/PaymentModal.tsx';
import AdminPanel from './components/AdminPanel.tsx';

export default function App() {
  const [currentAgent, setCurrentAgent] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home'); // 'home' | 'post-ad' | 'admin' | 'my-ads'
  
  // Modals Visibility
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Search/Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [searchLocation, setSearchLocation] = useState<string>('All');

  // Ads Database State
  const [ads, setAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [errorAds, setErrorAds] = useState('');

  // Auto-authenticate agent from Local Storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('skocha_agent_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Profile;
        setCurrentAgent(parsed);
        // Silently sync profile coins/details from backend
        syncProfile(parsed.id);
      } catch (e) {
        localStorage.removeItem('skocha_agent_session');
      }
    }
  }, []);

  // Sync profile details with server
  const syncProfile = async (agentId: string) => {
    try {
      const res = await fetch(`/api/agent/profile?agentId=${agentId}`);
      if (res.ok) {
        const updated = await res.json() as Profile;
        setCurrentAgent(updated);
        localStorage.setItem('skocha_agent_session', JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Silent profile sync failed, using offline session state.');
    }
  };

  // Fetch Ads based on Category and Location
  const fetchAds = async (cat: string = selectedCategory, loc: string = selectedLocation) => {
    setLoadingAds(true);
    setErrorAds('');
    try {
      const response = await fetch(`/api/ads?category=${cat}&location=${loc}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch directory listings.');
      }

      setAds(data);
    } catch (err: any) {
      setErrorAds(err.message);
    } finally {
      setLoadingAds(false);
    }
  };

  // Trigger search on mount and filter changes
  useEffect(() => {
    fetchAds(selectedCategory, selectedLocation);
  }, [selectedCategory, selectedLocation]);

  // Handle successful login/registration
  const handleLoginSuccess = (agent: Profile) => {
    setCurrentAgent(agent);
    localStorage.setItem('skocha_agent_session', JSON.stringify(agent));
    // If developer logged in, go to admin panel by default
    if (agent.isDeveloper) {
      setActiveTab('admin');
    } else {
      setActiveTab('home');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentAgent(null);
    localStorage.removeItem('skocha_agent_session');
    setActiveTab('home');
  };

  // Handle coins update when ad is created or purchased
  const handleCoinsUpdate = (newBalance: number) => {
    if (currentAgent) {
      const updated = { ...currentAgent, coinBalance: newBalance };
      setCurrentAgent(updated);
      localStorage.setItem('skocha_agent_session', JSON.stringify(updated));
    }
  };

  // Hotspot Click Filters
  const handleHotspotClick = (type: 'category' | 'location', value: string) => {
    if (type === 'category') {
      setSelectedCategory(value);
    } else {
      setSelectedLocation(value);
      setSearchLocation(value);
    }
    
    // Smooth scroll down to listings section
    const listEl = document.getElementById('listings-section');
    if (listEl) {
      listEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLocation(searchLocation);
  };

  // Group of beautiful luxury cities and directories cards
  const hotspots = [
    {
      id: 'hs_1',
      title: 'Call Girl Page',
      badge: 'Premium Companion Services',
      sub: 'Elegant, verified female escorts & dates',
      img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
      action: () => handleHotspotClick('category', 'Call Girl')
    },
    {
      id: 'hs_2',
      title: 'Mumbai',
      badge: 'Hotspot',
      sub: 'View local directory →',
      img: 'https://images.unsplash.com/photo-1570168007244-23704139443d?auto=format&fit=crop&q=80&w=800',
      action: () => handleHotspotClick('location', 'Mumbai')
    },
    {
      id: 'hs_3',
      title: 'Massage Page',
      badge: 'Sensual Relaxing Therapies',
      sub: 'Full-body relaxation & tantric touch',
      img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
      action: () => handleHotspotClick('category', 'Massage')
    },
    {
      id: 'hs_4',
      title: 'Delhi NCR',
      badge: 'Hotspot',
      sub: 'View local directory →',
      img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800',
      action: () => handleHotspotClick('location', 'Delhi NCR')
    },
    {
      id: 'hs_5',
      title: 'Adult Meeting',
      badge: 'Discreet Sensory Rendezvous',
      sub: 'Casual meetups & adult hookups',
      img: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800',
      action: () => handleHotspotClick('category', 'Adult Meeting')
    }
  ];

  const agentAds = currentAgent ? ads.filter(ad => ad.agentId === currentAgent.id) : [];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Header component */}
      <Header
        currentAgent={currentAgent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenBuyCoins={() => setShowPaymentModal(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-grow pb-16">
        
        {/* VIEW 1: HOMEPAGE */}
        {activeTab === 'home' && (
          <div>
            {/* Hero Slogan Section */}
            <div className="relative pt-16 pb-12 px-4 max-w-7xl mx-auto text-center overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.03)_0,transparent_100%)] pointer-events-none" />
              
              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                <div className="flex items-center justify-center space-x-2.5 mb-4">
                  <span className="w-12 h-[1px] bg-amber-500/30"></span>
                  <span className="text-[10px] tracking-[0.3em] font-bold text-amber-500 uppercase font-mono">Discreet • Verified • Premium</span>
                  <span className="w-12 h-[1px] bg-amber-500/30"></span>
                </div>
                
                <h1 className="font-serif text-4xl sm:text-6xl font-medium tracking-tight text-white mb-6">
                  Find your perfect <span className="italic text-amber-500 font-serif">companion</span> tonight.
                </h1>
                
                <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-8">
                  Browse thousands of verified listings across India. Connect instantly via direct phone call or secure WhatsApp templates.
                </p>

                {/* Location Search bar */}
                <form 
                  onSubmit={handleSearchSubmit}
                  className="max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-3 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/40"
                  id="search-bar"
                >
                  <div className="w-full flex items-center space-x-3 px-3 py-2 sm:py-0">
                    <MapPin className="w-5 h-5 text-amber-500 shrink-0" />
                    <select
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full bg-transparent border-none text-sm text-slate-300 focus:outline-none cursor-pointer"
                    >
                      <option value="All" className="bg-slate-900 text-slate-300">Enter your city or location</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} className="bg-slate-900 text-slate-300">{loc}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition-all shrink-0 shadow-md shadow-amber-500/10"
                    id="btn-search-submit"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Hotspots Directories Section */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 border-t border-slate-800">
              <div className="text-center mb-10">
                <p className="text-[10px] tracking-[0.2em] font-bold text-amber-500 uppercase font-mono mb-2">VIP Directories & Premium Hotspots</p>
                <h2 className="font-serif text-3xl font-bold text-white tracking-tight">Browse Luxury Services & Cities</h2>
                <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto font-light leading-normal">
                  Choose an elite companion service or jump straight to active regional escorts. Selecting a hotspot filters your view instantly.
                </p>
              </div>

              {/* Grid bento layout of hotspots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" id="hotspots-grid">
                {hotspots.map((hs) => (
                  <div
                    key={hs.id}
                    onClick={hs.action}
                    className="relative group h-72 rounded-2xl overflow-hidden cursor-pointer border border-slate-800 hover:border-amber-500/30 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    id={`hotspot-${hs.id}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-10" />
                    <img
                      src={hs.img}
                      alt={hs.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-x-0 bottom-0 p-4 z-20 text-left">
                      <span className="text-[8px] bg-amber-500/15 border border-amber-500/20 text-amber-400 font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
                        {hs.badge}
                      </span>
                      <h4 className="font-serif text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                        {hs.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        {hs.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE DIRECTORY LISTINGS */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 mt-4" id="listings-section">
              
              {/* Category Filter Pills & Title */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800 pb-6">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">Active Verified Ads</h2>
                  <p className="text-xs text-slate-500 mt-1">Showing {ads.length} active escort listings in {selectedLocation === 'All' ? 'India' : selectedLocation}.</p>
                </div>

                {/* Categories filtering bar */}
                <div className="flex flex-wrap gap-2" id="categories-filter-bar">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all border ${
                      selectedCategory === 'All'
                        ? 'bg-amber-500 text-slate-950 border-amber-500'
                        : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    All Types
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all border ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Directory Content Row */}
              {loadingAds ? (
                <div className="p-20 text-center text-slate-400 font-mono text-xs">
                  <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-4" />
                  <span>Loading live directories...</span>
                </div>
              ) : errorAds ? (
                <div className="p-12 text-center bg-red-500/10 border border-red-500/20 rounded-2xl max-w-xl mx-auto text-red-400">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3" />
                  <p className="text-sm font-bold">Failed to load directory</p>
                  <p className="text-xs mt-1 text-slate-400">{errorAds}</p>
                </div>
              ) : ads.length === 0 ? (
                <div className="p-16 text-center border border-dashed border-slate-800 rounded-2xl max-w-xl mx-auto">
                  <Layers className="w-10 h-10 text-slate-700 mx-auto mb-4" />
                  <h3 className="text-sm font-bold text-slate-300">No Listings Found</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-6">
                    No active ads available for {selectedCategory} in {selectedLocation === 'All' ? 'India' : selectedLocation}.
                  </p>
                  
                  {(selectedCategory !== 'All' || selectedLocation !== 'All') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setSelectedLocation('All');
                        setSearchLocation('All');
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg text-xs transition-colors"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {ads.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              )}

            </div>

            {/* SUPPORT CONTACT & PRIVACY POLICY COMPACT SECTION */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 mt-6 border-t border-slate-800" id="homepage-support-section">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xl">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full filter blur-3xl pointer-events-none" />
                
                <div className="text-left space-y-2">
                  <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                    Help & Customer Support
                  </span>
                  <h3 className="text-xl font-serif font-bold text-white tracking-tight">
                    Need Assistance with Coins or Listings?
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Our dedicated companion verification team is available 24/7 to clear pending UPI transaction UTRs, adjust coin balances, and assist with any listing questions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  {/* Contact Methods */}
                  <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono text-left mr-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Email:</span>
                      <a href="mailto:supportt.skocha@gmail.com" className="text-amber-400 hover:underline">
                        supportt.skocha@gmail.com
                      </a>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500">Phone:</span>
                      <a href="tel:+916378490489" className="text-amber-400 hover:underline">
                        +91 63784 90489
                      </a>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-3">
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 font-semibold rounded-lg text-xs transition-all flex items-center space-x-1.5"
                    >
                      <span>Privacy Policy</span>
                    </a>
                    <a
                      href="mailto:supportt.skocha@gmail.com"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-all"
                    >
                      Contact Us
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: POST AD */}
        {activeTab === 'post-ad' && currentAgent && (
          <AdPostForm
            currentAgent={currentAgent}
            onAdCreated={handleCoinsUpdate}
            setActiveTab={setActiveTab}
            onOpenBuyCoins={() => setShowPaymentModal(true)}
          />
        )}

        {/* VIEW 3: DEVELOPER ADMIN PANEL */}
        {activeTab === 'admin' && currentAgent && (
          <AdminPanel
            currentAgent={currentAgent}
            onCoinsResetSuccess={handleCoinsUpdate}
          />
        )}

        {/* VIEW 4: MY ADS / AGENT ACCOUNT */}
        {activeTab === 'my-ads' && currentAgent && (
          <div className="max-w-4xl mx-auto p-4 sm:p-6" id="agent-profile-dashboard">
            {/* Home button in top left side of profile view */}
            <div className="mb-4 text-left">
              <button
                onClick={() => setActiveTab('home')}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold rounded-lg text-xs font-mono transition-colors"
                id="btn-profile-back-home"
              >
                <span>← Home</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-white">Agent Dashboard</h2>
                <p className="text-sm text-slate-400 font-mono text-left">{currentAgent.email}</p>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <Coins className="w-5 h-5 text-amber-500 animate-pulse" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Your Balance</p>
                  <p className="text-lg font-bold font-mono text-amber-400">{currentAgent.coinBalance} Coins</p>
                </div>
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  BUY COINS
                </button>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold text-white mb-4">My Published Listings ({agentAds.length})</h3>
              
              {agentAds.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl">
                  <p className="text-sm text-slate-500 mb-4">You haven't posted any ad listings yet.</p>
                  <button
                    onClick={() => setActiveTab('post-ad')}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                  >
                    Post Your First Ad Listing
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {agentAds.map((ad) => (
                    <AdCard key={ad.id} ad={ad} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Persistent Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Skocha Companion Platform. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">Discretion & Privacy Policy</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Verification Guides</a>
          </div>
        </div>
      </footer>

      {/* MODAL 1: LOGIN/REGISTER MODAL */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* MODAL 2: COIN PURCHASE MODAL */}
      {showPaymentModal && currentAgent && (
        <PaymentModal
          currentAgent={currentAgent}
          onClose={() => setShowPaymentModal(false)}
          onTransactionSubmitted={() => syncProfile(currentAgent.id)}
        />
      )}

    </div>
  );
}
