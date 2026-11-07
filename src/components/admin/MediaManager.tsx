import React, { useState, useEffect } from 'react';
import {
  Image,
  Video,
  Plus,
  Trash2,
  Play,
  Upload,
  Sparkles,
  Scissors,
  ShoppingBag,
  QrCode,
  Globe,
  Palette,
  Eye,
  CheckCircle,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { dataService } from '../../lib/data';
import { uploadMedia } from '../../lib/storage';

export function MediaManager() {
  const [activeCategory, setActiveCategory] = useState<
    'identidade' | 'banners' | 'videos_916' | 'galeria' | 'produtos' | 'cortes' | 'atendimento' | 'pix'
  >('banners');

  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [pixConfig, setPixConfig] = useState<any>(null);

  // Forms and Modals
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('/src/assets/images/carousel_salon_1_1793799835801.jpg');
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [showAddVideo, setShowAddVideo] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoAuthor, setVideoAuthor] = useState('');
  const [videoThumb, setVideoThumb] = useState('/src/assets/images/vertical_salon_style_1_1793799836206.jpg');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Media preview modal
  const [previewMediaUrl, setPreviewMediaUrl] = useState<string | null>(null);

  const loadMedia = async () => {
    setLoading(true);
    const [bRes, vRes, pRes, pixRes] = await Promise.all([
      dataService.getBanners(),
      dataService.getVideos916(),
      dataService.getProducts(),
      dataService.getPixConfig()
    ]);
    if (bRes.data) setBanners(bRes.data);
    if (vRes.data) setVideos(vRes.data);
    if (pRes.data) setProducts(pRes.data);
    if (pixRes.data) setPixConfig(pixRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'banner' | 'video_file' | 'video_thumb' | 'product_img' | 'pix_qr'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (target === 'banner') {
        setUploadingBanner(true);
        const url = await uploadMedia('media-banners', 'banners/banner', file);
        setBannerUrl(url);
      } else if (target === 'video_file') {
        setUploadingVideo(true);
        const url = await uploadMedia('media-banners', 'videos/story', file);
        setVideoUrl(url);
      } else if (target === 'video_thumb') {
        setUploadingVideo(true);
        const url = await uploadMedia('media-banners', 'thumbnails/thumb', file);
        setVideoThumb(url);
      }
    } catch {
      // FileReader Base64 fallback if storage bucket fails
      const reader = new FileReader();
      reader.onload = ev => {
        const result = ev.target?.result as string;
        if (target === 'banner') setBannerUrl(result);
        if (target === 'video_file') setVideoUrl(result);
        if (target === 'video_thumb') setVideoThumb(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingBanner(false);
      setUploadingVideo(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim()) return;

    await dataService.addBanner({
      title: bannerTitle,
      subtitle: bannerSubtitle,
      image_url: bannerUrl,
      tag: 'Destaque VIP',
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
    if (!confirm('Deseja realmente remover este banner do carrossel?')) return;
    await dataService.deleteBanner(id);
    await loadMedia();
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm('Deseja realmente remover esta mídia 9:16?')) return;
    await dataService.deleteVideo916(id);
    await loadMedia();
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-left">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-gray-950 via-amber-950/30 to-gray-950 border border-amber-500/30 p-5 sm:p-6 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 text-black shadow-lg shadow-amber-500/20 shrink-0">
            <FolderOpen size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Central de Mídias e Uploads (Exclusivo ADM)
            </h2>
            <p className="text-xs text-gray-300 mt-0.5">
              Envie, organize, substitua e gerencie todas as imagens e vídeos oficiais do aplicativo.
            </p>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 overflow-x-auto custom-scrollbar">
        {[
          { id: 'banners', label: 'Carrossel & Banners', icon: Image },
          { id: 'videos_916', label: 'Vídeos & Fotos 9:16', icon: Video },
          { id: 'produtos', label: 'Fotos de Produtos', icon: ShoppingBag },
          { id: 'cortes', label: 'Cortes & Tranças', icon: Scissors },
          { id: 'pix', label: 'QR Code Pix', icon: QrCode },
          { id: 'identidade', label: 'Identidade Visual', icon: Palette },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-amber-500 text-black font-black shadow-lg shadow-amber-500/20' 
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              <Icon size={15} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category 1: Banners */}
      {activeCategory === 'banners' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Banners do Carrossel Principal ({banners.length})
            </h3>
            <button
              onClick={() => setShowAddBanner(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md hover:from-amber-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>Adicionar Novo Banner</span>
            </button>
          </div>

          {/* Form Modal */}
          {showAddBanner && (
            <form onSubmit={handleCreateBanner} className="p-5 bg-gray-950 border border-amber-500/40 rounded-3xl space-y-4 animate-in fade-in">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                Cadastrar Banner no Carrossel
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Título do Banner"
                  value={bannerTitle}
                  onChange={e => setBannerTitle(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Subtítulo / Descrição"
                  value={bannerSubtitle}
                  onChange={e => setBannerSubtitle(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">Imagem do Banner</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30 cursor-pointer flex items-center gap-2 shrink-0">
                    <Upload size={14} />
                    <span>{uploadingBanner ? 'Carregando...' : 'Enviar Arquivo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload(e, 'banner')}
                      className="hidden"
                      disabled={uploadingBanner}
                    />
                  </label>
                  <input
                    type="text"
                    value={bannerUrl}
                    onChange={e => setBannerUrl(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-gray-300"
                    placeholder="Ou informe a URL da imagem"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBanner(false)}
                  className="px-4 py-2 bg-gray-900 text-gray-400 font-bold rounded-xl text-xs hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-black font-extrabold rounded-xl text-xs shadow-md"
                >
                  Salvar Banner
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banners.map(ban => (
              <div key={ban.id} className="p-4 bg-gray-950 border border-gray-800 rounded-3xl space-y-3 relative group">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-gray-800 relative">
                  <img src={ban.image_url} alt={ban.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteBanner(ban.id)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-black/80 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
                    title="Remover Banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white truncate">{ban.title}</h4>
                  <p className="text-xs text-gray-400 truncate">{ban.subtitle || 'Banner Ativo'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category 2: Videos 9:16 */}
      {activeCategory === 'videos_916' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Vídeos & Fotos Verticais 9:16 ({videos.length})
            </h3>
            <button
              onClick={() => setShowAddVideo(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-md hover:from-amber-300 cursor-pointer"
            >
              <Plus size={16} />
              <span>Cadastrar Mídia 9:16</span>
            </button>
          </div>

          {/* Form Modal */}
          {showAddVideo && (
            <form onSubmit={handleCreateVideo} className="p-5 bg-gray-950 border border-amber-500/40 rounded-3xl space-y-4 animate-in fade-in">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                Cadastrar Mídia Vertical 9:16
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Título da Mídia (Ex: Morena Iluminada)"
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Autor / Especialista (Ex: Carla Silva)"
                  value={videoAuthor}
                  onChange={e => setVideoAuthor(e.target.value)}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-300 font-bold block">Thumbnail (Foto de Capa)</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-amber-400 font-bold rounded-xl text-xs border border-amber-500/30 cursor-pointer flex items-center gap-2 shrink-0">
                    <Upload size={14} />
                    <span>Enviar Capa</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload(e, 'video_thumb')}
                      className="hidden"
                    />
                  </label>
                  <input
                    type="text"
                    value={videoThumb}
                    onChange={e => setVideoThumb(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-xs text-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddVideo(false)}
                  className="px-4 py-2 bg-gray-900 text-gray-400 font-bold rounded-xl text-xs hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-black font-extrabold rounded-xl text-xs shadow-md"
                >
                  Salvar Mídia
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {videos.map(vid => (
              <div key={vid.id} className="p-3 bg-gray-950 border border-gray-800 rounded-3xl space-y-2 relative group text-left">
                <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-gray-800 relative">
                  <img src={vid.thumbnail} alt={vid.title} className="w-full h-full object-cover opacity-85" />
                  <button
                    onClick={() => handleDeleteVideo(vid.id)}
                    className="absolute top-2 right-2 p-2 rounded-xl bg-black/80 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-md cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h4 className="text-xs font-bold text-white truncate">{vid.title}</h4>
                <p className="text-[10px] text-amber-400 font-medium truncate">{vid.author || 'Bela Mulher'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category 3: Products */}
      {activeCategory === 'produtos' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Fotos de Produtos Cadastrados ({products.length})
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {products.map(prod => (
              <div key={prod.id} className="p-3 bg-gray-950 border border-gray-800 rounded-3xl space-y-2 text-left">
                <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-gray-800">
                  <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-xs font-bold text-white truncate">{prod.name}</h4>
                <span className="text-[10px] text-amber-400 font-bold block">
                  R$ {Number(prod.sale_price).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category 4: Cortes & Tranças */}
      {activeCategory === 'cortes' && (
        <div className="p-6 bg-gray-950 border border-amber-500/30 rounded-3xl text-center space-y-3">
          <Scissors size={28} className="text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Catálogo Mídia de Cortes, Tranças e Penteados</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            Todas as fotos de modelos de tranças, cortes e penteados vinculadas à Galeria e ao Chat Inteligente são gerenciadas automaticamente e sincronizadas com a nuvem Supabase.
          </p>
        </div>
      )}

      {/* Category 5: QR Code Pix */}
      {activeCategory === 'pix' && (
        <div className="p-6 bg-gray-950 border border-amber-500/30 rounded-3xl space-y-4 text-center">
          <QrCode size={28} className="text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-white">QR Code Pix do Salão</h3>
          <p className="text-xs text-gray-300 max-w-md mx-auto">
            A imagem do QR Code oficial do Pix pode ser substituída diretamente na seção de Pagamentos e Pix do Painel ADM.
          </p>
          <div className="w-36 h-36 mx-auto rounded-2xl bg-white p-2 border border-amber-500/40 overflow-hidden">
            <img src={pixConfig?.qrcode_url || '/src/assets/images/service_showcase_1_1793799836251.jpg'} alt="Pix QR" className="w-full h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
