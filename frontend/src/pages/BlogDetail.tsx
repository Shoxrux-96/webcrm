import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlog } from '../api/api';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { motion } from 'motion/react';

interface Blog {
  id: number;
  title: string;
  image?: string;
  youtube_link?: string;
  short_text: string;
  content: string;
  status: string;
  created_at: string;
}

export const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = React.useState<Blog | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    getBlog(Number(id))
      .then(setPost)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const getYoutubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|v\/|watch\?v=|&v=)([^#&?]{11})/);
    return match ? match[1] : null;
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-32 text-center text-slate-400">Yuklanmoqda...</div>;
  }

  if (!post || post.status !== 'published') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-6">
        <h1 className="text-4xl font-bold text-slate-900">Maqola topilmadi yoki hali chop etilmagan</h1>
        <Link to="/blog" className="inline-flex items-center gap-2 text-indigo-600 font-bold">
          <ArrowLeft className="w-5 h-5" /> Blogga qaytish
        </Link>
      </div>
    );
  }

  const videoId = post.youtube_link ? getYoutubeId(post.youtube_link) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-16 space-y-12"
    >
      <Link to="/blog" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors">
        <ArrowLeft className="w-5 h-5" /> Orqaga
      </Link>

      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" /> {post.created_at?.split('T')[0]}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            {post.title}
          </h1>
        </div>

        {videoId ? (
          <div className="aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : post.image ? (
          <div className="aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : null}

        <div className="grid lg:grid-cols-[1fr_auto] gap-12 items-start">
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-xl text-slate-600 leading-relaxed font-medium mb-8">
              {post.short_text}
            </p>
            <div
              className="text-slate-700 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <div className="lg:sticky lg:top-24 space-y-8">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <h3 className="font-bold text-slate-900">Ulashish</h3>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};