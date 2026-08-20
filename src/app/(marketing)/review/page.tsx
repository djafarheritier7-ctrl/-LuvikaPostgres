// src/app/(marketing)/review/page.tsx
import { ReviewForm } from '../../../components/review/ReviewForm';

export default function ReviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/5 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {[...Array(5)].map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" 
                className="w-12 h-12 fill-amber-400 text-amber-400">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600">
            Partagez votre expérience
          </h1>
          <p className="text-gray-400 mt-2">
            30 secondes pour nous aider à devenir meilleurs ❤️
          </p>
        </div>
        
        <ReviewForm />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>⭐⭐⭐⭐⭐ Évalué 4.9/5 par plus de 2 500 utilisateurs en Afrique</p>
          <p className="mt-1 flex items-center justify-center gap-1">
            <span>🇫🇷</span> <span>🇬🇧</span> <span>🇨🇩</span> <span>🇰🇪</span> <span>🇳🇬</span> <span>🇿🇦</span> <span>... +15 pays</span>
          </p>
        </div>
      </div>
    </div>
  );
}