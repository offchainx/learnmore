import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Search, Mail, Clock, ChevronRight, Tag, ArrowRight, Calendar } from 'lucide-react';

const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [lang, setLang] = useState<'en' | 'zh'>('en'); 
  const [activeCategory, setActiveCategory] = useState('All');
  const [email, setEmail] = useState('');

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const t = {
    en: {
      title: "Blog & Newsroom",
      subtitle: "Updates, learning tips, and engineering insights from the LearnMore team.",
      newsletter: {
        title: "Get smarter every week.",
        desc: "Join 50,000+ students receiving our weekly study hacks and product updates.",
        placeholder: "Enter your email",
        btn: "Subscribe",
        note: "No spam, unsubscribe anytime."
      },
      categories: ["All", "Product Updates", "Learning Tips", "Edu News", "Engineering"],
      featured: "Featured Story",
      readMore: "Read Article",
      minRead: "min read",
      footer: "© 2025 LearnMore Edu. All rights reserved."
    },
    zh: {
      title: "动态资讯",
      subtitle: "来自 LearnMore 团队的最新更新、学习技巧和技术洞察。",
      newsletter: {
        title: "每周变强一点点。",
        desc: "加入 50,000+ 学员，接收我们每周发送的学习黑客技巧和产品更新。",
        placeholder: "输入您的邮箱",
        btn: "订阅",
        note: "无垃圾邮件，随时退订。"
      },
      categories: ["全部", "产品更新", "学习技巧", "教育新闻", "工程技术"],
      featured: "精选故事",
      readMore: "阅读全文",
      minRead: "分钟阅读",
      footer: "© 2025 LearnMore Edu. 保留所有权利。"
    }
  };

  const currentT = t[lang];

  // Mock Data
  const posts = [
    {
      id: 1,
      title: lang === 'en' ? "How Knowledge Graphs Change the Way We Learn" : "知识图谱如何改变我们的学习方式",
      excerpt: lang === 'en' ? "We are moving away from linear textbooks to a connected web of concepts. Here is the science behind why it works." : "我们正在从线性课本转向概念网络。这就是其背后的科学原理。",
      category: lang === 'en' ? "Engineering" : "工程技术",
      author: "James Chen",
      role: "CTO",
      date: "Oct 24, 2024",
      readTime: 8,
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: 2,
      title: lang === 'en' ? "5 Study Hacks for IGCSE Math" : "IGCSE 数学的 5 个学习黑客技巧",
      excerpt: lang === 'en' ? "Stop grinding past papers aimlessly. Use these targeted strategies to boost your grade by one letter." : "别再盲目刷真题了。使用这些针对性策略，让你的成绩提升一个等级。",
      category: lang === 'en' ? "Learning Tips" : "学习技巧",
      author: "Sarah Miller",
      role: "Head of Product",
      date: "Oct 20, 2024",
      readTime: 5,
      image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: 3,
      title: lang === 'en' ? "Ministry of Education Announces New SPM Format" : "教育部宣布新的 SPM 考试格式",
      excerpt: lang === 'en' ? "Everything you need to know about the format changes for the upcoming 2025 examination cycle." : "关于即将到来的 2025 年考试周期的格式变化，你需要知道的一切。",
      category: lang === 'en' ? "Edu News" : "教育新闻",
      author: "Editorial Team",
      role: "LearnMore",
      date: "Oct 18, 2024",
      readTime: 4,
      image: "https://images.unsplash.com/photo-1427504746696-ea5abd7dfe88?q=80&w=800&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: 4,
      title: lang === 'en' ? "Feature Drop: Dark Mode & Offline Support" : "功能发布：深色模式与离线支持",
      excerpt: lang === 'en' ? "You asked, we listened. Now you can study late at night without eye strain, and learn on the go without data." : "你们的要求，我们听到了。现在你可以深夜学习不伤眼，外出学习不费流量。",
      category: lang === 'en' ? "Product Updates" : "产品更新",
      author: "David Park",
      role: "Lead Engineer",
      date: "Oct 15, 2024",
      readTime: 3,
      image: "https://images.unsplash.com/photo-1555421689-d68471e189f2?q=80&w=800&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
    },
    {
      id: 5,
      title: lang === 'en' ? "Why 'Cramming' Doesn't Work: The Science of Spaced Repetition" : "为什么“临时抱佛脚”不管用：间隔重复的科学",
      excerpt: lang === 'en' ? "Understand the forgetting curve and how our algorithm fights it automatically for you." : "了解遗忘曲线，以及我们的算法如何自动帮你对抗它。",
      category: lang === 'en' ? "Learning Tips" : "学习技巧",
      author: "Dr. Eleanor Vance",
      role: "CEO",
      date: "Oct 10, 2024",
      readTime: 6,
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100&auto=format&fit=crop"
    }
  ];

  const featuredPost = {
    title: lang === 'en' ? "Introducing AI Speaking Coach: Your 24/7 Language Partner" : "隆重推出 AI 口语教练：你的 7x24 小时语言伙伴",
    excerpt: lang === 'en' ? "Master English and Malay pronunciation with real-time feedback. Our new voice model understands local accents and corrects intonation instantly." : "通过实时反馈掌握英语和马来语发音。我们的新语音模型能听懂本地口音并即时纠正语调。",
    category: lang === 'en' ? "Product Updates" : "产品更新",
    author: "LearnMore Team",
    date: "Nov 1, 2024",
    readTime: 6,
    image: "https://images.unsplash.com/photo-1589254065878-42c9da912fa5?q=80&w=1200&auto=format&fit=crop"
  };

  const filteredPosts = activeCategory === (lang === 'en' ? 'All' : '全部') 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

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
        <section className="px-6 max-w-7xl mx-auto mb-20">
           <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 group cursor-pointer hover:border-slate-700 transition-colors">
              <div className="grid lg:grid-cols-2">
                 <div className="relative h-64 lg:h-auto overflow-hidden">
                    <img 
                       src={featuredPost.image} 
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
                                <span>{featuredPost.date}</span> • <span>{featuredPost.readTime} {currentT.minRead}</span>
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
        </section>

        {/* Categories Filter */}
        <section className="px-6 max-w-7xl mx-auto mb-12 sticky top-20 z-20 bg-[#020617]/95 backdrop-blur-sm py-4 -mx-6 md:mx-auto">
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {currentT.categories.map((cat) => (
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
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filteredPosts.map((post) => (
                 <article key={post.id} className="group cursor-pointer flex flex-col h-full">
                    <div className="relative aspect-[16/10] mb-6 overflow-hidden rounded-2xl border border-slate-800">
                       <img 
                          src={post.image} 
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
                          <img src={post.avatar} alt={post.author} className="w-8 h-8 rounded-full object-cover border border-slate-800" />
                          <div className="text-xs">
                             <div className="font-bold text-slate-200">{post.author}</div>
                             <div className="text-slate-500">{post.date} • {post.readTime} {currentT.minRead}</div>
                          </div>
                       </div>
                    </div>
                 </article>
              ))}
           </div>
        </section>

        {/* Newsletter Signup */}
        <section className="px-6 max-w-4xl mx-auto">
           <div className="bg-gradient-to-br from-blue-900/20 to-slate-900/20 border border-slate-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10">
                 <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-700 shadow-xl transform rotate-3">
                    <Mail className="w-8 h-8 text-blue-400" />
                 </div>
                 <h2 className="text-3xl font-serif text-white mb-4">{currentT.newsletter.title}</h2>
                 <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    {currentT.newsletter.desc}
                 </p>
                 
                 <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                    <Input 
                       placeholder={currentT.newsletter.placeholder} 
                       className="bg-slate-950 border-slate-700 text-white h-12"
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button variant="glow" size="lg" className="h-12 px-8">
                       {currentT.newsletter.btn}
                    </Button>
                 </form>
                 <p className="text-xs text-slate-600 mt-4">{currentT.newsletter.note}</p>
              </div>
           </div>
        </section>

      </main>

      <footer className="bg-[#020617] border-t border-slate-900 py-10 text-center text-slate-600 text-sm">
         <div className="max-w-7xl mx-auto px-4">
            <p>{currentT.footer}</p>
         </div>
      </footer>
    </div>
  );
};

export default BlogPage;