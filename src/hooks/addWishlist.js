import { auth, db, doc, setDoc, getDoc } from '../client/firebaseConfig';
import client from '../client/ShopifyClient';
import { gql } from '@apollo/client';

// Query para buscar variantes de um produto
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

// Função para mostrar modal de seleção de variante
const showVariantSelector = (variants, productTitle, onSelect) => {
  return new Promise((resolve) => {
    // Se houver apenas uma variante, seleciona automaticamente
    if (variants.length === 1) {
      resolve(variants[0]);
      return;
    }

    // Criar modal para seleção de variante
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
                <div style="font-size: 0.9em; color: #333;">R$ ${parseFloat(variant.price.amount).toFixed(2)}</div>
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

const addToWishlist = async (product) => {
  try {
    // Buscar variantes do produto
    const { data } = await client.query({
      query: GET_PRODUCT_VARIANTS,
      variables: { productId: product.id },
    });

    const variants = data.product.variants.edges.map(edge => edge.node);
    
    if (variants.length === 0) {
      alert("Este produto não possui variantes disponíveis.");
      return;
    }

    // Mostrar seletor de variante
    const selectedVariant = await showVariantSelector(variants, data.product.title);
    
    if (!selectedVariant) {
      return; // Usuário cancelou
    }

    // Criar item da wishlist com dados completos
    const wishlistItem = {
      id: `wishlist_${Date.now()}_${Math.random()}`, // ID único para wishlist
      productId: product.id,
      variantId: selectedVariant.id,
      name: data.product.title,
      variantTitle: selectedVariant.title,
      price: parseFloat(selectedVariant.price.amount),
      image: data.product.images.edges[0]?.node?.url || "https://via.placeholder.com/400x400",
      selectedOptions: selectedVariant.selectedOptions,
      addedAt: new Date().toISOString(),
    };

    const user = auth.currentUser;
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistSnap = await getDoc(wishlistRef);
      const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];

      // Verificar se já existe (baseado no variantId)
      const isAlreadyInWishlist = existingItems.some(item => item.variantId === selectedVariant.id);

      if (!isAlreadyInWishlist) {
        await setDoc(wishlistRef, { items: [...existingItems, wishlistItem] }, { merge: true });
        alert("Produto adicionado à wishlist!");
      } else {
        alert("Esta variante já está na sua wishlist.");
      }
    } else {
      // Para visitantes, usar localStorage
      const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      const isAlreadyInWishlist = guestWishlist.some(item => item.variantId === selectedVariant.id);
      
      if (!isAlreadyInWishlist) {
        guestWishlist.push(wishlistItem);
        localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
        alert("Produto adicionado à wishlist!");
      } else {
        alert("Esta variante já está na sua wishlist.");
      }
    }
  } catch (error) {
    console.error("Erro ao adicionar à wishlist:", error);
    alert("Falha ao adicionar à wishlist. Tente novamente.");
  }
};

const removeFromWishlist = async (itemId) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistSnap = await getDoc(wishlistRef);
      const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];

      const updatedItems = existingItems.filter(item => item.id !== itemId);
      await setDoc(wishlistRef, { items: updatedItems }, { merge: true });
      alert("Produto removido da wishlist!");
    } else {
      // Para visitantes, usar localStorage
      const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      const updatedItems = guestWishlist.filter(item => item.id !== itemId);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
      alert("Produto removido da wishlist!");
    }
  } catch (error) {
    console.error("Erro ao remover da wishlist:", error);
    alert("Falha ao remover da wishlist. Tente novamente.");
  }
};

// Função para verificar se um item está na wishlist
const isItemInWishlist = async (variantId) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const docSnap = await getDoc(wishlistRef);
      if (docSnap.exists()) {
        return docSnap.data().items.some(item => item.variantId === variantId);
      }
      return false;
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      return guestWishlist.some(item => item.variantId === variantId);
    }
  } catch (error) {
    console.error("Erro ao verificar wishlist:", error);
    return false;
  }
};

export default { addToWishlist, removeFromWishlist, isItemInWishlist };