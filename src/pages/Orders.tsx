import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, OperationType, handleFirestoreError } from '../components/AuthProvider';
import { Order } from '../types';
import { formatUGX, cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { Clock, CheckCircle2, XCircle, Truck, ShoppingBag, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const path = 'orders';
    const ordersCol = collection(db, 'orders');
    const q = query(
      ordersCol, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 text-brand-orange">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen max-w-7xl mx-auto">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase italic leading-none">My Tracks</h1>
        <p className="text-gray-400 font-medium mt-2">Historical and upcoming meal deliveries.</p>
      </header>

      {orders.length === 0 ? (
        <div className="bento-card py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gray-100">
             <ShoppingBag className="text-gray-300" size={40} />
          </div>
          <h2 className="text-2xl font-black text-black uppercase italic tracking-tighter mb-4">No tracks found</h2>
          <Link to="/menu" className="text-brand-orange font-black uppercase text-xs tracking-widest hover:underline">
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={order.id}
              className="bento-card flex flex-col group hover:border-brand-orange/20 transition-colors"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Order Ref</div>
                  <div className="font-mono text-[10px] font-black text-black bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100 uppercase">#{order.id.slice(-6)}</div>
                </div>
                <div className={cn("status-pill capitalize", order.status)}>
                  {order.status}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-black text-black uppercase tracking-tighter leading-tight mb-2 group-hover:text-brand-orange transition-colors">{order.mealName}</h3>
                {order.selectedOption && (
                  <div className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                    With {order.selectedOption}
                  </div>
                )}
                <div className="flex items-center gap-3 text-xs font-black text-brand-orange uppercase">
                   <span className="bg-brand-orange/10 px-2 py-1 rounded-lg">Qty {order.quantity}</span>
                   <span className="text-gray-300">•</span>
                   <span>{formatUGX(order.totalPrice)}</span>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50 flex-grow">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 border border-gray-100">
                    <Clock size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">EST. Delivery</div>
                    <div className="text-sm font-black text-black leading-none">{format(new Date(order.deliveryDate), 'PPP')}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 border border-gray-100">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Spot</div>
                    <div className="text-sm font-black text-black line-clamp-2 leading-tight">{order.deliveryLocation}</div>
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <div className="mt-8 p-6 bg-brand-orange/5 rounded-[1.5rem] border border-brand-orange/10 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-5 scale-150">
                      <ShoppingBag size={48} className="text-brand-orange" />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-2 block tracking-[0.2em]">Deposit Required</p>
                   <p className="text-base font-black text-brand-orange tracking-tighter leading-tight">Pay {formatUGX(order.totalPrice * 0.5)} deposit to confirm your slot.</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
