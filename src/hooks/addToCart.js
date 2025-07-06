import { auth, db, doc, getDoc, setDoc } from '../client/firebaseConfig';
import client from '../client/ShopifyClient';
import { gql } from '@apollo/client';

const GET_PRODUCT_VARIANTS = gql`
  query GetProductVariants($productId: ID!) {
    product(id: $productId) {
      id
      title
      variants(first: 10) {
        edges {
          node {
            id
            title
            price {
              amount
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 1) {
        edges {
          node {
            url
          }
        }
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        checkoutUrl
      }
    }
  }
`;

export const showVariantSelector = (variants, productTitle) => {
  return new Promise((resolve) => {
    if (variants.length === 1) {
      resolve(variants[0]);
      return;
    }
    // Criar modal para seleção de variante (igual ao wishlist.js)
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 400px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
    `;
    content.innerHTML = `
      <h3 style="margin-bottom: 1rem; color: #333;">Selecione uma variante para "${productTitle}"</h3>
      <div id="variant-options" style="margin-bottom: 1rem;">
        ${variants.map((variant, index) => {
          const options = variant.selectedOptions
            .map(opt => `${opt.name}: ${opt.value}`)
            .join(', ');
          return `
            <div style="margin-bottom: 0.5rem;">
              <button 
                data-variant-index="${index}"
                style="
                  width: 100%;
                  padding: 0.75rem;
                  border: 1px solid #ddd;
                  border-radius: 4px;
                  background: white;
                  cursor: pointer;
                  text-align: left;
                  transition: all 0.2s;
                "
                onmouseover="this.style.background='#f5f5f5'"
                onmouseout="this.style.background='white'"
              >
                <div style="font-weight: bold;">${variant.title}</div>
                <div style="font-size: 0.9em; color: #666;">${options}</div>
                <div style="font-size: 0.9em; color: #333;">$ ${parseFloat(variant.price.amount).toFixed(2)}</div>
              </button>
            </div>
          `;
        }).join('')}
      </div>
      <div style="display: flex; gap: 1rem; justify-content: flex-end;">
        <button 
          id="cancel-btn"
          style="
            padding: 0.5rem 1rem;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
          "
        >
          Cancelar
        </button>
      </div>
    `;
    modal.appendChild(content);
    document.body.appendChild(modal);
    // Event listeners
    content.querySelectorAll('[data-variant-index]').forEach(button => {
      button.addEventListener('click', () => {
        const index = parseInt(button.dataset.variantIndex);
        document.body.removeChild(modal);
        resolve(variants[index]);
      });
    });
    document.getElementById('cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(null);
    });
    // Fechar modal clicando fora
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(null);
      }
    });
  });
};

export const addToCart = async (product) => {
  try {
    // Se variantId já foi fornecido, usar diretamente (vem do CollectionModal)
    if (product.variantId) {
      // Shopify add
      let cartId = localStorage.getItem('shopifyCartId');
      if (!cartId) {
        const { data: cartData } = await client.mutate({
          mutation: gql`
            mutation { cartCreate(input: {}) { cart { id checkoutUrl } } }
          `,
        });
        cartId = cartData.cartCreate.cart.id;
        localStorage.setItem('shopifyCartId', cartId);
      }

      await client.mutate({
        mutation: ADD_TO_CART,
        variables: {
          cartId,
          lines: [{ merchandiseId: product.variantId, quantity: product.quantity || 1 }],
        },
      });

      // Local/Firebase add
      const cartItem = {
        id: product.variantId,
        name: product.name,
        price: product.price,
        image: product.image || 'https://via.placeholder.com/400x400',
        quantity: product.quantity || 1,
      };

      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        const existingItems = cartSnap.exists() ? cartSnap.data().items : [];
        const existingItemIndex = existingItems.findIndex((i) => i.id === cartItem.id);
        if (existingItemIndex !== -1) {
          existingItems[existingItemIndex].quantity += cartItem.quantity;
        } else {
          existingItems.push(cartItem);
        }
        await setDoc(cartRef, { items: existingItems }, { merge: true });
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItemIndex = guestCart.findIndex((i) => i.id === cartItem.id);
        if (existingItemIndex !== -1) {
          guestCart[existingItemIndex].quantity += cartItem.quantity;
        } else {
          guestCart.push(cartItem);
        }
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }
      return;
    }

    // Lógica original para produtos sem variante pré-selecionada
    // Buscar variantes do produto
    const { data } = await client.query({
      query: GET_PRODUCT_VARIANTS,
      variables: { productId: product.id },
    });
    const variants = data.product.variants.edges.map((edge) => edge.node);
    if (variants.length === 0) {
      alert('Este produto não possui variantes disponíveis.');
      return;
    }
    const selectedVariant = await showVariantSelector(variants, data.product.title);
    if (!selectedVariant) return;
    // Shopify add
    let cartId = localStorage.getItem('shopifyCartId');
    if (!cartId) {
      const { data: cartData } = await client.mutate({
        mutation: gql`
          mutation { cartCreate(input: {}) { cart { id checkoutUrl } } }
        `,
      });
      cartId = cartData.cartCreate.cart.id;
      localStorage.setItem('shopifyCartId', cartId);
    }
    await client.mutate({
      mutation: ADD_TO_CART,
      variables: {
        cartId,
        lines: [{ merchandiseId: selectedVariant.id, quantity: 1 }],
      },
    });
    // Local/Firebase add
    const cartItem = {
      id: selectedVariant.id,
      name: data.product.title,
      price: parseFloat(selectedVariant.price.amount),
      image: data.product.images.edges[0]?.node?.url || 'https://via.placeholder.com/400x400',
      quantity: 1,
    };
    const user = auth.currentUser;
    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      const cartSnap = await getDoc(cartRef);
      const existingItems = cartSnap.exists() ? cartSnap.data().items : [];
      const existingItemIndex = existingItems.findIndex((i) => i.id === cartItem.id);
      if (existingItemIndex !== -1) {
        existingItems[existingItemIndex].quantity += 1;
      } else {
        existingItems.push(cartItem);
      }
      await setDoc(cartRef, { items: existingItems }, { merge: true });
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
      const existingItemIndex = guestCart.findIndex((i) => i.id === cartItem.id);
      if (existingItemIndex !== -1) {
        guestCart[existingItemIndex].quantity += 1;
      } else {
        guestCart.push(cartItem);
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    alert('Falha ao adicionar ao carrinho. Verifique os dados do produto.');
  }
};

export const addKitToCart = async (kit) => {
  try {
    if (!Array.isArray(kit.items) || kit.items.length === 0) {
      alert('Kit sem produtos válidos.');
      return;
    }

    let cartId = localStorage.getItem('shopifyCartId');
    if (!cartId) {
      const { data: cartData } = await client.mutate({
        mutation: gql`
          mutation { cartCreate(input: {}) { cart { id checkoutUrl } } }
        `,
      });
      cartId = cartData.cartCreate.cart.id;
      localStorage.setItem('shopifyCartId', cartId);
    }

    const selectedVariants = [];
    for (const product of kit.items) {
      // Se já veio variantId e selectedVariant, usa direto
      if (product.variantId && product.selectedVariant) {
        selectedVariants.push({
          variant: product.selectedVariant,
          product: { title: product.name || product.title },
          image: product.selectedVariant.image?.url || product.image
        });
        continue;
      }

      // Caso contrário, fluxo antigo (fallback)
      const { data } = await client.query({
        query: GET_PRODUCT_VARIANTS,
        variables: { productId: product.id },
      });

      const variants = data.product.variants.edges.map((edge) => edge.node);
      if (variants.length === 0) {
        alert(`O produto "${product.name}" não possui variantes disponíveis.`);
        continue;
      }

      const selectedVariant = await showVariantSelector(variants, data.product.title);
      if (!selectedVariant) {
        alert(`Seleção de variante cancelada para "${product.name}".`);
        continue;
      }

      selectedVariants.push({
        variant: selectedVariant,
        product: data.product,
        image: data.product.images.edges[0]?.node?.url || 'https://via.placeholder.com/400x400',
      });
    }

    // Preparar linhas do carrinho
    const cartLines = selectedVariants.map(({ variant }) => ({
      merchandiseId: variant.id,
      quantity: 1
    }));

    // Adicionar todos ao carrinho Shopify de uma vez
    await client.mutate({
      mutation: ADD_TO_CART,
      variables: {
        cartId,
        lines: cartLines,
      },
    });

    // Aplicar desconto de coleção se aplicável
    if (kit.hasCollectionDiscount && kit.discountCode) {
      console.log('🎯 Tentando aplicar desconto:', {
        cartId,
        discountCode: kit.discountCode,
        hasDiscount: kit.hasCollectionDiscount,
        percentage: kit.discountPercentage
      });

      try {
        const discountResult = await client.mutate({
          mutation: gql`
            mutation ($cartId: ID!, $discountCodes: [String!]!) {
              cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
                cart {
                  id
                  discountCodes {
                    code
                    applicable
                  }
                  cost {
                    totalAmount {
                      amount
                    }
                    subtotalAmount {
                      amount
                    }
                  }
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            cartId,
            discountCodes: [kit.discountCode],
          },
        });

        console.log('✅ Resultado do desconto:', discountResult.data);
        
        if (discountResult.data.cartDiscountCodesUpdate.userErrors.length > 0) {
          console.error('❌ Erros ao aplicar desconto:', discountResult.data.cartDiscountCodesUpdate.userErrors);
        } else {
          console.log('🎉 Desconto aplicado com sucesso:', kit.discountCode);
        }
      } catch (discountError) {
        console.error('❌ Erro ao aplicar desconto:', discountError);
        // Não falhar o processo inteiro se o desconto não funcionar
      }
    } else {
      console.log('ℹ️ Sem desconto aplicável:', {
        hasCollectionDiscount: kit.hasCollectionDiscount,
        discountCode: kit.discountCode
      });
    }

    // Adicionar ao carrinho local/Firebase
    for (const { variant, product, image } of selectedVariants) {
      const cartItem = {
        id: variant.id,
        name: product.title,
        price: parseFloat(variant.price.amount),
        image,
        quantity: 1,
      };

      const user = auth.currentUser;
      if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        const cartSnap = await getDoc(cartRef);
        const existingItems = cartSnap.exists() ? cartSnap.data().items : [];
        const existingItemIndex = existingItems.findIndex((i) => i.id === cartItem.id);
        
        if (existingItemIndex !== -1) {
          existingItems[existingItemIndex].quantity += 1;
        } else {
          existingItems.push(cartItem);
        }
        
        await setDoc(cartRef, { items: existingItems }, { merge: true });
      } else {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const existingItemIndex = guestCart.findIndex((i) => i.id === cartItem.id);
        
        if (existingItemIndex !== -1) {
          guestCart[existingItemIndex].quantity += 1;
        } else {
          guestCart.push(cartItem);
        }
        
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar kit ao carrinho:', error);
    alert('Falha ao adicionar o kit ao carrinho. Verifique os dados dos produtos.');
  }
};
