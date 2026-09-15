'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// 这个组件挂在 AppProvider 外面，拿不到 useApp()，所以直接读 AppProvider 落在
// localStorage 里的 'lang'。默认 zh，和 AppProvider 的 initialLang 保持一致。
function readLang(): 'zh' | 'en' {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

const copy = {
  zh: {
    text: '我们使用 Cookie 记住语言偏好并统计访问量。',
    policy: '隐私政策',
    decline: '拒绝',
    accept: '接受',
  },
  en: {
    text: 'We use cookies to remember your language and measure traffic.',
    policy: 'Privacy Policy',
    decline: 'Decline',
    accept: 'Accept',
  },
} as const;

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  useEffect(() => {
    let consent: string | null = null;
    try {
      consent = localStorage.getItem('cookie-consent');
    } catch {
      consent = null;
    }
    if (consent) return;

    setLang(readLang());

    // 首屏是转化入口（报名内测），横幅不能压在主 CTA 上：等用户滑过第一屏再出现。
    const maybeShow = () => {
      if (window.scrollY > window.innerHeight * 0.5) {
        setIsVisible(true);
        window.removeEventListener('scroll', maybeShow);
      }
    };
    maybeShow();
    window.addEventListener('scroll', maybeShow, { passive: true });
    return () => window.removeEventListener('scroll', maybeShow);
  }, []);

  const dismiss = (value: 'accepted' | 'declined') => {
    try {
      localStorage.setItem('cookie-consent', value);
    } catch {
      /* 隐私模式：本次会话内关掉就行 */
    }
    setIsVisible(false);
  };

  const t = copy[lang];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[100] px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] tablet:px-6 tablet:pb-6"
          role="region"
          aria-label={t.policy}
        >
          <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-700 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
            <p className="min-w-[12rem] flex-1 text-xs leading-snug text-slate-200">
              {t.text}{' '}
              <Link
                href="/privacy"
                className="text-blue-300 underline underline-offset-2 hover:text-blue-200"
              >
                {t.policy}
              </Link>
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => dismiss('declined')}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
              >
                {t.decline}
              </button>
              <button
                onClick={() => dismiss('accepted')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-500 active:scale-95"
              >
                {t.accept}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
