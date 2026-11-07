import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { dataService } from '../lib/data';

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  tag?: string;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'ban-1',
    title: 'Transformação Capilar Premium',
    subtitle: 'Mechas, Balayage e Nutrição Profissional de Alto Padrão',
    image_url: '/src/assets/images/carousel_salon_1_1793799835801.jpg',
    tag: 'Destaque VIP'
  },
  {
    id: 'ban-2',
    title: 'Esmaltação em Gel & Nail Art',
    subtitle: 'Unhas impecáveis com brilho acetinado e durabilidade prolongada',
    image_url: '/src/assets/images/carousel_salon_2_1793799837071.jpg',
    tag: 'Unhas & Spa'
  },
  {
    id: 'ban-3',
    title: 'Tratamentos & Reconstrução Ouro 24k',
    subtitle: 'Terapia profunda de reposição de massa e restauração dos fios',
    image_url: '/src/assets/images/service_showcase_2_1793799836229.jpg',
    tag: 'Terapia Capilar'
  },
  {
    id: 'ban-4',
    title: 'Design de Sobrancelhas & Estética',
    subtitle: 'Mapeamento facial e realce da beleza natural com especialistas',
    image_url: '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
    tag: 'Estética VIP'
  }
];

export function Carousel() {
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    dataService.getBanners().then(res => {
      if (isMounted && res.data && res.data.length > 0) {
        // Merge with defaults if fewer than 2 banners
        if (res.data.length >= 2) {
          setBanners(res.data);
        } else {
          setBanners([...res.data, ...DEFAULT_BANNERS.slice(res.data.length)]);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Automatic Smooth Sliding
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % banners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [banners.length, isPaused]);

  const handlePrev = () => {
    setIndex(prev => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex(prev => (prev + 1) % banners.length);
  };

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full h-72 sm:h-88 md:h-[420px] overflow-hidden rounded-[2rem] border border-amber-500/40 shadow-2xl shadow-amber-500/10 bg-black group select-none ring-1 ring-amber-500/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slides with Crossfade Animation */}
      {banners.map((item, i) => {
        const isActive = i === index;
        return (
          <div
            key={item.id || i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-7000 ease-out transform scale-100 group-hover:scale-105"
            />
            {/* Elegant Luxury Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-5 sm:p-7 md:p-9">
              <span className="text-[10px] sm:text-xs font-black text-amber-300 uppercase tracking-widest inline-flex items-center gap-1.5 mb-2 self-start bg-gradient-to-r from-black/90 to-gray-950/80 px-3 py-1 rounded-full border border-amber-500/40 backdrop-blur-md shadow-md">
                <Sparkles size={12} className="text-amber-400" />
                {item.tag || 'Destaque VIP Bela Mulher'}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-lg leading-tight line-clamp-2">
                {item.title}
              </h2>
              {item.subtitle && (
                <p className="text-xs sm:text-sm md:text-base text-gray-200/90 font-medium max-w-2xl mt-1.5 line-clamp-2 drop-shadow leading-relaxed">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Manual Navigation Controls (Left / Right) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-amber-500 text-white hover:text-black border border-amber-500/40 hover:border-amber-400 transition-all opacity-80 group-hover:opacity-100 active:scale-90 shadow-xl cursor-pointer"
            aria-label="Banner anterior"
            title="Anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-black/70 hover:bg-amber-500 text-white hover:text-black border border-amber-500/40 hover:border-amber-400 transition-all opacity-80 group-hover:opacity-100 active:scale-90 shadow-xl cursor-pointer"
            aria-label="Próximo banner"
            title="Próximo"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Indicadores no Rodapé do Banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-5 sm:right-8 flex items-center gap-2 z-20">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                i === index
                  ? 'w-8 bg-gradient-to-r from-amber-400 to-amber-500 shadow-md shadow-amber-500/50'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Ir para banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
