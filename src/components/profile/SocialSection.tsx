// src/components/profile/SocialSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Share2, Instagram, Linkedin, Github, Youtube } from 'lucide-react';
import { SiTiktok, SiPinterest, SiReddit, SiDiscord, SiThreads } from "react-icons/si";
import SocialCard from './SocialCard';
import { isSectionEnabled } from '../../lib/utils/profileHelpers';

type Profile = {
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  pinterest?: string | null;
  tiktok?: string | null;
  snapchat?: string | null;
  telegram?: string | null;
  discord?: string | null;
  reddit?: string | null;
  threads?: string | null;
  youtube?: string | null;
};

type CardConfig = {
  scan_type: string;
  enabled: boolean;
};

export default function SocialSection({ 
  profile, 
  cardConfigs 
}: { 
  profile: Profile; 
  cardConfigs: CardConfig[]; 
}) {
  const showSocialSection = isSectionEnabled('social', cardConfigs) && (
    profile.instagram?.trim() ||
    profile.linkedin?.trim() ||
    profile.github?.trim() ||
    profile.pinterest?.trim() ||
    profile.tiktok?.trim() ||
    profile.snapchat?.trim() ||
    profile.telegram?.trim() ||
    profile.discord?.trim() ||
    profile.reddit?.trim() ||
    profile.threads?.trim() ||
    profile.youtube?.trim()
  );

  if (!showSocialSection) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2 }}
      className="w-full px-4 mt-10"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Share2 className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Mes réseaux sociaux</h2>
          </div>
          <p className="text-sm text-gray-400">
            Retrouvez-moi sur les plateformes professionnelles et créatives
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          
          {profile.instagram?.trim() && (
            <SocialCard
              platform="instagram"
              label="Instagram"
              handle={profile.instagram.trim()}
              href={`https://instagram.com/${encodeURIComponent(profile.instagram.trim())}`}
              icon={<Instagram className="w-5 h-5 text-white" />}
            />
          )}
          
          {profile.linkedin?.trim() && (
            <SocialCard
              platform="linkedin"
              label="LinkedIn"
              handle={profile.linkedin.trim()}
              href={`https://linkedin.com/in/${encodeURIComponent(profile.linkedin.trim())}`}
              icon={<Linkedin className="w-5 h-5 text-white" />}
            />
          )}
          
          {profile.github?.trim() && (
            <SocialCard
              platform="github"
              label="GitHub"
              handle={profile.github.trim()}
              href={`https://github.com/${encodeURIComponent(profile.github.trim())}`}
              icon={<Github className="w-5 h-5 text-white" />}
            />
          )}
          
          {profile.youtube?.trim() && (
            <SocialCard
              platform="youtube"
              label="YouTube"
              handle={profile.youtube.trim()}
              href={`https://youtube.com/@${encodeURIComponent(profile.youtube.trim().replace(/^@/, ''))}`}
              icon={<Youtube className="w-5 h-5 text-white" />}
            />
          )}
          
          {profile.tiktok?.trim() && (
            <SocialCard
              platform="tiktok"
              label="TikTok"
              handle={`@${profile.tiktok.trim().replace(/^@/, '')}`}
              href={`https://tiktok.com/@${encodeURIComponent(profile.tiktok.trim().replace(/^@/, ''))}`}
              icon={<SiTiktok className="w-5 h-5 text-white" />}
            />
          )}
          
          {profile.snapchat?.trim() && (
            <SocialCard
              platform="snapchat"
              label="Snapchat"
              handle={profile.snapchat.trim()}
              href={`https://snapchat.com/add/${encodeURIComponent(profile.snapchat.trim())}`}
              icon={<SnapchatIcon className="w-5 h-5 text-white" />}
            />
          )}
          
          {profile.telegram?.trim() && (
            <SocialCard
              platform="telegram"
              label="Telegram"
              handle={profile.telegram.trim()}
              href={`https://t.me/${encodeURIComponent(profile.telegram.trim())}`}
              icon={<TelegramIcon className="w-5 h-5 text-white" />}
            />
          )}

          {profile.pinterest?.trim() && (
            <SocialCard
              platform="pinterest"
              label="Pinterest"
              handle={profile.pinterest.trim()}
              href={`https://pinterest.com/${encodeURIComponent(profile.pinterest.trim())}`}
              icon={<SiPinterest className="w-5 h-5 text-white" />}
            />
          )}

          {profile.discord?.trim() && (
            <SocialCard
              platform="discord"
              label="Discord"
              handle={profile.discord.trim()}
              href={`https://discord.com/users/${encodeURIComponent(profile.discord.trim())}`}
              icon={<SiDiscord className="w-5 h-5 text-white" />}
            />
          )}

          {profile.reddit?.trim() && (
            <SocialCard
              platform="reddit"
              label="Reddit"
              handle={profile.reddit.trim()}
              href={`https://reddit.com/user/${encodeURIComponent(profile.reddit.trim())}`}
              icon={<SiReddit className="w-5 h-5 text-white" />}
            />
          )}

          {profile.threads?.trim() && (
            <SocialCard
              platform="threads"
              label="Threads"
              handle={profile.threads.trim()}
              href={`https://threads.net/@${encodeURIComponent(profile.threads.trim())}`}
              icon={<SiThreads className="w-5 h-5 text-white" />}
            />
          )}
        </div>

        <div className="mt-10 pt-8 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
            <span>Réseaux sociaux vérifiés</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Icônes SVG customs
const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.333 13.5l-1.45 4.35c-.15.45-.6.6-1 .45L12 19l-6.5 3.5c-.4.2-.8-.1-.6-.5l1.5-6.5L3.5 12c-.2-.4 0-.8.4-.8l17-7c.4-.2.8.1.6.5l-2.5 12.5c-.1.5-.5.8-.9.6l-2.767-1.167z"/>
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.333 13.5l-1.45 4.35c-.15.45-.6.6-1 .45L12 19l-6.5 3.5c-.4.2-.8-.1-.6-.5l1.5-6.5L3.5 12c-.2-.4 0-.8.4-.8l17-7c.4-.2.8.1.6.5l-2.5 12.5c-.1.5-.5.8-.9.6l-2.767-1.167z"/>
  </svg>
);