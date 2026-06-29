import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Coins, AlertCircle, Trash2, ArrowRight } from 'lucide-react';
import { Profile, AdAttributes, CATEGORIES, LOCATIONS } from '../types.ts';
import { supabase } from '../supabaseClient';

interface AdPostFormProps {
  currentAgent: Profile;
  onAdCreated: (updatedCoinBalance: number) => void;
  setActiveTab: (tab: string) => void;
  onOpenBuyCoins: () => void;
}

export default function AdPostForm({
  currentAgent,
  onAdCreated,
  setActiveTab,
  onOpenBuyCoins
}: AdPostFormProps) {
  const [category, setCategory] = useState('Call Girl');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('Mumbai');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91'); // ✅ CHANGE 1: Country code state
  const [adType, setAdType] = useState<'free' | 'paid'>('free');
  
  // Attributes State
  const [attributes, setAttributes] = useState<AdAttributes>({
    eyes: 'Brown',
    chest: '34B',
    height: "5'5\"",
    hair: 'Black',
    figure: 'Slim'
  });

  const [photos, setPhotos] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time word counter
  const wordCount = bio.trim().split(/\s+/).filter(Boolean).length;
  const isBioValid = wordCount >= 300;

  // File Upload Drag & Drop and Convert to Base64
  const processFiles = (files: FileList) => {
    setError('');
    const filesArray = Array.from(files);
    
    if (photos.length + filesArray.length > 5) {
      setError('You can upload a maximum of 5 photos per ad listing.');
      return;
    }

    filesArray.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are permitted.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result && typeof e.target.result === 'string') {
          setPhotos((prev) => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Pre-fill placeholder beautiful photos to make posting easier for testing
  const loadPlaceholders = () => {
    const categoryPlaceholders: Record<string, string[]> = {
      'Call Girl': [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800'
      ],
      'Massage': [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=800'
      ],
      'Adult Meeting': [
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&q=80&w=800'
      ],
      'Transsexual': [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
      ],
      'Male Escort': [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
      ]
    };
    
    setPhotos(categoryPlaceholders[category] || categoryPlaceholders['Call Girl']);
  };

  // Submit Ad form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (wordCount < 300) {
      setError(`Your bio has ${wordCount} words. It must be at least 300 words.`);
      return;
    }

    if (adType === 'paid' && currentAgent.coinBalance < 4) {
      setError('Insufficient coins! A Paid Priority Ad costs 4 Coins. Please buy coins to continue.');
      return;
    }

    setLoading(true);

    try {
      // ✅ CHANGE 3: Full number with country code save hoga
      const fullPhone = `${countryCode}${phone.replace(/[\s\-]/g, '')}`;

      // Insert ad into Supabase
      const { error: adError } = await supabase
        .from('ads')
        .insert({
          agent_id: currentAgent.id,
          category,
          title,
          bio,
          photos,
          attributes,
          type: adType,
          location,
          phone: fullPhone, // ✅ Full number with country code
          status: 'active'
        });

      if (adError) throw new Error(adError.message);

      // Deduct coins if paid ad
      if (adType === 'paid') {
        const { error: coinError } = await supabase
          .from('profiles')
          .update({ coinBalance: currentAgent.coinBalance - 4 })
          .eq('id', currentAgent.id);

        if (coinError) throw new Error(coinError.message);
      }

      const newBalance = currentAgent.coinBalance - (adType === 'paid' ? 4 : 0);

      setSuccess('Your ad listing has been published successfully!');
      onAdCreated(newBalance);
      
      // Reset inputs
      setTitle('');
      setBio('');
      setPhotos([]);
      setPhone('');
      setCountryCode('+91');

      setTimeout(() => {
        setActiveTab('home');
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6" id="ad-post-form-container">
      
      {/* Title */}
      <div className="mb-6">
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white">Post Ad Listing</h2>
        <p className="text-sm text-slate-400">Post a free (3 days) or paid premium priority (7 days) ad on Skocha.</p>
      </div>

      {success ? (
        <div className="p-8 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-6 shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-white mb-2">Listing Published!</h3>
          <p className="text-sm text-slate-300 mb-6">{success}</p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg text-sm transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-sm text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Rows */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
            
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Category Type</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-950 text-slate-200">{cat}</option>
                ))}
              </select>
            </div>

            {/* City Location selection */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">City Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
              >
                {LOCATIONS.map((loc) => (
                  <option key={loc} value={loc} className="bg-slate-950 text-slate-200">{loc}</option>
                ))}
              </select>
            </div>

            {/* ✅ CHANGE 2: Phone with Country Code Selector */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Direct Contact Phone (Mobile Number)
              </label>
              <div className="flex gap-2">

                {/* Country Code Dropdown */}
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-amber-400 font-bold focus:outline-none focus:border-amber-500/50 shrink-0"
                >
                  <option value="+91">🇮🇳 +91 India</option>
                  <option value="+1">🇺🇸 +1 USA</option>
                  <option value="+44">🇬🇧 +44 UK</option>
                  <option value="+971">🇦🇪 +971 UAE</option>
                  <option value="+92">🇵🇰 +92 Pakistan</option>
                  <option value="+880">🇧🇩 +880 Bangladesh</option>
                  <option value="+94">🇱🇰 +94 Sri Lanka</option>
                  <option value="+977">🇳🇵 +977 Nepal</option>
                  <option value="+60">🇲🇾 +60 Malaysia</option>
                  <option value="+65">🇸🇬 +65 Singapore</option>
                  <option value="+61">🇦🇺 +61 Australia</option>
                  <option value="+966">🇸🇦 +966 Saudi Arabia</option>
                </select>

                {/* Number Input */}
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9\s\-]/g, ''))}
                  placeholder="90548 47048"
                  className="flex-1 px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              {/* Live Preview */}
              {phone && (
                <p className="text-xs text-emerald-400 mt-1.5 font-mono">
                  ✅ WhatsApp Number: {countryCode}{phone.replace(/[\s\-]/g, '')}
                </p>
              )}
            </div>

            {/* Ad Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Ad Catchy Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Sophisticated Independent Companion - Priya (South Mumbai)"
                className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Physical Attributes Block */}
            <div className="md:col-span-2">
              <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">Verification Attributes</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Eyes</label>
                  <input
                    type="text"
                    value={attributes.eyes}
                    onChange={(e) => setAttributes({ ...attributes, eyes: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Chest/Bust</label>
                  <input
                    type="text"
                    value={attributes.chest}
                    onChange={(e) => setAttributes({ ...attributes, chest: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Height</label>
                  <input
                    type="text"
                    value={attributes.height}
                    onChange={(e) => setAttributes({ ...attributes, height: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Hair</label>
                  <input
                    type="text"
                    value={attributes.hair}
                    onChange={(e) => setAttributes({ ...attributes, hair: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Figure</label>
                  <input
                    type="text"
                    value={attributes.figure}
                    onChange={(e) => setAttributes({ ...attributes, figure: e.target.value })}
                    className="w-full px-2 py-1.5 bg-slate-950/60 border border-slate-800 rounded text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Description Bio (Word validation) */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-baseline mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Detailed Bio Description</label>
                <div className="text-right">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isBioValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {wordCount} / 300 words
                  </span>
                </div>
              </div>
              <textarea
                required
                rows={8}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write an elegant, attractive description of yourself, your services, terms, and availability. This bio must be at least 300 words long to qualify for verification."
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                Note: A longer description improves Google search ranking and verifies your agency profile authenticity.
              </p>
            </div>

            {/* Photo upload */}
            <div className="md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Photos (Upload up to 5 photos)</label>
                <button
                  type="button"
                  onClick={loadPlaceholders}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold font-sans"
                >
                  ⚡ Use Beautiful Placeholder Photos
                </button>
              </div>

              {/* Drag and Drop Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-500/5' 
                    : 'border-slate-800 hover:border-amber-500/30 hover:bg-slate-950/40'
                }`}
                id="photo-uploader"
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-semibold">Drag & Drop Photos Here, or Click to Browse</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG or JPEG format (Max 5 photos)</p>
              </div>

              {/* Photo Previews */}
              {photos.length > 0 && (
                <div className="grid grid-cols-5 gap-3 mt-4">
                  {photos.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-950 group">
                      <img src={src} alt={`Upload preview ${index + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute top-1 right-1 p-1 bg-slate-950/80 text-red-400 hover:text-red-300 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ad Posting Tier Selection */}
            <div className="md:col-span-2 border-t border-slate-800 pt-5 mt-3">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Choose Listing Tier</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Free Listing Card */}
                <div
                  onClick={() => setAdType('free')}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${
                    adType === 'free'
                      ? 'border-slate-400 bg-slate-900/40'
                      : 'border-slate-800 bg-transparent hover:border-slate-700'
                  }`}
                  id="tier-free-selector"
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-bold text-white text-lg">Free Ad</span>
                    <span className="text-xs font-bold text-slate-400 font-mono">0 Coins</span>
                  </div>
                  <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Valid for 3 days.</li>
                    <li>Standard homepage rotation.</li>
                    <li>No coin cost.</li>
                  </ul>
                </div>

                {/* Paid Listing Card */}
                <div
                  onClick={() => setAdType('paid')}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative overflow-hidden ${
                    adType === 'paid'
                      ? 'border-amber-500 bg-amber-500/5 shadow-md shadow-amber-500/5'
                      : 'border-slate-800 bg-transparent hover:border-amber-500/20'
                  }`}
                  id="tier-paid-selector"
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-bl uppercase font-mono shadow-sm">
                    Popular
                  </div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-bold text-amber-400 text-lg flex items-center space-x-1">
                      <span>Priority Ad</span>
                    </span>
                    <span className="text-xs font-bold text-amber-400 font-mono">4 Coins</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
                    <li>Valid for 7 days.</li>
                    <li><strong className="text-amber-400">Priority Placement</strong> at top tier rotation.</li>
                    <li>Featured with high-contrast glowing card layout.</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

          {/* Form Action Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
            <div className="flex items-center space-x-3 text-sm">
              <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
              <div>
                <p className="text-slate-300">Your Current Balance: <span className="font-bold text-white font-mono">{currentAgent.coinBalance} Coins</span></p>
                {adType === 'paid' && (
                  <p className="text-xs text-amber-500">
                    Posting will deduct <span className="font-bold font-mono">4 Coins</span> (Remaining: {currentAgent.coinBalance - 4} Coins).
                  </p>
                )}
              </div>
            </div>

            {adType === 'paid' && currentAgent.coinBalance < 4 ? (
              <button
                type="button"
                onClick={onOpenBuyCoins}
                className="w-full sm:w-auto px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md"
              >
                <span>Buy Coins Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || wordCount < 300}
                className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md"
                id="btn-ad-publish-submit"
              >
                {loading ? 'Publishing Listing...' : 'Publish Ad'}
              </button>
            )}
          </div>

        </form>
      )}

    </div>
  );
}