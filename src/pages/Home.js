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

// Query para buscar metaobjeto por ID
const GET_METAOBJECT = gql`
  query GetMetaobject($id: ID!) {
    metaobject(id: $id) {
      id
      type
      field(key: "label") {
        value
      }
    }
  }
`;

const GET_HOME_PRODUCTS = gql`
  query {
    # Produtos com tag "Hot-Topics"
    hotTopicsProducts: products(first: 10, query: "tag:Hot-Topics") {
      edges {
        node {
          id
          title
          tags
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          # Fallback para metafields customizados
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"},
            {namespace: "custom", key: "target_gender"},
            {namespace: "custom", key: "gender"}
          ]) {
            key
            value
            namespace
          }
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

    # Produtos com tag "Top"
    topProducts: products(first: 10, query: "tag:Top") {
      edges {
        node {
          id
          title
          tags
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          # Fallback para metafields customizados
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"},
            {namespace: "custom", key: "target_gender"},
            {namespace: "custom", key: "gender"}
          ]) {
            key
            value
            namespace
          }
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

    # Produtos com tag "Bottom"
    bottomProducts: products(first: 10, query: "tag:Bottom") {
      edges {
        node {
          id
          title
          tags
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          # Fallback para metafields customizados
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"},
            {namespace: "custom", key: "target_gender"},
            {namespace: "custom", key: "gender"}
          ]) {
            key
            value
            namespace
          }
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

    # Produtos com tag "Dresses"
    dressesProducts: products(first: 10, query: "tag:Dresses") {
      edges {
        node {
          id
          title
          tags
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"}
          ]) {
            key
            value
            namespace
          }
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

    # Produtos com tag "Footwear"
    footwearProducts: products(first: 10, query: "tag:Footwear") {
      edges {
        node {
          id
          title
          tags
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"}
          ]) {
            key
            value
            namespace
          }
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
    # Produtos com tag "Acessories"
    accessoriesProducts: products(first: 10, query: "tag:Accessories") {
      edges {
        node {
          id
          title
          tags
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"}
          ]) {
            key
            value
            namespace
          }
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
          # Metacampos para gênero alvo - metaobjeto Shopify
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                type
                field(key: "label") {
                  value
                }
              }
            }
          }
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"}
          ]) {
            key
            value
            namespace
          }
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
          # Metafields para desconto (opcional - caso configurados no Shopify)
          discountPercentage: metafield(namespace: "custom", key: "discount_percentage") {
            value
          }
          minItemsForDiscount: metafield(namespace: "custom", key: "min_items_for_discount") {
            value
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
                      title
                      availableForSale
                      price {
                        amount
                      }
                      compareAtPrice {
                        amount
                      }
                      image {
                        url
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
    const variants = product.variants?.edges?.map(edge => {
      const v = edge.node;
      return {
        id: v.id,
        title: v.title,
        availableForSale: typeof v.availableForSale === 'boolean' ? v.availableForSale : true,
        image: v.image ? { ...v.image } : undefined,
        price: v.price ? { ...v.price } : undefined,
        compareAtPrice: v.compareAtPrice ? { ...v.compareAtPrice } : undefined
      };
    }) || [];

    // Processar metacampos (especialmente genero_alvo)
    const metafields = {};
    
    // Processar metafields principais (incluindo metaobjeto target-gender do Shopify)
    if (product.metafields && Array.isArray(product.metafields)) {
      
      product.metafields.forEach(metafield => {
        if (metafield && metafield.key && metafield.value !== null) {
          // Para metaobjeto target-gender, processar valor JSON
          if (metafield.key === 'target-gender' && metafield.namespace === 'shopify') {
            try {
              // O valor vem como string JSON de array de IDs
              const metaobjectIds = JSON.parse(metafield.value);
              if (Array.isArray(metaobjectIds) && metaobjectIds.length > 0) {
                const metaobjectId = metaobjectIds[0];
                
                // Analisar o título e tags do produto para inferir o gênero
                const productTitle = product.title?.toLowerCase() || '';
                const productTags = product.tags || [];
                
                // Indicadores femininos - expandidos
                const femaleIndicators = [
                  'female', 'women', 'girl', 'feminino', 'mulher', 'garota', 
                  'spicy girl', 'y2k', 'lady', 'ladies', 'womens', 'girlfriend',
                  'she', 'her', 'feminine', 'girly', 'princess', 'queen',
                  // Termos de moda feminina
                  'heels', 'stiletto', 'pumps', 'ballet', 'flats',
                  'dress', 'skirt', 'blouse', 'bra', 'panties', 'lingerie',
                  'makeup', 'lipstick', 'nail', 'beauty'
                ];
                
                // Indicadores masculinos - expandidos  
                const maleIndicators = [
                  'male', 'men', 'boy', 'masculino', 'homem', 'garoto',
                  'gentleman', 'guy', 'dude', 'bro', 'mans', 'mens',
                  'he', 'him', 'masculine', 'manly', 'king', 'sir',
                  // Termos de moda masculina
                  'beard', 'mustache', 'tie', 'suit', 'tuxedo', 'blazer',
                  'boxer', 'briefs', 'cologne', 'shaving'
                ];
                
                // Indicadores neutros/unissex
                const unisexIndicators = [
                  'unisex', 'neutral', 'both', 'everyone', 'all', 'universal',
                  'androgynous', 'gender neutral', 'genderless'
                ];
                
                const hasFemaleIndicators = femaleIndicators.some(indicator => 
                  productTitle.includes(indicator) || 
                  productTags.some(tag => tag.toLowerCase().includes(indicator))
                );
                
                const hasMaleIndicators = maleIndicators.some(indicator => 
                  productTitle.includes(indicator) || 
                  productTags.some(tag => tag.toLowerCase().includes(indicator))
                );
                
                const hasUnisexIndicators = unisexIndicators.some(indicator => 
                  productTitle.includes(indicator) || 
                  productTags.some(tag => tag.toLowerCase().includes(indicator))
                );
                
                // Mapeamento baseado no ID conhecido do metaobjeto
                let genderFromId = null;
                
                const genderIdMap = {
                  '157432053980': 'WOMEN',
                };
                
                if (metaobjectId && Object.keys(genderIdMap).some(id => metaobjectId.includes(id))) {
                  const foundId = Object.keys(genderIdMap).find(id => metaobjectId.includes(id));
                  genderFromId = genderIdMap[foundId];
                }
                
                // Decisão final do gênero (prioridade: ID > indicadores textuais)
                let genderValue;
                let inferredFrom;
                
                if (genderFromId) {
                  // Se temos mapeamento por ID, usar com prioridade
                  genderValue = genderFromId;
                  inferredFrom = 'metaobject_id';
                } else if (hasUnisexIndicators) {
                  genderValue = 'UNISEX';
                  inferredFrom = 'unisex_indicators';
                } else if (hasFemaleIndicators && !hasMaleIndicators) {
                  genderValue = 'WOMEN';
                  inferredFrom = 'female_indicators';
                } else if (hasMaleIndicators && !hasFemaleIndicators) {
                  genderValue = 'MEN';
                  inferredFrom = 'male_indicators';
                } else if (hasFemaleIndicators && hasMaleIndicators) {
                  // Só se tiver ambos os indicadores
                  genderValue = 'UNISEX';
                  inferredFrom = 'both_indicators';
                } else {
                  // Se não tiver nenhum indicador e nem ID conhecido, não especificar gênero
                  genderValue = null;
                  inferredFrom = 'no_indicators';
                }
                
                // Só adicionar metafield se houver gênero identificado
                if (genderValue) {
                  metafields['genero_alvo'] = {
                    key: 'genero_alvo',
                    value: genderValue,
                    namespace: 'shopify',
                    source: 'metaobject',
                    originalValue: metafield.value,
                    inferredFrom: inferredFrom
                  };
                  
                } else {

                }
              }
            } catch (error) {
              console.warn('⚠️ Erro ao processar metaobjeto target-gender:', error, 'Valor:', metafield.value);
            }
          } 
          // Fallback: tentar extrair do references se disponível
          else if (metafield.key === 'target-gender' && metafield.references?.edges?.length > 0) {
            const genderLabel = metafield.references.edges[0].node.field?.value;
            if (genderLabel) {
              metafields['genero_alvo'] = {
                key: 'genero_alvo',
                value: genderLabel.toUpperCase(),
                namespace: metafield.namespace || 'shopify',
                source: 'metaobject'
              };
            }
          } else {
            // Outros metafields normais
            metafields[metafield.key] = {
              key: metafield.key,
              value: metafield.value,
              namespace: metafield.namespace || 'shopify'
            };
          }
        }
      });
    }
    
    // Processar metafields customizados como fallback
    if (product.customMetafields && Array.isArray(product.customMetafields)) {
      
      product.customMetafields.forEach(metafield => {
        if (metafield && metafield.key && metafield.value !== null) {
          // Só adicionar se não existir já dos metafields principais
          if (!metafields[metafield.key]) {
            metafields[metafield.key] = {
              key: metafield.key,
              value: metafield.value,
              namespace: metafield.namespace || 'custom',
              source: 'custom'
            };
          }
        }
      });
    }

    // Usar a primeira variante disponível para exibição principal
    const variant = variants[0];
    const currentPrice = parseFloat(variant?.price?.amount || 0);
    const originalPrice = parseFloat(variant?.compareAtPrice?.amount || 0);

    // Calcular desconto apenas se compareAtPrice existir e for maior que o preço atual
    const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
    const hasInvertedValues = originalPrice > 0 && originalPrice < currentPrice;
    const displayPrice = hasInvertedValues ? originalPrice : currentPrice;
    const displayOriginalPrice = hasInvertedValues ? currentPrice : originalPrice;
    const finalHasDiscount = hasDiscount || hasInvertedValues;

    const discountPercentage = finalHasDiscount 
      ? Math.round(((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100)
      : 0;

    const finalProduct = {
      id: product.id,
      name: product.title,
      image: product.images?.edges?.[0]?.node?.url || "https://via.placeholder.com/400x500 ",
      price: displayPrice,
      originalPrice: finalHasDiscount ? displayOriginalPrice : undefined, // Só inclui se há desconto
      discount: discountPercentage > 0 ? discountPercentage : undefined, // Só inclui se há desconto
      tags: product.tags || [],
      metafields: metafields, // Adicionar metacampos processados
      isPromotion: product.tags?.includes("promoção"),
      isLimitedStock: product.tags?.includes("estoque-limitado"),
      isNew: product.tags?.includes("novo"),
      availableForSale: variant?.availableForSale ?? true, // Se não vier, assume disponível
      variants: variants, // Array de variantes preservando todos os campos
      stockCount: variant?.availableForSale ? 3 : 0,
      _debugNote: hasInvertedValues ? 'Valores invertidos temporariamente para demonstração' : 'Valores corretos'
    };

    return finalProduct;
  };

  const transformCollection = (collection) => {
    // Extrair produtos da collection
    const products = collection.products.edges.map(productEdge => {
      const product = productEdge.node;
      // Garante que cada variante preserve todos os campos essenciais
      const variants = product.variants?.edges?.map(edge => {
        const v = edge.node;
        return {
          id: v.id,
          title: v.title,
          availableForSale: typeof v.availableForSale === 'boolean' ? v.availableForSale : true,
          image: v.image ? { ...v.image } : undefined,
          price: v.price ? { ...v.price } : undefined,
          compareAtPrice: v.compareAtPrice ? { ...v.compareAtPrice } : undefined
        };
      }) || [];

      // Usar a primeira variante disponível para exibição principal
      const variant = variants[0];
      const currentPrice = parseFloat(variant?.price?.amount || 0);
      const originalPrice = parseFloat(variant?.compareAtPrice?.amount || 0);

      // Calcular desconto apenas se compareAtPrice existir e for maior que o preço atual
      const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
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
        image: product.images?.edges?.[0]?.node?.url || "https://via.placeholder.com/400x500 ",
        price: displayPrice,
        originalPrice: finalHasDiscount ? displayOriginalPrice : undefined, // Só inclui se há desconto
        discount: discountPercentage > 0 ? discountPercentage : undefined, // Só inclui se há desconto
        tags: product.tags || [],
        availableForSale: variant?.availableForSale ?? true, // Se não vier, assume disponível
        variants: variants, // Array de variantes preservando todos os campos
        rating,
        // Para compatibilidade com o modal
        variantId: variant?.id,
        title: product.title // Alias para name
      };
    });

    // Calcular faixa de preço
    const prices = products.map(p => p.price).filter(p => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    // Obter valores de desconto dos metafields (se disponíveis) ou usar valores padrão
    const discountPercentage = collection.discountPercentage?.value 
      ? parseInt(collection.discountPercentage.value) 
      : 20; // Valor padrão

    const minItemsForDiscount = collection.minItemsForDiscount?.value 
      ? parseInt(collection.minItemsForDiscount.value)
      : Math.max(1, products.length - 1); // Permitir remover apenas 1 item

    return {
      id: collection.id,
      name: collection.title,
      description: collection.description || "Coleção sem descrição",
      image: collection.image?.url || "https://via.placeholder.com/800x400 ",
      priceRange: prices.length ? `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}` : "N/A",
      products, // <-- importante para ProductSection
      // Metadados de desconto
      discountPercentage,
      minItemsForDiscount,
      hasCollectionDiscount: true // Flag para identificar coleções com desconto
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

  // Função para obter ou criar um carrinho no Shopify
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
          <div className="container mx-auto px-4 md:px-6 xl:px-8 3xl:px-10 4xl:px-12 5xl:px-16 max-w-screen-xl 3xl:max-w-screen-2xl 4xl:max-w-2k 5xl:max-w-4k text-center relative z-10">
            <p className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-semibold animate-pulse tracking-wider uppercase">
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
          sectionType="collections"
          heroImage="/Collections-1.jpg"
      />

      {/* Carrosseis de Destaques */}
      <CarousselSection 
        title="TOP" 
        products={topProducts} 
        id="parte-cima"
        heroImage=''
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
        heroImage="Acessories-1.jpg"
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