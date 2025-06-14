import { Star, Minus, Plus } from "lucide-react";
import { useState } from "react";

const ProductDetail = ({ product, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => window.history.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Voltar aos produtos
        </button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <img
              src="https://images.unsplash.com/photo-1618453292459-53424b66bb6a?q=80&w=1664&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt='Camisa'
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Camisa</h1>
            <div className="flex items-center mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < Math.floor(4.8) ? "text-yellow-400" : "text-gray-300"
                    }
                  />
                ))}
              </div>
              <span className="ml-1 text-sm text-gray-500">(272)</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xl font-bold text-blue-600">
                R$ 199.99
              </p>
              <p className="text-sm text-gray-500 line-through">
                R$ 499.99
              </p>
            </div>
            <p className="text-gray-700 mb-6">a</p>
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Quantidade:</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 border rounded-lg hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Adicionar ao Carrinho
              </button>
              <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
                Comprar Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;