import HeroBanner from '../components/Home/HeroBanner';
import GenderSplitBanner from '../components/Home/GenderSplitBanner';
import CategoryFilterSection from '../components/Home/CategoryFilterSection';
import FeaturedProducts from '../components/Home/FeaturedProducts';
import NewsletterSection from '../components/Home/NewsletterSection';
import CarousselSection from '../components/Home/CarouselSection';
import ProductSection from '../components/Home/ProductSection';
import GridProduct from '../components/Home/GridProduct';
import PromotionalBanner from '../components/Home/AccountBanner';
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
    footwearProducts: products(first: 10, query: "tag:Footwear") {
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
    # Produtos com tag "Acessories"
    accessoriesProducts: products(first: 10, query: "tag:Accessories") {
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
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
    # Produtos com tag "Bags"
    bagsProducts: products(first: 10, query: "tag:Bags") {
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
                image {
                  url
                }
              }
            }
          }
        }
      }
    }
    collectionProducts: collections(first: 10) {
      edges {
        node {
          id
          title
          description
          image {
            url
          }
          products(first: 10) {
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
                      price {
                        amount
                      }
                    }
                  }
                }
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

  // Helper para transformar dados do produto SECTION
  const transformProduct = (product) => {
    const variant = product.variants.edges[0]?.node;
    const currentPrice = parseFloat(variant?.price.amount || 0);
    const originalPrice = parseFloat(variant?.compareAtPrice?.amount || 0);
    
    // Calcular desconto apenas se compareAtPrice existir e for maior que o preço atual
    const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
    
    // TEMPORÁRIO: Para demonstração, vamos inverter os valores se estiverem "errados"
    const hasInvertedValues = originalPrice > 0 && originalPrice < currentPrice;
    const displayPrice = hasInvertedValues ? originalPrice : currentPrice;
    const displayOriginalPrice = hasInvertedValues ? currentPrice : originalPrice;
    const finalHasDiscount = hasDiscount || hasInvertedValues;
    
    const discountPercentage = finalHasDiscount 
      ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
      : 0;
    
    return {
      id: product.id,
      name: product.title,
      image: product.images.edges[0]?.node.url || "https://via.placeholder.com/400x500 ",
      price: displayPrice,
      originalPrice: finalHasDiscount ? displayOriginalPrice : undefined, // Só inclui se há desconto
      discount: discountPercentage > 0 ? discountPercentage : undefined, // Só inclui se há desconto
      tags: product.tags || [],
      isPromotion: product.tags.includes("promoção"),
      isLimitedStock: product.tags.includes("estoque-limitado"),
      isNew: product.tags.includes("novo"),
      availableForSale: variant?.availableForSale || false,
      variants: product.variants,
      stockCount: variant?.availableForSale ? 3 : 0,
      _debugNote: hasInvertedValues ? 'Valores invertidos temporariamente para demonstração' : 'Valores corretos'
    };
  };

  const transformCollection = (collection) => {
    // Extrair produtos da collection
    const products = collection.products.edges.map(productEdge => {
      const product = productEdge.node;
      const variant = product.variants.edges[0]?.node;
      const currentPrice = parseFloat(variant?.price.amount || 0);
      const originalPrice = parseFloat(variant?.compareAtPrice?.amount || 0);
      
      // Calcular desconto apenas se compareAtPrice existir e for maior que o preço atual
      const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
      
      // TEMPORÁRIO: Para demonstração, vamos inverter os valores se estiverem "errados"
      const hasInvertedValues = originalPrice > 0 && originalPrice < currentPrice;
      const displayPrice = hasInvertedValues ? originalPrice : currentPrice;
      const displayOriginalPrice = hasInvertedValues ? currentPrice : originalPrice;
      const finalHasDiscount = hasDiscount || hasInvertedValues;
      
      const discountPercentage = finalHasDiscount 
        ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
        : 0;
      
      // Gerar rating mockado de forma consistente por produto
      const rating = (product.id && typeof product.id === 'string')
        ? 4.0 + (parseInt(product.id.replace(/\D/g, '').slice(-1)) % 10) * 0.1 // rating entre 4.0 e 4.9
        : 4.5;
      return {
        id: product.id,
        name: product.title,
        image: product.images.edges[0]?.node.url || "https://via.placeholder.com/400x500 ",
        price: displayPrice,
        originalPrice: finalHasDiscount ? displayOriginalPrice : undefined, // Só inclui se há desconto
        discount: discountPercentage > 0 ? discountPercentage : undefined, // Só inclui se há desconto
        tags: product.tags || [],
        availableForSale: variant?.availableForSale || false,
        variants: product.variants,
        rating
      };
    });

    // Calcular faixa de preço
    const prices = products.map(p => p.price).filter(p => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    return {
      id: collection.id,
      name: collection.title,
      description: collection.description || "Coleção sem descrição",
      image: collection.image?.url || "https://via.placeholder.com/800x400 ",
      priceRange: prices.length ? `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}` : "N/A",
      products // <-- importante para ProductSection
    };
  };

  // Transformar dados
  const hotTopicProducts = data?.hotTopicsProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const topProducts = data?.topProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const bottomProducts = data?.bottomProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const dressesProducts = data?.dressesProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const footwearProducts = data?.footwearProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const accessoriesProducts = data?.accessoriesProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const bagsProducts = data?.bagsProducts?.edges?.map(edge => 
    transformProduct(edge.node)
  ) || [];

  const collectionProducts = data?.collectionProducts?.edges.map(edge => 
    transformCollection(edge.node)
  );

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;



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
          collections={collectionProducts} 
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
        products={{ accessories: accessoriesProducts, bags: bagsProducts }} 
        sectionType="acessorios"
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