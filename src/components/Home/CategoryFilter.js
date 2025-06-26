const CategoryFilter = ({  }) => {
  const categoryFilters = [
    { id: 1, name: "Prime", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=300&h=300&fit=crop", gender: "all" },
    { id: 2, name: "Camisetas", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop", gender: "female" },
    { id: 3, name: "Polos", image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=300&h=300&fit=crop", gender: "female" },
    { id: 4, name: "Bermudas", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop", gender: "female" },
    { id: 5, name: "Camisas", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop", gender: "female" },
    { id: 6, name: "Calças", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop", gender: "female" },
    { id: 7, name: "Casacos", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=300&h=300&fit=crop", gender: "male" },
    { id: 8, name: "Pima", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=300&h=300&fit=crop", gender: "male" },
    { id: 9, name: "Óculos", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300&h=300&fit=crop", gender: "male" },
    { id: 10, name: "Cuecas", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop", gender: "male" },
    { id: 11, name: "Calçados", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop", gender: "male" },
    { id: 12, name: "Feminino", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop", gender: "male" }
  ];
  return(
        <section className="py-4 bg-black text-white">
            <div className="container mx-auto px-4 mt-4">

                {/* Linha de divisão visual entre os gêneros */}
                <div className="flex items-center justify-center mb-12 relative">
                    <div className="flex-1 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full" />
                </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {categoryFilters.slice(0, 6).map((cat) => (
                            <div key={cat.id} className="flex flex-col items-center space-y-2 group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-purple-600 group-hover:border-purple-800 transition-all duration-300">
                                    <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>
                                <span className="text-sm tracking-wide group-hover:text-purple-400">{cat.name}</span>
                            </div>
                        ))}

                    {categoryFilters.slice(6, 12).map((cat) => (
                        <div key={cat.id} className="flex flex-col items-center space-y-2 group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-red-600 group-hover:border-red-800 transition-all duration-300">
                                <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <span className="text-sm tracking-wide group-hover:text-red-400">{cat.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
export default CategoryFilter;