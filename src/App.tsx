/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import DishCard from './components/DishCard';
import Cart from './components/Cart';
import Chatbot from './components/Chatbot';
import BowlLogo from './components/BowlLogo';
import { Dish, CartItem } from './types';

const DISHES: Dish[] = [
  { id: '1', name: 'Classic Burger', price: 10.99, description: 'Juicy beef patty with cheese.' },
  { id: '2', name: 'Margherita Pizza', price: 12.99, description: 'Fresh tomatoes, mozzarella.' },
  { id: '3', name: 'Caesar Salad', price: 8.99, description: 'Crispy romaine with dressing.' },
];

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (dish: Dish) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === dish.id);
      if (existing) {
        return prev.map(item => item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...dish, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 font-sans">
      <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-10 max-w-6xl mx-auto">
        {/* Disconnected Brand Banner Card */}
        <div className="flex items-center gap-4 bg-white border-3 border-zinc-900 rounded-3xl p-4 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] flex-1">
          <BowlLogo />
          <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Food Fix</h1>
        </div>

        {/* Disconnected stand-alone Cart Trigger Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center justify-center gap-3 bg-orange-500 text-zinc-900 font-extrabold text-lg uppercase tracking-wider px-6 py-4 border-3 border-zinc-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all cursor-pointer relative"
        >
          <ShoppingCart size={24} className="stroke-zinc-900 stroke-[2.5px]" />
          <span>Cart</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-xs font-black rounded-full h-6 w-6 flex items-center justify-center border-2 border-zinc-900 shadow-sm animate-bounce">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </header>
      <main className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {DISHES.map(dish => (
          <div key={dish.id}>
            <DishCard dish={dish} onAddToCart={addToCart} />
          </div>
        ))}
      </main>
      {isCartOpen && (
        <Cart cartItems={cartItems} onRemoveFromCart={removeFromCart} onCheckout={() => setIsCartOpen(false)} />
      )}
      <Chatbot />
    </div>
  );
}
