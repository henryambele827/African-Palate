import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, Meal, MealCategory, CountryCategory } from '../types';
import { formatUGX, cn } from '../lib/utils';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Clock, 
  DollarSign,
  Plus,
  Trash2,
  Phone,
  X,
  Upload,
  Edit2
} from 'lucide-react';
import { OperationType, handleFirestoreError } from '../components/AuthProvider';

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'menu'>('orders');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [newMeal, setNewMeal] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main Dish' as MealCategory,
    country: 'Uganda' as CountryCategory,
    imageUrl: '',
    isAvailable: true,
    meatOptions: [] as string[],
    accompanimentOptions: [] as string[]
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Main Dish' as MealCategory,
    country: 'Uganda' as CountryCategory,
    imageUrl: '',
    isAvailable: true,
    meatOptions: [] as string[],
    accompanimentOptions: [] as string[]
  });

  useEffect(() => {
    if (editingMeal) {
      setEditFormData({
        name: editingMeal.name,
        description: editingMeal.description,
        price: editingMeal.price,
        category: editingMeal.category,
        country: editingMeal.country || 'Uganda',
        imageUrl: editingMeal.imageUrl || '',
        isAvailable: editingMeal.isAvailable,
        meatOptions: editingMeal.meatOptions || [],
        accompanimentOptions: editingMeal.accompanimentOptions || []
      });
    }
  }, [editingMeal]);

  // Flash success messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    const ordersPath = 'orders';
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, orderBy('createdAt', 'desc'));
    const unsubscribeOrders = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, ordersPath);
    });

    const mealsPath = 'meals';
    const mealsCol = collection(db, 'meals');
    const unsubscribeMeals = onSnapshot(mealsCol, (snapshot) => {
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, mealsPath);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeMeals();
    };
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const path = `orders/${orderId}`;
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      setSuccessMessage('Order status updated');
    } catch (e) { 
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const addMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const path = 'meals';
    try {
      await addDoc(collection(db, 'meals'), {
        ...newMeal,
        createdAt: new Date().toISOString()
      });
      setShowAddForm(false);
      setSuccessMessage('Dish added successfully');
      setNewMeal({
        name: '',
        description: '',
        price: 0,
        category: 'Main Dish',
        country: 'Uganda',
        imageUrl: '',
        isAvailable: true,
        meatOptions: [],
        accompanimentOptions: []
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const updateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;
    setIsSaving(true);
    const path = `meals/${editingMeal.id}`;
    try {
      const updateData = {
        name: editFormData.name,
        description: editFormData.description,
        price: editFormData.price,
        category: editFormData.category,
        country: editFormData.country,
        imageUrl: editFormData.imageUrl,
        isAvailable: editFormData.isAvailable,
        meatOptions: editFormData.meatOptions,
        accompanimentOptions: editFormData.accompanimentOptions,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(doc(db, 'meals', editingMeal.id), updateData);
      setEditingMeal(null);
      setSuccessMessage('Dish updated');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMeal = async (mealId: string) => {
    if (!mealId) return;
    const path = `meals/${mealId}`;
    try { 
      await deleteDoc(doc(db, 'meals', mealId)); 
      setShowDeleteConfirm(null);
      setSuccessMessage('Dish removed');
    } catch (e) { 
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  };

  const stats = {
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + o.totalPrice, 0),
    pendingDeposits: orders.filter(o => o.status === 'pending').reduce((acc, o) => acc + (o.totalPrice * 0.5), 0),
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    totalOrders: orders.length
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 text-brand-purple">
        <div className="w-12 h-12 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 min-h-screen max-w-7xl mx-auto">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter uppercase italic leading-none">Command Center</h1>
          <p className="text-gray-400 font-medium mt-2">Manage operations and monitor campus cravings.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('orders')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'orders' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600')}
          >
            Orders
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'menu' ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-gray-600')}
          >
            Kitchen
          </button>
        </div>
      </header>

      {/* Success Notification */}
      <AnimatePresence>
        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-32 left-1/2 -translate-x-1/2 z-[200] bg-brand-green text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest italic text-xs shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <div className="bento-card bg-white group hover:border-brand-orange/20 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Gross Volume</p>
          <p className="text-2xl font-black text-black tracking-tighter">{formatUGX(stats.totalRevenue)}</p>
          <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-brand-orange w-2/3" />
          </div>
        </div>
        <div className="bento-card bg-white group hover:border-brand-purple/20 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Unpaid Deposits</p>
          <p className="text-2xl font-black text-black tracking-tighter">{formatUGX(stats.pendingDeposits)}</p>
          <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-brand-purple w-1/3" />
          </div>
        </div>
        <div className="bento-card bg-white group hover:border-brand-green/20 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Active Tracks</p>
          <p className="text-2xl font-black text-black tracking-tighter">{stats.pendingOrders}</p>
          <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-brand-green w-1/2" />
          </div>
        </div>
        <div className="bento-card bg-white group hover:border-black/5 transition-colors">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Total orders</p>
          <p className="text-2xl font-black text-black tracking-tighter">{stats.totalOrders}</p>
          <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
            <div className="h-full bg-black w-3/4" />
          </div>
        </div>
      </div>

      {activeTab === 'orders' ? (
        <div className="grid grid-cols-1 gap-4">
          <h2 className="text-xl font-black text-black uppercase tracking-tighter italic mb-4">Traffic Control</h2>
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Order/Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Meal</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Target</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Total</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-6">
                        <div className="font-black text-black text-sm uppercase tracking-tight">{order.userName}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{order.userPhone}</div>
                        <div className="font-mono text-[9px] text-gray-300 mt-1 uppercase">#{order.id.slice(-6)}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-black text-black text-sm uppercase tracking-tight">{order.mealName}</div>
                        {(order.selectedMeat || order.selectedAccompaniment || order.selectedOption) && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {order.selectedMeat && (
                              <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm border border-red-100">Meat: {order.selectedMeat}</span>
                            )}
                            {order.selectedAccompaniment && (
                              <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm border border-blue-100">Side: {order.selectedAccompaniment}</span>
                            )}
                            {order.selectedOption && order.selectedOption !== 'Standard' && (
                              <span className="text-[9px] bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm border border-gray-100">Misc: {order.selectedOption}</span>
                            )}
                          </div>
                        )}
                        <div className="text-[10px] text-gray-400 font-medium mt-1">Quantity: {order.quantity}</div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs font-black text-black leading-tight">{order.deliveryLocation}</div>
                        <div className="text-[10px] text-brand-orange font-black mt-1 uppercase italic">{format(new Date(order.deliveryDate), 'MMM d')}</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn("status-pill", order.status)}>{order.status}</span>
                      </td>
                      <td className="px-6 py-6 font-black text-black text-sm">
                        {formatUGX(order.totalPrice)}
                      </td>
                      <td className="px-6 py-6 text-right">
                        <select 
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="bg-gray-100 border-none rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-purple cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirm</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancel</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bento-card group flex flex-col justify-between">
              <div>
                <div className="flex gap-4 items-start justify-between mb-6">
                  <img src={meal.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-sm" alt="" />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingMeal(meal)}
                      className="p-3 text-gray-400 hover:text-black hover:bg-gray-100 rounded-2xl transition-all active:scale-90"
                      title="Edit dish"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => setShowDeleteConfirm(meal.id)}
                      className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                      title="Delete dish"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-black text-black uppercase tracking-tighter mb-1">{meal.name}</h3>
                <p className="text-brand-orange font-black text-sm mb-4">{formatUGX(meal.price)}</p>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{meal.category}</span>
                 <span className={cn(
                   "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                   meal.isAvailable ? "bg-green-100 text-brand-green" : "bg-red-100 text-red-500"
                 )}>
                   {meal.isAvailable ? 'Active' : 'Sold Out'}
                 </span>
              </div>
            </div>
          ))}
          <div 
            onClick={() => setShowAddForm(true)}
            className="bento-card border-dashed border-2 border-gray-200 flex flex-col items-center justify-center py-12 gap-4 group hover:border-brand-purple/20 transition-colors cursor-pointer min-h-[320px]"
          >
             <div className="w-12 h-12 bg-gray-50 group-hover:bg-brand-purple/10 group-hover:text-brand-purple rounded-full flex items-center justify-center text-gray-300 transition-colors">
               <Plus size={24} />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-brand-purple transition-colors">Add New Dish</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tighter italic mb-4">Final Warning</h2>
              <p className="text-gray-400 font-medium mb-8">This action will permanently remove <span className="text-black font-bold">"{meals.find(m => m.id === showDeleteConfirm)?.name}"</span> from the database. This cannot be undone.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-4 rounded-2xl text-gray-400 font-black uppercase tracking-widest italic hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => deleteMeal(showDeleteConfirm)}
                  className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest italic shadow-xl shadow-red-500/20 active:scale-95 transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Meal Modal */}
      <AnimatePresence>
        {(showAddForm || editingMeal) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddForm(false);
                setEditingMeal(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50 flex-shrink-0">
                <h2 className="text-xl font-black text-black uppercase tracking-tighter italic">
                  {showAddForm ? 'Add New Dish' : 'Update Recipe'}
                </h2>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingMeal(null);
                  }} 
                  className="text-gray-400 hover:text-black transition-colors p-2"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form 
                onSubmit={showAddForm ? addMeal : updateMeal} 
                className="p-6 space-y-6 overflow-y-auto custom-scrollbar"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Dish Name</label>
                    <input 
                      required
                      type="text" 
                      value={showAddForm ? newMeal.name : editFormData.name}
                      onChange={(e) => showAddForm 
                        ? setNewMeal({...newMeal, name: e.target.value})
                        : setEditFormData({...editFormData, name: e.target.value})
                      }
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none"
                      placeholder="e.g. Special Jollof"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Description</label>
                    <textarea 
                      required
                      value={showAddForm ? newMeal.description : editFormData.description}
                      onChange={(e) => showAddForm
                        ? setNewMeal({...newMeal, description: e.target.value})
                        : setEditFormData({...editFormData, description: e.target.value})
                      }
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all h-24 resize-none outline-none"
                      placeholder="Ingredients, spice level..."
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Meat Options (Customer Chooses One)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {(showAddForm ? newMeal.meatOptions : editFormData.meatOptions).map((opt, idx) => (
                         <div key={idx} className="bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-2 group/tag transition-all hover:bg-red-50">
                            <span className="text-xs font-bold text-black uppercase tracking-tight">{opt}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const currentOpts = showAddForm ? [...newMeal.meatOptions] : [...editFormData.meatOptions];
                                currentOpts.splice(idx, 1);
                                if (showAddForm) setNewMeal({...newMeal, meatOptions: currentOpts});
                                else setEditFormData({...editFormData, meatOptions: currentOpts});
                              }}
                              className="text-gray-300 group-hover/tag:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                         </div>
                       ))}
                    </div>
                    <div className="flex gap-2 mb-6">
                      <input 
                        type="text" 
                        id="meat-option-input"
                        placeholder="Add meat option (e.g. Beef, Fish)..."
                        className="flex-grow bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              const currentOpts = showAddForm ? [...newMeal.meatOptions] : [...editFormData.meatOptions];
                              if (!currentOpts.includes(val)) {
                                if (showAddForm) setNewMeal({...newMeal, meatOptions: [...currentOpts, val]});
                                else setEditFormData({...editFormData, meatOptions: [...currentOpts, val]});
                              }
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('meat-option-input') as HTMLInputElement;
                          const val = input.value.trim();
                          if (val) {
                            const currentOpts = showAddForm ? [...newMeal.meatOptions] : [...editFormData.meatOptions];
                            if (!currentOpts.includes(val)) {
                              if (showAddForm) setNewMeal({...newMeal, meatOptions: [...currentOpts, val]});
                              else setEditFormData({...editFormData, meatOptions: [...currentOpts, val]});
                            }
                            input.value = '';
                          }
                        }}
                        className="bg-gray-100 p-4 rounded-2xl text-black hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Accompaniment Options (Customer Chooses One)</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                       {(showAddForm ? newMeal.accompanimentOptions : editFormData.accompanimentOptions).map((opt, idx) => (
                         <div key={idx} className="bg-gray-100 px-3 py-1.5 rounded-xl flex items-center gap-2 group/tag transition-all hover:bg-red-50">
                            <span className="text-xs font-bold text-black uppercase tracking-tight">{opt}</span>
                            <button 
                              type="button"
                              onClick={() => {
                                const currentOpts = showAddForm ? [...newMeal.accompanimentOptions] : [...editFormData.accompanimentOptions];
                                currentOpts.splice(idx, 1);
                                if (showAddForm) setNewMeal({...newMeal, accompanimentOptions: currentOpts});
                                else setEditFormData({...editFormData, accompanimentOptions: currentOpts});
                              }}
                              className="text-gray-300 group-hover/tag:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                         </div>
                       ))}
                    </div>
                    <div className="flex gap-2 mb-6">
                      <input 
                        type="text" 
                        id="acc-option-input"
                        placeholder="Add accompaniment (e.g. Rice, Matooke)..."
                        className="flex-grow bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              const currentOpts = showAddForm ? [...newMeal.accompanimentOptions] : [...editFormData.accompanimentOptions];
                              if (!currentOpts.includes(val)) {
                                if (showAddForm) setNewMeal({...newMeal, accompanimentOptions: [...currentOpts, val]});
                                else setEditFormData({...editFormData, accompanimentOptions: [...currentOpts, val]});
                              }
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('acc-option-input') as HTMLInputElement;
                          const val = input.value.trim();
                          if (val) {
                            const currentOpts = showAddForm ? [...newMeal.accompanimentOptions] : [...editFormData.accompanimentOptions];
                            if (!currentOpts.includes(val)) {
                              if (showAddForm) setNewMeal({...newMeal, accompanimentOptions: [...currentOpts, val]});
                              else setEditFormData({...editFormData, accompanimentOptions: [...currentOpts, val]});
                            }
                            input.value = '';
                          }
                        }}
                        className="bg-gray-100 p-4 rounded-2xl text-black hover:bg-gray-200 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Price (UGX)</label>
                      <input 
                        required
                        type="number" 
                        value={showAddForm ? (newMeal.price || '') : (editFormData.price || '')}
                        onChange={(e) => showAddForm
                          ? setNewMeal({...newMeal, price: parseInt(e.target.value)})
                          : setEditFormData({...editFormData, price: parseInt(e.target.value)})
                        }
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none"
                        placeholder="8000"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Country</label>
                      <select 
                        value={showAddForm ? newMeal.country : editFormData.country}
                        onChange={(e) => showAddForm
                          ? setNewMeal({...newMeal, country: e.target.value as CountryCategory})
                          : setEditFormData({...editFormData, country: e.target.value as CountryCategory})
                        }
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all cursor-pointer outline-none appearance-none"
                      >
                        {['Uganda', 'Somalia', 'Eritrea', 'DR Congo', 'Nigeria', 'Sudan'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Category</label>
                      <select 
                        value={showAddForm ? newMeal.category : editFormData.category}
                        onChange={(e) => showAddForm
                          ? setNewMeal({...newMeal, category: e.target.value as MealCategory})
                          : setEditFormData({...editFormData, category: e.target.value as MealCategory})
                        }
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all cursor-pointer outline-none appearance-none"
                      >
                        {['Main Dish', 'Quick Bite', 'Daily Special', 'Traditional'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Availability</label>
                      <select 
                        value={showAddForm 
                          ? (newMeal.isAvailable ? 'true' : 'false') 
                          : (editFormData.isAvailable ? 'true' : 'false')
                        }
                        onChange={(e) => showAddForm
                          ? setNewMeal({...newMeal, isAvailable: e.target.value === 'true'})
                          : setEditFormData({...editFormData, isAvailable: e.target.value === 'true'})
                        }
                        className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all cursor-pointer outline-none appearance-none"
                      >
                        <option value="true">In Stock</option>
                        <option value="false">Sold Out</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Image URL</label>
                    <input 
                      required
                      type="url" 
                      value={showAddForm ? newMeal.imageUrl : editFormData.imageUrl}
                      onChange={(e) => showAddForm
                        ? setNewMeal({...newMeal, imageUrl: e.target.value})
                        : setEditFormData({...editFormData, imageUrl: e.target.value})
                      }
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-brand-orange/20 transition-all outline-none"
                      placeholder="https://image-url.com"
                    />
                  </div>
                </div>

                <div className="pt-4 sticky bottom-0 bg-white">
                  <button 
                    disabled={isSaving}
                    type="submit"
                    className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest italic hover:bg-brand-orange transition-all shadow-xl shadow-black/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Processing...' : (showAddForm ? 'Confirm & Add' : 'Save Changes')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
