/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ROOMS } from './data';
import { Room, Project, FilmRecord, StillCapture } from './types';
import { SpatialCanvas } from './components/SpatialCanvas';
import { NavigationHUD } from './components/NavigationHUD';
import { RoomNexus } from './components/RoomNexus';
import { RoomStudio } from './components/RoomStudio';
import { RoomGallery } from './components/RoomGallery';
import { RoomCinema } from './components/RoomCinema';
import { RoomDispatch } from './components/RoomDispatch';
import { Modals } from './components/Modals';
import { Toast } from './components/Toast';
import { CookieConsent } from './components/CookieConsent';
import { useTheme } from './lib/theme';
import { Eye, EyeOff, ArrowLeft, ArrowRight, Sun } from 'lucide-react';

const ROOM_COUNT = ROOMS.length;

export default function App() {
  const { dark } = useTheme();
  const [currentRoom, setCurrentRoom] = useState<Room>(ROOMS[0]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [zCoord, setZCoord] = useState<string>('Z: +8.00m');
  const [warpKey, setWarpKey] = useState<number>(0);
  const [worldOnly, setWorldOnly] = useState<boolean>(false);
  const [lightAngle, setLightAngle] = useState<number>(135);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal & toast state
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeFilm, setActiveFilm] = useState<FilmRecord | null>(null);
  const [activeStill, setActiveStill] = useState<StillCapture | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeIndexRef = useRef(0);
  const worldOnlyRef = useRef(false);
  const travelLockRef = useRef(0);
  const dialRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const readyFlagsRef = useRef({ fonts: false, world: false });
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    worldOnlyRef.current = worldOnly;
  }, [worldOnly]);

  // 光線方向 → CSS 變數（驅動卡片漸層方向）
  useEffect(() => {
    document.documentElement.style.setProperty('--light-angle', `${lightAngle}deg`);
  }, [lightAngle]);

  // 載入完成判定：字體 + 3D 世界都就緒，且至少展示 1.2 秒
  const tryFinish = useCallback(() => {
    if (!readyFlagsRef.current.fonts || !readyFlagsRef.current.world) return;
    const elapsed = Date.now() - startTimeRef.current;
    const delay = Math.max(0, 1200 - elapsed);
    window.setTimeout(() => setLoading(false), delay);
  }, []);

  const handleWorldReady = useCallback(() => {
    readyFlagsRef.current.world = true;
    tryFinish();
  }, [tryFinish]);

  useEffect(() => {
    const markFonts = () => {
      readyFlagsRef.current.fonts = true;
      tryFinish();
    };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(markFonts).catch(markFonts);
    } else {
      markFonts();
    }
  }, [tryFinish]);

  // 進入新房間時，把房內滾動重置到頂端（避免從中間開始）
  useEffect(() => {
    const el = document.querySelector(`[data-room-scroll="${activeIndex}"]`) as HTMLElement | null;
    if (el) el.scrollTop = 0;
  }, [activeIndex]);

  // 滑鼠驅動的 3D 傾斜（寫入 CSS 變數，rAF 節流，不觸發 React 重繪）
  // 只在有滑鼠（fine pointer）的裝置啟用，手機/觸控不生效
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    let raf = 0;
    let mx = 0;
    let my = 0;
    const onMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth) * 2 - 1;
      my = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          document.documentElement.style.setProperty('--mx', mx.toFixed(4));
          document.documentElement.style.setProperty('--my', my.toFixed(4));
        });
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const scrollToRoom = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(ROOM_COUNT - 1, index));
    // 直接切換房間狀態（不依賴 scroll 事件），再用「比例」方式捲到正確位置。
    // 手機上 100vh 與 window.innerHeight 不一致，用 innerHeight 相乘會捲不到位。
    activeIndexRef.current = clamped;
    setActiveIndex(clamped);
    setCurrentRoom(ROOMS[clamped]);
    setWarpKey((k) => k + 1);
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const target = total > 0 ? (clamped / (ROOM_COUNT - 1)) * total : 0;
    window.scrollTo(0, target);
  }, []);

  // 旋鈕：從指針位置計算光線角度
  const updateAngleFromPointer = useCallback((e: { clientX: number; clientY: number }) => {
    const el = dialRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    setLightAngle(((Math.round(angle) % 360) + 360) % 360);
  }, []);

  const handleScrollProgress = useCallback((progress: number) => {
    const idx = Math.max(0, Math.min(ROOM_COUNT - 1, Math.round(progress * (ROOM_COUNT - 1))));
    if (idx !== activeIndexRef.current) {
      activeIndexRef.current = idx;
      setActiveIndex(idx);
      setCurrentRoom(ROOMS[idx]);
      setWarpKey((k) => k + 1); // 觸發飛越光效
    }
    const z = 8 - progress * 56;
    const sign = z >= 0 ? '+' : '';
    setZCoord(`Z: ${sign}${z.toFixed(2)}m`);
  }, []);

  // 滾輪在房間底部／頂部時，飛到下一／上一間世界位置
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const idx = activeIndexRef.current;
      if (worldOnlyRef.current) {
        // 純世界模式：每次滾動直接飛越
        if (Date.now() < travelLockRef.current) return;
        if (Math.abs(e.deltaY) < 2) return;
        e.preventDefault();
        const next = idx + (e.deltaY > 0 ? 1 : -1);
        if (next >= 0 && next < ROOM_COUNT) {
          travelLockRef.current = Date.now() + 600;
          scrollToRoom(next);
        }
        return;
      }
      const el = document.querySelector(`[data-room-scroll="${idx}"]`) as HTMLElement | null;
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (e.deltaY > 0 && el.scrollTop < maxScroll - 2) return; // 房內繼續滾
        if (e.deltaY < 0 && el.scrollTop > 2) return;
      }
      if (Math.abs(e.deltaY) < 2) return;
      if (Date.now() < travelLockRef.current) return; // 冷卻中，避免一次滑過多間
      e.preventDefault();
      const next = idx + (e.deltaY > 0 ? 1 : -1);
      if (next >= 0 && next < ROOM_COUNT) {
        travelLockRef.current = Date.now() + 600;
        scrollToRoom(next);
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, [scrollToRoom]);

  // 觸控滑動：手機沒有滾輪，改用手滑上下切換房間（含房內滾動邊界）
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.abs(dy) < 35 || Math.abs(dy) < Math.abs(dx) * 1.2) return;
      const idx = activeIndexRef.current;
      const el = document.querySelector(`[data-room-scroll="${idx}"]`) as HTMLElement | null;
      if (el) {
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (dy < 0 && el.scrollTop < maxScroll - 2) return; // 房內還有內容，繼續滾
        if (dy > 0 && el.scrollTop > 2) return;
      }
      const next = idx + (dy < 0 ? 1 : -1);
      if (Date.now() < travelLockRef.current) return;
      if (next >= 0 && next < ROOM_COUNT) {
        travelLockRef.current = Date.now() + 600;
        scrollToRoom(next);
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [scrollToRoom]);

  // 滾動停止後吸附到最近的房間（章節鎖定）
  useEffect(() => {
    let timer: number | undefined;
    const onScrollEnd = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total <= 0) return;
        const progress = window.scrollY / total;
        const idx = Math.max(0, Math.min(ROOM_COUNT - 1, Math.round(progress * (ROOM_COUNT - 1))));
        scrollToRoom(idx);
      }, 120);
    };
    window.addEventListener('scroll', onScrollEnd, { passive: true });
    return () => {
      if (timer) window.clearTimeout(timer);
      window.removeEventListener('scroll', onScrollEnd);
    };
  }, [scrollToRoom]);

  const handleNavigate = useCallback(
    (roomId: string) => {
      const idx = ROOMS.findIndex((r) => r.id === roomId);
      if (idx >= 0) scrollToRoom(idx);
    },
    [scrollToRoom]
  );

  const handleCloseModal = () => {
    setActiveProject(null);
    setActiveFilm(null);
    setActiveStill(null);
  };

  const renderRoom = (roomId: string) => {
    switch (roomId) {
      case 'room-nexus':
        return <RoomNexus onNavigate={handleNavigate} />;
      case 'room-studio':
        return <RoomStudio />;
      case 'room-gallery':
        return <RoomGallery onSelectProject={setActiveProject} />;
      case 'room-cinema':
        return <RoomCinema onSelectFilm={setActiveFilm} onSelectStill={setActiveStill} />;
      case 'room-dispatch':
        return <RoomDispatch onShowToast={showToast} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen text-ink selection:bg-primary selection:text-white">
      {/* 世界背景：網格 + 3D 走廊 */}
      <div className="fixed inset-0 z-0 hairline-grid pointer-events-none" />
      <SpatialCanvas onScrollProgress={handleScrollProgress} lightAngle={lightAngle} darkMode={dark} onReady={handleWorldReady} />

      {/* 滾動長度：每個房間一屏，滾動即飛越世界 */}
      <div style={{ height: `${ROOM_COUNT * 100}vh` }} aria-hidden="true" />

      {/* 各世界位置的房間（固定，依滾動淡入淡出） */}
      <div className={`fixed inset-0 z-10 transition-opacity duration-500 ${worldOnly ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {ROOMS.map((room, i) => {
          const isActive = i === activeIndex;
          return (
            <div
              key={room.id}
              className={`absolute inset-0 transition-all duration-700 ease-out ${
                isActive ? 'opacity-100 pointer-events-auto room-enter' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                transform: `translateY(${isActive ? 0 : 48}px) scale(${isActive ? 1 : 0.96})`,
              }}
            >
              <div className="tilt-3d h-full">
                <div
                  data-room-scroll={i}
                  className="room-scroll h-full overflow-y-auto overflow-x-hidden overscroll-contain"
                >
                  {renderRoom(room.id)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 全螢幕環境光 */}
      <div className="light-wash fixed inset-0 z-[11] pointer-events-none" aria-hidden="true" />

      {/* 飛越光效 */}
      {warpKey > 0 && (
        <div key={warpKey} className="warp-flash fixed inset-0 z-30 pointer-events-none" aria-hidden="true" />
      )}

      {/* 底片顆粒 */}
      <div className="film-grain fixed inset-0 z-20 pointer-events-none" aria-hidden="true" />

      {!worldOnly && (
        <NavigationHUD currentRoom={currentRoom} zCoord={zCoord} onNavigate={handleNavigate} />
      )}

      {/* 只顯示 3D 世界的開關 */}
      <button
        onClick={() => setWorldOnly((v) => !v)}
        className="fixed bottom-5 right-5 z-50 hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-ink text-white font-mono text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-primary transition-colors cursor-pointer border-none"
        title={worldOnly ? '回到網站' : '只顯示 3D 世界'}
      >
        {worldOnly ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span>{worldOnly ? 'Exit World' : 'World Only'}</span>
      </button>

      {/* 上／下一段按鈕 */}
      <button
        onClick={() => scrollToRoom(activeIndex - 1)}
        disabled={activeIndex <= 0}
        aria-label="上一段"
        className="fixed left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/85 backdrop-blur-md border border-border-crisp shadow-lg text-ink hover:bg-primary hover:text-white transition-colors cursor-pointer border-none flex items-center justify-center disabled:opacity-30 disabled:cursor-default"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scrollToRoom(activeIndex + 1)}
        disabled={activeIndex >= ROOM_COUNT - 1}
        aria-label="下一段"
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 rounded-full bg-white/85 backdrop-blur-md border border-border-crisp shadow-lg text-ink hover:bg-primary hover:text-white transition-colors cursor-pointer border-none flex items-center justify-center disabled:opacity-30 disabled:cursor-default"
      >
        <ArrowRight className="w-5 h-5" />
      </button>

      {/* 光線方向（360° 旋鈕） */}
      <div
        ref={dialRef}
        className="fixed bottom-5 left-5 z-40 hidden md:block w-14 h-14 rounded-full bg-white/85 backdrop-blur-md border border-border-crisp shadow-lg cursor-grab select-none touch-none"
        onPointerDown={(e) => {
          draggingRef.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          updateAngleFromPointer(e);
        }}
        onPointerMove={(e) => { if (draggingRef.current) updateAngleFromPointer(e); }}
        onPointerUp={() => { draggingRef.current = false; }}
        title="光線方向"
      >
        <Sun className="absolute inset-0 m-auto w-4 h-4 text-ink/35 pointer-events-none" />
        <span
          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-primary pointer-events-none"
          style={{ transform: `translate(-50%, -50%) rotate(${lightAngle}deg) translateY(-18px)` }}
        />
      </div>

      {/* 手機底部導覽列：點擊直接切換房間（最可靠的到達方式） */}
      <nav
        className="fixed bottom-0 inset-x-0 z-40 md:hidden flex items-stretch bg-white/90 backdrop-blur-md border-t border-border-crisp shadow-[0_-4px_20px_rgba(0,0,0,0.10)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {ROOMS.map((room, i) => {
          const active = i === activeIndex;
          return (
            <button
              key={room.id}
              onClick={() => scrollToRoom(i)}
              aria-label={room.name}
              aria-current={active ? 'true' : undefined}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 cursor-pointer border-none bg-transparent ${
                active ? 'text-primary' : 'text-ink-muted'
              }`}
            >
              <span className={`font-mono text-[9px] font-bold ${active ? 'opacity-100' : 'opacity-60'}`}>{room.number}</span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wide">{room.label}</span>
            </button>
          );
        })}
      </nav>
      <Modals
        activeProject={activeProject}
        activeFilm={activeFilm}
        activeStill={activeStill}
        onClose={handleCloseModal}
        onShowToast={showToast}
      />
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <CookieConsent />

      {/* 載入畫面 */}
      <div
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-surface-warm transition-opacity duration-500 ${loading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!loading}
      >
        <div className="font-display text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          WASI SHAH <span className="font-chinese text-primary">峻山</span>
        </div>
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-[#6CC8FF]/30" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FFB15E] border-r-[#6CC8FF] animate-spin" />
        </div>
        <div className="w-40 h-0.5 bg-[#6CC8FF]/20 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-[#6CC8FF] to-[#FFB15E] rounded-full animate-progress" />
        </div>
        <div className="font-mono text-xs text-ink-muted uppercase tracking-widest">Entering the world…</div>
      </div>
    </div>
  );
}
