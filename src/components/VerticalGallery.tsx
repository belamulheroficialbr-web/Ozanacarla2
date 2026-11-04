import React, {useState, useEffect} from 'react';
import {Play, X, Sparkles, User} from 'lucide-react';
import {dataService} from '../lib/data';

export function VerticalGallery() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);

  useEffect(() => {
    dataService.getVideos916().then(res => {
      if (res.data && res.data.length > 0) {
        setVideos(res.data);
      }
    });
  }, []);

  if (videos.length === 0) return null;

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          <Sparkles size={16} className="text-amber-400" />
          <span>Vídeos & Histórias Verticais (9:16)</span>
        </h3>
        <span className="text-xs text-gray-400">Salão Bela Mulher</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {videos.map(vid => (
          <button
            key={vid.id}
            onClick={() => setSelectedVideo(vid)}
            className="group relative aspect-[9/16] rounded-2xl overflow-hidden border border-gray-800 bg-gray-950 text-left transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/10 focus:outline-none"
          >
            <img
              src={vid.thumbnail}
              alt={vid.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-between">
              <div className="self-end p-1.5 rounded-full bg-amber-500/80 text-black shadow-lg">
                <Play size={14} fill="currentColor" />
              </div>

              <div>
                <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest block">
                  {vid.author || 'Bela Mulher'}
                </span>
                <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">
                  {vid.title}
                </h4>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal Video Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X size={20} />
            </button>

            <video
              src={selectedVideo.video_url}
              controls
              autoPlay
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/70 backdrop-blur-sm border border-gray-800 rounded-2xl space-y-1">
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                {selectedVideo.author}
              </span>
              <h4 className="text-xs font-bold text-white">{selectedVideo.title}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
