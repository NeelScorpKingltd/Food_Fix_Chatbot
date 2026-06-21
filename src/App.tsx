/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShoppingCart, Search, Sparkles, Compass, TrendingUp } from 'lucide-react';
import DishCard from './components/DishCard';
import Cart from './components/Cart';
import Chatbot from './components/Chatbot';
import BowlLogo from './components/BowlLogo';
import { Dish, CartItem } from './types';

const DISHES: Dish[] = [
  {
    id: '1',
    name: 'Smokey Double Truffle Burger',
    price: 14.99,
    description: 'Two flame-grilled beef patties, double melted Swiss cheese, caramelized onions, crisp pickles, and our signature truffle aioli on a glossy brioche bun.',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'Wood-Fired Spicy Pepperoni',
    price: 15.49,
    description: 'Bubbling sourdough crust topped with thick-cup pepperoni, crushed San Marzano tomatoes, fresh oregano, and finished with organic hot honey drizzle.',
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'Classic Italian Margherita',
    price: 12.99,
    description: 'Rustic stone-baked crust topped with creamy fior di latte mozzarella, rich vine-ripened tomato-basil sauce, and cold-pressed extra virgin olive oil.',
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '4',
    name: 'Tuscan Garlic Fettuccine',
    price: 16.49,
    description: 'Al dente fettuccine ribbons smothered in rich garlic butter, roasted cherry tomatoes, wild mushrooms, and pan-seared strips of free-range chicken.',
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '5',
    name: 'Slow-Smoked Pork Ribs',
    price: 18.99,
    description: 'Fall-off-the-bone tender baby back pork ribs blanketed with our classic sweet and sticky hickory glaze, served with a cup of fresh apple-slaw.',
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '6',
    name: 'Truffle Parmesan Fries',
    price: 7.49,
    description: 'Golden hand-cut Idaho potatoes tossed with gourmet black truffle oil, dynamic sea salt flakes, freshly grated pecorino cheese, and fresh rosemary.',
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '7',
    name: 'Cayenne Glazed Wings',
    price: 11.99,
    description: 'Crispy jumbo wings dry-rubbed, slow-cooked in our custom smoker, and glazed in our bright cayenne-honey buffalo sauce.',
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '8',
    name: 'Crispy Heart of Romaine Caesar',
    price: 9.99,
    description: 'Crisp hand-cut organic romaine leaves loaded with premium shaved vintage parmesan, herb-seasoned sourdough croutons, and rich Caesar dressing.',
    category: 'Greens',
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '9',
    name: 'Caprese & Burrata Salad',
    price: 11.49,
    description: 'A full creamy sphere of hand-pulled Italian burrata alongside beefsteak tomatoes, fresh basil pesto, toasted pine nuts, and balsamic glaze.',
    category: 'Greens',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '10',
    name: 'Avocado Crunch Toast',
    price: 10.49,
    description: 'Toasted artisanal wheat country bread covered in whipped seasoned avocados, premium sea salt, dynamic chia mix, and crumbled greek feta.',
    category: 'Greens',
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '11',
    name: 'Molten Belgian Chocolate Dome',
    price: 8.49,
    description: 'Decadent dark chocolate sponge cake with a flowing, lava-hot liquid chocolate core, served with raspberries and sugar dust.',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '12',
    name: 'Fried Sugared Spanish Churros',
    price: 6.99,
    description: 'Golden fried Spanish butter dough spirals dusted with coarse cinnamon sugar, served with thick dark chocolate and spicy caramel dip pots.',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '13',
    name: 'Wild Berries Matcha Iced Latte',
    price: 5.99,
    description: 'Ceremonial grade pure stoneground Japanese green tea matcha poured over cold sweet milk and our fresh homemade summer berry compote.',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '14',
    name: 'Crispy Nashville Hot Chicken',
    price: 13.99,
    description: 'Golden southern-fried chicken breast dipped in a fiery cayenne glaze, with juicy pickles, vinegar-slaw, and seasoned dynamic chef sauce.',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1627662236973-4f8259fa2441?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '15',
    name: 'Avocado Green Goddess Burger',
    price: 13.49,
    description: 'Flame-grilled organic turkey patty topped with thick avocados, house-blended green goddess pesto cream, and crisp watercress leaf mix.',
    category: 'Burgers',
    image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '16',
    name: 'Wild Mushroom & Truffle Pizza',
    price: 16.99,
    description: 'White garlic base loaded with dynamic sautéed hand-torn portobello, cremini, goat cheese rounds, roasted garlic, and cold-pressed truffle oil.',
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '17',
    name: 'Smoked Barbecue Chicken Pizza',
    price: 15.99,
    description: 'Tangy wood-smoke BBQ base, hand-shredded slow-cooked chicken, roasted purple onion rings, smoked gouda melt, and fresh coriander leaves.',
    category: 'Pizzas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '18',
    name: 'Creamy Sun-Dried Tomato Penne',
    price: 14.49,
    description: 'Rich and velvety basil-pink sauce over al dente ridge penne, bursting with Italian sun-dried tomatoes, wilted baby kale, and creamy feta crumbs.',
    category: 'Pasta',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '19',
    name: 'Crispy Calamari Fritti',
    price: 12.49,
    description: 'Salt-and-pepper dusted crispy calamari rings served with our legendary fire gochujang-chili aioi and charred lemon cheeks.',
    category: 'Starters',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '20',
    name: 'Sweet Potato Frites & Chili Aioli',
    price: 7.99,
    description: 'Thick hand-cut oven frites dusted with sweet paprika-brown sugar seasoning, served with a double-sized pot of spicy chipotle dip.',
    category: 'Sides',
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '21',
    name: 'Warm Apple Berry Crumble Pie',
    price: 8.99,
    description: 'Baked cast-iron sweet apples and dark summer blackberries, hidden underneath a crunchy toasted oat dynamic crust, topped with real vanilla dust.',
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1621510456681-23a23cfb5f57?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '22',
    name: 'Mango Passion Fruit Mocktail',
    price: 6.49,
    description: 'Double-shaken sweet Philippine yellow mango juice, wild purple passionfruit pulp, dynamic lime-tonic splash, and raw wild sugarcane syrup.',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: '23',
    name: 'Salted Caramel Cold Brew',
    price: 5.49,
    description: 'Twenty-four hour steeped artisanal organic drop cold brew coffee, topped with sea-salt sweet cream cap and hand-drizzled toffee rivers.',
    category: 'Drinks',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=600&auto=format&fit=crop'
  }
];

