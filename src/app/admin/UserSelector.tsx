// src/app/admin/UserSelector.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';

export type User = {
  id: string;
  full_name: string;
  username: string;
  email: string;
  subscription_plan: 'basic' | 'premium' | 'entreprise';
};

type Props = {
  onSelect: (user: User | null) => void;
  selectedUser: User | null;
  displayField?: 'email' | 'username' | 'full_name';
};

export default function UserSelector({
  onSelect,
  selectedUser,
  displayField = 'email',
}: Props) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Chargement utilisateurs
  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const url = search 
          ? `/api/admin/users?search=${encodeURIComponent(search)}`
          : '/api/admin/users';
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur chargement utilisateurs:', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [search, isOpen]);

  const handleSelect = (user: User) => {
    onSelect(user);
    setIsOpen(false);
    setSearch('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
  };

  const getPrimaryText = (user: User) => {
    switch (displayField) {
      case 'email': return user.email;
      case 'username': return `@${user.username}`;
      default: return user.full_name || user.email;
    }
  };

  const getSecondaryText = (user: User) => {
    if (displayField === 'full_name' && user.username) return `@${user.username}`;
    if (displayField !== 'full_name' && user.full_name) return user.full_name;
    return '';
  };

  const planLabel = (plan: string) => {
    switch (plan) {
      case 'premium': return 'Premium';
      case 'entreprise': return 'Entreprise';
      default: return 'Basic';
    }
  };

  const planColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-cyan-500/10 text-cyan-300/60 border-cyan-500/20';
      case 'entreprise': return 'bg-purple-500/10 text-purple-300/60 border-purple-500/20';
      default: return 'bg-gray-500/10 text-gray-300/60 border-gray-500/20';
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Bouton sélecteur */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between h-9 px-3 text-xs bg-white/[0.03] border border-white/[0.08] text-white/80 rounded-xl hover:bg-white/[0.04] transition-colors font-light"
      >
        <div className="flex-1 truncate text-left">
          {selectedUser ? (
            <span className="text-white/70">{getPrimaryText(selectedUser)}</span>
          ) : (
            <span className="text-gray-500/50">Sélectionner un utilisateur...</span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {selectedUser && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-light ${planColor(selectedUser.subscription_plan)}`}>
              {planLabel(selectedUser.subscription_plan)}
            </span>
          )}
          {selectedUser ? (
            <X className="w-3.5 h-3.5 text-gray-400/60 hover:text-white/70 cursor-pointer" onClick={clearSelection} />
          ) : (
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400/60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          )}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-slate-900/90 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-xl overflow-hidden">
          {/* Recherche */}
          <div className="p-2 border-b border-white/[0.06]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500/50" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-9 h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 rounded-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Liste */}
          <div className="max-h-48 overflow-y-auto p-1">
            {loading ? (
              <div className="px-3 py-4 text-xs text-gray-400/60 font-light text-center">
                Chargement...
              </div>
            ) : users.length === 0 ? (
              <div className="px-3 py-4 text-xs text-gray-400/60 font-light text-center">
                Aucun utilisateur trouvé
              </div>
            ) : (
              users.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(user)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white/70 font-medium truncate">{getPrimaryText(user)}</p>
                      {getSecondaryText(user) && (
                        <p className="text-[11px] text-gray-400/50 font-light truncate">{getSecondaryText(user)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-light ${planColor(user.subscription_plan)}`}>
                        {planLabel(user.subscription_plan)}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400/60" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}