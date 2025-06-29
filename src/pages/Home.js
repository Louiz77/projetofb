import HeroBanner from '../components/Home/HeroBanner';
import GenderSplitBanner from '../components/Home/GenderSplitBanner';
import CategoryFilterSection from '../components/Home/CategoryFilterSection';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import NewsletterSection from '../components/Home/NewsletterSection';
import CarousselSection from '../components/Home/CarouselSection';
import ProductSection from '../components/Home/ProductSection';
import GridProduct from '../components/Home/GridProduct';
import PromotionalBanner from '../components/Home/PromotionalBanner';
import AccountBanner from '../components/Home/AccountBanner';
import CategoryFilter from '../components/Home/CategoryFilter';
import { auth, db, doc, getDoc, setDoc, onSnapshot } from '../client/firebaseConfig';
import client from '../client/ShopifyClient';
import { useQuery, gql } from '@apollo/client';

const GET_HOME_PRODUCTS = gql`
  query {
    # Produtos com tag "Hot-Topics"
    hotTopicsProducts: products(first: 10, query: "tag:Hot-Topics") {
      edges {
        node {
          id
          title
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                price { amount }
                compareAtPrice { amount }
                title
                availableForSale
              }
            }
          }
        }
      }
    }

    # Produtos com tag "Top"
    topProducts: products(first: 10, query: "tag:Top") {
      edges {
        node {
          id
          title
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                price { amount }
                compareAtPrice { amount }
                title
                availableForSale
              }
            }
          }
        }
      }
    }

    # Produtos com tag "Bottom"
    bottomProducts: products(first: 10, query: "tag:Bottom") {
      edges {
        node {
          id
          title
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                price { amount }
                compareAtPrice { amount }
                title
                availableForSale
              }
            }
          }
        }
      }
    }

    # Produtos com tag "Dresses"
    dressesProducts: products(first: 10, query: "tag:Dresses") {
      edges {
        node {
          id
          title
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                price { amount }
                compareAtPrice { amount }
                title
                availableForSale
              }
            }
          }
        }
      }
    }

    # Produtos com tag "Footwear"
    footwear: products(first: 10, query: "tag:Footwear") {
      edges {
        node {
          id
          title
          tags
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 5) {
            edges {
              node {
                id
                price { amount }
                compareAtPrice { amount }
                title
                availableForSale
              }
            }
          }
        }
      }
    }
  }
`;

