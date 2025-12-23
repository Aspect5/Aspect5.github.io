import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Heart, Play, Volume2, VolumeX, Edit2, Plus, Trash2 } from 'lucide-react';
import './index.css';
import { CONTENT } from './content';

export default function App() {
  const [bookRotation, setBookRotation] = useState(0);
  const [camera, setCamera] = useState({ panX: 0, panY: 0, rotateX: 0, rotateY: 0 });
  
  const [isBookDragging, setIsBookDragging] = useState(false);
  const [isSceneDragging, setIsSceneDragging] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editedContent, setEditedContent] = useState(() => {
    const content = { ...CONTENT };
    if (!content.body || !Array.isArray(content.body)) {
      content.body = [];
    }
    return content;
  });
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y?: number; initialVal?: number; initialCamera?: { panX: number; panY: number; rotateX: number; rotateY: number } }>({ x: 0, y: 0, initialVal: 0, initialCamera: { ...camera } });

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleBookPointerDown = (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    e.stopPropagation(); 
    setIsBookDragging(true);
    dragStartRef.current = { x: e.clientX, initialVal: bookRotation };
    cardRef.current?.setPointerCapture(e.pointerId);
  };

  const handleBookPointerMove = (e) => {
    if (!isBookDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const deltaX = e.clientX - dragStartRef.current.x;
    let newRotation = (dragStartRef.current.initialVal ?? 0) - (deltaX * 0.6);
    newRotation = Math.max(0, Math.min(180, newRotation));
    setBookRotation(newRotation);
  };

  const handleBookPointerUp = (e) => {
    if (!isBookDragging) return;
    setIsBookDragging(false);
    cardRef.current?.releasePointerCapture(e.pointerId);
    if (bookRotation > 40) {
      setBookRotation(180);
        if (isYouTubeUrl(displayContent.videoUrl)) {
          setTimeout(() => { setIsPlaying(true); }, 300);
        } else if (videoRef.current && !isPlaying) {
          const video = videoRef.current;
          setTimeout(() => { video.play().catch(() => {}); setIsPlaying(true); }, 300);
        }
    } else {
      setBookRotation(0);
      if (isYouTubeUrl(displayContent.videoUrl)) {
        setIsPlaying(false);
      } else if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleScenePointerDown = (e) => {
    e.preventDefault();
    setIsSceneDragging(true);
    dragStartRef.current = { 
      x: e.clientX, 
      y: e.clientY, 
      initialCamera: { 
        panX: baseCameraPan.current.panX, 
        panY: camera.panY, 
        rotateX: camera.rotateX, 
        rotateY: 0 
      } 
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handleScenePointerMove = (e) => {
    if (!isSceneDragging) return;
    e.preventDefault();
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - (dragStartRef.current.y ?? 0);
    const initialCamera = dragStartRef.current.initialCamera ?? { panX: 0, panY: 0, rotateX: 0, rotateY: 0 };
    setCamera(prev => ({ 
      ...prev, 
      panX: baseCameraPan.current.panX + deltaX * 0.5, 
      panY: initialCamera.panY + deltaY * 0.5,
      rotateY: 0
    }));
  };

  const handleScenePointerUp = (e) => {
    setIsSceneDragging(false);
    e.target.releasePointerCapture(e.pointerId);
  };

  const renderCardStack = (type) => {
    const layers: React.ReactElement[] = [];
    const thickness = 6;
    for (let i = 0; i <= thickness; i++) {
       const isFront = i === thickness;
       const isBack = i === 0;
       
       layers.push(
         <div 
            key={i}
            className={`absolute inset-0 rounded-r-lg border-l border-stone-300 ${isFront || isBack ? '' : 'bg-[#e6e2da] border border-stone-300/50'}`}
            style={{ 
               transform: `translateZ(${i}px)`,
               width: isFront || isBack ? '100%' : '99.5%',
               height: isFront || isBack ? '100%' : '99.5%',
               left: isFront || isBack ? '0' : '0.25%',
               top: isFront || isBack ? '0' : '0.25%',
            }}
         >
            {type === 'cover' && isFront && (
              <div className="absolute inset-0 bg-[#e8e4dc] rounded-r-lg flex flex-col items-center justify-center border border-[#d6d3cb] overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none mix-blend-multiply" />
                  <div className="w-[88%] h-[90%] border border-[#a8a49d]/40 flex flex-col items-center justify-center p-8 text-center relative z-10 pointer-events-none">
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 w-[1px] h-3/4 border-r-2 border-dotted border-stone-400/40"></div>
                    <div className="w-28 h-28 bg-rose-900/5 rounded-full flex items-center justify-center mb-8 text-rose-900 ring-1 ring-rose-900/10">
                      <Heart size={48} strokeWidth={0.8} fill="currentColor" className="opacity-70 drop-shadow-sm" />
                    </div>
                    <h1 className="handwritten text-7xl text-stone-800 mb-6 select-none drop-shadow-sm">{displayContent.title}</h1>
                    <p className="handwritten text-4xl text-stone-600 mb-10 select-none">{displayContent.subtitle}</p>
                    <p className="body-text text-stone-500 uppercase tracking-[0.2em] text-xs mt-6 opacity-60 select-none font-semibold">Drag to Open</p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none z-20" />
              </div>
            )}
            
            {type === 'cover' && isBack && (
               <div className="absolute inset-0 bg-[#e8e4dc] rounded-r-lg flex flex-col items-center justify-center border border-[#d6d3cb] overflow-hidden" style={{ transform: 'rotateY(180deg)' }}>
                  <div className="relative w-[92%] h-[92%] bg-black shadow-inner rounded overflow-hidden border-2 border-stone-400/20">
                     {isYouTubeUrl(displayContent.videoUrl) ? (() => {
                        const embedUrl = getYouTubeEmbedUrl(displayContent.videoUrl);
                        const videoId = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/)?.[1] || '';
                        const shouldAutoplay = bookRotation >= 180 && isPlaying;
                        return (
                          <iframe
                            key={shouldAutoplay ? 'playing' : 'paused'}
                            src={`${embedUrl}?${shouldAutoplay ? 'autoplay=1&' : ''}loop=1&playlist=${videoId}&mute=0&controls=1`}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                          />
                        );
                     })() : (
                        <>
                          <video 
                            ref={videoRef}
                            className="w-full h-full object-cover opacity-95"
                            loop
                            playsInline
                            src={displayContent.videoUrl}
                          />
                          <div className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-10"
                            style={{ opacity: Math.max(0, 0.9 - (bookRotation / 120)) }} 
                          />
                          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6 z-20">
                            <button onClick={togglePlay} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer border border-white/10">
                              {isPlaying ? <span className="w-4 h-4 block bg-white rounded-[1px]" /> : <Play fill="currentColor" size={20} />}
                            </button>
                            <button onClick={toggleMute} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white cursor-pointer border border-white/10">
                              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                          </div>
                        </>
                     )}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-stone-900/10 to-transparent pointer-events-none z-30 mix-blend-multiply" />
               </div>
            )}


            {type === 'letter' && isFront && (
               <div className="absolute inset-0 bg-[#fffdf9] rounded-r-lg flex flex-col p-8 border border-stone-200" style={{ opacity: bookRotation > 10 ? 1 : 0, visibility: bookRotation > 10 ? 'visible' : 'hidden', transition: 'opacity 0.3s, visibility 0.1s' }}>
                  <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none mix-blend-multiply" />
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-stone-900/10 to-transparent pointer-events-none z-10 mix-blend-multiply" />
                  <div className="absolute inset-0 pointer-events-none transition-opacity duration-100 rounded-r-lg z-10"
                    style={{ background: `linear-gradient(to right, rgba(20,15,10,${Math.max(0, 0.3 - (bookRotation/200))}) 0%, transparent 40%)`, mixBlendMode: 'multiply' }} 
                  />
                  
                  <div className={`h-full border-2 border-stone-300/40 rounded p-6 flex flex-col relative z-20 ${bookRotation < 90 ? 'pointer-events-none' : 'select-text'}`}>
                      <div className="flex justify-end mb-4"><span className="text-stone-400 text-xs tracking-widest uppercase font-semibold opacity-70">{displayContent.date}</span></div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <p className="body-text text-2xl leading-relaxed text-stone-900 mb-6">{displayContent.greeting}</p>
                        {(displayContent.body || []).map((paragraph, index) => (
                          <p 
                            key={index} 
                            className="body-text text-xl leading-relaxed text-stone-800 mb-5 font-light"
                            dangerouslySetInnerHTML={{ __html: paragraph }}
                          />
                        ))}
                        
                        <div className="mt-auto pt-8 pl-2 pr-4 transform -rotate-2 origin-bottom-left">
                           <p className="handwritten text-4xl text-stone-900 opacity-90 leading-tight">
                              {displayContent.signOff}
                           </p>
                           <span className="handwritten text-5xl ml-6 block mt-2 text-stone-900">{displayContent.signature}</span>
                        </div>
                      </div>
                  </div>
               </div>
            )}
         </div>
       );
    }
    return layers;
  };


  const displayContent = isEditing ? editedContent : CONTENT;

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    const shortsMatch = url.match(/(?:youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
    
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    
    if (url.includes('youtube.com/embed/')) {
      return url.split('?')[0];
    }
    
    return '';
  };

  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem('cardContent', JSON.stringify(editedContent));
  };

  const handleReset = () => {
    setEditedContent(CONTENT);
  };

  React.useEffect(() => {
    const saved = localStorage.getItem('cardContent');
    if (saved) {
      try {
        setEditedContent(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  React.useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode = window.matchMedia("(orientation: portrait)").matches;
      setIsPortrait(isPortraitMode);
      setIsMobile(window.innerWidth < 768);
    };
    
    checkOrientation();
    const timeoutId = setTimeout(checkOrientation, 100);
    
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    });
    
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', () => {
        setTimeout(checkOrientation, 100);
      });
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
    };
  }, []);

  const baseCameraPan = React.useRef({ panX: 0 });
  
  React.useEffect(() => {
    if (!isSceneDragging && !isBookDragging) {
      const rotationProgress = bookRotation / 180;
      const targetPanX = rotationProgress * 80;
      
      baseCameraPan.current = {
        panX: targetPanX
      };
      
      setCamera(prev => ({
        ...prev,
        panX: baseCameraPan.current.panX,
        rotateY: 0,
        rotateX: 0
      }));
    }
  }, [bookRotation, isSceneDragging, isBookDragging]);

  return (
    <div 
      className="min-h-screen bg-[#f0eee6] flex items-center justify-center p-4 font-serif selection:bg-rose-200 cursor-move"
      onPointerDown={isEditing ? undefined : handleScenePointerDown}
      onPointerMove={isEditing ? undefined : handleScenePointerMove}
      onPointerUp={isEditing ? undefined : handleScenePointerUp}
      onPointerLeave={isEditing ? undefined : handleScenePointerUp}
    >
      
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="fixed top-4 right-4 z-50 p-3 bg-white/80 hover:bg-white backdrop-blur-md rounded-full shadow-lg border border-stone-200 text-stone-700 hover:text-stone-900 transition-all"
        title="Edit Card Content"
      >
        <Edit2 size={20} />
      </button>

      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-50 mix-blend-multiply bg-white/40 px-4 py-2 rounded-full text-xs font-semibold tracking-widest text-stone-600 hidden sm:block">
        DRAG BACKGROUND TO MOVE • DRAG CARD TO OPEN
      </div>
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none opacity-50 mix-blend-multiply bg-white/40 px-4 py-2 rounded-full text-xs font-semibold tracking-widest text-stone-600 block sm:hidden">
        DRAG CARD TO OPEN
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        .scene { perspective: 2000px; -webkit-perspective: 2000px; }
        .transform-style-3d { transform-style: preserve-3d; -webkit-transform-style: preserve-3d; }
        .handwritten { font-family: 'Great Vibes', cursive; }
        .body-text { font-family: 'Cormorant Garamond', serif; }
        @keyframes hint-nudge { 0%, 100% { transform: rotateY(0deg); } 50% { transform: rotateY(-6deg); } }
        .animate-hint { animation: hint-nudge 3s ease-in-out infinite; }
      `}</style>

      {isPortrait && (
        <div className="fixed inset-0 z-[200] bg-[#f0eee6] flex flex-col items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <div className="text-6xl mb-6 animate-spin" style={{ animationDuration: '2s', animationIterationCount: 'infinite' }}>📱</div>
            <h2 className="handwritten text-4xl text-stone-800 mb-4">Please Rotate Your Device</h2>
            <p className="body-text text-lg text-stone-600 mb-2">You're going to want to see this in landscape mode</p>
            <p className="body-text text-sm text-stone-500">Rotate your phone sideways to continue</p>
          </div>
        </div>
      )}
      
      <div className={`scene relative w-full max-w-[450px] h-[600px] min-h-[400px] z-10 items-center justify-center select-none mx-auto flex px-4 ${isPortrait ? 'opacity-0 pointer-events-none' : ''}`} style={{ 
        maxWidth: 'min(450px, 90vw)', 
        height: 'min(600px, 80vh)',
        transform: isMobile ? 'scale(0.65)' : 'scale(0.85)',
        transition: 'transform 0.3s ease-out, opacity 0.3s'
      }}>
        
        <div className="relative w-full h-full transform-style-3d transition-transform duration-300 ease-out"
           style={{ transform: `translateX(${camera.panX}px) translateY(${camera.panY}px) rotateX(${camera.rotateX}deg) rotateY(${camera.rotateY}deg)` }}
        >
          
          <div className="absolute bottom-0 left-1/2 transform-style-3d pointer-events-none"
             style={{ width: 'min(450px, 90vw)', height: '40px', transform: `translateX(-50%) translateY(200px) rotateX(90deg) translateZ(-50px)`, zIndex: -1 }}
          >
              <div className="w-full h-full bg-black/20 blur-2xl rounded-[50%] transition-all duration-500 ease-out"
                style={{ transform: `scaleX(${1 + (bookRotation/180)}) translateX(${-bookRotation/4}px)`, opacity: 0.4 + (bookRotation/600) }}
              />
          </div>

          <div className="relative w-full h-full transform-style-3d">
            <div className="absolute inset-0 transform-style-3d origin-left" style={{ transform: 'translateZ(-6px)', zIndex: 1 }}>
               {renderCardStack('letter')}
            </div>

            <div 
              ref={cardRef}
              className={`absolute inset-0 transform-style-3d cursor-grab active:cursor-grabbing origin-left ${!isBookDragging && bookRotation === 0 ? 'animate-hint' : ''}`}
              onPointerDown={handleBookPointerDown}
              onPointerMove={handleBookPointerMove}
              onPointerUp={handleBookPointerUp}
              onPointerLeave={handleBookPointerUp}
              style={{
                transform: `rotateY(-${bookRotation}deg)`,
                transition: isBookDragging ? 'none' : 'transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
                zIndex: 100,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                touchAction: 'none'
              }}
            >
               {renderCardStack('cover')}
            </div>

          </div>
        </div>
      </div>


      {isEditing && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" 
          onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative z-[101]" 
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerMove={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-stone-800">Edit Card Content</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Title (Cover)</label>
                <input
                  type="text"
                  value={editedContent.title}
                  onChange={(e) => setEditedContent({...editedContent, title: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Subtitle (Cover)</label>
                <input
                  type="text"
                  value={editedContent.subtitle}
                  onChange={(e) => setEditedContent({...editedContent, subtitle: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Date</label>
                <input
                  type="text"
                  value={editedContent.date}
                  onChange={(e) => setEditedContent({...editedContent, date: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Greeting</label>
                <input
                  type="text"
                  value={editedContent.greeting}
                  onChange={(e) => setEditedContent({...editedContent, greeting: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-stone-700">Body Paragraphs</label>
                  <button
                    type="button"
                    onClick={() => setEditedContent({
                      ...editedContent,
                      body: [...(editedContent.body || []), '']
                    })}
                    className="flex items-center gap-1 px-3 py-1 text-xs bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors"
                  >
                    <Plus size={14} />
                    Add Paragraph
                  </button>
                </div>
                {(editedContent.body || []).map((paragraph, index) => (
                  <div key={index} className="mb-3 flex gap-2">
                    <textarea
                      value={paragraph}
                      onChange={(e) => {
                        const newBody = [...(editedContent.body || [])];
                        newBody[index] = e.target.value;
                        setEditedContent({...editedContent, body: newBody});
                      }}
                      rows={3}
                      placeholder={`Paragraph ${index + 1}...`}
                      className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newBody = [...(editedContent.body || [])];
                        newBody.splice(index, 1);
                        setEditedContent({...editedContent, body: newBody});
                      }}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors"
                      title="Remove paragraph"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {(!editedContent.body || editedContent.body.length === 0) && (
                  <p className="text-sm text-stone-400 italic">No paragraphs yet. Click "Add Paragraph" to get started.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Sign Off</label>
                <input
                  type="text"
                  value={editedContent.signOff}
                  onChange={(e) => setEditedContent({...editedContent, signOff: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Signature</label>
                <input
                  type="text"
                  value={editedContent.signature}
                  onChange={(e) => setEditedContent({...editedContent, signature: e.target.value})}
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Video URL</label>
                <input
                  type="text"
                  value={editedContent.videoUrl}
                  onChange={(e) => setEditedContent({...editedContent, videoUrl: e.target.value})}
                  placeholder="/videos/video.mov or https://..."
                  className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                <p className="text-xs text-stone-500 mt-1">For local files: /videos/filename.mp4 | For YouTube: Use embed URL</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-semibold"
              >
                Save Changes
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-stone-500 mt-4">
              Changes saved to browser storage. Edit <code className="bg-stone-100 px-1 rounded">content.ts</code> for permanent changes.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);