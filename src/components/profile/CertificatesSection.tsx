// src/components/profile/CertificatesSection.tsx
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Award, ExternalLink, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

type Certificate = {
  id: string;
  title: string;
  issuer: string;
  date_issued: string;
  credential_url?: string;
  thumbnail_url?: string;
};

const issuerColors: Record<string, string> = {
  'MAKEATHON Orange': 'from-orange-500 to-red-500',
  'Google': 'from-blue-500 to-cyan-500',
  'Meta': 'from-blue-500 to-indigo-500',
  'Coursera': 'from-green-500 to-emerald-500',
  'Microsoft': 'from-purple-500 to-pink-500',
  'LinkedIn': 'from-sky-500 to-blue-600',
  'AWS': 'from-amber-500 to-yellow-500',
};

export default function CertificatesSection({ items }: { items: Certificate[] }) {
  if (!items.length) return null;

  return (
    <Card className="glass-border overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <Award className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white">Certifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((cert, index) => {
            const color = issuerColors[cert.issuer] || 'from-gray-500 to-gray-400';
            const date = new Date(cert.date_issued);
            const formattedDate = date.toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'short' 
            });
            
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ x: 4 }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-white/5 to-transparent border border-white/10 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Icône avec gradient */}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300`}>
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {cert.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-0.5">
                      {cert.issuer}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      <p className="text-gray-500 text-xs">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                  
                  {/* Lien externe */}
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-center p-1 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-all duration-200"
                      aria-label="Voir certification"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                {/* Effet de bordure au hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 transition-all duration-500" />
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}