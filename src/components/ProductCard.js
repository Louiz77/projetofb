import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

const ProductCard = ({ product, onViewDetails, onAddToCart, onAddToWishlist }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
  const encodedId = encodeURIComponent(product.id);
  navigate(`/product/${encodedId}`);
};

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist(product);
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-blue-50 transition-colors"
        >
          <Heart size={18} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className={i < 4 ? "text-yellow-400" : "text-gray-300"}
            />
          ))}
          <span className="ml-1 text-sm text-gray-500">(245)</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-blue-600">
            $ {product.price.toFixed(2)}
          </p>
          <button
            onClick={handleViewDetails}
            className="bg-gray-100 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductCard;