import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Share2 } from 'lucide-react';

const SITE_URL = 'https://www.wowdayday.com';
const SHARE_TITLE = 'WoW Day Day - 魔兽天天看';
const SHARE_SUMMARY = '艾泽拉斯冒险者的每日基地，47+精选魔兽工具导航';

const QQ_SHARE_URL = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent(SHARE_TITLE)}&summary=${encodeURIComponent(SHARE_SUMMARY)}`;

const WEIBO_SHARE_URL = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent(`${SHARE_TITLE} | ${SHARE_SUMMARY}`)}`;

function useShareMenuClose(
  open: boolean,
  onClose: () => void,
  panelRef: RefObject<HTMLElement | null>,
  btnRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!open) return;

    const onDocMouse = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (btnRef.current?.contains(t)) return;
      onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', onDocMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, panelRef, btnRef]);
}

export default function ShareMenu() {
  const [open, setOpen] = useState(false);
  const [copyDone, setCopyDone] = useState(false);
  const [wechatHint, setWechatHint] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const close = useCallback(() => setOpen(false), []);
  useShareMenuClose(open, close, panelRef, btnRef);

  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      setCopyDone(true);
      copyTimerRef.current = setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setCopyDone(false);
    }
  };

  const handleWechat = () => {
    setWechatHint(true);
    window.setTimeout(() => setWechatHint(false), 3200);
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: SHARE_TITLE,
        text: SHARE_SUMMARY,
        url: SITE_URL,
      });
      setOpen(false);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="分享本站"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-void-mid text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
      >
        <Share2 className="h-5 w-5" strokeWidth={2} />
      </button>

      {/* 移动端：全屏遮罩 */}
      <div
        className={`fixed inset-0 z-[60] bg-black/50 transition-opacity duration-200 md:hidden ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      />

      {/* 微信提示 */}
      <div
        className={`fixed left-1/2 top-1/2 z-[80] max-w-[min(90vw,20rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-600 bg-slate-900/95 px-4 py-3 text-center text-sm text-slate-200 shadow-xl transition-opacity duration-200 ${
          wechatHint ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        role="status"
      >
        请截图或复制链接发送给微信好友
      </div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-hidden={!open}
        aria-label="分享面板"
        className={[
          'overflow-hidden border border-slate-700 bg-void-mid shadow-xl transition-all duration-200 ease-out will-change-transform',
          'fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] rounded-t-2xl md:absolute md:inset-auto md:bottom-auto md:left-auto md:right-0 md:top-full md:mt-2 md:max-h-none md:w-[min(100vw-2rem,20rem)] md:rounded-xl',
          open
            ? 'pointer-events-auto translate-y-0 opacity-100 md:scale-100'
            : 'pointer-events-none opacity-0 max-md:translate-y-full md:translate-y-0 md:scale-95',
        ].join(' ')}
      >
        <div className="border-b border-slate-800 px-4 py-3 text-center text-sm font-semibold text-slate-100">
          分享给朋友 🌞
        </div>
        <div className="flex flex-col gap-0.5 p-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800/90"
          >
            <span className="text-lg" aria-hidden>
              🔗
            </span>
            <span>{copyDone ? '✅ 已复制' : '复制链接'}</span>
          </button>

          <button
            type="button"
            onClick={handleWechat}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800/90"
          >
            <span className="text-lg" aria-hidden>
              💬
            </span>
            <span>微信分享</span>
          </button>

          <a
            href={QQ_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/90"
            onClick={() => setOpen(false)}
          >
            <span className="text-lg" aria-hidden>
              🐧
            </span>
            <span>QQ 分享</span>
          </a>

          <a
            href={WEIBO_SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors hover:bg-slate-800/90"
            onClick={() => setOpen(false)}
          >
            <span className="text-lg" aria-hidden>
              📱
            </span>
            <span>微博分享</span>
          </a>

          {canNativeShare ? (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800/90 md:hidden"
            >
              <span className="text-lg" aria-hidden>
                📤
              </span>
              <span>更多分享方式</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
