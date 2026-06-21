import React from 'react';
import { Dish } from '../types';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';

interface DishCardProps {
  dish: Dish;
  onAddToCart: (dish: Dish) => void;
}

const getTagForDish = (dish: Dish): { text: string; style: string } => {
  const nameLower = dish.name.toLowerCase();

  if (dish.id === '1') {
    return { text: '👑 BEST SELLER', style: 'bg-yellow-300 text-zinc-950 border-zinc-900' };
  }
  if (nameLower.includes('spicy') || nameLower.includes('nashville') || nameLower.includes('cayenne') || nameLower.includes('chili')) {
    return { text: '🔥 HOT & SPICY', style: 'bg-red-500 text-white border-zinc-900' };
  }
  if (nameLower.includes('truffle') || nameLower.includes('burrata') || nameLower.includes('belgian')) {
    return { text: '✨ CHEF SIGNATURE', style: 'bg-purple-600 text-white border-zinc-900' };
  }
  if (dish.category === 'Pizzas') {
    return { text: '🍕 WOOD-FIRED', style: 'bg-orange-100 text-orange-950 border-zinc-900' };
  }
  if (dish.category === 'Pasta') {
    return { text: '🍝 AL DENTE', style: 'bg-yellow-100 text-yellow-950 border-zinc-900' };
  }
  if (dish.category === 'Greens') {
    return { text: '🌱 LIVE GREENS', style: 'bg-green-100 text-green-950 border-zinc-900' };
  }
  if (dish.category === 'Desserts') {
    return { text: '🍮 SWEET TOOTH', style: 'bg-pink-100 text-pink-950 border-zinc-900' };
  }
  if (dish.category === 'Drinks') {
    return { text: '🍹 COOLING', style: 'bg-cyan-100 text-cyan-950 border-zinc-900' };
  }
  return { 
    text: dish.category ? dish.category.toUpperCase() : 'DELICIOUS', 
    style: 'bg-zinc-100 text-zinc-950 border-zinc-900' 
  };
};

const getImageForDish = (dish: Dish): string => {
  if (dish.image) return dish.image;
  switch (dish.id) {
    case '1': // Classic Burger
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop';
    case '2': // Margherita Pizza
      return 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600&auto=format&fit=crop';
    case '3': // Caesar Salad
      return 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop';
    default:
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
  }
};

export default function DishCard({ dish, onAddToCart }: DishCardProps) {
  const imageUrl = getImageForDish(dish);
  const tag = getTagForDish(dish);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="bg-white border-3 border-zinc-900 rounded-[28px] overflow-hidden shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] hover:shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] transition-all flex flex-col h-full relative"
    >
      {/* Heavy-bordered Image Container with absolute Price Tag */}
      <div className="relative h-48 w-full overflow-hidden border-b-3 border-zinc-900 bg-zinc-100">
        <img
          src={imageUrl}
          alt={dish.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover hover:scale-105 transition-transform duration-550 ease-out"
          loading="lazy"
        />
        
        {/* Dynamic Tag overlaying the image */}
        <div className={`absolute top-4 left-4 font-black px-2.5 py-1 border-2 border-zinc-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] text-[10px] tracking-wider uppercase select-none ${tag.style}`}>
          {tag.text}
        </div>

        <div className="absolute top-4 right-4 bg-yellow-300 text-zinc-900 font-black px-3.5 py-1.5 border-2.5 border-zinc-900 rounded-xl rotate-3 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] select-none text-base">
          ${dish.price.toFixed(2)}
        </div>
      </div>

      {/* Details Box */}
      <div className="p-5 flex flex-col justify-between flex-grow gap-4">
        <div className="space-y-1.5">
          <h3 className="font-extrabold text-xl text-zinc-900 uppercase tracking-tight line-clamp-1">{dish.name}</h3>
          <p className="text-zinc-600 text-sm leading-relaxed line-clamp-2 h-10">{dish.description}</p>
        </div>

        <button
          onClick={() => onAddToCart(dish)}
          className="w-full bg-orange-500 text-zinc-900 font-extrabold py-3 border-2.5 border-zinc-900 rounded-2xl shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px] transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <Plus size={16} className="stroke-[3px]" />
          <span>Add to order</span>
        </button>
      </div>
    </motion.div>
  );
}
