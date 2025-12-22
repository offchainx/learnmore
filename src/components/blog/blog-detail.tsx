'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { useApp } from '@/providers/app-provider';
import { NewsletterForm } from '@/components/marketing/newsletter-form';
import { BlogPost } from '@prisma/client';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Calendar, Clock, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface BlogDetailProps {
  post: BlogPost;
}

export function BlogDetailClient({ post }: BlogDetailProps) {
  const { lang, setLang } = useApp();

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const t = {
    en: {
      back: "Back to Blog",
      newsletter: {
        title: "Get smarter every week.",
        desc: "Join 50,000+ students receiving our weekly study hacks and product updates.",
        placeholder: "Enter your email",
        btn: "Subscribe",
        note: "No spam, unsubscribe anytime."
      },
      footer: "© 2025 LearnMore Edu. All rights reserved."
    },
    zh: {
      back: "返回博客",
      newsletter: {
        title: "每周变强一点点。",
        desc: "加入 50,000+ 学员，接收我们每周发送的学习黑客技巧和产品更新。",
        placeholder: "输入您的邮箱",
        btn: "订阅",
        note: "无垃圾邮件，随时退订。"
      },
      footer: "© 2025 LearnMore Edu. 保留所有权利。"
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100">
      <Navbar lang={lang} onToggleLang={toggleLang} />

      <main className="pt-24 pb-20">
        <article className="px-6 max-w-4xl mx-auto">
          {/* Back Link */}
          <div className="mb-8">
            <Link href="/blog">
              <Button variant="ghost" className="text-slate-400 hover:text-white pl-0 gap-2">
                <ArrowLeft className="w-4 h-4" /> {currentT.back}
              </Button>
            </Link>
          </div>

          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-6">
               <span className="bg-blue-600/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30 uppercase tracking-wider">
                  {post.category}
               </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 border-b border-slate-800 pb-8">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-slate-200 font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
              </div>
              {/* Read time could be calculated */}
              <div className="flex items-center gap-2">
                 <Clock className="w-4 h-4" />
                 <span>5 min read</span>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="mb-12 rounded-2xl overflow-hidden border border-slate-800 aspect-[2/1]">
              <img 
                src={post.coverImage} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none mb-20 prose-headings:font-serif prose-a:text-blue-400 hover:prose-a:text-blue-300">
            <ReactMarkdown 
              remarkPlugins={[remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Newsletter Signup */}
        <section className="px-6 max-w-4xl mx-auto">
           <NewsletterForm content={currentT.newsletter} />
        </section>

      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>
    </div>
  );
}
