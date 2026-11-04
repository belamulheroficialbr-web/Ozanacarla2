import React, {useState, useEffect} from 'react';
import {Image, Video, Plus, Trash2, Play} from 'lucide-react';
import {dataService} from '../../lib/data';

export function MediaManager() {
  const [activeTab, setActiveTab] = useState<'banners' | 'videos'>('banners');
  const [banners, setBanners] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Banner form
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/src/assets/images/carousel_salon_1_1793799835801.jpg');

  // New Video form
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAuthor, setVideoAuthor] = useState('');
  const [videoThumb, setVideoThumb] = useState('/src/assets/images/vertical_salon_style_1_1793799836206.jpg');

  const loadMedia = async () => {
    setLoading(true);
    const [bRes, vRes] = await Promise.all([
      dataService.getBanners(),
      dataService.getVideos916()
    ]);
    if (bRes.data) setBanners(bRes.data);
    if (vRes.data) setVideos(vRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    await dataService.addBanner({
      title: bannerTitle,
      subtitle: bannerSubtitle,
      image_url: bannerUrl,
      link_type: 'general',
      is_active: true
    });

    setBannerTitle('');
    setBannerSubtitle('');
    setShowAddBanner(false);
    await loadMedia();
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    await dataService.addVideo916({
      title: videoTitle,
      video_url: videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-stylist-washing-a-clients-hair-in-a-salon-43407-large.mp4',
      thumbnail: videoThumb,
      author: videoAuthor || 'Equipe Bela Mulher'
    });

    setVideoTitle('');
    setVideoUrl('');
    setShowAddVideo(false);
    await loadMedia();
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm('Deseja excluir este banner?')) {
      await dataService.deleteBanner(id);
      await loadMedia();
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (confirm('Deseja excluir este vídeo 9:16?')) {
      await dataService.deleteVideo916(id);
      await loadMedia();
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-gray-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Image size={18} className="text-amber-400" />
            <span>Gestão de Banners & Vídeos 9:16</span>
          </h3>
          <p className="text-xs text-gray-400">Gerencie a vitrine de destaque e as histórias em vídeo na página inicial.</p>
        </div>
      </div>

      <div className="flex border-b border-gray-800 gap-2">
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all ${
            activeTab === 'banners'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Banners Promocionais ({banners.length})
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-2.5 px-4 text-xs font-bold transition-all ${
            activeTab === 'videos'
              ? 'text-amber-400 border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Vídeos Verticais 9:16 ({videos.length})
        </button>
      </div>

      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddBanner(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Adicionar Banner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {banners.map(b => (
              <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                <img src={b.image_url} alt={b.title} className="w-full h-36 object-cover" />
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h5 className="font-bold text-white text-xs">{b.title}</h5>
                    <p className="text-[11px] text-gray-400">{b.subtitle}</p>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-gray-800">
                    <button
                      onClick={() => handleDeleteBanner(b.id)}
                      className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddVideo(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus size={15} />
              <span>Adicionar Vídeo Story 9:16</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {videos.map(v => (
              <div key={v.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="relative aspect-[9/16] bg-black">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-2.5 rounded-full bg-amber-500/80 text-black">
                      <Play size={18} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-white text-xs truncate">{v.title}</h5>
                    <p className="text-[10px] text-gray-400 truncate">{v.author}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteVideo(v.id)}
                    className="mt-2 text-red-400 hover:text-red-300 text-[11px] flex items-center gap-1"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Banner */}
      {showAddBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateBanner} className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-3">
            <h4 className="text-base font-bold text-white pb-2 border-b border-gray-800">Novo Banner</h4>
            <div>
              <label className="text-xs text-gray-300 block mb-1">Título do Banner</label>
              <input
                type="text"
                required
                value={bannerTitle}
                onChange={e => setBannerTitle(e.target.value)}
                placeholder="Ex: Especial de Verão"
                className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-1">Subtítulo</label>
              <input
                type="text"
                value={bannerSubtitle}
                onChange={e => setBannerSubtitle(e.target.value)}
                placeholder="Ex: Desconto exclusivo em pacotes capilares"
                className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-1">URL da Imagem</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={e => setBannerUrl(e.target.value)}
                className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowAddBanner(false)} className="w-1/2 py-2 bg-gray-800 text-xs text-gray-300 rounded-xl font-bold">Cancelar</button>
              <button type="submit" className="w-1/2 py-2 bg-amber-600 text-xs text-white rounded-xl font-bold">Salvar Banner</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Video */}
      {showAddVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateVideo} className="w-full max-w-md bg-gray-900 border border-gray-800 p-6 rounded-3xl space-y-3">
            <h4 className="text-base font-bold text-white pb-2 border-b border-gray-800">Novo Vídeo Vertical 9:16</h4>
            <div>
              <label className="text-xs text-gray-300 block mb-1">Título do Vídeo</label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={e => setVideoTitle(e.target.value)}
                placeholder="Ex: Antes e Depois Mechas"
                className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-1">Autor / Profissional</label>
              <input
                type="text"
                value={videoAuthor}
                onChange={e => setVideoAuthor(e.target.value)}
                placeholder="Ex: Carla Silva"
                className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-gray-300 block mb-1">URL do Vídeo (mp4)</label>
              <input
                type="text"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 bg-black border border-gray-700 rounded-xl text-white text-xs"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowAddVideo(false)} className="w-1/2 py-2 bg-gray-800 text-xs text-gray-300 rounded-xl font-bold">Cancelar</button>
              <button type="submit" className="w-1/2 py-2 bg-amber-600 text-xs text-white rounded-xl font-bold">Salvar Vídeo</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
