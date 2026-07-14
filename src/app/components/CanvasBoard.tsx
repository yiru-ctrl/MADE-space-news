import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, Maximize2, Minimize2, Scan, Trash2, MoreHorizontal, Pencil, Check, Plus } from "lucide-react";
import { DotGridBackground } from "./DotGridBackground";

interface Article {
  id: string; title: string; summary: string; source: string; sourceIcon: string;
  category: string; publishedAt: string; imageUrl: string | null; readTime: number;
  boardIds: string[];
}
interface Board { id: string; name: string; articleIds: string[]; emoji: string; }
interface Pos { x: number; y: number; }
interface Conn { id: string; from: string; to: string; }

const CARD_W = 220;
const CARD_H = 250;

const CATEGORY_EMOJI: Record<string, string> = {
  Technology: "⚡", Design: "✦", Science: "🔬", Culture: "🎭",
  Business: "📈", Health: "🌿", Politics: "🏛", Environment: "🌍",
  Sports: "🏎", Art: "🎨",
};

function scatter(articles: Article[]): Record<string, Pos> {
  const cols = Math.max(2, Math.ceil(Math.sqrt(articles.length)));
  const out: Record<string, Pos> = {};
  articles.forEach((a, i) => {
    const seed = parseInt(a.id, 10) || i;
    out[a.id] = {
      x: 80 + (i % cols) * (CARD_W + 80) + ((seed * 997) % 50) - 25,
      y: 80 + Math.floor(i / cols) * (CARD_H + 80) + ((seed * 1201) % 50) - 25,
    };
  });
  return out;
}

function createConnectedNetwork(articles: Article[], layout: Record<string, Pos>): Conn[] {
  if (articles.length < 2) return [];

  // Small boards benefit from a complete visual network. Larger boards use a
  // minimum-distance spanning tree so every card stays connected without a web
  // of overlapping lines.
  if (articles.length <= 6) {
    const complete: Conn[] = [];
    for (let i = 0; i < articles.length; i += 1) {
      for (let j = i + 1; j < articles.length; j += 1) {
        complete.push({
          id: `auto-${articles[i].id}-${articles[j].id}`,
          from: articles[i].id,
          to: articles[j].id,
        });
      }
    }
    return complete;
  }

  const connected = new Set<string>([articles[0].id]);
  const remaining = new Set(articles.slice(1).map(article => article.id));
  const network: Conn[] = [];

  while (remaining.size > 0) {
    let bestFrom = "";
    let bestTo = "";
    let bestDistance = Number.POSITIVE_INFINITY;

    connected.forEach(from => {
      remaining.forEach(to => {
        const a = layout[from] ?? { x: 0, y: 0 };
        const b = layout[to] ?? { x: 0, y: 0 };
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestFrom = from;
          bestTo = to;
        }
      });
    });

    if (!bestFrom || !bestTo) break;
    network.push({ id: `auto-${bestFrom}-${bestTo}`, from: bestFrom, to: bestTo });
    connected.add(bestTo);
    remaining.delete(bestTo);
  }

  return network;
}

export function CanvasBoard({ board, boards = [], articles, mode = "fullscreen", onClose, onFullscreen, onRemoveFromBoard, onRenameBoard, onDeleteBoard, onOpenArticle, onAddToBoard, onSelectBoard }: {
  board: Board; articles: Article[];
  boards?: Board[];
  mode?: "panel" | "fullscreen";
  onClose: () => void;
  onFullscreen?: () => void;
  onRemoveFromBoard: (articleId: string, boardId: string) => void;
  onRenameBoard: (boardId: string, newName: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onOpenArticle?: (article: Article) => void;
  onAddToBoard?: (articleId: string, boardId: string) => void;
  onSelectBoard?: (board: Board) => void;
}) {
  const isPanel = mode === "panel";
  const boardArticles = useMemo(
    () => articles.filter(article => article.boardIds.includes(board.id)),
    [articles, board.id],
  );

  const [positions, setPositions] = useState<Record<string, Pos>>(() => scatter(boardArticles));
  const [pan, setPan] = useState({ x: 60, y: 80 });
  const [scale, setScale] = useState(1);
  const [connections, setConnections] = useState<Conn[]>([]);

  // Board header state
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(board.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (renaming) renameInputRef.current?.focus(); }, [renaming]);

  function commitRename() {
    const v = renameValue.trim();
    if (v && v !== board.name) onRenameBoard(board.id, v);
    setRenaming(false);
    setMenuOpen(false);
  }

  // Render-only signals derived from refs
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [connDrag, setConnDrag] = useState<{ from: string; mx: number; my: number } | null>(null);
  const [hoveredConn, setHoveredConn] = useState<string | null>(null);
  const [cardBoardMenu, setCardBoardMenu] = useState<string | null>(null);
  const [, forceGeometryTick] = useState(0);

  // Refs hold mutable state accessed inside the single-registered listeners
  const dragRef = useRef<{ id: string; smx: number; smy: number; sx: number; sy: number } | null>(null);
  const dragMovedRef = useRef(false);
  const panRef = useRef<{ smx: number; smy: number; spx: number; spy: number } | null>(null);
  const scaleRef = useRef(scale);
  const panRef2 = useRef(pan);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef2.current = pan; }, [pan]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => forceGeometryTick(value => value + 1));
    return () => cancelAnimationFrame(frame);
  }, [positions, pan, scale, boardArticles.length]);

  // Global listeners — registered once
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragRef.current) {
        const s = scaleRef.current;
        const dx = (e.clientX - dragRef.current.smx) / s;
        const dy = (e.clientY - dragRef.current.smy) / s;
        if (Math.hypot(e.clientX - dragRef.current.smx, e.clientY - dragRef.current.smy) > 5) {
          dragMovedRef.current = true;
        }
        const id = dragRef.current.id;
        const sx = dragRef.current.sx;
        const sy = dragRef.current.sy;
        setPositions(prev => ({ ...prev, [id]: { x: sx + dx, y: sy + dy } }));
      }
      if (panRef.current) {
        const dx = e.clientX - panRef.current.smx;
        const dy = e.clientY - panRef.current.smy;
        setPan({ x: panRef.current.spx + dx, y: panRef.current.spy + dy });
      }
      setConnDrag(prev => prev ? { ...prev, mx: e.clientX, my: e.clientY } : null);
    };
    const onUp = () => {
      dragRef.current = null;
      panRef.current = null;
      setDraggingId(null);
      setIsPanning(false);
      setConnDrag(null);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, []);

  const startCardDrag = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    const pos = positions[id] ?? { x: 0, y: 0 };
    dragRef.current = { id, smx: e.clientX, smy: e.clientY, sx: pos.x, sy: pos.y };
    dragMovedRef.current = false;
    setDraggingId(id);
  }, [positions]);

  const startPan = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    panRef.current = { smx: e.clientX, smy: e.clientY, spx: panRef2.current.x, spy: panRef2.current.y };
    setIsPanning(true);
  }, []);

  const startConn = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setConnDrag({ from: id, mx: e.clientX, my: e.clientY });
  }, []);

  const finishConn = useCallback((e: React.MouseEvent, toId: string) => {
    setConnDrag(prev => {
      if (!prev || prev.from === toId) return null;
      e.stopPropagation();
      setConnections(cs => {
        const exists = cs.some(c => (c.from === prev.from && c.to === toId) || (c.from === toId && c.to === prev.from));
        if (exists) return cs;
        return [...cs, { id: `${prev.from}--${toId}--${Date.now()}`, from: prev.from, to: toId }];
      });
      return null;
    });
  }, []);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1 / 0.9;
    setScale(s => {
      const ns = Math.min(2.5, Math.max(0.15, s * factor));
      const sf = ns / s;
      setPan(p => ({ x: mx - (mx - p.x) * sf, y: my - (my - p.y) * sf }));
      return ns;
    });
  }, []);

  const fitLayout = useCallback((layout: Record<string, Pos>) => {
    if (!canvasRef.current || boardArticles.length === 0) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xs = boardArticles.map(a => layout[a.id]?.x ?? 0);
    const ys = boardArticles.map(a => layout[a.id]?.y ?? 0);
    const minX = Math.min(...xs) - 60, minY = Math.min(...ys) - 60;
    const maxX = Math.max(...xs) + CARD_W + 60, maxY = Math.max(...ys) + CARD_H + 60;
    const cw = maxX - minX, ch = maxY - minY;
    const topInset = rect.width < 640 ? 120 : 86;
    const sideInset = rect.width < 640 ? 14 : 28;
    const availableWidth = Math.max(200, rect.width - sideInset * 2);
    const availableHeight = Math.max(180, rect.height - topInset - 24);
    const ns = Math.min(2, Math.max(0.15, Math.min(availableWidth / cw, availableHeight / ch)));
    setPan({
      x: sideInset + (availableWidth - cw * ns) / 2 - minX * ns,
      y: topInset + (availableHeight - ch * ns) / 2 - minY * ns,
    });
    setScale(ns);
  }, [boardArticles]);

  const zoomToFit = useCallback(() => fitLayout(positions), [fitLayout, positions]);

  useEffect(() => {
    const next = scatter(boardArticles);
    setPositions(next);
    setConnections(createConnectedNetwork(boardArticles, next));
    const frame = requestAnimationFrame(() => fitLayout(next));
    return () => cancelAnimationFrame(frame);
  }, [board.id, fitLayout]);

  useEffect(() => {
    const handleResize = () => fitLayout(positions);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitLayout, positions]);

  const cardCenter = (id: string) => {
    const p = positions[id];
    if (!p) return null;
    const element = canvasRef.current?.querySelector(`[data-card-id="${CSS.escape(id)}"]`);
    const rect = element?.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (rect && canvasRect) {
      return {
        x: rect.left - canvasRect.left + rect.width / 2,
        y: rect.top - canvasRect.top + rect.height / 2,
      };
    }
    const article = boardArticles.find(item => item.id === id);
    const height = article?.imageUrl ? 218 : 132;
    return { x: p.x * scale + pan.x + (CARD_W * scale) / 2, y: p.y * scale + pan.y + (height * scale) / 2 };
  };

  const cardPortToward = (id: string, target: { x: number; y: number }) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const portElements = Array.from(canvasRef.current?.querySelectorAll(`[data-port-for="${CSS.escape(id)}"]`) ?? []);
    const ports = portElements
      .map(port => {
        const rect = port.getBoundingClientRect();
        if (!canvasRect) return null;
        return {
          x: rect.left - canvasRect.left + rect.width / 2,
          y: rect.top - canvasRect.top + rect.height / 2,
        };
      })
      .filter((port): port is { x: number; y: number } => Boolean(port));
    if (ports.length === 0) return cardCenter(id);
    return ports.reduce((best, port) => {
      const current = Math.hypot(port.x - target.x, port.y - target.y);
      const previous = Math.hypot(best.x - target.x, best.y - target.y);
      return current < previous ? port : best;
    }, ports[0]);
  };

  const curve = (fx: number, fy: number, tx: number, ty: number) => {
    const dx = tx - fx;
    const dy = ty - fy;
    if (Math.abs(dx) >= Math.abs(dy)) {
      const bend = Math.max(Math.abs(dx) * 0.42, 52);
      const direction = Math.sign(dx || 1);
      return `M ${fx} ${fy} C ${fx + bend * direction} ${fy}, ${tx - bend * direction} ${ty}, ${tx} ${ty}`;
    }
    const bend = Math.max(Math.abs(dy) * 0.42, 52);
    const direction = Math.sign(dy || 1);
    return `M ${fx} ${fy} C ${fx} ${fy + bend * direction}, ${tx} ${ty - bend * direction}, ${tx} ${ty}`;
  };

  const rect = canvasRef.current?.getBoundingClientRect();

  return (
    <div
      className={`${isPanel ? "relative h-full w-full rounded-2xl border border-border bg-card" : "fixed inset-0 z-[100] bg-background"} overflow-hidden`}
      style={{ background: isPanel ? "var(--card)" : "var(--background)" }}
    >
      {/* Dot grid */}
      <DotGridBackground />

      {/* Responsive board navigation and header */}
      <div className="absolute left-3 right-3 top-3 z-30 flex h-14 items-center gap-2">
        {!isPanel && (
          <button
            onClick={onClose}
            className="flex h-14 flex-shrink-0 items-center gap-2 rounded-2xl bg-card px-4 text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground dark:bg-[#1c1c1e]"
            aria-label="Back to Discover"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs font-medium">For You</span>
          </button>
        )}

        <div className="flex h-14 min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl bg-card px-3 dark:bg-[#1c1c1e] sm:px-4">
          {isPanel && (
            <button
              onClick={onClose}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
              aria-label="Close board panel"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <span className="text-xl">{board.emoji}</span>
          <div className="min-w-[11rem] flex-shrink-0">
            {renaming ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") { setRenaming(false); setRenameValue(board.name); } }}
                onBlur={commitRename}
                className="text-sm font-semibold leading-none bg-transparent outline-none border-b border-foreground/30 w-full pb-px"
              />
            ) : (
              <p className="text-sm font-semibold leading-none truncate">{board.name}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
              {boardArticles.length} pins · {connections.length} connections · auto-connected · drag any port
            </p>
          </div>
          {boards.length > 1 && (
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto rounded-full bg-[var(--app-highlight)] p-1 scrollbar-hide">
              {boards.map(item => {
                const active = item.id === board.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectBoard?.(item)}
                    className={`flex h-8 max-w-[170px] flex-none items-center gap-1.5 rounded-full px-3 text-[11px] font-medium transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:bg-white/60 hover:text-foreground dark:hover:bg-white/10"
                    }`}
                    aria-pressed={active}
                  >
                    <span>{item.emoji}</span>
                    <span className="truncate">{item.name}</span>
                    <span className="opacity-55">{item.articleIds.length}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="ml-auto flex flex-shrink-0 items-center gap-1">
            {onFullscreen && (
              <button
                onClick={onFullscreen}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-highlight)] text-muted-foreground hover:bg-[var(--app-highlight-hover)]"
                aria-label={isPanel ? "Open board fullscreen" : "Return board to side panel"}
                title={isPanel ? "Fullscreen" : "Side panel"}
              >
                {isPanel ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
            )}
            <button onClick={() => setScale(s => Math.min(2.5, s * 1.2))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-highlight)] text-muted-foreground hover:bg-[var(--app-highlight-hover)]">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setScale(s => Math.max(0.15, s * 0.8))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-highlight)] text-muted-foreground hover:bg-[var(--app-highlight-hover)]">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button onClick={zoomToFit}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-highlight)] text-muted-foreground hover:bg-[var(--app-highlight-hover)]">
              <Scan className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
            {/* Three-dot menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-highlight)] text-muted-foreground hover:bg-[var(--app-highlight-hover)]"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-9 bg-card dark:bg-[#2c2c2e] rounded-xl py-1.5 min-w-[160px] z-50"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.22)" }}
                  onMouseLeave={() => !renaming && setMenuOpen(false)}
                >
                  <button
                    onClick={() => { setRenaming(true); setRenameValue(board.name); setMenuOpen(false); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--app-highlight)] transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    Rename board
                  </button>
                  <div className="h-px bg-border mx-3 my-1" />
                  <button
                    onClick={() => { onDeleteBoard(board.id); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-[var(--app-highlight)] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete board
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden"
        style={{ cursor: draggingId || isPanning ? "grabbing" : "grab" }}
        onMouseDown={startPan}
        onWheel={onWheel}
      >
        {/* SVG connections — screen space */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 6 }}>
          <defs>
            <linearGradient id="connectionGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>

          {connections.map(c => {
            const fromCenter = cardCenter(c.from), toCenter = cardCenter(c.to);
            if (!fromCenter || !toCenter) return null;
            const f = cardPortToward(c.from, toCenter);
            const t = cardPortToward(c.to, fromCenter);
            if (!f || !t) return null;
            const hov = hoveredConn === c.id;
            const d = curve(f.x, f.y, t.x, t.y);
            return (
              <g key={c.id} style={{ pointerEvents: "auto" }}>
                <path d={d} stroke="transparent" strokeWidth={18} fill="none" style={{ cursor: "pointer" }}
                  onMouseEnter={() => setHoveredConn(c.id)}
                  onMouseLeave={() => setHoveredConn(null)}
                  onClick={e => { e.stopPropagation(); setConnections(cs => cs.filter(x => x.id !== c.id)); }}
                />
                <path d={d}
                  data-connection-id={c.id}
                  stroke="var(--foreground)"
                  strokeWidth={hov ? 2.2 : 1.45}
                  fill="none" opacity={hov ? 0.95 : 0.52}
                  strokeLinecap="round"
                  strokeDasharray={hov ? "7 5" : "6 6"}
                  style={{ pointerEvents: "none", transition: "stroke 0.12s, opacity 0.12s, stroke-width 0.12s" }}
                />
                <circle cx={f.x} cy={f.y} r={hov ? 2.4 : 1.7} fill="var(--foreground)" opacity={hov ? 0.95 : 0.52} style={{ pointerEvents: "none" }} />
                <circle cx={t.x} cy={t.y} r={hov ? 2.4 : 1.7} fill="var(--foreground)" opacity={hov ? 0.95 : 0.52} style={{ pointerEvents: "none" }} />
                {hov && (
                  <g transform={`translate(${(f.x + t.x) / 2},${(f.y + t.y) / 2})`}
                    style={{ pointerEvents: "auto", cursor: "pointer" }}
                    onClick={e => { e.stopPropagation(); setConnections(cs => cs.filter(x => x.id !== c.id)); }}>
                    <circle r={9} fill="#ef4444" />
                    <line x1="-3.5" y1="-3.5" x2="3.5" y2="3.5" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
                    <line x1="3.5" y1="-3.5" x2="-3.5" y2="3.5" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
                  </g>
                )}
              </g>
            );
          })}

          {/* Live connection being drawn */}
          {connDrag && (() => {
            const tx = connDrag.mx - (rect?.left ?? 0);
            const ty = connDrag.my - (rect?.top ?? 0);
            const f = cardPortToward(connDrag.from, { x: tx, y: ty });
            if (!f) return null;
            return <path d={curve(f.x, f.y, tx, ty)} stroke="white" strokeWidth={2} strokeDasharray="5 4" fill="none" opacity={0.95} />;
          })()}
        </svg>

        {/* Cards */}
        <div style={{ position: "absolute", top: 0, left: 0, transformOrigin: "0 0", transform: `translate(${pan.x}px,${pan.y}px) scale(${scale})`, zIndex: 10 }}>
          {boardArticles.map(a => {
            const pos = positions[a.id] ?? { x: 0, y: 0 };
            const isDragged = draggingId === a.id;
            const isConnSrc = connDrag?.from === a.id;

            return (
              <div
                key={a.id}
                className="group/card"
                data-card-id={a.id}
                style={{
                  position: "absolute", left: pos.x, top: pos.y, width: CARD_W,
                  zIndex: isDragged || cardBoardMenu === a.id ? 100 : 10,
                  cursor: isDragged ? "grabbing" : "grab",
                  userSelect: "none",
                  filter: isDragged ? "drop-shadow(0 16px 40px rgba(0,0,0,0.35))" : "none",
                  transition: "filter 0.2s",
                }}
                onMouseDown={e => startCardDrag(e, a.id)}
                onMouseUp={e => finishConn(e, a.id)}
              >
                {/* Top connection port */}
                <div
                  data-port-for={a.id}
                  data-port-position="top"
                  onMouseDown={e => startConn(e, a.id)}
                  onMouseUp={e => finishConn(e, a.id)}
                  style={{ position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: isConnSrc ? "#fff" : "var(--card)", border: `2px solid ${isConnSrc ? "#fff" : "var(--border)"}`, cursor: "crosshair", zIndex: 20, boxShadow: "0 0 0 2px var(--background)", transition: "transform 0.12s, background 0.12s, opacity 0.14s" }}
                  className={`${isConnSrc || connDrag ? "opacity-100" : "opacity-0"} group-hover/card:opacity-100 hover:scale-125 hover:!bg-white hover:!border-white`}
                  title="Drag to connect"
                />

                {/* Card body */}
                <div
                  className="group bg-white dark:bg-[#2c2c2e]"
                  style={{
                    borderRadius: 16, overflow: "hidden",
                    border: "1px solid var(--border)",
                    outline: isConnSrc ? "2px solid rgba(255,255,255,0.9)" : "2px solid transparent",
                    outlineOffset: 1,
                  }}
                  onClick={event => {
                    event.stopPropagation();
                    if (!dragMovedRef.current) onOpenArticle?.(a);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open details for ${a.title}`}
                  onKeyDown={event => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      event.stopPropagation();
                      onOpenArticle?.(a);
                    }
                  }}
                >
                  {a.imageUrl && (
                    <div style={{ height: 130, overflow: "hidden", position: "relative" }}>
                      <img src={a.imageUrl} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                      <span style={{ position: "absolute", top: 8, left: 8, fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "white", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", padding: "2px 8px", borderRadius: 99, fontWeight: 500 }}>
                        {CATEGORY_EMOJI[a.category]} {a.category}
                      </span>
                    </div>
                  )}
                  <div style={{ padding: "10px 12px 9px" }}>
                    {!a.imageUrl && (
                      <span style={{ fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "white", background: "#1C1B18", padding: "2px 8px", borderRadius: 99, display: "inline-block", marginBottom: 7, fontWeight: 500 }}>
                        {CATEGORY_EMOJI[a.category]} {a.category}
                      </span>
                    )}
                    <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.45, color: "var(--foreground)", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden", margin: 0 }}>
                      {a.title}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
                      <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{a.source}</span>
                      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 2 }}>
                        {boards.length > 1 && (
                          <button
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); setCardBoardMenu(value => value === a.id ? null : a.id); }}
                            className="opacity-0 group-hover:opacity-100 hover:bg-[var(--app-highlight)] rounded-lg transition-opacity"
                            style={{ border: "none", background: "transparent", padding: 4, cursor: "pointer", color: "var(--muted-foreground)" }}
                            aria-label={`Save ${a.title} to another board`}
                          >
                            <Plus style={{ width: 11, height: 11 }} />
                          </button>
                        )}
                        <button
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => { e.stopPropagation(); onRemoveFromBoard(a.id, board.id); }}
                          className="opacity-0 group-hover:opacity-100 hover:bg-[var(--app-highlight)] rounded-lg transition-opacity"
                          style={{ border: "none", background: "transparent", padding: 4, cursor: "pointer", color: "var(--muted-foreground)" }}
                          aria-label={`Remove ${a.title} from ${board.name}`}
                        >
                          <Trash2 style={{ width: 11, height: 11 }} />
                        </button>
                        {cardBoardMenu === a.id && (
                          <div
                            onMouseDown={e => e.stopPropagation()}
                            className="absolute right-0 top-6 z-[220] min-w-[176px] rounded-xl border border-border bg-card py-1.5"
                          >
                            {boards.map(item => {
                              const inBoard = item.articleIds.includes(a.id);
                              return (
                                <button
                                  key={item.id}
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (inBoard) onRemoveFromBoard(a.id, item.id);
                                    else onAddToBoard?.(a.id, item.id);
                                    setCardBoardMenu(null);
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] text-muted-foreground transition-colors hover:bg-[var(--app-highlight)] hover:text-foreground"
                                >
                                  <span>{item.emoji}</span>
                                  <span className="flex-1 truncate">{item.name}</span>
                                  {inBoard ? <Check className="h-3 w-3 text-foreground" /> : <Plus className="h-3 w-3 opacity-35" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right port */}
                <div
                  data-port-for={a.id}
                  data-port-position="right"
                  onMouseDown={e => startConn(e, a.id)}
                  onMouseUp={e => finishConn(e, a.id)}
                  style={{ position: "absolute", right: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: isConnSrc ? "#fff" : "var(--card)", border: `2px solid ${isConnSrc ? "#fff" : "var(--border)"}`, cursor: "crosshair", zIndex: 20, boxShadow: "0 0 0 2px var(--background)", transition: "transform 0.12s, background 0.12s, opacity 0.14s" }}
                  className={`${isConnSrc || connDrag ? "opacity-100" : "opacity-0"} group-hover/card:opacity-100 hover:scale-125 hover:!bg-white hover:!border-white`}
                />
                {/* Left port */}
                <div
                  data-port-for={a.id}
                  data-port-position="left"
                  onMouseDown={e => startConn(e, a.id)}
                  onMouseUp={e => finishConn(e, a.id)}
                  style={{ position: "absolute", left: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", background: isConnSrc ? "#fff" : "var(--card)", border: `2px solid ${isConnSrc ? "#fff" : "var(--border)"}`, cursor: "crosshair", zIndex: 20, boxShadow: "0 0 0 2px var(--background)", transition: "transform 0.12s, background 0.12s, opacity 0.14s" }}
                  className={`${isConnSrc || connDrag ? "opacity-100" : "opacity-0"} group-hover/card:opacity-100 hover:scale-125 hover:!bg-white hover:!border-white`}
                />
                {/* Bottom port */}
                <div
                  data-port-for={a.id}
                  data-port-position="bottom"
                  onMouseDown={e => startConn(e, a.id)}
                  onMouseUp={e => finishConn(e, a.id)}
                  style={{ position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: isConnSrc ? "#fff" : "var(--card)", border: `2px solid ${isConnSrc ? "#fff" : "var(--border)"}`, cursor: "crosshair", zIndex: 20, boxShadow: "0 0 0 2px var(--background)", transition: "transform 0.12s, background 0.12s, opacity 0.14s" }}
                  className={`${isConnSrc || connDrag ? "opacity-100" : "opacity-0"} group-hover/card:opacity-100 hover:scale-125 hover:!bg-white hover:!border-white`}
                  title="Drag to connect"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom pill */}
      <div className="absolute bottom-4 right-4 z-30 bg-card dark:bg-[#1c1c1e] rounded-lg px-2.5 py-1 text-[11px] text-muted-foreground font-medium">
        {Math.round(scale * 100)}%
      </div>

      {boardArticles.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">{board.emoji}</div>
          <p className="font-medium text-foreground">Nothing pinned here yet</p>
          <p className="text-sm text-muted-foreground">Pin any article and it will appear in this space</p>
        </div>
      )}
    </div>
  );
}
