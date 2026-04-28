import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Meal, CountryCategory } from '../types';
import { formatUGX, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, Search, Filter, Globe2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { seedMeals } from '../lib/seedData';
import { OperationType, handleFirestoreError, useAuth } from '../components/AuthProvider';

const COUNTRIES: (CountryCategory | 'All')[] = ['All', 'Uganda', 'Somalia', 'Eritrea', 'DR Congo', 'Nigeria', 'Sudan'];

export default function Menu() {
  const { user, signIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState<CountryCategory | 'All'>(
    (location.state as any)?.country || 'All'
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if ((location.state as any)?.country) {
      setActiveCountry((location.state as any).country);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchMeals = async () => {
      const path = 'meals';
      try {
        try {
          await seedMeals();
        } catch (e) {
          console.warn('Seeding skipped:', e);
        }
        
        const mealsCol = collection(db, 'meals');
        const q = query(mealsCol, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const mealsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
        setMeals(mealsList);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  const filteredMeals = meals.filter(m => {
    const matchesCountry = activeCountry === 'All' || m.country === activeCountry;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCountry && matchesSearch;
  });

  const handleOrder = (meal: Meal) => {
    if (!user) {
      signIn();
      return;
    }
    navigate('/cart', { state: { meal } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full"
        />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Preparing the Kitchen...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Globe2 size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Continental Flavors</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-black tracking-tighter uppercase italic leading-[0.85]">
              Explore <br/>
              <span className="text-brand-orange">The Menu</span>
            </h1>
          </motion.div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:border-brand-orange transition-colors outline-none"
            />
          </div>
        </div>

        {/* Country Filter - Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {COUNTRIES.map((country) => (
            <button
              key={country}
              onClick={() => setActiveCountry(country)}
              className={cn(
                "whitespace-nowrap px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
                activeCountry === country 
                ? 'bg-black text-white border-black shadow-2xl shadow-black/20' 
                : 'bg-white text-gray-400 border-gray-50 hover:border-gray-200'
              )}
            >
              {country}
            </button>
          ))}
        </div>
      </header>

      {/* Grid of Meals */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {filteredMeals.map((meal) => (
            <motion.div
              key={meal.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group bg-white rounded-[2.5rem] p-4 border border-gray-100 hover:border-brand-orange/20 transition-all hover:shadow-2xl hover:shadow-black/5"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] mb-6">
                <img 
                  src={meal.imageUrl} 
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {meal.country}
                  </span>
                  <span className="bg-white/90 backdrop-blur-md text-gray-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {meal.category}
                  </span>
                </div>
              </div>
              
              <div className="px-2 pb-2">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-2xl font-black text-black leading-none uppercase tracking-tighter group-hover:text-brand-orange transition-colors">
                    {meal.name}
                  </h3>
                  <div className="bg-brand-orange/5 text-brand-orange px-3 py-1.5 rounded-xl font-black text-sm lowercase tracking-tighter">
                    {formatUGX(meal.price)}
                  </div>
                </div>
                <p className="text-gray-400 text-xs font-medium mb-8 leading-relaxed line-clamp-2">
                  {meal.description}
                </p>
                
                <button 
                  onClick={() => handleOrder(meal)}
                  className={cn(
                    "w-full py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] italic flex items-center justify-center gap-3 transition-all",
                    user 
                      ? "bg-black text-white hover:bg-brand-orange shadow-lg shadow-black/5" 
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  )}
                >
                  {user ? 'Order This Meal' : 'Sign In to Order'}
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredMeals.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No dishes found in this territory.</p>
          <button 
            onClick={() => { setActiveCountry('All'); setSearchQuery(''); }}
            className="mt-4 text-brand-orange font-black uppercase text-xs hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
