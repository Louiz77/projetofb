import ProductCard from '../ProductCard';

const FeaturedProducts = () => {
  const featuredProducts = [
    {
      id: "gid://shopify/Product/8984041783516",
      name: "Men's Gothic Cross Print Distressed Denim Jacket",
      price: 136.66,
      image: "https://cdn.shopify.com/s/files/1/0765/2759/9836/files/5aa2aa68246644198824910c836e61ba-Max-Origin.webp?v=1750192729"
    },
    {
      id: "gid://shopify/Product/8984044110044",
      name: "Gothic Velvet Cobweb Court Rococo Coat Cardigan Top",
      price: 150,
      image: "https://cdn.shopify.com/s/files/1/0765/2759/9836/files/94be7652-2f3c-4af6-8d1e-f48ae905b1c9.jpg?v=1750193051"
    }
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">FEATURED PRODUCTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={() => console.log("Ver detalhes:", product.id)}
              onAddToCart={() => console.log("Adicionar ao carrinho:", product.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;