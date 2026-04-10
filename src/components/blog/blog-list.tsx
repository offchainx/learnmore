'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { MarketingNewsletterSection } from '@/components/marketing/MarketingNewsletterSection';
import { Button } from '@/components/ui/button';
import { MarketingSimpleFooter } from '@/components/marketing/MarketingSimpleFooter';
import { getBlogNewsletterContent } from '@/lib/marketing/newsletter';
import { resolveMarketingLocale } from '@/lib/marketing/site-shell';
import { Tag, ArrowRight, SearchX } from 'lucide-react';
import { useApp } from '@/providers';
import { BlogPost } from '@prisma/client';
import Link from 'next/link';

interface BlogListProps {
  initialPosts: BlogPost[];
}

export function BlogList({ initialPosts }: BlogListProps) {
  const { lang, setLang } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');

  const toggleLang = () => {
    const nextLang = lang === 'en' ? 'zh' : 'en';
    setLang(nextLang);
  };

  const t = {
    en: {
      title: "Blog & Newsroom",
      subtitle: "Updates, learning tips, and engineering insights from the LearnMore team.",
      categories: ["All", "Product Updates", "Learning Tips", "Edu News", "Engineering"], // Updated categories based on mock data logic but simplified
      featured: "Featured Story",
      readMore: "Read Article",
      minRead: "min read",
    },
    zh: {
      title: "动态资讯",
      subtitle: "来自 LearnMore 团队的最新更新、学习技巧和技术洞察。",
      categories: ["全部", "产品更新", "学习技巧", "教育新闻", "工程技术"],
      featured: "精选故事",
      readMore: "阅读全文",
      minRead: "分钟阅读",
    }
  };

  const currentT = t[lang as keyof typeof t] || t['en'];
  const locale = resolveMarketingLocale(lang);

  // Derive categories from available posts + 'All'
  const uniqueCategories = Array.from(new Set(initialPosts.map(p => p.category)));
  const categories = ['All', ...uniqueCategories];

  // Featured post logic: Pick the first one or a specific one
  const featuredPost = initialPosts[0]; 
  const remainingPosts = initialPosts.slice(1);
  const displayPosts = activeCategory === 'All' ? remainingPosts : initialPosts.filter(p => p.category === activeCategory && p.id !== featuredPost?.id);
  const hasAnyPosts = initialPosts.length > 0;
  const hasVisiblePosts = displayPosts.length > 0;


  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar lang={lang} onToggleLang={toggleLang} />

      <main className="pt-24 pb-20">
        
        {/* Header */}
        <section className="px-6 py-12 max-w-7xl mx-auto">
           <h1 className="text-4xl md:text-6xl font-serif font-medium mb-4">{currentT.title}</h1>
           <p className="text-xl text-slate-400 max-w-2xl">{currentT.subtitle}</p>
        </section>

        {/* Featured Post (Hero) */}
        {featuredPost && activeCategory === 'All' && (
        <section className="px-6 max-w-7xl mx-auto mb-20">
            <Link href={`/blog/${featuredPost.slug}`}>
           <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 group cursor-pointer hover:border-slate-700 transition-colors">
              <div className="grid lg:grid-cols-2">
                 <div className="relative h-64 lg:h-auto overflow-hidden">
                    <img 
                       src={featuredPost.coverImage || ''} 
                       alt={featuredPost.title} 
                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute top-4 left-4">
                       <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          {currentT.featured}
                       </span>
                    </div>
                 </div>
                 <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4 text-blue-400 text-sm font-bold uppercase tracking-wider">
                       <Tag className="w-3 h-3" /> {featuredPost.category}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                       {featuredPost.title}
                    </h2>
                    <p className="text-slate-400 text-lg mb-8 line-clamp-3">
                       {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                       <div className="flex items-center gap-3">
                          <div className="text-sm">
                             <div className="font-bold text-white">{featuredPost.author}</div>
                             <div className="text-slate-500 text-xs flex items-center gap-2">
                                <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                             </div>
                          </div>
                       </div>
                       <Button variant="ghost" className="text-white group-hover:translate-x-1 transition-transform">
                          <ArrowRight className="w-6 h-6" />
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
           </Link>
        </section>
        )}

        {/* Categories Filter */}
        <section className="px-6 max-w-7xl mx-auto mb-12 sticky top-20 z-20 bg-[#020617]/95 backdrop-blur-sm py-4 -mx-6 md:mx-auto">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                 <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                       activeCategory === cat 
                          ? 'bg-white text-slate-900 border-white' 
                          : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600 hover:text-white'
                    }`}
                 >
                    {cat}
                 </button>
              ))}
           </div>
        </section>

        {/* Article Grid */}
        <section className="px-6 max-w-7xl mx-auto mb-24">
           {hasVisiblePosts ? (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {displayPosts.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.id}>
                   <article className="group cursor-pointer flex flex-col h-full">
                      <div className="relative aspect-[16/10] mb-6 overflow-hidden rounded-2xl border border-slate-800">
                         <img 
                            src={post.coverImage || ''} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                         <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-xs font-bold text-slate-300 px-3 py-1 rounded-full border border-slate-700/50">
                            {post.category}
                         </div>
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                         <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-blue-400 transition-colors">
                            {post.title}
                         </h3>
                         <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                            {post.excerpt}
                         </p>
                         
                         <div className="mt-auto flex items-center gap-3 pt-4 border-t border-slate-900">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                               {post.author.charAt(0)}
                            </div>
                            <div className="text-xs">
                               <div className="font-bold text-slate-200">{post.author}</div>
                               <div className="text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</div>
                            </div>
                         </div>
                      </div>
                   </article>
                   </Link>
                ))}
             </div>
           ) : (
             <div className="rounded-3xl border border-slate-800 bg-slate-900/30 px-6 py-14 text-center">
               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                 <SearchX className="h-7 w-7" />
               </div>
               <h3 className="text-2xl font-bold text-white">
                 {hasAnyPosts ? 'No articles match this category yet.' : 'No articles published yet.'}
               </h3>
               <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
                 {hasAnyPosts
                   ? 'Try another category or reset the filter to browse the full newsroom.'
                   : 'Our editorial team is still preparing the first set of posts. Please check back soon.'}
               </p>
               {activeCategory !== 'All' ? (
                 <Button
                   type="button"
                   variant="glow"
                   className="mt-6"
                   onClick={() => setActiveCategory('All')}
                 >
                   Show all posts
                 </Button>
               ) : null}
             </div>
           )}
        </section>

        {/* Newsletter Signup */}
        <MarketingNewsletterSection content={getBlogNewsletterContent(locale)} />

      </main>

      <MarketingSimpleFooter locale={locale} />
    </div>
  );
}
