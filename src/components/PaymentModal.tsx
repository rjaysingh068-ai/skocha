import React, { useState } from 'react';
import { X, QrCode, Coins, CheckCircle, AlertCircle, Sparkles, Copy, Check } from 'lucide-react';
import { Profile, COIN_PACKAGES, CoinPackage } from '../types.ts';

interface PaymentModalProps {
  currentAgent: Profile;
  onClose: () => void;
  onTransactionSubmitted: () => void;
}

export default function PaymentModal({
  currentAgent,
  onClose,
  onTransactionSubmitted
}: PaymentModalProps) {
  const [selectedPack, setSelectedPack] = useState<CoinPackage>(COIN_PACKAGES[2]); // Default to 50 Coins
  const [utrNumber, setUtrNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Copy helper
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handlePackageSelect = (pack: CoinPackage) => {
    setSelectedPack(pack);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Check UTR regex (exactly 12 digits)
    const isTwelveDigits = /^\d{12}$/.test(utrNumber);
    if (!isTwelveDigits) {
      setError('The UPI UTR reference number must be exactly 12 numeric digits.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: currentAgent.id,
          utrNumber,
          amount: selectedPack.price,
          coins: selectedPack.coins
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit payment details.');
      }

      setSuccess(`UTR Transaction Submitted! Your reference ${utrNumber} is pending manual confirmation. Coins will be credited to your balance within 5 minutes.`);
      setUtrNumber('');
      onTransactionSubmitted();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/5 animate-in fade-in zoom-in-95 duration-200 my-8"
        id="payment-modal-content"
      >
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors z-10"
          id="btn-payment-close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Headline */}
          <div className="text-center mb-6">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              <Coins className="w-6 h-6 text-amber-500 animate-bounce" />
              <span>Purchase Skocha Coins</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Top up your balance instantly to promote listings to Priority & drive maximum client leads!
            </p>
          </div>

          {success ? (
            <div className="p-6 text-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 shadow-inner" id="payment-success-msg">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3 animate-pulse" />
              <h3 className="text-lg font-bold text-white mb-2">Transaction Registered</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{success}</p>
              <div className="inline-block px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold font-mono rounded tracking-wide">
                🚀 5-MINUTE CREDIT PROMISE
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Packages Selection */}
              <div>
                <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">1. Select Coin Package</h3>
                <div className="space-y-2">
                  {COIN_PACKAGES.map((pack) => (
                    <div
                      key={pack.id}
                      onClick={() => handlePackageSelect(pack)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                        selectedPack.id === pack.id
                          ? 'border-amber-500 bg-amber-500/5 shadow-md'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                      }`}
                      id={`pack-option-${pack.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedPack.id === pack.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-amber-500'}`}>
                          <Coins className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-white">{pack.coins} Coins</p>
                          <p className="text-[10px] text-slate-400">Best for posting premium priority ads</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold font-mono text-amber-400">₹{pack.price}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-left">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Package Breakdown</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    You selected <strong className="text-white">{selectedPack.coins} Coins</strong> for <strong className="text-amber-500">₹{selectedPack.price}</strong>. This provides enough credit for <strong className="text-white">{(selectedPack.coins / 4).toFixed(0)} Paid Ads</strong> (7 days each).
                  </p>
                </div>
              </div>

              {/* Right Column: QR Code + Direct Payment Form */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">2. Pay via UPI App</h3>
                  
                  {/* Actual dynamically generated UPI QR Code */}
                  <div className="flex flex-col items-center p-4 bg-slate-950/60 border border-slate-800 rounded-xl mb-3 text-center">
                    <div className="w-32 h-32 bg-white p-1.5 rounded-lg flex items-center justify-center relative group shadow-lg mb-2">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`upi://pay?pa=9898783284@ptaxis&pn=SKOCHA&am=${selectedPack.price}&cu=INR`)}`} 
                        alt="UPI QR Code" 
                        className="w-28 h-28"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/80 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                      </div>
                    </div>
                    <div className="w-full text-center">
                      <p className="text-xs font-bold text-white mb-1">Scan UPI QR Code</p>
                      <p className="text-[10px] text-slate-400 leading-snug mb-3">
                        Use PhonePe, GooglePay, Paytm, or any UPI app to scan & pay <strong className="text-amber-400">₹{selectedPack.price}</strong>.
                      </p>
                      
                      {/* Deep Link for Mobile Users */}
                      <a 
                        href={`upi://pay?pa=9898783284@ptaxis&pn=SKOCHA&am=${selectedPack.price}&cu=INR`}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-md transition-colors shadow-sm mb-3 cursor-pointer"
                        id="btn-upi-deeplink"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pay via UPI App Directly</span>
                      </a>

                      {/* Display UPI ID with Copy Option */}
                      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono w-full">
                        <span className="text-slate-400">UPI ID:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-200 font-bold">9898783284@ptaxis</span>
                          <button 
                            type="button"
                            onClick={() => copyToClipboard('9898783284@ptaxis', 'upi-id')} 
                            className="p-1 text-slate-500 hover:text-white rounded transition-colors"
                          >
                            {copiedText === 'upi-id' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Account Details Box */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl mb-4 text-left relative overflow-hidden">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Or Direct Bank Transfer Details</p>
                    
                    <div className="space-y-1.5 text-xs font-mono">
                      
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">A/C Holder:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-200 font-bold">JAY SINGH</span>
                          <button onClick={() => copyToClipboard('JAY SINGH', 'holder')} className="p-1 text-slate-500 hover:text-white rounded">
                            {copiedText === 'holder' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Bank Account No:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-200 font-bold">31320100021487</span>
                          <button onClick={() => copyToClipboard('31320100021487', 'acc')} className="p-1 text-slate-500 hover:text-white rounded">
                            {copiedText === 'acc' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">IFSC Code:</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-slate-200 font-bold">BARB0ASPURX</span>
                          <button onClick={() => copyToClipboard('BARB0ASPURX', 'ifsc')} className="p-1 text-slate-500 hover:text-white rounded">
                            {copiedText === 'ifsc' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start space-x-2 text-xs text-red-400 mb-3 text-left">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submission Form */}
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="text-left">
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Enter 12-digit UPI UTR Number</label>
                      <input
                        type="text"
                        required
                        pattern="\d{12}"
                        maxLength={12}
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="e.g., 617482930128"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 font-mono placeholder-slate-700 focus:outline-none focus:border-amber-500/50"
                      />
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                        Submit the 12-digit numeric reference from your payment confirmation screen to unlock coins.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || utrNumber.length !== 12}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-lg text-sm transition-all shadow-md mt-2"
                      id="btn-payment-submit"
                    >
                      {loading ? 'Submitting Reference...' : 'Submit Transaction'}
                    </button>
                  </form>
                </div>
              </div>

            </div>
          )}

          {/* Prompt close text */}
          <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between text-[11px] text-slate-400">
            <span>Locked with 256-bit bank level SSL encryption.</span>
            <span className="font-bold text-amber-500 font-sans">Skocha Coin Verification Engine</span>
          </div>

        </div>
      </div>
    </div>
  );
}