const Home = () => {
  const { loading, error, data } = useQuery(GET_HOME_PRODUCTS);

  // Helper para transformar dados do produto
  const transformProduct = (product) => {
    const variant = product.variants.edges[0]?.node;
    return {
      id: product.id,
      name: product.title,
      image: product.images.edges[0]?.node.url || "https://via.placeholder.com/400x500 ",
      price: parseFloat(variant?.price.amount || 0),
      originalPrice: parseFloat(variant?.compareAtPrice?.amount || 0),
      tags: product.tags || [],
      isPromotion: product.tags.includes("promoção"),
      isLimitedStock: product.tags.includes("estoque-limitado"),
      isNew: product.tags.includes("novo"),
      availableForSale: variant?.availableForSale || false,
      variants: product.variants,
      stockCount: variant?.availableForSale ? 3 : 0
    };
  };

  // Transformar dados
  const hotTopicProducts = data?.hotTopicsProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const topProducts = data?.topProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const bottomProducts = data?.topProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const dressesProducts = data?.topProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const footwearProducts = data?.topProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;


  const mockProducts = [
    { id: 1, name: "Gothic Dress", price: 299, originalPrice: 399, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", sale: true, limited: false },
    { id: 2, name: "Dark Angel Top", price: 159, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 3, name: "Shadow Jacket", price: 449, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop", sale: false, limited: false },
    { id: 4, name: "Midnight Skirt", price: 199, originalPrice: 269, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop", sale: true, limited: false },
    { id: 5, name: "Rebel Boots", price: 349, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 6, name: "Darkness Hoodie", price: 229, image: "https://images.unsplash.com/photo-1556821840-3a9fbc82ea14?w=400&h=500&fit=crop", sale: false, limited: false },
    { id: 7, name: "Rebel Boots", price: 349, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 8, name: "Rebel Boots", price: 349, image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=500&fit=crop", sale: false, limited: true },
    { id: 9, name: "Gothic Dress", price: 299, originalPrice: 399, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", sale: true, limited: false },
    { id: 10, name: "Gothic Jacket", price: 429, originalPrice: 648, image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", sale: true, limited: true },
    {
      id: 1,
      name: "Camiseta Premium Masculina",
      price: 89.90,
      originalPrice: 129.90,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop",
      category: "HOMEM",
      isPromotion: true,
      isNew: false,
      isLimitedStock: false
    },
    {
      id: 2,
      name: "Vestido Elegante Feminino",
      price: 199.90,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
      category: "MULHER",
      isPromotion: false,
      isNew: true,
      isLimitedStock: false
    },
    {
      id: 3,
      name: "Jaqueta de Couro Masculina",
      price: 399.90,
      originalPrice: 499.90,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop",
      category: "HOMEM",
      isPromotion: true,
      isNew: false,
      isLimitedStock: true,
      stockCount: 2
    },
    {
      id: 4,
      name: "Blusa Casual Feminina",
      price: 79.90,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop",
      category: "MULHER",
      isPromotion: false,
      isNew: false,
      isLimitedStock: false
    },
    {
      id: 5,
      name: "Calça Jeans Masculina",
      price: 149.90,
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop",
      category: "HOMEM",
      isPromotion: false,
      isNew: true,
      isLimitedStock: false
    }
  ];

  const kits = [
    { 
      id: 1, 
      name: "Dark Prince Kit", 
      price: 449, 
      originalPrice: 529,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Camiseta", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop" },
        { name: "Jaqueta", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop" },
        { name: "Calça", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop" }
      ],
      rating: 4.8,
      isPromotion: true
    },
    { 
      id: 2, 
      name: "Shadow Warrior Kit", 
      price: 389, 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Tank Top", image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=300&h=300&fit=crop" },
        { name: "Shorts", image: "https://images.unsplash.com/photo-1506629905607-e9e501629f83?w=300&h=300&fit=crop" },
        { name: "Boné", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=300&h=300&fit=crop" }
      ],
      rating: 4.7,
      isLimitedStock: true,
      stockCount: 8
    },
    { 
      id: 3, 
      name: "Urban Rebel Kit", 
      price: 459, 
      originalPrice: 529,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Hoodie", image: "https://images.unsplash.com/photo-1556821840-3a9c6c1b0520?w=300&h=300&fit=crop" },
        { name: "Calça Cargo", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&h=300&fit=crop" },
        { name: "Tênis", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" }
      ],
      rating: 4.6,
      isPromotion: true
    },
    { 
      id: 4, 
      name: "Mystical Kit", 
      price: 399, 
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop", 
      gender: "male",
      items: [
        { name: "Regata", image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=300&h=300&fit=crop" },
        { name: "Bermuda", image: "https://images.unsplash.com/photo-1506629905607-e9e501629f83?w=300&h=300&fit=crop" }
      ],
      rating: 4.5
    },
    { 
      id: 5, 
      name: "Shadow Queen Kit", 
      price: 519, 
      originalPrice: 649,
      image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop", 
      gender: "female",
      items: [
        { name: "Top Cropped", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
        { name: "Saia", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=300&h=300&fit=crop" },
        { name: "Meias", image: "https://images.unsplash.com/photo-1586281002406-c954bb5c23dd?w=300&h=300&fit=crop" }
      ],
      rating: 4.9,
      isPromotion: true
    },
    { 
      id: 6, 
      name: "Rebel Princess Kit", 
      price: 479, 
      image: "https://images.unsplash.com/photo-1494790108755-2616c056ca96?w=400&h=500&fit=crop", 
      gender: "female",
      items: [
        { name: "Vestido", image: "https://images.unsplash.com/photo-1566479179817-c0b2bbadccca?w=300&h=300&fit=crop" },
        { name: "Jaqueta", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=300&fit=crop" },
        { name: "Botas", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop" }
      ],
      rating: 4.8,
      isNew: true
    },
    { 
      id: 7, 
      name: "Dark Angel Kit", 
      price: 399, 
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop", 
      gender: "female",
      items: [
        { name: "Blusa Mesh", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=300&fit=crop" },
        { name: "Shorts", image: "https://images.unsplash.com/photo-1506629905607-e9e501629f83?w=300&h=300&fit=crop" },
        { name: "Acessórios", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=300&fit=crop" }
      ],
      rating: 4.7,
      isLimitedStock: true,
      stockCount: 5
    }
  ];

  const getOrCreateCartId = async () => {
    let cartId = localStorage.getItem('shopifyCartId');

    if (!cartId) {
      try {
        const { data } = await client.mutate({
          mutation: gql`
            mutation {
              cartCreate(input: {}) {
                cart {
                  id
                  checkoutUrl
                }
              }
            }
          `,
        });
        cartId = data.cartCreate.cart.id;
        localStorage.setItem('shopifyCartId', cartId);
      } catch (error) {
        console.error("Erro ao criar carrinho do Shopify:", error);
        alert("Falha ao iniciar o carrinho. Tente recarregar a página.");
        throw error;
      }
    }

    return cartId;
  };

  // Função para adicionar ao carrinho
  const addToCart = async (item) => {
    try {
      const cartId = localStorage.getItem('shopifyCartId') || (await getOrCreateCartId());

      // Validar que o merchandiseId é um variantId válido
      if (!item.variantId || !item.variantId.startsWith("gid://shopify/ProductVariant/")) {
        alert("ID da variante inválido. Não foi possível adicionar ao carrinho.");
        return;
      }

      const { data } = await client.mutate({
        mutation: gql`
          mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                checkoutUrl
              }
            }
          }
        `,
        variables: {
          cartId,
          lines: [
            {
              merchandiseId: item.variantId,
              quantity: item.quantity || 1,
            },
          ],
        },
      });

      // Atualizar carrinho local com estrutura padronizada
      const cartItem = {
        id: item.variantId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity || 1,
      };

      // Lógica para atualizar carrinho no Firebase ou localStorage
      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        const existingItems = cartSnap.exists() ? cartSnap.data().items || [] : [];

        const isAlreadyInCart = existingItems.some(cartItem => cartItem.id === cartItem.id);
        const updatedItems = isAlreadyInCart
          ? existingItems.map(cartItem => 
              cartItem.id === cartItem.id 
                ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                : cartItem
            )
          : [...existingItems, cartItem];

        await setDoc(cartRef, { items: updatedItems }, { merge: true });
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const isAlreadyInCart = guestCart.some(cartItem => cartItem.id === cartItem.id);
        const updatedItems = isAlreadyInCart
          ? guestCart.map(cartItem => 
              cartItem.id === cartItem.id 
                ? { ...cartItem, quantity: cartItem.quantity + 1 } 
                : cartItem
            )
          : [...guestCart, cartItem];

        localStorage.setItem('guestCart', JSON.stringify(updatedItems));
      }

      alert(`${item.name} adicionado ao carrinho`);
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      alert("Falha ao adicionar ao carrinho. Verifique os dados do produto.");
    }
  };

  return (
    <div>
      <HeroBanner />
      
      <GenderSplitBanner />

      {/* Faixa Promocional */}
      <section className="snap-section banner-section bg-[#8A0101] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[#8A0101]" />
        </div>
        <div className="py-4">
          <div className="container mx-auto px-4 text-center relative z-10">
            <p className="text-white text-sm sm:text-base lg:text-lg font-semibold animate-pulse">
              🔥 <span className="hidden sm:inline">FREE SHIPPING ($450) • INTEREST-FREE INSTALLMENTS IN UP TO 3X • </span>
              <span className="sm:hidden">FREE SHIPPING • INSTALLMENTS • </span>
              SILENCE IS JUST THE PRELUDE TO CHAOS 🔥
            </p>
          </div>
        </div>
      </section>

      {/* Hot Topics */}
      <CarousselSection 
        title="HOT TOPICS" 
        products={hotTopicProducts} 
        id="hot-topics"
        onAddToCart={addToCart}
      />

      {/* Kits Section */}
      <ProductSection 
          products={kits} 
          sectionType="kits"
        />

      {/* Carrosseis de Destaques */}
      <CarousselSection 
        title="TOP" 
        products={topProducts} 
        id="parte-cima"
        onAddToCart={addToCart}
      />
      <CarousselSection 
        title="BOTTOM PART" 
        products={bottomProducts} 
        id="parte-baixo"
        onAddToCart={addToCart}
      />

      {/* Acessórios & Bolsas */}
      {/* <GridProduct mockProducts={mockProducts}/> */}
      <ProductSection 
        products={kits} 
        sectionType="acessórios"
        heroImage="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop"
        heroTitle="STYLE ESSENTIALS"
        heroSubtitle="COMPLETE YOUR LOOK"
        heroButton="DISCOVER NOW"
      />


      <CarousselSection 
        title="DRESSES" 
        products={dressesProducts} 
        id="DRESSES"
        onAddToCart={addToCart}
      />
      <CarousselSection 
        title="FOOTWEAR" 
        products={footwearProducts} 
        id="FOOTWEAR"
        onAddToCart={addToCart}
      />
      
      {/* Faixa Promocional para Cadastro */}
      <PromotionalBanner />

      <section className="py-4 bg-[#8A0101] text-white text-center">
        <p className="text-sm font-bold tracking-wider uppercase">
          🔥 FREE SHIPPING ($450) • INTEREST-FREE INSTALLMENTS IN UP TO 3X • SILENCE IS JUST THE PRELUDE TO CHAOS 🔥
        </p>
      </section>

      {/* Filtros por Categorias */}
      <CategoryFilterSection />

      {/* Seção de Propagandas com IMG ao fundo 
      <AccountBanner />*/}

      {/*Filtro com Layout de Bolinhas Estilizadas (Categoria) 
      <CategoryFilter />
      <FeaturedProducts />*/}
      <NewsletterSection />
    </div>
  );
};

export default Home;