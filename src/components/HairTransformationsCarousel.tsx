import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Scissors, Calendar } from 'lucide-react';

interface TransformationItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  tag: string;
}

const TRANSFORMATIONS: TransformationItem[] = [
  {
    id: 'trans-1',
    category: 'Cortes & Visagismo',
    title: 'Cortes Tendência & Visagismo',
    subtitle: 'Harmonização facial e estilo único',
    description: 'Long bob assimétrico, camadas iluminadas, corte borboleta e pixie sofisticado.',
    image_url: '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
    tag: 'Cortes Exclusivos'
  },
  {
    id: 'trans-2',
    category: 'Coloração & Mechas',
    title: 'Balayage & Loiros Perolados',
    subtitle: 'Técnica internacional sem quebra',
    description: 'Morena iluminada, baby lights, loiro platinado e correção de tonalidade com proteção capilar.',
    image_url: '/src/assets/images/carousel_salon_1_1793799835801.jpg',
    tag: 'Colorimetria VIP'
  },
  {
    id: 'trans-3',
    category: 'Penteados & Festas',
    title: 'Penteados VIP & Madrinhas',
    subtitle: 'Elegância para momentos inesquecíveis',
    description: 'Coques clássicos despojados, semipresos românticos e tranças contemporâneas de alta durabilidade.',
    image_url: '/src/assets/images/carousel_salon_2_1793799837071.jpg',
    tag: 'Produção Glamour'
  },
  {
    id: 'trans-4',
    category: 'Transformações Capilares',
    title: 'Alinhamento & Botox Orgânico',
    subtitle: 'Brilho espelhado e zero frizz',
    description: 'Reestruturação térmica com ativos nobres, selagem orgânica e redução de volume natural.',
    image_url: '/src/assets/images/service_showcase_2_1793799836229.jpg',
    tag: 'Transformação'
  },
  {
    id: 'trans-5',
    category: 'Tratamentos & Cronograma',
    title: 'Reconstrução Ouro 24k & Lipídica',
    subtitle: 'Saúde profunda fio a fio',
    description: 'Reposição intensiva de aminoácidos, colágeno vegetal e ampolas concentradas de nutrição.',
    image_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    tag: 'Terapia Capilar'
  }
];

interface HairTransformationsCarouselProps {
  onSelectCategory?: (category: string) => void;
  onOpenBooking?: () => void;
}

export function HairTransformationsCarousel({ onSelectCategory, onOpenBooking }: HairTransformationsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="space-y-3.5 w-full">
      {/* Header da Seção */}
      <div className="flex items-center justify-between px-1">
        <div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-0.5">
            Especialidades Bela Mulher
          </span>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Scissors size={18} className="text-amber-400" />
            <span>Cortes, Penteados & Coloração</span>
          </h2>
        </div>

        {/* Setas de navegação manual */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-amber-400 border border-gray-800 transition-colors active:scale-90"
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 rounded-full bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-amber-400 border border-gray-800 transition-colors active:scale-90"
            aria-label="Rolar para direita"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Carrossel Horizontal */}
      <div
        ref={scrollRef}
        className="flex gap-3.5 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory scroll-smooth"
      >
        {TRANSFORMATIONS.map(item => (
          <div
            key={item.id}
            onClick={() => {
              if (onSelectCategory) {
                onSelectCategory(item.category);
              } else if (onOpenBooking) {
                onOpenBooking();
              }
            }}
            className="snap-start shrink-0 w-64 sm:w-72 rounded-3xl overflow-hidden bg-gray-950 border border-amber-500/20 hover:border-amber-500/50 shadow-xl group transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            {/* Foto e Badge Superior */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-900">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-black/30" />
              
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md">
                  {item.tag}
                </span>
              </div>
            </div>

            {/* Informações Textuais */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest block">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-200 transition-colors mt-0.5 line-clamp-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-medium">Procedimento VIP</span>
                <span className="text-xs font-bold text-amber-400 group-hover:underline flex items-center gap-1">
                  <span>Conhecer</span>
                  <ChevronRight size={12} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
