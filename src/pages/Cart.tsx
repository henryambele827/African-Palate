import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, OperationType, handleFirestoreError } from '../components/AuthProvider';
import { formatUGX, cn } from '../lib/utils';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion } from 'motion/react';
import { ShoppingBag, MapPin, Phone, Calendar, CreditCard, ChevronLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { addDays, format } from 'date-fns';

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signIn } = useAuth();
  const meal = location.state?.meal;

  const [quantity, setQuantity] = useState(1);
  const [selectedMeat, setSelectedMeat] = useState(meal?.meatOptions?.[0] || '');
  const [selectedAccompaniment, setSelectedAccompaniment] = useState(meal?.accompanimentOptions?.[0] || '');
  const [selectedOption, setSelectedOption] = useState(meal?.options?.[0] || '');
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user) {
    return (
      <div className="pt-40 px-4 text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-8 text-brand-orange">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-3xl font-black text-black uppercase italic mb-4 tracking-tighter leading-tight">Identity Required</h2>
        <p className="text-gray-400 font-medium mb-8">Please sign in to confirm your identity before placing an order.</p>
        <button 
          onClick={() => signIn()}
          className="w-full bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest italic shadow-xl shadow-black/10 hover:scale-105 transition-transform"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="pt-40 px-4 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="text-gray-400" size={40} />
        </div>
        <h2 className="text-2xl font-black text-black uppercase italic mb-4 tracking-tighter">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/menu')}
          className="text-brand-orange font-black uppercase text-xs tracking-widest hover:underline"
        >
          Go back to menu
        </button>
      </div>
    );
  }

  const totalPrice = meal.price * quantity;
  const depositAmount = totalPrice * 0.5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    const path = 'orders';
    try {
      const orderData = {
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Customer',
        userPhone: phone,
        mealId: meal.id,
        mealName: meal.name,
        selectedMeat: selectedMeat || null,
        selectedAccompaniment: selectedAccompaniment || null,
        selectedOption: selectedOption || 'Standard',
        quantity,
        totalPrice,
        paidAmount: 0,
        status: 'pending',
        deliveryDate,
        deliveryLocation,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="pt-40 px-4 text-center animate-fade-in max-w-lg mx-auto">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 text-brand-green rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-green-200 shadow-sm"
        >
          <CheckCircle2 size={60} />
        </motion.div>
        <h2 className="text-4xl font-black text-black uppercase italic tracking-tighter mb-4">Order Received!</h2>
        <p className="text-gray-400 font-medium mb-12">
          Your pre-order for <span className="text-black font-black">{meal.name}</span> has been successfully logged.
        </p>
        <div className="p-8 bg-black text-white rounded-[2rem] shadow-xl text-left">
           <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4 font-black">Mobile Money Deposit</p>
           <p className="text-xl font-black mb-1">Pay: {formatUGX(depositAmount)}</p>
           <p className="text-brand-yellow font-black text-sm mb-6 uppercase italic">Dial *165# or *185#</p>
           <div className="h-px bg-gray-800 mb-6" />
           <p className="text-gray-400 text-xs italic font-medium leading-relaxed">Wait for admin to confirm your payment. You will see your order status change to 'Confirmed' in your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen max-w-6xl mx-auto">
      <button 
        onClick={() => navigate('/menu')}
        className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-12 text-xs font-black uppercase tracking-widest"
      >
        <ChevronLeft size={16} />
        Back to Menu
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          <h2 className="text-xl font-black text-black uppercase tracking-tighter italic mb-6">Review Order</h2>
          <div className="bento-card">
            <div className="flex gap-6 mb-8">
              <img src={meal.imageUrl} alt={meal.name} className="w-24 h-24 rounded-2xl object-cover shadow-sm" />
              <div>
                <h3 className="font-black text-black text-lg leading-tight uppercase tracking-tighter">{meal.name}</h3>
                <p className="text-brand-orange font-black mt-1">{formatUGX(meal.price)}</p>
              </div>
            </div>

            {meal.meatOptions && meal.meatOptions.length > 0 && (
              <div className="mb-6 p-6 bg-gray-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Choose Your Protein</label>
                <div className="grid grid-cols-1 gap-3">
                  {meal.meatOptions.map((opt: string) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedMeat(opt)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        selectedMeat === opt 
                          ? "bg-black border-black text-white shadow-lg" 
                          : "bg-white border-white text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-black uppercase tracking-tight",
                        selectedMeat === opt ? "text-white" : "text-black group-hover:text-brand-orange"
                      )}>{opt}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedMeat === opt ? "border-brand-orange bg-brand-orange" : "border-gray-100"
                      )}>
                        {selectedMeat === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {meal.accompanimentOptions && meal.accompanimentOptions.length > 0 && (
              <div className="mb-6 p-6 bg-gray-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Choose Your Side</label>
                <div className="grid grid-cols-1 gap-3">
                  {meal.accompanimentOptions.map((opt: string) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedAccompaniment(opt)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        selectedAccompaniment === opt 
                          ? "bg-black border-black text-white shadow-lg" 
                          : "bg-white border-white text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-black uppercase tracking-tight",
                        selectedAccompaniment === opt ? "text-white" : "text-black group-hover:text-brand-orange"
                      )}>{opt}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedAccompaniment === opt ? "border-brand-orange bg-brand-orange" : "border-gray-100"
                      )}>
                        {selectedAccompaniment === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {meal.options && meal.options.length > 0 && (
              <div className="mb-8 p-6 bg-gray-50 rounded-[2rem]">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Other Customizations</label>
                <div className="grid grid-cols-1 gap-3">
                  {meal.options.map((opt: string) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedOption(opt)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group",
                        selectedOption === opt 
                          ? "bg-black border-black text-white shadow-lg" 
                          : "bg-white border-white text-gray-400 hover:border-gray-200"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-black uppercase tracking-tight",
                        selectedOption === opt ? "text-white" : "text-black group-hover:text-brand-orange"
                      )}>{opt}</span>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                        selectedOption === opt ? "border-brand-orange bg-brand-orange" : "border-gray-100"
                      )}>
                        {selectedOption === opt && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Quantity</span>
                <div className="flex items-center gap-4 bg-white rounded-xl px-4 py-2 border border-gray-200">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-gray-400 hover:text-brand-orange font-black">-</button>
                  <span className="text-black font-black text-sm w-4 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-gray-400 hover:text-brand-orange font-black">+</button>
                </div>
              </div>
              <div className="flex justify-between items-center px-4">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Tax & Delivery</span>
                <span className="text-xs font-black text-black">INCLUDED</span>
              </div>
              <div className="px-4 py-6 bg-brand-orange/5 rounded-3xl border border-brand-orange/10 flex flex-col gap-2">
                <div className="flex justify-between text-xs font-black uppercase tracking-widest text-brand-orange opacity-60">
                   <span>Order Total</span>
                   <span>{formatUGX(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brand-orange">Required Deposit (50%)</div>
                  <div className="text-3xl font-black text-brand-orange tracking-tighter leading-none">{formatUGX(depositAmount)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Details Form */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <h2 className="text-xl font-black text-black uppercase tracking-tighter italic mb-6">Delivery details</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm focus-within:border-brand-orange transition-colors">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Mobile Money No.
                </label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0700123456"
                  className="w-full bg-transparent border-none p-0 focus:outline-none text-black font-black text-lg"
                />
              </div>
              <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm focus-within:border-brand-orange transition-colors">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                  Delivery Date
                </label>
                <input 
                  type="date" 
                  required 
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-transparent border-none p-0 focus:outline-none text-black font-black text-lg uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] p-6 border border-gray-100 shadow-sm focus-within:border-brand-orange transition-colors">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">
                Target Spot (Hostel/Campus Area)
              </label>
              <textarea 
                required 
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Where should we drop off your food tomorrow?"
                className="w-full bg-transparent border-none p-0 focus:outline-none text-black font-black text-lg resize-none h-32"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-black text-white font-black py-6 rounded-[1.5rem] text-sm uppercase tracking-[0.2em] italic shadow-xl shadow-black/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>PLACE PRE-ORDER</>
              )}
            </button>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center pt-2 italic">
               Note: 50% prepayment is required to confirm your cooking slot.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