const CATEGORIES = ['All', 'Burgers', 'Pizzas', 'Pasta', 'Starters', 'Sides', 'Greens', 'Desserts', 'Drinks'];

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null);
    });
  };

  const filteredDishes = DISHES.filter(dish => {
    const matchesCategory = selectedCategory === 'All' || dish.category === selectedCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 p-4 sm:p-8 font-sans transition-all selection:bg-orange-300">
      {/* Sticky Top-level navigation / header for premium scrollable view control */}
      <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8 max-w-6xl mx-auto">
        {/* Disconnected Brand Banner Card with custom status line */}
        <div className="flex items-center gap-4 bg-white border-3 border-zinc-900 rounded-3xl p-4 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] flex-1 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500 rounded-bl-[100px] opacity-10 group-hover:scale-110 transition-transform" />
          <BowlLogo />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Food Fix</h1>
              <span className="hidden xs:inline-flex items-center gap-1 bg-yellow-300 text-zinc-900 border-2 border-zinc-900 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase rotate-2 animate-pulse">
                Hot <Sparkles size={10} className="fill-zinc-900" />
              </span>
            </div>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-0.5">Satisfy cravings instantly</p>
          </div>
        </div>

        {/* Disconnected stand-alone Cart Trigger Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex items-center justify-center gap-3 bg-orange-500 text-zinc-900 font-black text-lg uppercase tracking-wider px-8 py-5 border-3 border-zinc-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all cursor-pointer relative"
        >
          <ShoppingCart size={24} className="stroke-zinc-900 stroke-[3px]" />
          <span>Cart</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-2.5 -right-2.5 bg-yellow-300 text-zinc-900 text-sm font-black rounded-full h-7 w-7 flex items-center justify-center border-3 border-zinc-900 shadow-md animate-bounce">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Hero promo & navigation panel */}
      <section className="max-w-6xl mx-auto mb-8 bg-zinc-900 text-zinc-50 rounded-[32px] p-6 sm:p-10 border-3 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] relative overflow-hidden">
        {/* Abstract background shapes targeting brutalist vibe */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-orange-500/20 skew-x-12 translate-x-12 hidden md:block" />
        
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-zinc-950 font-black text-xs uppercase px-3 py-1 border-2 border-zinc-950 rounded-xl">
            <TrendingUp size={12} className="stroke-[3px]" /> Special Promo Code applied
          </div>
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
            Don't starve.<br />Get your <span className="text-orange-400">Food Fix</span> now.
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed font-medium">
            Handcrafted luxury street eats delivered blistering hot in record times. Crafted to cure dynamic midnight hungers or satisfy midday office cravings.
          </p>
        </div>
      </section>

      {/* Search and Category Filtering Block */}
      <section className="max-w-6xl mx-auto bg-white border-3 border-zinc-900 rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] mb-10 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
          {/* Compass & header title */}
          <div className="flex items-center gap-2.5">
            <Compass className="text-orange-500 stroke-[2.5px]" size={24} />
            <span className="font-extrabold text-lg text-zinc-900 uppercase tracking-tight">Explore the Menu</span>
          </div>

          {/* Styled search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 stroke-[2.5px]" size={18} />
            <input
              type="text"
              placeholder="Search dishes (e.g. burger, spicy pepper...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border-2.5 border-zinc-900 rounded-2xl pl-12 pr-4 py-3 text-sm font-semibold text-zinc-900 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-zinc-200 hover:bg-zinc-300 text-zinc-850 text-xs font-black px-2 py-0.5 rounded-lg border border-zinc-900"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Horizontal Category tags container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x -mx-6 px-6 sm:mx-0 sm:px-0">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider border-2.5 border-zinc-900 whitespace-nowrap cursor-pointer transition-all shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] ${
                  isActive
                    ? 'bg-yellow-300 text-zinc-950 shadow-[0px_0px_0px_0px] translate-y-0.5'
                    : 'bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Catalog View: Scrollable order screen */}
      <main className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
            Showing <span className="bg-zinc-900 text-white px-2 py-0.5 rounded-md text-[10px]">{filteredDishes.length}</span> delicious matches
          </p>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-black uppercase text-orange-600 hover:underline flex items-center gap-1 px-2 py-1 rounded"
            >
              Reset active category
            </button>
          )}
        </div>

        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
            {filteredDishes.map(dish => (
              <div key={dish.id} className="h-full">
                <DishCard dish={dish} onAddToCart={addToCart} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border-3 border-dashed border-zinc-300 rounded-[32px] flex flex-col items-center justify-center p-8 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4 border-2 border-zinc-900">
              <Search size={28} className="stroke-[2.5px] text-zinc-900" />
            </div>
            <h3 className="font-extrabold text-2xl text-zinc-900 uppercase tracking-tight mb-2">No cravings matched</h3>
            <p className="text-zinc-500 text-sm max-w-md">
              We couldn't find any dishes fitting "{searchQuery}" under the category "{selectedCategory}". Try checking your typing or search for broad terms.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-6 bg-zinc-900 text-white font-extrabold text-xs uppercase px-5 py-3 border-2 border-zinc-900 rounded-xl hover:translate-x-0.5 hover:translate-y-0.5 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] transition-all cursor-pointer"
            >
              Show all foods
            </button>
          </div>
        )}
      </main>

      {isCartOpen && (
        <Cart
          cartItems={cartItems}
          onRemoveFromCart={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onCheckout={() => setIsCartOpen(false)}
        />
      )}
      <Chatbot />
    </div>
  );
}
