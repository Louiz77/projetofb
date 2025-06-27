import { useState, useEffect } from 'react';

const CategoryFilterSection = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const categoryFilters = [
    { id: 1, name: "Calça", icon: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop"  },
    { id: 2, name: "Vestido", icon: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop"  },
    { id: 3, name: "Acessorios", icon: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop"  },
    { id: 4, name: "Tênis", icon: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop"  },
    { id: 5, name: "Camisa", icon: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop"  },
    { id: 6, name: "Calça", icon: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop"  }
  ];

  return (
      <section className="py-8 bg-black text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">EXPLORE BY CATEGORY</h2>
          
          {/* Divisão entre gêneros */}
          <div className="flex items-center justify-center mb-12">
            {/* <div className="mx-8 text-2xl font-bold">FEMALE</div>*/}
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-purple-500"></div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"></div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-red-500"></div>
            {/*<div className="mx-8 text-2xl font-bold">MALE</div>*/}
          </div>

         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categoryFilters.map((cat) => (
              <div
                key={cat.id}
                className="relative group overflow-hidden rounded-2xl cursor-pointer bg-white text-gray-900 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
                <div className="absolute bottom-4 left-4 text-white z-10">
                  <h4 className="text-lg font-bold tracking-wide">{cat.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default CategoryFilterSection;