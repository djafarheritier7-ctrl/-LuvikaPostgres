// src/components/profile/PortfolioSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { ExternalLink, Github, Eye } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type PortfolioItem = {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  demo_url?: string;
  repo_url?: string;
  tags: string[];
};

export default function PortfolioSection({ items }: { items: PortfolioItem[] }) {
  if (!items.length) return null;

  return (
    <Card className="glass-border overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Eye className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white">Projets</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ y: -4 }}
              className="group border border-white/10 rounded-xl overflow-hidden hover:bg-white/5 transition-all duration-300"
            >
              {item.image_url ? (
                <div className="h-36 overflow-hidden relative">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    width={400}
                    height={144}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div className="h-36 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
                  <Eye className="w-10 h-10 text-cyan-400/50" />
                </div>
              )}
              
              <div className="p-4">
                <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {item.title}
                </h3>
                
                {item.description && (
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
                
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 text-xs rounded-full border border-cyan-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-xs rounded-full">
                        +{item.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3 mt-4 pt-3 border-t border-white/10">
                  {item.demo_url && (
                    <a
                      href={item.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors group/link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live</span>
                    </a>
                  )}
                  {item.repo_url && (
                    <a
                      href={item.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors group/link"
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>Code</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}