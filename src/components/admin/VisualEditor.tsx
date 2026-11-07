import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Save,
  Eye,
  Send,
  RotateCcw,
  RotateCw,
  History,
  Plus,
  Trash2,
  Copy,
  EyeOff,
  MoveUp,
  MoveDown,
  AlignCenter,
  AlignLeft,
  AlignRight,
  CheckCircle,
  AlertTriangle,
  Move,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Sliders,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  AppLayoutConfig,
  LayoutElement,
  DEFAULT_LAYOUT_CONFIG,
  getLayoutConfig,
  saveLayoutDraft,
  publishLayoutConfig,
  getLayoutHistory
} from '../../lib/data';
import { Carousel } from '../Carousel';
import { VerticalGallery } from '../VerticalGallery';
import { uploadMedia } from '../../lib/storage';

type DeviceMode = 'mobile' | 'tablet' | 'desktop';
type SectionTab = 'home' | 'header' | 'carousel' | 'gallery' | 'menu' | 'footer';

export function VisualEditor() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [layout, setLayout] = useState<AppLayoutConfig>(DEFAULT_LAYOUT_CONFIG);

  // History Stack for Undo/Redo
  const [historyStack, setHistoryStack] = useState<AppLayoutConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // UI Modes
  const [device, setDevice] = useState<DeviceMode>('mobile');
  const [activeTab, setActiveTab] = useState<SectionTab>('home');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>('elem-header');
  
  // Modals & Panels
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAddElementModal, setShowAddElementModal] = useState(false);
  const [elementToDelete, setElementToDelete] = useState<LayoutElement | null>(null);
  const [versionHistoryList, setVersionHistoryList] = useState<any[]>([]);
  const [toastMsg, setToastMsg] = useState('');

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const elementStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // New Element Form State
  const [newElemType, setNewElemType] = useState<'button' | 'banner' | 'text_block' | 'section'>('button');
  const [newElemTitle, setNewElemTitle] = useState('');
  const [newElemContent, setNewElemContent] = useState('');
  const [newElemImgUrl, setNewElemImgUrl] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  // Load layout on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const draft = await getLayoutConfig('draft');
      setLayout(draft);
      setHistoryStack([draft]);
      setHistoryIndex(0);
      setLoading(false);
    }
    load();
  }, []);

  const pushHistoryState = (newLayout: AppLayoutConfig) => {
    const nextStack = historyStack.slice(0, historyIndex + 1);
    nextStack.push(newLayout);
    setHistoryStack(nextStack);
    setHistoryIndex(nextStack.length - 1);
    setLayout(newLayout);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setLayout(historyStack[prevIndex]);
      showToast('Ação desfeita!');
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setLayout(historyStack[nextIndex]);
      showToast('Ação refeita!');
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // 1. Save Draft
  const handleSaveDraft = async () => {
    setSaving(true);
    await saveLayoutDraft(layout);
    setSaving(false);
    showToast('Rascunho salvo no Supabase! (Versão pública mantida)');
  };

  // 2. Publish
  const handlePublish = async () => {
    setPublishing(true);
    const res = await publishLayoutConfig(layout);
    setPublishing(false);
    setShowPublishConfirm(false);
    setLayout(res.config);
    pushHistoryState(res.config);
    showToast(`Visual publicado com sucesso! Versão v${res.config.version} no ar!`);
  };

  // 3. Open History
  const handleOpenHistory = async () => {
    const list = await getLayoutHistory();
    setVersionHistoryList(list);
    setShowHistoryModal(true);
  };

  const handleRestoreVersion = (versionConfig: AppLayoutConfig) => {
    pushHistoryState({
      ...versionConfig,
      status: 'draft',
      updated_at: new Date().toISOString()
    });
    setShowHistoryModal(false);
    showToast(`Versão v${versionConfig.version} restaurada para rascunho!`);
  };

  // Directional Movements & Scaling for Selected Element
  const updateSelectedStyles = (updater: (prevStyles: LayoutElement['styles']) => LayoutElement['styles']) => {
    if (!selectedElementId) return;

    const updatedElements = layout.elements.map(el => {
      if (el.id === selectedElementId) {
        return {
          ...el,
          styles: updater(el.styles || {})
        };
      }
      return el;
    });

    pushHistoryState({
      ...layout,
      elements: updatedElements
    });
  };

  const moveElementPos = (dx: number, dy: number) => {
    updateSelectedStyles(s => ({
      ...s,
      x: (s.x || 0) + dx,
      y: (s.y || 0) + dy
    }));
  };

  const moveElementOrder = (direction: 'up' | 'down') => {
    if (!selectedElementId) return;
    const sorted = [...layout.elements].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(e => e.id === selectedElementId);
    if (idx === -1) return;

    if (direction === 'up' && idx > 0) {
      const prev = sorted[idx - 1];
      const curr = sorted[idx];
      const tempOrder = prev.order;
      prev.order = curr.order;
      curr.order = tempOrder;
    } else if (direction === 'down' && idx < sorted.length - 1) {
      const next = sorted[idx + 1];
      const curr = sorted[idx];
      const tempOrder = next.order;
      next.order = curr.order;
      curr.order = tempOrder;
    }

    pushHistoryState({
      ...layout,
      elements: sorted
    });
  };

  const alignElement = (align: 'left' | 'center' | 'right') => {
    updateSelectedStyles(s => ({
      ...s,
      textAlign: align,
      x: align === 'center' ? 0 : align === 'right' ? 20 : -20
    }));
  };

  // Pointer & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent, elemId: string) => {
    if (isPreviewMode) return;
    setSelectedElementId(elemId);
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };

    const targetElem = layout.elements.find(el => el.id === elemId);
    elementStartPos.current = {
      x: targetElem?.styles?.x || 0,
      y: targetElem?.styles?.y || 0
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedElementId || isPreviewMode) return;
    const deltaX = Math.round((e.clientX - dragStartPos.current.x) / 2);
    const deltaY = Math.round((e.clientY - dragStartPos.current.y) / 2);

    updateSelectedStyles(s => ({
      ...s,
      x: elementStartPos.current.x + deltaX,
      y: elementStartPos.current.y + deltaY
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Add Element
  const handleCreateElement = () => {
    if (!newElemTitle.trim()) return;

    const newElem: LayoutElement = {
      id: `elem-custom-${Date.now()}`,
      type: newElemType,
      title: newElemTitle.trim(),
      content: newElemContent.trim(),
      image_url: newElemImgUrl.trim(),
      order: layout.elements.length + 1,
      visible: true,
      is_protected: false,
      styles: {
        width: 100,
        padding: 12,
        borderRadius: 16,
        bgColor: '#111827',
        textColor: '#ffffff',
        textAlign: 'center'
      }
    };

    pushHistoryState({
      ...layout,
      elements: [...layout.elements, newElem]
    });

    setSelectedElementId(newElem.id);
    setShowAddElementModal(false);
    setNewElemTitle('');
    setNewElemContent('');
    setNewElemImgUrl('');
    showToast('Novo elemento criado no aplicativo!');
  };

  // Duplicate Element
  const handleDuplicateElement = (elemId: string) => {
    const original = layout.elements.find(e => e.id === elemId);
    if (!original) return;

    const copy: LayoutElement = {
      ...original,
      id: `elem-copy-${Date.now()}`,
      title: `${original.title} (Cópia)`,
      is_protected: false,
      order: layout.elements.length + 1
    };

    pushHistoryState({
      ...layout,
      elements: [...layout.elements, copy]
    });

    setSelectedElementId(copy.id);
    showToast('Elemento duplicado com sucesso!');
  };

  // Toggle Visibility
  const handleToggleVisibility = (elemId: string) => {
    const updated = layout.elements.map(e => e.id === elemId ? { ...e, visible: !e.visible } : e);
    pushHistoryState({
      ...layout,
      elements: updated
    });
  };

  // Delete Element with Confirmation
  const confirmDeleteElement = () => {
    if (!elementToDelete) return;

    if (elementToDelete.is_protected) {
      alert('Este elemento é essencial para a estrutura do aplicativo e não pode ser excluído.');
      setElementToDelete(null);
      return;
    }

    const updated = layout.elements.filter(e => e.id !== elementToDelete.id);
    pushHistoryState({
      ...layout,
      elements: updated
    });

    if (selectedElementId === elementToDelete.id) {
      setSelectedElementId(null);
    }
    setElementToDelete(null);
    showToast('Elemento excluído!');
  };

  // Image Upload Helper
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
    try {
      const url = await uploadMedia('media-banners', 'layout/elements', file);
      setNewElemImgUrl(url);
    } catch {
      const reader = new FileReader();
      reader.onload = ev => {
        setNewElemImgUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImg(false);
    }
  };

  const selectedElem = layout.elements.find(e => e.id === selectedElementId);

  if (loading) {
    return (
      <div className="p-12 text-center text-amber-400 font-bold animate-pulse">
        Carregando Editor Visual Bela Mulher...
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-full text-left font-sans">
      {/* TOAST ALERTS */}
      {toastMsg && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl font-black text-xs shadow-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. PERMANENT TOOLBAR */}
      <div className="sticky top-14 z-30 bg-gray-950 border border-amber-500/30 p-3 sm:p-4 rounded-3xl shadow-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Left: Section Tabs & Title */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 pr-3 border-r border-gray-800">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl text-black font-black">
              <Sliders size={18} />
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-widest font-black text-amber-500 block leading-none">
                Bela Mulher ADM
              </span>
              <h2 className="text-xs sm:text-sm font-black text-white">Editor Visual Live</h2>
            </div>
          </div>

          {/* Device Resolution Selector */}
          <div className="flex items-center gap-1 bg-black p-1 rounded-2xl border border-gray-800">
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                device === 'mobile' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="Prévia Celular (375px)"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline text-[11px]">Celular</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                device === 'tablet' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="Prévia Tablet (768px)"
            >
              <Tablet size={14} />
              <span className="hidden sm:inline text-[11px]">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                device === 'desktop' ? 'bg-amber-500 text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
              title="Prévia Computador (100%)"
            >
              <Monitor size={14} />
              <span className="hidden sm:inline text-[11px]">Desktop</span>
            </button>
          </div>
        </div>

        {/* Center/Right Toolbar Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 bg-black p-1 rounded-2xl border border-gray-800">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-xl text-gray-300 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
              title="Desfazer"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= historyStack.length - 1}
              className="p-1.5 rounded-xl text-gray-300 hover:text-amber-400 disabled:opacity-30 cursor-pointer"
              title="Refazer"
            >
              <RotateCw size={15} />
            </button>
          </div>

          {/* History Modal Trigger */}
          <button
            onClick={handleOpenHistory}
            className="p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-amber-400 rounded-2xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            title="Histórico de Versões"
          >
            <History size={15} />
            <span className="hidden md:inline">Histórico v{layout.version}</span>
          </button>

          {/* Preview Toggle */}
          <button
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className={`px-3 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isPreviewMode 
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                : 'bg-gray-900 hover:bg-gray-800 text-gray-200 border border-gray-800'
            }`}
          >
            <Eye size={15} />
            <span>{isPreviewMode ? 'Sair da Prévia' : 'Visualizar'}</span>
          </button>

          {/* Save Draft */}
          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={15} />}
            <span>Salvar Rascunho</span>
          </button>

          {/* Publish */}
          <button
            onClick={() => setShowPublishConfirm(true)}
            disabled={publishing}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-black rounded-2xl text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer shadow-lg shadow-amber-500/25"
          >
            <Send size={15} />
            <span>Publicar</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN LAYOUT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT / CENTER: CANVAS PREVIEW AREA */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-4">
          {/* Section Subnav */}
          <div className="w-full bg-gray-950 p-2 rounded-2xl border border-gray-800 flex items-center gap-1 overflow-x-auto custom-scrollbar">
            {[
              { id: 'home', label: 'Home Principal' },
              { id: 'header', label: 'Cabeçalho' },
              { id: 'carousel', label: 'Carrossel' },
              { id: 'gallery', label: 'Galeria 9:16' },
              { id: 'menu', label: 'Menu Lateral' },
              { id: 'footer', label: 'Rodapé Nav' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SectionTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* CANVAS CONTAINER FRAME BASED ON DEVICE MODE */}
          <div className="w-full flex justify-center bg-gray-950/80 border border-amber-500/20 p-4 rounded-3xl min-h-[600px] relative overflow-hidden shadow-2xl">
            <div
              className={`bg-black border-4 border-gray-800 rounded-3xl overflow-y-auto custom-scrollbar transition-all duration-300 relative ${
                device === 'mobile'
                  ? 'w-[375px] h-[720px] shadow-[0_0_40px_rgba(0,0,0,0.8)]'
                  : device === 'tablet'
                  ? 'w-[728px] h-[750px] shadow-2xl'
                  : 'w-full min-h-[750px]'
              }`}
            >
              {/* CANVAS HEADER BAR (SIMULATED APP BAR) */}
              <div 
                style={{
                  backgroundColor: layout.header.bgColor,
                  color: layout.header.textColor,
                  height: `${layout.header.height}px`
                }}
                className={`p-3 border-b border-amber-500/30 flex items-center justify-between transition-all relative ${
                  selectedElementId === 'elem-header' && !isPreviewMode ? 'ring-2 ring-amber-400' : ''
                }`}
                onClick={() => !isPreviewMode && setSelectedElementId('elem-header')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 text-black font-black flex items-center justify-center shadow">
                    {layout.header.logoText || 'BM'}
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight" style={{ color: layout.header.textColor }}>
                      {layout.header.title}
                    </h3>
                    <p className="text-[10px] font-medium opacity-80" style={{ color: layout.header.accentColor }}>
                      {layout.header.slogan}
                    </p>
                  </div>
                </div>
              </div>

              {/* CANVAS DYNAMIC ELEMENTS LIST */}
              <div className="p-3 space-y-4">
                {activeTab === 'home' && (
                  <>
                    {/* Carousel Section */}
                    {layout.carousel.visible && (
                      <div
                        onClick={() => !isPreviewMode && setSelectedElementId('elem-carousel')}
                        className={`rounded-2xl overflow-hidden border transition-all relative ${
                          selectedElementId === 'elem-carousel' && !isPreviewMode
                            ? 'border-amber-400 ring-2 ring-amber-400/50'
                            : 'border-gray-800'
                        }`}
                      >
                        <Carousel />
                      </div>
                    )}

                    {/* Gallery Section */}
                    {layout.gallery.visible && (
                      <div
                        onClick={() => !isPreviewMode && setSelectedElementId('elem-gallery')}
                        className={`rounded-2xl overflow-hidden border transition-all relative ${
                          selectedElementId === 'elem-gallery' && !isPreviewMode
                            ? 'border-amber-400 ring-2 ring-amber-400/50'
                            : 'border-gray-800'
                        }`}
                      >
                        <VerticalGallery />
                      </div>
                    )}

                    {/* Custom Created Elements */}
                    {layout.elements
                      .filter(e => !e.is_protected && e.visible)
                      .sort((a, b) => a.order - b.order)
                      .map(elem => {
                        const isSel = selectedElementId === elem.id && !isPreviewMode;
                        return (
                          <div
                            key={elem.id}
                            onPointerDown={e => handlePointerDown(e, elem.id)}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            style={{
                              transform: `translate(${elem.styles?.x || 0}px, ${elem.styles?.y || 0}px)`,
                              width: `${elem.styles?.width || 100}%`,
                              backgroundColor: elem.styles?.bgColor || '#111827',
                              color: elem.styles?.textColor || '#ffffff',
                              padding: `${elem.styles?.padding || 12}px`,
                              borderRadius: `${elem.styles?.borderRadius || 16}px`,
                              textAlign: elem.styles?.textAlign || 'center'
                            }}
                            className={`transition-shadow relative cursor-grab active:cursor-grabbing border ${
                              isSel ? 'border-amber-400 ring-2 ring-amber-400/60 shadow-xl' : 'border-gray-800'
                            }`}
                          >
                            {/* Drag Badge Overlay */}
                            {isSel && (
                              <div className="absolute -top-3 left-3 bg-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full shadow">
                                Arrastar com Mouse/Dedo
                              </div>
                            )}

                            {elem.type === 'button' && (
                              <button className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black rounded-xl text-xs shadow-md">
                                {elem.title}
                              </button>
                            )}

                            {elem.type === 'banner' && (
                              <div className="space-y-2">
                                {elem.image_url && (
                                  <img
                                    src={elem.image_url}
                                    alt={elem.title}
                                    className="w-full h-36 object-cover rounded-xl"
                                  />
                                )}
                                <h4 className="text-sm font-bold">{elem.title}</h4>
                                {elem.content && <p className="text-xs text-gray-300">{elem.content}</p>}
                              </div>
                            )}

                            {elem.type === 'text_block' && (
                              <div>
                                <h4 className="text-sm font-black">{elem.title}</h4>
                                {elem.content && <p className="text-xs text-gray-300 mt-1">{elem.content}</p>}
                              </div>
                            )}

                            {elem.type === 'section' && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400">{elem.title}</h4>
                                {elem.content && <p className="text-xs text-gray-300">{elem.content}</p>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </>
                )}

                {/* MENU LATERAL TAB VIEW */}
                {activeTab === 'menu' && (
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400">Configuração do Menu Lateral</h4>
                    <div className="space-y-2">
                      {layout.sideMenu.items.map((item, idx) => (
                        <div key={item.id} className="p-2.5 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{item.label}</span>
                          <span className="text-[10px] text-gray-400">Ordem #{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FOOTER TAB VIEW */}
                {activeTab === 'footer' && (
                  <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800 space-y-3">
                    <h4 className="text-xs font-bold text-amber-400">Configuração do Rodapé de Navegação</h4>
                    <div className="grid grid-cols-5 gap-1.5 p-2 bg-black rounded-xl border border-gray-800">
                      {layout.footer.items.map(item => (
                        <div key={item.id} className="p-2 bg-gray-900 rounded-lg text-center text-[10px] text-amber-300 font-bold">
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* CANVAS FOOTER BAR */}
              <div 
                style={{ backgroundColor: layout.footer.bgColor }}
                className="sticky bottom-0 left-0 right-0 p-2 border-t border-amber-500/30 grid grid-cols-5 gap-1 text-center bg-gray-950"
              >
                {layout.footer.items.map(item => (
                  <div key={item.id} className="p-1 text-[9.5px] font-bold text-amber-400 truncate">
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: PROPERTY INSPECTOR & DIRECTIONAL CONTROLS */}
        <div className="lg:col-span-4 space-y-4">
          {/* Add Element Action Trigger */}
          <button
            onClick={() => setShowAddElementModal(true)}
            className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-black font-black rounded-2xl text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Criar Novo Botão ou Seção</span>
          </button>

          {/* Directional Movement Controls Box */}
          {selectedElem && !isPreviewMode && (
            <div className="bg-gray-950 border border-amber-500/30 p-4 rounded-3xl space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Move size={14} />
                  <span>Controles de Posição & Tamanho</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono truncate max-w-[120px]">
                  {selectedElem.title}
                </span>
              </div>

              {/* Arrow Keys Grid for Micro Movements */}
              <div className="space-y-2">
                <label className="text-[10.5px] font-bold text-gray-300 block text-center">
                  Movimentação Direcional Precisa (Pressione para ajustar)
                </label>
                <div className="w-36 h-36 mx-auto grid grid-cols-3 gap-1 bg-black p-2 rounded-2xl border border-gray-800">
                  <div />
                  <button
                    onClick={() => moveElementPos(0, -10)}
                    className="bg-gray-900 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Mover para Cima"
                  >
                    <ChevronUp size={20} />
                  </button>
                  <div />

                  <button
                    onClick={() => moveElementPos(-10, 0)}
                    className="bg-gray-900 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Mover para Esquerda"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    onClick={() => updateSelectedStyles(s => ({ ...s, x: 0, y: 0 }))}
                    className="bg-amber-500/20 text-amber-400 rounded-xl text-[9px] font-black uppercase flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Resetar Posição"
                  >
                    Reset
                  </button>

                  <button
                    onClick={() => moveElementPos(10, 0)}
                    className="bg-gray-900 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Mover para Direita"
                  >
                    <ChevronRight size={20} />
                  </button>

                  <div />
                  <button
                    onClick={() => moveElementPos(0, 10)}
                    className="bg-gray-900 hover:bg-amber-500 hover:text-black text-amber-400 rounded-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                    title="Mover para Baixo"
                  >
                    <ChevronDown size={20} />
                  </button>
                  <div />
                </div>
              </div>

              {/* Order Shifting Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => moveElementOrder('up')}
                  className="py-2 bg-gray-900 hover:bg-gray-800 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <MoveUp size={14} />
                  <span>Subir Ordem</span>
                </button>
                <button
                  onClick={() => moveElementOrder('down')}
                  className="py-2 bg-gray-900 hover:bg-gray-800 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                >
                  <MoveDown size={14} />
                  <span>Descer Ordem</span>
                </button>
              </div>

              {/* Size Sliders */}
              <div className="space-y-3 pt-2 border-t border-gray-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Largura:</span>
                    <span className="text-amber-400 font-mono">{selectedElem.styles?.width || 100}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={selectedElem.styles?.width || 100}
                    onChange={e => updateSelectedStyles(s => ({ ...s, width: Number(e.target.value) }))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-300">
                    <span>Espaçamento Interno (Padding):</span>
                    <span className="text-amber-400 font-mono">{selectedElem.styles?.padding || 12}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="40"
                    value={selectedElem.styles?.padding || 12}
                    onChange={e => updateSelectedStyles(s => ({ ...s, padding: Number(e.target.value) }))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Alignment Controls */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => alignElement('left')}
                  className="flex-1 py-1.5 bg-gray-900 text-gray-300 hover:text-amber-400 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <AlignLeft size={14} />
                </button>
                <button
                  onClick={() => alignElement('center')}
                  className="flex-1 py-1.5 bg-gray-900 text-gray-300 hover:text-amber-400 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <AlignCenter size={14} />
                </button>
                <button
                  onClick={() => alignElement('right')}
                  className="flex-1 py-1.5 bg-gray-900 text-gray-300 hover:text-amber-400 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <AlignRight size={14} />
                </button>
              </div>

              {/* Duplicate / Hide / Delete Actions */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => handleDuplicateElement(selectedElem.id)}
                  className="py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Duplicar Elemento"
                >
                  <Copy size={13} />
                  <span>Duplicar</span>
                </button>

                <button
                  onClick={() => handleToggleVisibility(selectedElem.id)}
                  className="py-2 bg-gray-900 hover:bg-gray-800 text-gray-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  title="Ocultar/Exibir"
                >
                  <EyeOff size={13} />
                  <span>{selectedElem.visible ? 'Ocultar' : 'Exibir'}</span>
                </button>

                <button
                  onClick={() => setElementToDelete(selectedElem)}
                  disabled={selectedElem.is_protected}
                  className="py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 disabled:opacity-40 cursor-pointer"
                  title="Excluir Elemento"
                >
                  <Trash2 size={13} />
                  <span>Excluir</span>
                </button>
              </div>
            </div>
          )}

          {/* Global Header Styles Controls */}
          {activeTab === 'header' && (
            <div className="bg-gray-950 border border-amber-500/30 p-4 rounded-3xl space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase">Estilo do Cabeçalho Institucional</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Título do Salão</label>
                  <input
                    type="text"
                    value={layout.header.title}
                    onChange={e => pushHistoryState({
                      ...layout,
                      header: { ...layout.header, title: e.target.value }
                    })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Slogan Institucional</label>
                  <input
                    type="text"
                    value={layout.header.slogan}
                    onChange={e => pushHistoryState({
                      ...layout,
                      header: { ...layout.header, slogan: e.target.value }
                    })}
                    className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2 text-white"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. MODAL DE CONFIRMAÇÃO DE PUBLICAÇÃO */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-gray-950 border border-amber-500/40 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl">
                <Send size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Publicar Alterações Visuais</h3>
                <p className="text-xs text-gray-400">Versão v{(layout.version || 1) + 1}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Você está prestes a aplicar a nova configuração visual a <strong>todos os usuários do aplicativo Bela Mulher</strong>. A Home pública será atualizada instantaneamente no Supabase.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="flex-1 py-2.5 bg-gray-900 text-gray-300 font-bold rounded-xl text-xs hover:bg-gray-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {publishing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                <span>Confirmar Publicação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL DE CRIAÇÃO DE ELEMENTO */}
      {showAddElementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-gray-950 border border-amber-500/40 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Plus size={18} className="text-amber-400" />
                <span>Adicionar Novo Elemento</span>
              </h3>
              <button onClick={() => setShowAddElementModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">Tipo de Elemento</label>
                <select
                  value={newElemType}
                  onChange={e => setNewElemType(e.target.value as any)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="button">Botão Personalizado</option>
                  <option value="banner">Banner Promocional / Imagem</option>
                  <option value="text_block">Bloco de Texto / Título</option>
                  <option value="section">Seção Destacada</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">Título / Rótulo</label>
                <input
                  type="text"
                  value={newElemTitle}
                  onChange={e => setNewElemTitle(e.target.value)}
                  placeholder="Ex: Agendar Tratamento VIP"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-300 block mb-1">Descrição / Conteúdo (Opcional)</label>
                <textarea
                  value={newElemContent}
                  onChange={e => setNewElemContent(e.target.value)}
                  placeholder="Ex: Desconto de 20% para novos agendamentos"
                  rows={2}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-2.5 text-xs text-white resize-none"
                />
              </div>

              {newElemType === 'banner' && (
                <div>
                  <label className="text-xs font-bold text-amber-300 block mb-1">Imagem do Banner</label>
                  <label className="w-full py-2 bg-gray-900 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                    <Upload size={14} />
                    <span>{uploadingImg ? 'Enviando Imagem...' : 'Fazer Upload da Imagem'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              )}
            </div>

            <button
              onClick={handleCreateElement}
              disabled={!newElemTitle.trim()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-2xl text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
            >
              Adicionar ao Aplicativo
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL HISTÓRICO DE VERSÕES */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-gray-950 border border-amber-500/40 w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <History size={18} className="text-amber-400" />
                <span>Histórico de Versões do Layout</span>
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
              {versionHistoryList.map((ver, idx) => (
                <div key={ver.id || idx} className="p-3 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-black text-amber-400">Versão v{ver.version || (idx + 1)}</span>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(ver.updated_at).toLocaleString('pt-BR')} ({ver.status})
                    </span>
                  </div>
                  <button
                    onClick={() => handleRestoreVersion(ver.config)}
                    className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Restaurar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIRMAÇÃO DE EXCLUSÃO */}
      {elementToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-gray-950 border border-red-500/40 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Confirmar Exclusão</h3>
                <p className="text-xs text-gray-400">{elementToDelete.title}</p>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              Tem certeza de que deseja remover este elemento do layout? Essa ação poderá ser desfeita pelo histórico antes de publicar.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setElementToDelete(null)}
                className="flex-1 py-2.5 bg-gray-900 text-gray-300 font-bold rounded-xl text-xs hover:bg-gray-800 transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteElement}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer"
              >
                Excluir Elemento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
