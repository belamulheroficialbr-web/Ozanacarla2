import React, {useState, useEffect} from 'react';
import {Play, X, Sparkles, User, Image, Film, Eye} from 'lucide-react';
import {dataService} from '../lib/data';

interface MediaItem {
  id: string;
  type: 'video' | 'photo';
  title: string;
  media_url: string;
  thumbnail: string;
  author?: string;
  tag?: string;
}

const DEFAULT_PHOTOS_916: MediaItem[] = [
  {
    id: 'photo-1',
    type: 'photo',
    title: 'Transformação Loiro Dourado Perolado',
    media_url: '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
    thumbnail: '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
    author: 'Equipe Bela Mulher',
    tag: 'Cabelos & Mechas'
  },
  {
    id: 'photo-2',
    type: 'photo',
    title: 'Design de Unhas em Gel & Nail Art Ouro',
    media_url: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    thumbnail: '/src/assets/images/service_showcase_1_1793799836251.jpg',
    author: 'Juliana Mendes',
    tag: 'Unhas & Spa'
  },
  {
    id: 'photo-3',
    type: 'photo',
    title: 'Tratamento & Hidratação Ouro 24k',
    media_url: '/src/assets/images/service_showcase_2_1793799836229.jpg',
    thumbnail: '/src/assets/images/service_showcase_2_1793799836229.jpg',
    author: 'Carla Silva',
    tag: 'Tratamentos'
  }
];

export function VerticalGallery() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'todos' | 'videos' | 'fotos'>('todos');

  useEffect(() => {
    dataService.getVideos916().then(res => {
      const videoItems: MediaItem[] = (res.data || []).map((v: any) => ({
        id: v.id,
        type: 'video',
        title: v.title,
        media_url: v.video_url,
        thumbnail: v.thumbnail || '/src/assets/images/vertical_salon_style_1_1793799836206.jpg',
        author: v.author || 'Bela Mulher',
        tag: 'Vídeo 9:16'
      }));

      // Combine real videos with showcase photos
      setItems([...videoItems, ...DEFAULT_PHOTOS_916]);
    });
  }, []);

  const filteredItems = items.filter(item => {
    if (activeFilter === 'videos') return item.type === 'video';
    if (activeFilter === 'fotos') return item.type === 'photo';
    return true;
  });

  if (items.length === 0) return null;

  return (
    <div className="space-y-5 mt-8">
      {/* Header and Filter Pills for "NOSSOS TRABALHOS" */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-500/25">
        <div>
          <span className="text-[10px] sm:text-[11px] text-amber-400 font-extrabold uppercase tracking-widest block mb-0.5">
            Produções VIP & Resultados Reais
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Sparkles size={20} className="text-amber-400" />
            <span>Nossos Trabalhos</span>
          </h3>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-950 p-1 rounded-2xl border border-amber-500/30 self-start sm:self-center shadow-lg">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'todos' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Todos ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('videos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'videos' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Film size={13} />
            <span>Vídeos</span>
          </button>
          <button
            onClick={() => setActiveFilter('fotos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'fotos' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-md font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Image size={13} />
            <span>Fotos</span>
          </button>
        </div>
      </div>

      {/* Responsive Grid: STRICTLY 1 column on mobile (< sm), 2 columns on tablet, 3 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => (
          <div
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative aspect-[9/16] rounded-[2rem] overflow-hidden border border-amber-500/25 bg-gray-950 text-left transition-all duration-300 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 cursor-pointer shadow-xl ring-1 ring-amber-500/10"
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20 p-5 flex flex-col justify-between">
              {/* Top Tag & Indicator */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/40 shadow-md">
                  {item.tag || (item.type === 'video' ? 'Vídeo 9:16' : 'Foto 9:16')}
                </span>

                <div className="p-2.5 rounded-full bg-amber-500 text-black shadow-xl group-hover:scale-110 transition-transform">
                  {item.type === 'video' ? <Play size={15} fill="currentColor" /> : <Eye size={15} />}
                </div>
              </div>

              {/* Bottom Caption */}
              <div className="space-y-1 bg-black/75 backdrop-blur-md p-3.5 rounded-2xl border border-amber-500/20">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                  {item.author || 'Salão Bela Mulher'}
                </span>
                <h4 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-amber-200 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] text-gray-300/80 font-medium">
                  Toque para {item.type === 'video' ? 'assistir em tela cheia' : 'ampliar foto'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Media Player / Viewer */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl"
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors border border-gray-800"
              aria-label="Fechar"
            >
              <X size={18} />
            </button>

            {selectedItem.type === 'video' ? (
              <video
                src={selectedItem.media_url}
                controls
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={selectedItem.media_url}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
            )}

            <div className="absolute bottom-4 left-4 right-4 p-4 bg-black/80 backdrop-blur-md border border-gray-800 rounded-2xl space-y-1 pointer-events-none">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                {selectedItem.author}
              </span>
              <h4 className="text-sm font-bold text-white">{selectedItem.title}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
