import { auth, db, doc, setDoc, getDoc } from '../client/firebaseConfig';

const addToWishlist = async (item) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid);
      const wishlistSnap = await getDoc(wishlistRef);
      const existingItems = wishlistSnap.exists() ? wishlistSnap.data().items || [] : [];

      // Verificar se o item já existe
      const isAlreadyInWishlist = existingItems.some(wishlistItem => wishlistItem.id === item.id);

      if (!isAlreadyInWishlist) {
        await setDoc(wishlistRef, { items: [...existingItems, item] }, { merge: true });
        alert("Produto adicionado à wishlist!");
      } else {
        alert("Produto já está na sua wishlist.");
      }
    } else {
      // Para visitantes, usar localStorage
      const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
      if (!guestWishlist.some(wishlistItem => wishlistItem.id === item.id)) {
        guestWishlist.push(item);
        localStorage.setItem('wishlistItems', JSON.stringify(guestWishlist));
        alert("Produto adicionado à wishlist!");
      } else {
        alert("Produto já está na sua wishlist.");
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
const isItemInWishlist = (itemId) => {
  const user = auth.currentUser;
  if (user) {
    const wishlistRef = doc(db, 'wishlists', user.uid);
    return getDoc(wishlistRef).then(docSnap => {
      if (docSnap.exists()) {
        return docSnap.data().items.some(item => item.id === itemId);
      }
      return false;
    });
  } else {
    const guestWishlist = JSON.parse(localStorage.getItem('wishlistItems') || '[]');
    return guestWishlist.some(item => item.id === itemId);
  }
};

export default {addToWishlist, removeFromWishlist, isItemInWishlist}