import { Eye, Heart } from "lucide-react";  

const ProductCard = ({ product, size = "default" }) => (
    <div className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${size === "large" ? "min-w-80" : "min-w-64"} flex-shrink-0`}>
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full object-cover group-hover:scale-110 transition-transform duration-700 ${size === "large" ? "h-96" : "h-80"}`}
        />
        {product.sale && (
          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            PROMOTION
          </div>
        )}
        {product.limited && (
          <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
            LAST UNITS
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
          <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
            <Eye size={20} />
          </button>
          <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
            <Heart size={20} />
          </button>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-bold text-lg mb-2 text-gray-900">{product.name}</h3>
        <div className="flex items-center gap-2 mb-4">
          {product.originalPrice && (
            <span className="text-gray-500 line-through">$ {product.originalPrice}</span>
          )}
          <span className="text-2xl font-bold text-gray-900">$ {product.price}</span>
        </div>
        <button className="w-full bg-gradient-to-r from-purple-600 to-red-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-700 hover:to-red-700 transform hover:-translate-y-1 transition-all duration-300">
          ADD TO CART
        </button>
      </div>
    </div>
  );

export default ProductCard;