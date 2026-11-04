import React, {useState, useEffect} from 'react';
import {dataService} from '../lib/data';

export function Carousel() {
  const [banners, setBanners] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    dataService.getBanners().then(res => {
      if (res.data && res.data.length > 0) {
        setBanners(res.data);
      }
    });
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-3xl bg-gray-900 border border-gray-800">
        <img
          src="/src/assets/images/carousel_salon_1_1793799835801.jpg"
          alt="Bela Mulher"
          className="w-full h-full object-cover opacity-90"
        />
      </div>
    );
  }

  const current = banners[index];

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-3xl border border-gray-800 shadow-2xl group">
      <img
        src={current.image_url}
        alt={current.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 md:p-6">
        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">
          Destaques Bela Mulher
        </span>
        <h3 className="text-lg md:text-2xl font-bold text-white tracking-tight">
          {current.title}
        </h3>
        {current.subtitle && (
          <p className="text-xs md:text-sm text-gray-300 max-w-md mt-1">
            {current.subtitle}
          </p>
        )}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 right-4 flex justify-center gap-1.5 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
