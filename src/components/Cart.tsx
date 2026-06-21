import React from 'react';
import { CartItem } from '../types';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CartProps {
  cartItems: CartItem[];
  onRemoveFromCart: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onCheckout: () => void;
}

export default function Cart({ cartItems, onRemoveFromCart, onUpdateQuantity, onCheckout }: CartProps) {
  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onCheckout}
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs z-40 transition-opacity"
      />

      {/* Cart Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[460px] bg-white z-50 border-l-4 border-zinc-900 shadow-[-10px_0px_0px_0px_rgba(24,24,27,1)] flex flex-col"
      >
        {/* Header Block */}
        <div className="p-6 border-b-3 border-zinc-900 flex justify-between items-center bg-yellow-300">
          <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight text-zinc-900 uppercase">
            <ShoppingBag className="stroke-[3px]" /> 
            <span>Your Cravings</span>
          </h2>
          <button 
            onClick={onCheckout} 
            className="p-1 border-2 border-zinc-900 bg-white hover:bg-orange-400 text-zinc-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px] transition-all cursor-pointer animate-fade-in"
          >
            <X size={20} className="stroke-[3px]" />
          </button>
        </div>

        {/* List of Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50">
          {cartItems.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center p-4">
              <div className="w-16 h-16 bg-zinc-100 rounded-full border-2.5 border-dashed border-zinc-400 flex items-center justify-center mb-4 text-zinc-400">
                <ShoppingBag size={28} className="stroke-[2px]" />
              </div>
              <p className="font-extrabold text-lg text-zinc-850 uppercase tracking-tight">Your bag is empty!</p>
              <p className="text-zinc-500 text-xs mt-1 max-w-xs">
                Browse our mouthwatering menu items and add dishes to satisfy your cravings.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div 
                  key={item.id} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex gap-4 p-4 bg-white border-2.5 border-zinc-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] relative overflow-hidden"
                >
                  {/* Thumbnail */}
                  {item.image && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-900 bg-zinc-100 shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Details & Controls */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="font-black text-sm text-zinc-900 leading-tight uppercase tracking-tight line-clamp-1">{item.name}</p>
                      <p className="text-xs text-orange-600 font-bold mt-0.5">${item.price.toFixed(2)} each</p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Selectors */}
                      <div className="flex items-center gap-1.5 bg-zinc-100 border-2 border-zinc-900 p-0.5 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="h-7 w-7 flex items-center justify-center bg-white border border-zinc-900 hover:bg-orange-200 text-zinc-900 rounded-md transition-colors cursor-pointer text-xs font-black"
                        >
                          <Minus size={12} className="stroke-[3px]" />
                        </button>
                        <span className="text-xs font-black px-2.5 text-zinc-900 min-w-[20px] text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="h-7 w-7 flex items-center justify-center bg-white border border-zinc-900 hover:bg-orange-200 text-zinc-900 rounded-md transition-colors cursor-pointer text-xs font-black"
                        >
                          <Plus size={12} className="stroke-[3px]" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemoveFromCart(item.id)}
                        className="p-1.5 border border-zinc-300 hover:border-red-650 rounded-lg hover:bg-red-50 text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Absolute item total indicator */}
                  <div className="absolute top-4 right-4 font-black text-sm text-zinc-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Footer Billing Block */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t-3 border-zinc-900 bg-white shadow-inner">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-center text-sm font-bold text-zinc-500 uppercase tracking-wide">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-green-600 uppercase tracking-wide">
                <span>Shipping Fee</span>
                <span className="bg-green-100 px-2 py-0.5 rounded-md text-[11px] border border-green-400 font-extrabold">FREE</span>
              </div>
              <div className="pt-3 border-t border-zinc-200 flex justify-between items-center">
                <span className="font-black text-xl text-zinc-900 uppercase tracking-tight">Total</span>
                <span className="text-2xl font-black text-orange-650">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={onCheckout}
              className="w-full bg-orange-500 text-zinc-900 py-4.5 border-3 border-zinc-900 rounded-2xl font-black text-base uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Place Order Now</span>
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
