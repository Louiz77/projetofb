import { auth, db, doc, setDoc, getDoc } from '../client/firebaseConfig';
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

export const showVariantSelector = (variants, productTitle) => {
  return new Promise((resolve) => {
    if (variants.length === 1) {
      resolve(variants[0]);
      return;
    }
    // ...modal code (same as before, omitted for brevity)...
  });
};

export const addToWishlist = async (product) => {
  try {
    const { data } = await client.query({
      query: GET_PRODUCT_VARIANTS,
      variables: { productId: product.id },
    });
    const variants = data.product.variants.edges.map(edge => edge.node);
    if (variants.length === 0) {
      alert('Este produto não possui variantes disponíveis.');
      return;
    }
    const selectedVariant = await showVariantSelector(variants, data.product.title);
    if (!selectedVariant) return;
    const wishlistItem = {
      id: `wishlist_${Date.now()}_${Math.random()}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: data.product.title,
      variantTitle: selectedVariant.title,
      price: parseFloat(selectedVariant.price.amount),
      image: data.product.images.edges[0]?.node?.url || 'https://via.placeholder.com/400x400',
      selectedOptions: selectedVariant.selectedOptions,
      addedAt: new Date().toISOString(),
    };
    const user = auth.currentUser;
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistSnap = await getDoc(wishlistRef);
      const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];
      const isAlreadyInWishlist = existingItems.some(item => item.variantId === selectedVariant.id);
      if (!isAlreadyInWishlist) {
        await setDoc(wishlistRef, { items: [...existingItems, wishlistItem] }, { merge: true });
        alert('Produto adicionado à wishlist!');
      } else {
        alert('Esta variante já está na sua wishlist.');
      }
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      const isAlreadyInWishlist = guestWishlist.some(item => item.variantId === selectedVariant.id);
      if (!isAlreadyInWishlist) {
        guestWishlist.push(wishlistItem);
        localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
        alert('Produto adicionado à wishlist!');
      } else {
        alert('Esta variante já está na sua wishlist.');
      }
    }
  } catch (error) {
    console.error('Erro ao adicionar à wishlist:', error);
    alert('Falha ao adicionar à wishlist. Tente novamente.');
  }
};
