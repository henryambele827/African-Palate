import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Globe2, Sparkles, Truck, ShieldCheck, Heart } from 'lucide-react';
import { cn } from '../lib/utils';

const CUISINES = [
  { name: 'Uganda', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?auto=format&fit=crop&q=80&w=800', color: 'bg-brand-orange' },
  { name: 'Somalia', image: 'https://images.unsplash.com/photo-1666176481173-4c0b1a86cf35?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U29tYWxpYSUyMGZvb2R8ZW58MHx8MHx8fDA%3D', color: 'bg-blue-600' },
  { name: 'Nigeria', image: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&q=80&w=800', color: 'bg-green-600' },
  { name: 'Sudan', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800', color: 'bg-red-600' },
  { name: 'DR Congo', image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&q=80&w=800', color: 'bg-yellow-500' },
  { name: 'Eritrea', image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800', color: 'bg-brand-purple' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white z-10" />
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(230,81,0,0.15)_0%,transparent_70%)]" 
          />
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-brand-orange/20">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-brand-orange flex items-center justify-center text-white font-black italic text-2xl">AP</div>';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 text-brand-orange">
                  <Sparkles className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">The Culinary Gateway</span>
                </div>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[12vw] md:text-[10vw] font-black tracking-tighter leading-[0.8] uppercase italic text-black mb-8"
            >
              Taste <br/>
              <span className="text-brand-orange">Heritage.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl mb-12 leading-tight"
            >
              Experience the soul of Africa through authentic, student-priced meals delivered straight to your campus.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link 
                to="/menu" 
                className="bg-black text-white px-10 py-6 rounded-[2rem] font-black uppercase tracking-widest italic flex items-center gap-3 hover:bg-brand-orange transition-colors group shadow-2xl shadow-black/10"
              >
                Browse the Kitchen
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/3">
           <motion.div 
             animate={{ y: [0, -20, 0] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
             className="relative"
           >
             <div className="w-80 h-[500px] bg-brand-orange rounded-full opacity-5 blur-[100px]" />
             <div className="absolute top-0 right-20 w-64 h-64 border-2 border-brand-orange/20 rounded-full animate-spin-slow grow" />
           </motion.div>
        </div>
      </section>

      {/* Featured Countries */}
      <section className="py-32 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-orange block mb-4">Our Roots</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Cuisines of <br/> the Continent
              </h2>
            </div>
            <p className="text-gray-500 max-w-md font-medium text-lg leading-tight">
              From the spicy hills of Eritrea to the smoky party rice of Nigeria, we bring 36+ diverse dishes to your plate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {CUISINES.map((cuisine, index) => (
              <motion.div
                key={cuisine.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => navigate('/menu', { state: { country: cuisine.name } })}
                className="group cursor-pointer relative overflow-hidden rounded-[3rem] aspect-[4/5]"
              >
                <img 
                  src={cuisine.image} 
                  alt={cuisine.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-60 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-10 left-10 text-left">
                  <h3 className="text-4xl font-black uppercase italic tracking-tighter mb-2 group-hover:text-brand-orange transition-colors">
                    {cuisine.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 text-white">
                    View Dishes <ChevronRight size={14} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4">Simple Ordering</h2>
            <p className="text-gray-400 font-medium text-lg">Fresh meals, delivered today or pre-ordered for tomorrow.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: Globe2, title: 'Explore Menu', text: 'Browse our diverse collection of 36+ cross-continental dishes.' },
              { icon: Truck, title: 'Pre-Order', text: 'Confirm your meal for tomorrow to ensure fresh campus delivery.' },
              { icon: Heart, title: 'Enjoy', text: 'Receive your hot meal at your campus or hostel, prepared with love.' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-brand-orange/5 mx-auto rounded-3xl flex items-center justify-center text-brand-orange mb-8 group-hover:scale-110 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-xl shadow-brand-orange/20">
                  <item.icon size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter mb-4">{item.title}</h3>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
