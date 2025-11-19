import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import { Heart, ShoppingCart, Filter, X, ChevronDown, ChevronUp, Eye, ArrowRight, Grid, List, ArrowUpDown, Search, Loader2, Check, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { addToCart } from '../hooks/addToCart';
import wishlistHooks from '../hooks/addWishlist';
import { auth, db, doc, getDoc, setDoc } from '../client/firebaseConfig';
import '../styles/ProductsPage.css';

const { addToWishlist } = wishlistHooks;

// Query GraphQL otimizada para buscar produtos por tag
// Melhorias: Campos específicos, paginação eficiente, metafields otimizados
const GET_PRODUCTS_BY_TAG = gql`
  query GetProductsByTag($tag: String!, $first: Int = 50, $after: String) {
    products(first: $first, query: $tag, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          title
          handle
          tags
          # Metafields otimizados - apenas os necessários
          metafields(identifiers: [
            {namespace: "shopify", key: "target-gender"}
          ]) {
            key
            value
            namespace
            reference {
              ... on Metaobject {
                id
                field(key: "label") {
                  value
                }
              }
            }
          }
          customMetafields: metafields(identifiers: [
            {namespace: "custom", key: "genero_alvo"},
            {namespace: "custom", key: "target_gender"}
          ]) {
            key
            value
            namespace
          }
          # Imagens otimizadas - apenas as 3 primeiras
          images(first: 3) {
            edges {
              node {
                url(transform: {maxWidth: 800, maxHeight: 1000})
                altText
              }
            }
          }
          # Variantes otimizadas - apenas campos essenciais
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                image {
                  url(transform: {maxWidth: 400, maxHeight: 500})
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const ProductsPage = () => {
  const { gender, category, subcategory, tag } = useParams();
  const navigate = useNavigate();
  const { openCart } = useCart();
  
  // Determinar tag e subcategory baseado na estrutura da URL
  // Nova estrutura: /tag/gender/category/subcategory
  // Estrutura antiga: /tag/tag/subcategory (compatibilidade)
  // URLs de gênero: /tag/men ou /tag/women (sem categoria)
  
  // Se tiver gender definido, usar gender
  // Se não tiver gender mas tiver tag e for men/women, tratar como gender
  const isGenderOnly = !gender && !category && tag && ['men', 'women'].includes(tag.toLowerCase());
  const finalGender = gender || (isGenderOnly ? tag : null);
  const finalTag = finalGender; // Para filtro de gênero
  const finalCategory = category; // Pode ser null se for apenas gênero
  const finalSubcategory = subcategory;
  
  // Função para normalizar tags (capitalizar primeira letra para corresponder ao Shopify)
  const normalizeTag = (tagStr) => {
    if (!tagStr) return null;
    // Converter para formato Title Case (primeira letra maiúscula, resto minúscula)
    return tagStr.charAt(0).toUpperCase() + tagStr.slice(1).toLowerCase();
  };
  
  // Estados principais
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const [viewMode, setViewMode] = useState('grid'); // grid ou list
  const [sortBy, setSortBy] = useState('default'); // default, price-low, price-high, name
  const [searchQuery, setSearchQuery] = useState('');
  const [addingToCart, setAddingToCart] = useState(null);
  const [addingToWishlist, setAddingToWishlist] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Estados para modal de seleção de variantes
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Estados para lightbox de imagens
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0);
  
  // Estados para filtros colapsáveis
  const [expandedFilters, setExpandedFilters] = useState({
    price: true,
    size: true,
    color: true,
    style: true
  });
  
  // Auto-remove notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Construir query GraphQL baseada nos parâmetros
  // IMPORTANTE: Não incluímos gênero na query porque o Shopify não suporta filtrar por metafields na query string
  // Filtraremos por gênero no lado do cliente usando os metafields retornados
  const buildQueryTag = useMemo(() => {
    let queryParts = [];
    
    // Se for apenas gênero (sem categoria), buscar todos os produtos
    if (isGenderOnly) {
      // Buscar todos os produtos - o filtro por gênero será feito no cliente
      return 'tag:*';
    }
    
    // Se tiver categoria (nova estrutura), incluir (normalizado)
    if (finalCategory) {
      const normalizedCategory = normalizeTag(finalCategory);
      queryParts.push(`tag:${normalizedCategory}`);
    } else if (finalTag && !finalGender && !isGenderOnly) {
      // Se não tiver gender mas tiver tag (estrutura antiga que não é gênero), usar tag
      // Verificar se não é um gênero conhecido
      const tagLower = finalTag.toLowerCase();
      if (!['men', 'women', 'male', 'female'].includes(tagLower)) {
        const normalizedTag = normalizeTag(finalTag);
        queryParts.push(`tag:${normalizedTag}`);
      }
    }
    
    // Se tiver subcategoria, incluir (normalizado)
    if (finalSubcategory) {
      // Subcategorias podem ter múltiplas palavras, então precisamos tratar hífens
      const normalizedSubcategory = finalSubcategory
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      queryParts.push(`tag:"${normalizedSubcategory}"`);
    }
    
    const query = queryParts.length > 0 ? queryParts.join(' AND ') : 'tag:*';
    
    // Debug: log da query construída
    console.log('🔍 ProductsPage Query Debug:', {
      gender,
      category,
      subcategory,
      tag,
      finalGender,
      finalTag,
      finalCategory,
      finalSubcategory,
      isGenderOnly,
      buildQueryTag: query,
      note: isGenderOnly ? 'Gender-only filter - will filter client-side' : 'Gender filtering will be done client-side using metafields'
    });
    
    return query;
  }, [finalTag, finalCategory, finalSubcategory, gender, category, subcategory, tag, finalGender, isGenderOnly]);

  // Query
  const { loading, error, data } = useQuery(GET_PRODUCTS_BY_TAG, {
    variables: {
      tag: buildQueryTag || 'tag:*',
      first: 50
    },
    skip: !buildQueryTag, // Skip se não houver query válida
    onError: (err) => {
      console.error('❌ GraphQL Query Error:', err);
      console.error('Query used:', buildQueryTag);
    },
    onCompleted: (data) => {
      console.log('✅ GraphQL Query Success:', {
        productsCount: data?.products?.edges?.length || 0,
        query: buildQueryTag
      });
    }
  });

  // Função para transformar dados do produto
  const transformProduct = (product) => {
    const variants = product.variants?.edges?.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      price: parseFloat(edge.node.price?.amount || 0),
      compareAtPrice: parseFloat(edge.node.compareAtPrice?.amount || 0),
      availableForSale: edge.node.availableForSale,
      quantityAvailable: edge.node.quantityAvailable || 0,
      image: edge.node.image?.url,
      selectedOptions: edge.node.selectedOptions || []
    })) || [];

    // Processar metacampos
    const metafields = {};
    
    // Processar metafields principais (com referências a metaobjetos)
    if (product.metafields && Array.isArray(product.metafields)) {
      product.metafields.forEach(field => {
        if (field && field.key) {
          // Prioridade 1: Se tiver reference (metaobjeto), usar o label
          if (field.reference && field.reference.field && field.reference.field.value) {
            metafields[field.key] = field.reference.field.value;
          } 
          // Prioridade 2: Se tiver value
          else if (field.value) {
            // Verificar se é uma string JSON com IDs de metaobjetos
            try {
              const parsed = JSON.parse(field.value);
              if (Array.isArray(parsed) && parsed.length > 0 && 
                  parsed.every(id => typeof id === 'string' && (id.includes('METAOBJECT') || id.includes('Metaobject')))) {
                // É um array de IDs de metaobjetos - precisamos usar o reference se disponível
                // Se não temos reference, vamos tentar inferir do ID ou usar fallback
                if (field.key === 'target-gender') {
                  // Mapeamento de IDs conhecidos de metaobjetos de gênero
                  const genderIdMap = {
                    '157432053980': 'WOMEN',
                    '157433233628': 'MEN',
                    '155234664668': 'UNISEX'
                  };
                  
                  // Tentar encontrar o ID no mapeamento
                  let foundGender = null;
                  for (const idStr of parsed) {
                    const idMatch = Object.keys(genderIdMap).find(key => idStr.includes(key));
                    if (idMatch) {
                      foundGender = genderIdMap[idMatch];
                      break;
                    }
                  }
                  
                  if (foundGender) {
                    metafields[field.key] = foundGender;
                  } else {
                    // Se não encontrou no mapeamento, deixar null para não filtrar incorretamente
                    console.warn('⚠️ Unknown gender metaobject ID:', parsed, product.title);
                  }
                } else {
                  // Para outros metafields, ignorar se for array de IDs
                }
              } else {
                metafields[field.key] = field.value;
              }
            } catch (e) {
              // Não é JSON, usar o value direto
              metafields[field.key] = field.value;
            }
          }
        }
      });
    }
    
    // Processar customMetafields
    if (product.customMetafields && Array.isArray(product.customMetafields)) {
      product.customMetafields.forEach(field => {
        if (field && field.key && field.value) {
          metafields[field.key] = field.value;
        }
      });
    }

    const variant = variants[0];
    const currentPrice = variant?.price || 0;
    const originalPrice = variant?.compareAtPrice || 0;

    // Usar apenas dados reais do Shopify para promoções
    const hasDiscount = originalPrice > 0 && originalPrice > currentPrice;
    const discountPercentage = hasDiscount 
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

    // Gerar badges automáticos baseados no estoque
    const stockLevel = variant?.quantityAvailable || 0;
    let stockBadge = null;
    
    if (stockLevel > 0 && stockLevel <= 3) {
      stockBadge = 'Last few units!';
    } else if (stockLevel > 3 && stockLevel <= 10) {
      stockBadge = 'Limited stock!';
    } else if (stockLevel > 10 && stockLevel <= 20) {
      stockBadge = 'Almost sold out!';
    }

    return {
      id: product.id,
      handle: product.handle,
      name: product.title,
      images: product.images?.edges?.map(edge => edge.node.url) || [],
      price: currentPrice,
      originalPrice: hasDiscount ? originalPrice : undefined,
      discount: discountPercentage > 0 ? discountPercentage : undefined,
      tags: product.tags || [],
      metafields: metafields,
      variants: variants,
      availableForSale: variant?.availableForSale ?? true,
      stockLevel: stockLevel,
      stockBadge: stockBadge
    };
  };

  const products = useMemo(() => 
    data?.products?.edges?.map(edge => transformProduct(edge.node)) || []
  , [data]);

  // Extrair filtros reais dos produtos (cores e tamanhos das variantes)
  const availableFilters = useMemo(() => {
    const colors = new Set();
    const sizes = new Set();
    const styles = new Set();

    products.forEach(product => {
      // Extrair cores e tamanhos das variantes
      if (product.variants) {
        product.variants.forEach(variant => {
          variant.selectedOptions?.forEach(option => {
            if (option.name && option.value) {
              const nameLower = option.name.toLowerCase();
              if (nameLower.includes('color') || nameLower.includes('colour')) {
                colors.add(option.value);
              } else if (nameLower.includes('size')) {
                sizes.add(option.value);
              }
            }
          });
        });
      }

      // Extrair estilos das tags
      product.tags?.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (['goth', 'streetwear', 'y2k', 'grunge', 'emo', 'punk', 'alternative', 'dark', 'vintage'].includes(tagLower)) {
          styles.add(tag);
        }
      });
    });

    return {
      size: Array.from(sizes).sort(),
      color: Array.from(colors).sort(),
      style: Array.from(styles).sort(),
      price: ['Under $50', '$50-$100', '$100-$200', '$200+'] // Mantém mockado por enquanto
    };
  }, [products]);

  // Função helper para verificar se produto corresponde ao gênero desejado
  const matchesGender = (product, targetGender) => {
    if (!targetGender) return true; // Se não especificar gênero, retorna todos
    
    const targetGenderUpper = targetGender.toUpperCase();
    
    // Verificar metafields do Shopify (metaobjeto)
    if (product.metafields && typeof product.metafields === 'object') {
      let genderValue = null;
      
      // Tentar diferentes chaves de metafield
      const genderMetafield = product.metafields['target-gender'] || 
                              product.metafields['target_gender'] ||
                              product.metafields['genero_alvo'] ||
                              product.metafields['gender'];
      
      if (genderMetafield) {
        // O metafield já deve estar processado pelo transformProduct
        // Se for string direta, usar
        if (typeof genderMetafield === 'string') {
          genderValue = genderMetafield;
          
          // Verificar se é uma string JSON com IDs (que não deveria passar, mas por segurança)
          try {
            const parsed = JSON.parse(genderMetafield);
            if (Array.isArray(parsed) && parsed.length > 0) {
              // Se for array de IDs, não podemos determinar o gênero diretamente
              // Isso significa que o reference não foi processado corretamente
              console.warn('⚠️ Gender metafield contains ID array instead of label:', genderMetafield, product.name);
              return false; // Não podemos determinar, então não incluir
            }
          } catch (e) {
            // Não é JSON, usar o valor direto
            genderValue = genderMetafield;
          }
        } else if (typeof genderMetafield === 'object') {
          // Se for objeto, tentar value ou label
          genderValue = genderMetafield.value || genderMetafield.label;
          if (genderValue && typeof genderValue !== 'string') {
            genderValue = String(genderValue);
          }
        }
      }
      
      if (genderValue) {
        const genderValueUpper = genderValue.toUpperCase().trim();
        
        // Mapear valores comuns para MEN
        if (targetGenderUpper === 'MEN' || targetGenderUpper === 'MALE') {
          const isMatch = genderValueUpper === 'MEN' || 
                         genderValueUpper === 'MALE' || 
                         genderValueUpper === 'HOMEM' || 
                         genderValueUpper === 'MASCULINO' ||
                         genderValueUpper === 'UNISEX';
          
          if (!isMatch) {
            console.log('❌ Gender mismatch (MEN):', {
              product: product.name,
              target: targetGenderUpper,
              productGender: genderValueUpper
            });
          }
          
          return isMatch;
        }
        
        // Mapear valores comuns para WOMEN
        if (targetGenderUpper === 'WOMEN' || targetGenderUpper === 'FEMALE') {
          const isMatch = genderValueUpper === 'WOMEN' || 
                         genderValueUpper === 'FEMALE' || 
                         genderValueUpper === 'MULHER' || 
                         genderValueUpper === 'FEMININO' ||
                         genderValueUpper === 'UNISEX';
          
          if (!isMatch) {
            console.log('❌ Gender mismatch (WOMEN):', {
              product: product.name,
              target: targetGenderUpper,
              productGender: genderValueUpper
            });
          }
          
          return isMatch;
        }
      } else {
        // Metafield existe mas não conseguimos extrair valor
        console.warn('⚠️ Could not extract gender value:', {
          product: product.name,
          metafield: genderMetafield,
          metafields: product.metafields
        });
      }
    }
    
    // Se não encontrou metafield, retornar false (produto sem gênero não deve aparecer)
    return false;
  };

  // Filtrar e ordenar produtos
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Filtro por gênero usando metafields (cliente-side)
      // Usar finalGender (que pode ser gender ou tag se for gênero apenas)
      if (finalGender && !matchesGender(product, finalGender)) {
        return false;
      }
      
      // Filtro por preço
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }
      
      // Filtro por busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesTags = product.tags.some(tag => 
          tag.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesTags) return false;
      }
      
      // Filtros por cor, tamanho e estilo
      if (selectedFilters.length > 0) {
        let matchesFilter = false;

        selectedFilters.forEach(filter => {
          // Verificar se é cor - buscar nas variantes
          const isColor = product.variants?.some(variant => 
            variant.selectedOptions?.some(opt => 
              (opt.name?.toLowerCase().includes('color') || opt.name?.toLowerCase().includes('colour')) &&
              opt.value === filter
            )
          );

          // Verificar se é tamanho - buscar nas variantes
          const isSize = product.variants?.some(variant => 
            variant.selectedOptions?.some(opt => 
              opt.name?.toLowerCase().includes('size') &&
              opt.value === filter
            )
          );

          // Verificar se é estilo ou tag
          const isStyle = product.tags?.some(tag => 
            tag.toLowerCase() === filter.toLowerCase() ||
            tag.toLowerCase().includes(filter.toLowerCase())
          );

          if (isColor || isSize || isStyle) {
            matchesFilter = true;
          }
        });

        if (!matchesFilter) return false;
      }
      
      return true;
    });

    // Ordenação
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

        return sorted;
      }, [products, priceRange, searchQuery, selectedFilters, sortBy, finalGender]);

  // Funções auxiliares para extrair opções das variantes
  const getProductOptions = (product) => {
    if (!product || !product.variants || product.variants.length === 0) {
      return { colors: [], sizes: [] };
    }

    const colors = new Set();
    const sizes = new Set();

    product.variants.forEach(variant => {
      variant.selectedOptions?.forEach(option => {
        if (option.name && option.value) {
          const nameLower = option.name.toLowerCase();
          if (nameLower.includes('color') || nameLower.includes('colour')) {
            colors.add(option.value);
          } else if (nameLower.includes('size')) {
            sizes.add(option.value);
          }
        }
      });

      // Fallback: tentar extrair do título da variante (ex: "Black / S")
      if (!colors.size && !sizes.size && variant.title) {
        const parts = variant.title.split(' / ').map(p => p.trim());
        if (parts.length > 0) colors.add(parts[0]);
        if (parts.length > 1) sizes.add(parts[1]);
      }
    });

    return {
      colors: Array.from(colors),
      sizes: Array.from(sizes)
    };
  };

  // Função para encontrar variante baseada nas opções selecionadas
  const findVariantByOptions = (product, color, size) => {
    if (!product || !product.variants) return null;

    return product.variants.find(variant => {
      const variantOptions = variant.selectedOptions || [];
      const hasColor = !color || variantOptions.some(opt => 
        opt.name?.toLowerCase().includes('color') && opt.value === color
      ) || variant.title?.includes(color);
      const hasSize = !size || variantOptions.some(opt => 
        opt.name?.toLowerCase().includes('size') && opt.value === size
      ) || variant.title?.includes(size);

      return hasColor && hasSize && variant.availableForSale;
    }) || product.variants.find(v => v.availableForSale) || product.variants[0];
  };

  // Função para obter código de cor (helper para UI)
  const getColorCode = (colorName) => {
    const colorMap = {
      'Black': '#000000',
      'White': '#FFFFFF',
      'Red': '#FF0000',
      'Blue': '#0000FF',
      'Green': '#008000',
      'Yellow': '#FFFF00',
      'Pink': '#FFC0CB',
      'Purple': '#800080',
      'Orange': '#FFA500',
      'Brown': '#A52A2A',
      'Gray': '#808080',
      'Grey': '#808080',
      'Navy': '#000080',
      'Beige': '#F5F5DC',
      'Cream': '#FFFDD0'
    };
    return colorMap[colorName] || '#CCCCCC';
  };

  // Função para adicionar ao carrinho diretamente (usada quando há apenas uma variante)
  const handleAddToCartDirectly = async (product, variant) => {
    if (addingToCart) return;
    
    try {
      setAddingToCart(product.id);
      
      const productToAdd = {
        id: product.id,
        name: product.name,
        price: variant?.price || product.price,
        image: variant?.image || product.images[0],
        variantId: variant?.id || product.variants[0]?.id,
        quantity: 1
      };
      
      await addToCart(productToAdd);
      
      setNotification({
        type: 'success',
        message: `${product.name} added to cart!`
      });
      
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [] } }));
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { items: [] } }));
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add to cart. Please try again.'
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // Função para abrir modal de seleção de variantes
  const openVariantModal = (product) => {
    setSelectedProduct(product);
    
    // Se não houver variantes ou apenas uma variante disponível, adicionar diretamente
    const availableVariants = product.variants?.filter(v => v.availableForSale) || [];
    if (availableVariants.length <= 1) {
      if (availableVariants.length === 1) {
        handleAddToCartDirectly(product, availableVariants[0]);
      } else if (product.variants?.length > 0) {
        // Se não há variantes disponíveis, usar a primeira variante mesmo assim
        handleAddToCartDirectly(product, product.variants[0]);
      } else {
        // Se não há variantes, adicionar produto diretamente
        handleAddToCartDirectly(product, null);
      }
      return;
    }

    const { colors, sizes } = getProductOptions(product);
    
    // Se não há opções de cor e tamanho, adicionar diretamente
    if (colors.length === 0 && sizes.length === 0) {
      handleAddToCartDirectly(product, availableVariants[0]);
      return;
    }
    
    // Inicializar seleções com primeiras opções disponíveis
    const initialColor = colors.length > 0 ? colors[0] : null;
    const initialSize = sizes.length > 0 ? sizes[0] : null;
    
    setSelectedColor(initialColor);
    setSelectedSize(initialSize);
    
    // Encontrar variante inicial
    const initialVariant = findVariantByOptions(product, initialColor, initialSize);
    setSelectedVariant(initialVariant);
    
    setShowVariantModal(true);
  };

  // Atualizar variante quando cor/tamanho mudarem
  useEffect(() => {
    if (showVariantModal && selectedProduct) {
      const variant = findVariantByOptions(selectedProduct, selectedColor, selectedSize);
      setSelectedVariant(variant || null);
    }
  }, [selectedColor, selectedSize, showVariantModal, selectedProduct]);

  // Função para adicionar ao carrinho após seleção no modal
  const handleAddToCart = async () => {
    if (!selectedProduct || !selectedVariant || addingToCart) return;
    
    try {
      setAddingToCart(selectedProduct.id);
      
      const productToAdd = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedVariant.price || selectedProduct.price,
        image: selectedVariant.image || selectedProduct.images[0],
        variantId: selectedVariant.id,
        quantity: 1
      };
      
      await addToCart(productToAdd);
      
      setNotification({
        type: 'success',
        message: `${selectedProduct.name} added to cart!`
      });
      
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { items: [] } }));
      window.dispatchEvent(new CustomEvent('guestCartUpdated', { detail: { items: [] } }));
      
      // Fechar modal
      setShowVariantModal(false);
      setSelectedProduct(null);
      setSelectedColor(null);
      setSelectedSize(null);
      setSelectedVariant(null);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setNotification({
        type: 'error',
        message: 'Failed to add to cart. Please try again.'
      });
    } finally {
      setAddingToCart(null);
    }
  };

  // Função para adicionar à wishlist - Melhorada
  const handleAddToWishlist = async (product) => {
    if (addingToWishlist) return;
    
    try {
      setAddingToWishlist(product.id);
      
      // Encontrar primeira variante disponível ou primeira variante
      const firstVariant = product.variants?.find(v => v.availableForSale) || product.variants?.[0];
      
      if (!firstVariant?.id) {
        throw new Error('No available variants for this product.');
      }
      
      const user = auth.currentUser;
      const wishlistItem = {
        id: `wishlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        variantId: firstVariant.id,
        name: product.name,
        variantTitle: firstVariant.title || 'Default',
        price: parseFloat(firstVariant.price?.amount || product.price),
        image: firstVariant.image?.url || product.images[0] || 'https://via.placeholder.com/400x400',
        quantity: 1,
        addedAt: new Date().toISOString(),
      };

      if (user) {
        const wishlistRef = doc(db, 'wishlists', user.uid);
        const wishlistSnap = await getDoc(wishlistRef);
        const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];
        
        // Verificar se já existe (baseado no variantId ou productId)
        const isAlreadyInWishlist = existingItems.some(
          item => item.variantId === wishlistItem.variantId || item.productId === wishlistItem.productId
        );
        
        if (!isAlreadyInWishlist) {
          await setDoc(wishlistRef, { items: [...existingItems, wishlistItem] }, { merge: true });
          setNotification({
            type: 'success',
            message: `${product.name} added to wishlist!`
          });
        } else {
          setNotification({
            type: 'error',
            message: 'This product is already in your wishlist.'
          });
        }
      } else {
        // Para visitantes, usar localStorage
        const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
        const isAlreadyInWishlist = guestWishlist.some(
          item => item.variantId === wishlistItem.variantId || item.productId === wishlistItem.productId
        );
        
        if (!isAlreadyInWishlist) {
          guestWishlist.push(wishlistItem);
          localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
          // Disparar evento customizado
          window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: { items: guestWishlist } }));
          setNotification({
            type: 'success',
            message: `${product.name} added to wishlist!`
          });
        } else {
          setNotification({
            type: 'error',
            message: 'This product is already in your wishlist.'
          });
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add to wishlist. Please try again.'
      });
    } finally {
      setAddingToWishlist(null);
    }
  };

  // Função para trocar imagem no hover/mobile
  const handleImageChange = (productId, direction) => {
    const product = filteredAndSortedProducts.find(p => p.id === productId);
    if (!product || product.images.length <= 1) return;

    const currentIndex = currentImageIndex[productId] || 0;
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % product.images.length;
    } else {
      newIndex = currentIndex === 0 ? product.images.length - 1 : currentIndex - 1;
    }
    
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: newIndex
    }));
  };

  // Função para navegar para produto
  const navigateToProduct = (handle) => {
    navigate(`/product/${handle}`);
  };

  // Função para abrir lightbox de imagens
  const openImageLightbox = (images, startIndex = 0) => {
    setLightboxImages(images);
    setLightboxCurrentIndex(startIndex);
    setShowImageLightbox(true);
    document.body.style.overflow = 'hidden'; // Prevenir scroll do body
  };

  // Função para fechar lightbox
  const closeImageLightbox = () => {
    setShowImageLightbox(false);
    document.body.style.overflow = 'unset'; // Restaurar scroll
  };

  // Função para navegar entre imagens no lightbox
  const navigateLightbox = (direction) => {
    if (direction === 'next') {
      setLightboxCurrentIndex((prev) => (prev + 1) % lightboxImages.length);
    } else {
      setLightboxCurrentIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    }
  };

  // Navegação por teclado no lightbox
  useEffect(() => {
    if (!showImageLightbox) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') navigateLightbox('prev');
      if (e.key === 'ArrowRight') navigateLightbox('next');
      if (e.key === 'Escape') closeImageLightbox();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageLightbox, lightboxImages.length]);

  // Função para toggle de filtros colapsáveis
  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Estado de loading melhorado
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#8A0101] border-t-transparent mx-auto mb-4"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-r-[#4B014E] mx-auto mb-4" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-[#F3ECE7] text-lg font-semibold tracking-wider">LOADING PRODUCTS...</p>
          <p className="text-gray-400 text-sm mt-2">Silence is just the prelude to chaos</p>
        </div>
      </div>
    );
  }

  // Estado de erro melhorado
  if (error) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-[#8A0101]/20 border border-[#8A0101]/50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-[#F3ECE7] tracking-wider">ERROR LOADING</h2>
            <p className="text-gray-400 mb-6">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#8A0101] hover:bg-[#8A0101]/80 text-[#F3ECE7] px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-[#F3ECE7]">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-2xl transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-600 text-white' 
            : 'bg-[#8A0101] text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' ? (
              <Check size={20} className="flex-shrink-0" />
            ) : (
              <X size={20} className="flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header da página - Estilo alinhado */}
      <div className="bg-gradient-to-b from-black to-[#1C1C1C] border-b border-[#8A0101]/20">
        <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-wider uppercase text-[#F3ECE7]">
                {isGenderOnly 
                  ? finalGender?.replace(/-/g, ' ').toUpperCase() || tag?.replace(/-/g, ' ').toUpperCase()
                  : finalCategory 
                    ? finalCategory.replace(/-/g, ' ').toUpperCase() 
                    : finalTag?.replace(/-/g, ' ').toUpperCase()
                }
                {finalSubcategory && ` - ${finalSubcategory.replace(/-/g, ' ').toUpperCase()}`}
              </h1>
              <p className="text-gray-400 mt-2 text-sm lg:text-base">
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'product found' : 'products found'}
              </p>
            </div>
            
            {/* Controles de visualização */}
            <div className="flex items-center gap-3">
              {/* Botão de busca mobile */}
              <button
                className="lg:hidden bg-[#4B014E]/50 hover:bg-[#4B014E] p-2 rounded-lg transition-colors border border-[#4B014E]"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Search size={20} />
              </button>
              
              {/* Botão de filtros (mobile) */}
              <button
                className="lg:hidden bg-[#8A0101] hover:bg-[#8A0101]/80 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors font-semibold"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={20} />
                <span>FILTERS</span>
              </button>

              {/* View mode toggle (desktop) */}
              <div className="hidden lg:flex items-center gap-2 bg-black/50 rounded-lg p-1 border border-[#4B014E]/30">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-[#8A0101] text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-[#8A0101] text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Barra de busca e ordenação (desktop) */}
          <div className="hidden lg:flex items-center gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-[#4B014E]/30 rounded-lg pl-10 pr-4 py-2 text-[#F3ECE7] placeholder-gray-500 focus:outline-none focus:border-[#8A0101] transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black/50 border border-[#4B014E]/30 rounded-lg px-4 py-2 pr-10 text-[#F3ECE7] focus:outline-none focus:border-[#8A0101] transition-colors appearance-none cursor-pointer"
              >
                <option value="default">Sort by</option>
                <option value="price-low">Lowest Price</option>
                <option value="price-high">Highest Price</option>
                <option value="name">Name A-Z</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 xl:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de filtros - Estilo melhorado */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Overlay para mobile */}
            {showFilters && (
              <div 
                className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
                onClick={() => setShowFilters(false)}
              />
            )}
            
            <div className={`bg-black/50 backdrop-blur-sm border border-[#4B014E]/30 rounded-lg ${showFilters ? 'lg:static fixed top-0 right-0 h-full w-80 z-50 overflow-y-auto custom-scrollbar' : 'sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar'}`}>
              <div className="p-4 lg:p-6 space-y-4">
                {/* Header dos filtros */}
                <div className="flex items-center justify-between border-b border-[#4B014E]/30 pb-3">
                  <h3 className="text-lg font-bold text-[#F3ECE7] tracking-wider">FILTERS</h3>
                  <button
                    className="lg:hidden text-gray-400 hover:text-[#F3ECE7] transition-colors"
                    onClick={() => setShowFilters(false)}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Busca mobile dentro dos filtros */}
                <div className="lg:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-black/50 border border-[#4B014E]/30 rounded-lg pl-10 pr-4 py-2 text-[#F3ECE7] placeholder-gray-500 focus:outline-none focus:border-[#8A0101] transition-colors text-sm"
                    />
                  </div>
                </div>

                {/* Ordenação mobile */}
                <div className="lg:hidden">
                  <label className="block text-sm font-semibold mb-2 text-red-400">SORT</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-black/50 border border-[#4B014E]/30 rounded-lg px-4 py-2 text-[#F3ECE7] focus:outline-none focus:border-[#8A0101] transition-colors text-sm"
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Lowest Price</option>
                    <option value="price-high">Highest Price</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>

                {/* Selected Filters - Mover para o topo */}
                {selectedFilters.length > 0 && (
                  <div className="border-b border-[#4B014E]/30 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-[#8A0101] tracking-wider uppercase">Active ({selectedFilters.length})</h4>
                      <button
                        onClick={() => setSelectedFilters([])}
                        className="text-xs text-gray-400 hover:text-[#F3ECE7] transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFilters.map(filter => (
                        <span
                          key={filter}
                          className="bg-[#8A0101] text-white text-xs px-2 py-1 rounded-full flex items-center space-x-1 font-medium"
                        >
                          <span>{filter}</span>
                          <button
                            onClick={() => setSelectedFilters(selectedFilters.filter(f => f !== filter))}
                            className="hover:bg-[#8A0101]/80 rounded-full p-0.5 transition-colors"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range - Colapsável */}
                <div className="border-b border-[#4B014E]/30 pb-3">
                  <button
                    onClick={() => toggleFilter('price')}
                    className="w-full flex items-center justify-between mb-2 group"
                  >
                    <h4 className="text-sm font-semibold text-[#8A0101] tracking-wider uppercase">PRICE</h4>
                    {expandedFilters.price ? (
                      <ChevronUp size={16} className="text-gray-400 group-hover:text-[#F3ECE7] transition-colors" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400 group-hover:text-[#F3ECE7] transition-colors" />
                    )}
                  </button>
                  {expandedFilters.price && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>$0</span>
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="flex-1 accent-[#8A0101] h-1.5 bg-[#4B014E]/20 rounded-lg appearance-none cursor-pointer"
                        />
                        <span>$1000+</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-[#F3ECE7]">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categories - Colapsáveis e compactas */}
                {Object.entries(availableFilters)
                  .filter(([category]) => category !== 'price')
                  .filter(([, options]) => options.length > 0)
                  .map(([category, options]) => (
                    <div key={category} className="border-b border-[#4B014E]/30 pb-3 last:border-b-0">
                      <button
                        onClick={() => toggleFilter(category)}
                        className="w-full flex items-center justify-between mb-2 group"
                      >
                        <h4 className="text-sm font-semibold text-[#8A0101] tracking-wider uppercase">
                          {category === 'size' ? 'SIZE' : 
                           category === 'color' ? 'COLOR' : 
                           category === 'style' ? 'STYLE' : category.toUpperCase()}
                        </h4>
                        {expandedFilters[category] ? (
                          <ChevronUp size={16} className="text-gray-400 group-hover:text-[#F3ECE7] transition-colors" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400 group-hover:text-[#F3ECE7] transition-colors" />
                        )}
                      </button>
                      {expandedFilters[category] && (
                        <div className="space-y-1.5 pt-2 max-h-48 overflow-y-auto custom-scrollbar">
                          {options.map(option => (
                            <label key={option} className="flex items-center space-x-2 cursor-pointer group/label py-1">
                              <input
                                type="checkbox"
                                checked={selectedFilters.includes(option)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFilters([...selectedFilters, option]);
                                  } else {
                                    setSelectedFilters(selectedFilters.filter(f => f !== option));
                                  }
                                }}
                                className="rounded border-[#4B014E] text-[#8A0101] focus:ring-[#8A0101] focus:ring-1 bg-black/50 w-4 h-4"
                              />
                              <span className="text-xs text-gray-300 group-hover/label:text-[#F3ECE7] transition-colors">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Clear Filters - Compacto */}
                {(selectedFilters.length > 0 || searchQuery || sortBy !== 'default' || priceRange[1] < 1000) && (
                  <button
                    onClick={() => {
                      setSelectedFilters([]);
                      setSearchQuery('');
                      setSortBy('default');
                      setPriceRange([0, 1000]);
                    }}
                    className="w-full bg-[#4B014E]/50 hover:bg-[#4B014E] border border-[#4B014E] px-3 py-2 rounded-lg transition-colors text-xs font-semibold text-[#F3ECE7] mt-2"
                  >
                    CLEAR ALL FILTERS
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid de produtos - Melhorado */}
          <div className="flex-1">
            {viewMode === 'grid' ? (
              <div className="products-grid">
                {filteredAndSortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="product-card group relative bg-black/50 backdrop-blur-sm border border-[#4B014E]/20 rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-[#8A0101]/20 transition-all duration-300"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                  >
                    {/* Badges container - Responsive positioning with proper spacing */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3 right-2 sm:right-3 z-40 flex justify-between items-start gap-1 sm:gap-2 pointer-events-none">
                      {/* Left side - Stock badge */}
                      {product.stockBadge && (
                        <div className="bg-[#8A0101] text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wider whitespace-nowrap flex-shrink-0 pointer-events-auto">
                          {product.stockBadge}
                        </div>
                      )}
                      
                      {/* Right side - Discount and Wishlist with proper spacing */}
                      <div className="flex items-center gap-1 sm:gap-2 ml-auto pointer-events-auto">
                        {/* Badge de desconto */}
                        {product.discount && (
                          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full tracking-wider shadow-lg whitespace-nowrap flex-shrink-0">
                            -{product.discount}%
                          </div>
                        )}
                        
                        {/* Botão de wishlist - Always visible, never overlaps with discount */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleAddToWishlist(product);
                          }}
                          disabled={addingToWishlist === product.id}
                          className={`p-1.5 sm:p-2 rounded-full bg-black/80 backdrop-blur-sm border border-[#4B014E]/50 hover:bg-[#8A0101] transition-all duration-300 flex-shrink-0 ${
                            addingToWishlist === product.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          aria-label="Add to wishlist"
                          title="Add to wishlist"
                        >
                          {addingToWishlist === product.id ? (
                            <Loader2 size={14} className="sm:w-4 sm:h-4 animate-spin text-[#F3ECE7]" />
                          ) : (
                            <Heart size={14} className="sm:w-4 sm:h-4 text-[#F3ECE7]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Container da imagem - Melhorado */}
                    <div 
                      className="product-image-container relative cursor-pointer z-0"
                      onClick={(e) => {
                        // Só abrir lightbox se não clicou em um botão
                        if (e.target.closest('button') || e.target.closest('[role="button"]')) {
                          return;
                        }
                        openImageLightbox(product.images, currentImageIndex[product.id] || 0);
                      }}
                    >
                      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 group-hover:bg-black/30 pointer-events-none">
                        <ZoomIn size={32} className="text-white drop-shadow-lg" />
                      </div>
                      <img
                        src={product.images[currentImageIndex[product.id] || 0] || product.images[0] || "https://via.placeholder.com/400x500"}
                        alt={product.name}
                        className="product-image w-full h-full object-cover transition-transform duration-500 pointer-events-none"
                        loading="lazy"
                      />

                      {/* Overlay para desktop - Melhorado */}
                      <div 
                        className="product-overlay absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 hidden lg:flex items-end justify-center pb-4 px-4 z-30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToProduct(product.handle);
                            }}
                            className="flex-1 bg-[#F3ECE7] text-[#1C1C1C] px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-white transition-colors"
                          >
                            <Eye size={16} />
                            <span>VIEW</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openVariantModal(product);
                            }}
                            disabled={addingToCart === product.id || !product.availableForSale}
                            className={`flex-1 bg-[#8A0101] text-[#F3ECE7] px-4 py-2 rounded-lg font-semibold flex items-center justify-center space-x-2 hover:bg-[#8A0101]/80 transition-colors ${
                              addingToCart === product.id || !product.availableForSale ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {addingToCart === product.id ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>ADDING...</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={16} />
                                <span>ADD</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Controles de imagem para mobile - Melhorado */}
                      {product.images.length > 1 && (
                        <div className="lg:hidden pointer-events-auto z-20">
                          {/* Dots indicator */}
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
                            {product.images.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [product.id]: index
                                  }));
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                                  index === (currentImageIndex[product.id] || 0)
                                    ? 'bg-[#8A0101] scale-125'
                                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                                }`}
                              />
                            ))}
                          </div>
                          
                          {/* Swipe areas - Melhorado */}
                          <div className="absolute inset-0 flex z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageChange(product.id, 'prev');
                              }}
                              className="flex-1 w-1/2 h-full bg-transparent active:bg-black active:bg-opacity-10 transition-colors flex items-center justify-start pl-4"
                            >
                              <div className="w-8 h-8 rounded-full bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center text-white">
                                ←
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleImageChange(product.id, 'next');
                              }}
                              className="flex-1 w-1/2 h-full bg-transparent active:bg-black active:bg-opacity-10 transition-colors flex items-center justify-end pr-4"
                            >
                              <div className="w-8 h-8 rounded-full bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center text-white">
                                →
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Informações do produto - Melhorado */}
                    <div className="p-4">
                      <h3 className="font-semibold text-base lg:text-lg mb-2 line-clamp-2 text-[#F3ECE7] hover:text-[#8A0101] transition-colors cursor-pointer"
                          onClick={() => navigateToProduct(product.handle)}>
                        {product.name}
                      </h3>
                      
                      {/* Preços - Melhorado */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg lg:text-xl font-bold text-[#F3ECE7]">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Indicador de estoque baixo */}
                      {product.stockLevel > 0 && product.stockLevel <= 5 && (
                        <div className="text-xs text-orange-400 mb-3 font-medium">
                          Only {product.stockLevel} {product.stockLevel === 1 ? 'unit' : 'units'} left!
                        </div>
                      )}

                      {/* Badge de indisponível */}
                      {!product.availableForSale && (
                        <div className="text-xs text-red-400 mb-3 font-medium">
                          Out of stock
                        </div>
                      )}

                      {/* Botões para mobile - Melhorado */}
                      <div className="lg:hidden flex gap-2 mt-4">
                        <button
                          onClick={() => navigateToProduct(product.handle)}
                          className="flex-1 bg-[#4B014E]/50 hover:bg-[#4B014E] border border-[#4B014E] text-[#F3ECE7] py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold text-sm"
                        >
                          <Eye size={16} />
                          <span>VIEW</span>
                        </button>
                        <button
                          onClick={() => openVariantModal(product)}
                          disabled={addingToCart === product.id || !product.availableForSale}
                          className={`flex-1 bg-[#8A0101] hover:bg-[#8A0101]/80 text-[#F3ECE7] py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold text-sm ${
                            addingToCart === product.id || !product.availableForSale ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={16} />
                              <span>ADD</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                /* View mode List */
                <div className="space-y-4">
                  {filteredAndSortedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-black/50 backdrop-blur-sm border border-[#4B014E]/20 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-[#8A0101]/20 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Imagem */}
                        <div className="relative w-full md:w-48 h-64 md:h-48 flex-shrink-0">
                          <img
                            src={product.images[0] || "https://via.placeholder.com/400x500"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {product.discount && (
                            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                              -{product.discount}%
                            </div>
                          )}
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-[#F3ECE7] mb-2">{product.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl font-bold text-[#F3ECE7]">${product.price.toFixed(2)}</span>
                              {product.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                              )}
                            </div>
                            {product.stockBadge && (
                              <span className="text-xs text-orange-400">{product.stockBadge}</span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => navigateToProduct(product.handle)}
                              className="bg-[#4B014E]/50 hover:bg-[#4B014E] border border-[#4B014E] text-[#F3ECE7] px-4 py-2 rounded-lg transition-colors font-semibold text-sm"
                            >
                              VIEW DETAILS
                            </button>
                            <button
                              onClick={() => openVariantModal(product)}
                              disabled={addingToCart === product.id || !product.availableForSale}
                              className={`bg-[#8A0101] hover:bg-[#8A0101]/80 text-[#F3ECE7] px-4 py-2 rounded-lg transition-colors font-semibold text-sm flex items-center gap-2 ${
                                addingToCart === product.id || !product.availableForSale ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {addingToCart === product.id ? (
                                <>
                                  <Loader2 size={16} className="animate-spin" />
                                  ADDING...
                                </>
                              ) : (
                                <>
                                  <ShoppingCart size={16} />
                                  ADD
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Empty state - Melhorado */}
            {filteredAndSortedProducts.length === 0 && (
              <div className="text-center py-20 px-4">
                <div className="max-w-md mx-auto">
                  <div className="mb-6">
                    <Search size={64} className="mx-auto text-gray-600" />
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-[#F3ECE7] tracking-wider">
                    NO PRODUCTS FOUND
                  </h3>
                  <p className="text-gray-400 mb-8 leading-relaxed">
                    Try adjusting your filters or search criteria to find what you're looking for.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedFilters([]);
                      setSearchQuery('');
                      setSortBy('default');
                      setPriceRange([0, 1000]);
                    }}
                    className="bg-[#8A0101] hover:bg-[#8A0101]/80 text-[#F3ECE7] px-8 py-3 rounded-lg transition-colors font-semibold"
                  >
                    CLEAR FILTERS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Seleção de Variantes - Estilizado */}
      {showVariantModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowVariantModal(false)}>
          <div 
            className="bg-gradient-to-br from-[#1C1C1C] to-black border border-[#4B014E]/50 rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-black to-[#1C1C1C] border-b border-[#4B014E]/50 p-4 flex items-center justify-between z-10 backdrop-blur-sm">
              <h2 className="text-xl font-bold text-[#F3ECE7] tracking-wider uppercase">SELECT OPTIONS</h2>
              <button
                onClick={() => {
                  setShowVariantModal(false);
                  setSelectedProduct(null);
                  setSelectedColor(null);
                  setSelectedSize(null);
                  setSelectedVariant(null);
                }}
                className="text-gray-400 hover:text-[#F3ECE7] transition-colors p-1 rounded-full hover:bg-[#4B014E]/30"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 space-y-6">
              {/* Imagem do Produto - Clicável */}
              <div 
                className="relative w-full h-64 rounded-lg overflow-hidden bg-black/50 border border-[#4B014E]/30 cursor-pointer group"
                onClick={() => {
                  // Incluir todas as imagens do produto no lightbox
                  const imagesToShow = selectedProduct.images.length > 0 
                    ? selectedProduct.images 
                    : selectedVariant?.image 
                      ? [selectedVariant.image]
                      : [];
                  if (imagesToShow.length > 0) {
                    openImageLightbox(imagesToShow, 0);
                  }
                }}
              >
                <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                  <ZoomIn size={32} className="text-white drop-shadow-lg" />
                </div>
                <img
                  src={selectedVariant?.image || selectedProduct.images[0] || "https://via.placeholder.com/400x500"}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Nome e Preço */}
              <div>
                <h3 className="text-2xl font-bold text-[#F3ECE7] mb-2">{selectedProduct.name}</h3>
                {selectedVariant && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#8A0101]">
                      ${selectedVariant.price?.toFixed(2) || selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedVariant.compareAtPrice && selectedVariant.compareAtPrice > selectedVariant.price && (
                      <span className="text-lg text-gray-400 line-through">
                        ${selectedVariant.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Opções de Variantes */}
              {(() => {
                const { colors, sizes } = getProductOptions(selectedProduct);
                
                return (
                  <div className="space-y-6">
                    {/* Seleção de Cor */}
                    {colors.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-[#8A0101] mb-3 tracking-wider uppercase">
                          COLOR
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {colors.map((color) => {
                            const isAvailable = findVariantByOptions(selectedProduct, color, selectedSize)?.availableForSale;
                            const isSelected = selectedColor === color;
                            
                            return (
                              <button
                                key={color}
                                onClick={() => setSelectedColor(color)}
                                disabled={!isAvailable}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? 'border-[#8A0101] bg-[#8A0101]/20 text-[#F3ECE7]'
                                    : isAvailable
                                    ? 'border-[#4B014E]/50 bg-black/50 text-gray-300 hover:border-[#4B014E] hover:bg-black/70'
                                    : 'border-gray-700 bg-black/30 text-gray-600 cursor-not-allowed opacity-50'
                                }`}
                              >
                                <div
                                  className="w-5 h-5 rounded-full border border-gray-600"
                                  style={{ backgroundColor: getColorCode(color) }}
                                />
                                <span className="font-medium text-sm">{color}</span>
                                {isSelected && <Check size={16} className="text-[#8A0101]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Seleção de Tamanho */}
                    {sizes.length > 0 && (
                      <div>
                        <label className="block text-sm font-semibold text-[#8A0101] mb-3 tracking-wider uppercase">
                          SIZE
                        </label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {sizes.map((size) => {
                            const isAvailable = findVariantByOptions(selectedProduct, selectedColor, size)?.availableForSale;
                            const isSelected = selectedSize === size;
                            const stockLevel = findVariantByOptions(selectedProduct, selectedColor, size)?.quantityAvailable || 0;
                            
                            return (
                              <button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                disabled={!isAvailable}
                                className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                                  isSelected
                                    ? 'border-[#8A0101] bg-[#8A0101]/20 text-[#F3ECE7] shadow-lg shadow-[#8A0101]/30'
                                    : isAvailable
                                    ? 'border-[#4B014E]/50 bg-black/50 text-gray-300 hover:border-[#4B014E] hover:bg-black/70'
                                    : 'border-gray-700 bg-black/30 text-gray-600 cursor-not-allowed opacity-50'
                                }`}
                                title={!isAvailable ? 'Out of stock' : stockLevel <= 5 ? `Only ${stockLevel} left` : ''}
                              >
                                {size}
                                {isSelected && stockLevel <= 5 && stockLevel > 0 && (
                                  <span className="block text-xs text-orange-400 mt-1">{stockLevel} left</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Mensagem se não houver variantes */}
                    {colors.length === 0 && sizes.length === 0 && (
                      <div className="text-center py-4 text-gray-400">
                        <p>No options available for this product.</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Botão de Adicionar ao Carrinho */}
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || !selectedVariant.availableForSale || addingToCart === selectedProduct.id}
                className={`w-full bg-gradient-to-r from-[#8A0101] to-[#8A0101]/80 hover:from-[#8A0101]/90 hover:to-[#8A0101] text-[#F3ECE7] px-6 py-4 rounded-lg font-bold text-lg tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-[#8A0101]/20 ${
                  !selectedVariant || !selectedVariant.availableForSale || addingToCart === selectedProduct.id
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:shadow-xl hover:shadow-[#8A0101]/30 transform hover:scale-[1.02]'
                }`}
              >
                {addingToCart === selectedProduct.id ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>ADDING...</span>
                  </>
                ) : !selectedVariant || !selectedVariant.availableForSale ? (
                  <span>OUT OF STOCK</span>
                ) : (
                  <>
                    <ShoppingCart size={20} />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              {/* Indicador de Estoque */}
              {selectedVariant && selectedVariant.quantityAvailable <= 5 && selectedVariant.quantityAvailable > 0 && (
                <div className="text-center py-2 px-4 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                  <p className="text-orange-400 text-sm font-medium">
                    Only {selectedVariant.quantityAvailable} {selectedVariant.quantityAvailable === 1 ? 'unit' : 'units'} left in stock!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox de Imagens - Desktop e Mobile */}
      {showImageLightbox && lightboxImages.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={closeImageLightbox}
        >
          {/* Botão fechar */}
          <button
            onClick={closeImageLightbox}
            className="absolute top-4 right-4 lg:top-8 lg:right-8 text-white hover:text-[#8A0101] transition-colors z-10 p-2 rounded-full hover:bg-white/10"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>

          {/* Navegação anterior */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('prev');
              }}
              className="absolute left-4 lg:left-8 text-white hover:text-[#8A0101] transition-colors z-10 p-3 rounded-full hover:bg-white/10 backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Imagem atual */}
          <div 
            className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImages[lightboxCurrentIndex] || "https://via.placeholder.com/800x1000"}
              alt={`Image ${lightboxCurrentIndex + 1} of ${lightboxImages.length}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Indicador de imagem */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                {lightboxCurrentIndex + 1} / {lightboxImages.length}
              </div>
            )}
          </div>

          {/* Navegação próxima */}
          {lightboxImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox('next');
              }}
              className="absolute right-4 lg:right-8 text-white hover:text-[#8A0101] transition-colors z-10 p-3 rounded-full hover:bg-white/10 backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Dots indicator para mobile */}
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10 lg:hidden">
              {lightboxImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxCurrentIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === lightboxCurrentIndex 
                      ? 'bg-[#8A0101] w-6' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;