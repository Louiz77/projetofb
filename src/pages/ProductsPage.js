import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import ProductCard from '../components/ProductCard';
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";

// Carrega mensagens de erro apenas em ambiente de desenvolvimento
if (process.env.NODE_ENV === "development") {
  loadDevMessages();  // Mensagens de erro específicas para dev
  loadErrorMessages(); // Mensagens de erro gerais
}

const GET_PRODUCTS = gql`
  query {
    products(first: 10) {
      edges {
        node {
          id
          title
          priceRange {
            minVariantPrice {
              amount
            }
          }
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    }
  }
`;

const ProductsPage = () => {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
    console.log('Adicionado ao carrinho:', product);
  };

  const addToWishlist = (product) => {
    setWishlist([...wishlist, product]);
    console.log('Adicionado à wishlist:', product);
  };

  if (loading) return <div>Carregando produtos...</div>;
  if (error) return <div>Erro ao carregar produtos: {error.message}</div>;

  const products = data.products.edges.map(edge => edge.node);
    console.log(products)
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{
                id: product.id,
                name: product.title,
                price: parseFloat(product.priceRange.minVariantPrice.amount),
                image: product.images.edges[0].node.url,
              }}
              onViewDetails={() => navigate(`/product/${product.id}`)}
              onAddToCart={addToCart}
              onAddToWishlist={addToWishlist}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;