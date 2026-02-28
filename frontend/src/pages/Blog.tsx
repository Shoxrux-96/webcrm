import { motion } from 'motion/react';
import { getBlogs } from '../api/api';
import { Calendar, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import React from 'react';

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

export const Blog = () => {
  const [blogs, setBlogs] = React.useState<Blog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const postsPerPage = 12;

  React.useEffect(() => {
    getBlogs()
      .then((data: Blog[]) => setBlogs(data.filter(b => b.status === 'published')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...blogs].sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalPages = Math.ceil(sorted.length / postsPerPage);
  const currentPosts = sorted.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const paginate = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // YouTube thumbnail helper
  const getYoutubeThumbnail = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const getImage = (blog: Blog) => {
    if (blog.image) return blog.image;
    if (blog.youtube_link) return getYoutubeThumbnail(blog.youtube_link);
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Blog va Yangiliklar</h1>
        <p className="text-slate-600 max-w-xl mx-auto">
          Sohadagi so'nggi yangiliklar, foydali maqolalar va o'quv markazimiz hayotidan lavhalar.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Yuklanmoqda...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentPosts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (i % 3) * 0.1 }}
              className="group bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all flex flex-col"
            >
              {getImage(post) && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={getImage(post)!}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
              <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  {post.created_at?.split('T')[0]}
                </div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 line-clamp-2 flex-1">
                  {post.short_text}
                </p>
                <Link
                  to={`/blog/${post.id}`}
                  className="flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all pt-4"
                >
                  Batafsil o'qish <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.article>
          ))}

          {currentPosts.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400">
              Hozircha maqolalar yo'q
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-12">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => paginate(num)}
                className={`w-10 h-10 rounded-xl font-bold transition-all ${
                  currentPage === num
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};