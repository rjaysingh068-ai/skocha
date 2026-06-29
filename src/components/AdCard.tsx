import React, { useState } from 'react';
import { Phone, MessageSquare, Eye, Heart, Calendar, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Ad } from '../types.ts';

interface AdCardProps {
  key?: string;
  ad: Ad;
}

export default function AdCard({ ad }: AdCardProps) {
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // Custom formatted WhatsApp message
  const whatsappText = `Hey I saw your add on Skocha for ${ad.category}. Is it available now?`;
  const whatsappUrl = `https://wa.me/91${ad.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappText)}`;
  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ad.photos.length > 1) {
      setCurrentPhotoIdx((prev) => (prev + 1) % ad.photos.length);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (ad.photos.length > 1) {
      setCurrentPhotoIdx((prev) => (prev - 1 + ad.photos.length) % ad.photos.length);
    }
  };

  return (
    <div 
      className={`relative flex flex-col md:flex-row bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        ad.type === 'paid' 
          ? 'border-amber-500/30 shadow-md shadow-amber-500/5 hover:border-amber-500/50 hover:shadow-amber-500/10' 
          : 'border-slate-800 hover:border-slate-700'
      }`}
      id={`ad-card-${ad.id}`}
    >
      {/* Photo Slideshow Container */}
      <div className="relative w-full md:w-80 h-96 md:h-auto shrink-0 bg-slate-950 overflow-hidden">
        <img
          src={ad.photos[currentPhotoIdx]}
          alt={ad.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />

        {/* Priority Ad Badge */}
        {ad.type === 'paid' && (
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase font-mono shadow-md animate-pulse">
            <Heart className="w-3 h-3 fill-slate-950" />
            <span>PRIORITY LISTING</span>
          </div>
        )}

        {/* Free Listing Badge */}
        {ad.type === 'free' && (
          <div className="absolute top-4 left-4 z-10 px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold text-[9px] tracking-wider uppercase font-mono border border-slate-700">
            FREE LISTING
          </div>
        )}

        {/* Slideshow Controllers */}
        {ad.photos.length > 1 && (
          <>
            <button
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-950/70 text-white hover:bg-slate-950 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Slideshow Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
              {ad.photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === currentPhotoIdx ? 'bg-amber-500 w-3' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Ad Details Content Section */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        
        <div>
          {/* Header Row: Category and Location */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5">
            <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
              {ad.category}
            </span>
            
            <span className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
              <MapPin className="w-3.5 h-3.5 text-amber-500" />
              <span>{ad.location}</span>
            </span>

            <span className="flex items-center space-x-1 text-[10px] text-slate-500 font-mono ml-auto">
              <Calendar className="w-3 h-3" />
              <span>Expires: {new Date(ad.expiresAt).toLocaleDateString()}</span>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
            {ad.title}
          </h3>

          {/* Verification Attributes Grid */}
          <div className="grid grid-cols-5 gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl mb-4 text-center">
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Eyes</p>
              <p className="text-xs font-semibold text-slate-300 font-mono">{ad.attributes.eyes}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Chest</p>
              <p className="text-xs font-semibold text-slate-300 font-mono">{ad.attributes.chest}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Height</p>
              <p className="text-xs font-semibold text-slate-300 font-mono">{ad.attributes.height}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Hair</p>
              <p className="text-xs font-semibold text-slate-300 font-mono">{ad.attributes.hair}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Figure</p>
              <p className="text-xs font-semibold text-slate-300 font-mono">{ad.attributes.figure}</p>
            </div>
          </div>

          {/* Description Bio */}
          <div className="text-sm text-slate-300 leading-relaxed line-clamp-4 md:line-clamp-5 whitespace-pre-line font-light">
            {ad.bio}
          </div>
        </div>

        {/* CTA Direct Actions Block */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 border-t border-slate-800 pt-4">
          
          <a
            href={`tel:${ad.phone}`}
            id={`btn-call-${ad.id}`}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-transparent border border-amber-500/30 hover:border-amber-500 text-amber-400 hover:text-amber-300 hover:bg-amber-500/5 font-bold text-sm transition-all shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Direct Call</span>
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            id={`btn-whatsapp-${ad.id}`}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold text-sm transition-all shadow-md shadow-[#25D366]/5"
          >
            <MessageSquare className="w-4 h-4 fill-slate-950" />
            <span>Chat via WhatsApp</span>
          </a>

        </div>

      </div>
    </div>
  );
}
