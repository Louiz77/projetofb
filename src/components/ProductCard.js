import { Star, ShoppingBag, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onViewDetails, onAddToCart, onAddToWishlist }) => {
    const navigate = useNavigate();

    const handleViewDetails = () => {
    navigate(`/product/${product.id}`);
  };
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToWishlist(product);
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
          >
            <Heart
              size={18}
              //className={wishlist.includes(product.id) ? "text-red-500" : "text-gray-400"}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
          >
            <ShoppingBag size={18} className="text-gray-400" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={i < Math.floor(product.rating) ? "text-yellow-400" : "text-gray-300"}
              />
            ))}
          </div>
          <span className="ml-1 text-sm text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xl font-bold text-blue-600">
              R$ {product.price.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 line-through">
              R$ 999.99
            </p>
          </div>
            <button onClick={handleViewDetails}>Ver Detalhes</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;