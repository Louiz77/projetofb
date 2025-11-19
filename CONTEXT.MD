# CONTEXT.MD - VANADUS Fashion Brand E-commerce

## 📋 Visão Geral do Projeto

**VANADUS** é uma loja de e-commerce de roupas focada no mercado do Reino Unido, especializada em moda alternativa (goth, streetwear, y2k, grunge, emo, punk) através de modelo de dropshipping com integração Shopify.

**Slogan:** "FOR THE UNTAMED" / "SILENCE IS JUST THE PRELUDE TO CHAOS"

---

## 🏗️ Arquitetura e Tecnologias

### Stack Principal
- **Frontend:** React 19.0.0 (Create React App)
- **Roteamento:** React Router DOM 7.6.2
- **Estado e API:** Apollo Client 3.13.8 (GraphQL)
- **Backend de Dados:** 
  - Shopify Storefront API (GraphQL) - Produtos, carrinho, checkout
  - Firebase (Firestore + Auth) - Carrinho de convidados, wishlist, autenticação
- **Estilização:** 
  - Tailwind CSS 3.4.17
  - Bootstrap 5.3.6 (parcial)
  - React Bootstrap 2.10.10
- **Analytics:** Vercel Analytics 1.5.0
- **Ícones:** Lucide React 0.515.0

### Configurações Shopify
- **Store URL:** `vanadus.myshopify.com`
- **API Version:** `2025-04`
- **Storefront Access Token:** Configurado no `ShopifyClient.js`
- **Endpoint GraphQL:** `https://vanadus.myshopify.com/api/2025-04/graphql.json`

### Configurações Firebase
- **Project ID:** `vanadus-32c2a`
- **Auth Domain:** `vanadus-32c2a.firebaseapp.com`
- **Storage:** Firebase Storage habilitado
- **Firestore:** Habilitado com persistência offline (IndexedDB)

---

## 📁 Estrutura do Projeto

```
projetofb/
├── public/                          # Assets estáticos
│   ├── imagens de banner e hero
│   ├── logo.png, favicon.ico
│   └── manifest.json
├── src/
│   ├── App.js                       # Componente principal com rotas
│   ├── index.js                     # Entry point com Apollo Provider
│   ├── index.css                    # Estilos globais + Tailwind
│   ├── client/
│   │   ├── ShopifyClient.js         # Cliente Apollo para Shopify
│   │   └── firebaseConfig.js        # Configuração Firebase
│   ├── components/
│   │   ├── Header.js                # Header com mega menu e carrinho
│   │   ├── Footer.js                # Footer com links e redes sociais
│   │   ├── ProductCard.js           # Card de produto reutilizável
│   │   └── Home/
│   │       ├── HeroBanner.js        # Banner hero principal
│   │       ├── GenderSplitBanner.js # Banner dividido por gênero
│   │       ├── CarouselSection.js   # Carrossel de produtos
│   │       ├── ProductSection.js    # Seção de coleções (modais)
│   │       ├── GridProduct.js       # Grid de produtos
│   │       ├── FeaturedProducts.js  # Produtos em destaque
│   │       ├── CategoryFilter.js    # Filtros de categoria
│   │       ├── CategoryFilterSection.js
│   │       ├── NewsletterSection.js # Newsletter signup
│   │       ├── PromotionalBanner.js # Banners promocionais
│   │       ├── AccountBanner.js     # Banner de conta
│   │       └── ProductCard.js       # Card de produto da home
│   ├── pages/
│   │   ├── Home.js                  # Página inicial
│   │   ├── ProductsPage.js          # Página de produtos por tag
│   │   ├── ProductDetail.js         # Detalhes do produto
│   │   ├── Cart.js                  # Modal de carrinho
│   │   ├── Wishlist.js              # Lista de desejos
│   │   ├── Account.js               # Login/Registro/Perfil
│   │   ├── Contact.js               # Contato
│   │   └── FAQ.js                   # Perguntas frequentes
│   ├── hooks/
│   │   ├── useCart.js               # Context do carrinho (abrir/fechar)
│   │   ├── addToCart.js             # Lógica de adicionar ao carrinho
│   │   ├── addWishlist.js           # Lógica de wishlist
│   │   └── wishlist.js              # Hooks de wishlist
│   └── styles/
│       └── ProductsPage.css         # Estilos específicos da página de produtos
├── package.json                     # Dependências e scripts
├── tailwind.config.js               # Configuração Tailwind (4K+ suportado)
├── postcss.config.js                # Configuração PostCSS
├── README.md                        # Documentação básica
├── SHOPIFY_DISCOUNT_SETUP.md       # Guia de descontos de coleção
└── CONFIGURE_COLLECTION_METAFIELDS.md # Guia de metafields

```

---

## 🎨 Design System e Paleta de Cores

### Cores Principais
- **Preto:** `#1C1C1C`, `#000000` (backgrounds principais)
- **Vermelho:** `#8A0101` (accent principal, botões)
- **Roxo:** `#4B014E`, `#6B0261` (accent secundário)
- **Creme:** `#F3ECE7` (textos claros, backgrounds)
- **Cinza:** Variações para textos e bordas

### Tipografia
- **Fonte Custom:** `FtVortex-G3ZDy.otf` (fonte gótica personalizada)
- **Font Stack:** `Helvetica Neue, sans-serif` (fallback)
- **Estilo:** Bold, tracking-wider (espaçamento entre letras)

### Breakpoints (Tailwind Config)
- Mobile: `< 768px`
- Tablet: `768px - 1440px`
- Desktop: `1440px - 1920px`
- Large: `1920px - 2560px`
- 4K+: `2560px+`
- Ultra Wide: `3840px+`

---

## 🔑 Funcionalidades Principais

### 1. Catálogo de Produtos

#### Busca e Filtragem
- **Por Tags:** Produtos organizados por tags (Hot-Topics, Top, Bottom, Dresses, Footwear, Accessories, Bags)
- **Por Categoria:**
  - MEN: Footwear, Top, Bottom, Accessories
  - WOMEN: Footwear, Top, Bottom, Full-Body, Accessories
  - STYLE: Goth, Streetwear, Y2K, Grunge, Emo, Punk
- **Metafields:** Suporte a metafields customizados e metaobjetos Shopify para gênero alvo
- **Filtros:** Por preço, tamanho, cor, estilo (implementação básica)

#### Produtos
- Variantes (tamanho, cor, etc.)
- Imagens múltiplas
- Preços com suporte a `compareAtPrice` (descontos)
- Badges automáticos (estoque limitado, novo, promoção)
- Disponibilidade em tempo real

### 2. Sistema de Carrinho

#### Funcionalidades
- **Dual Storage:**
  - Usuários logados: Firebase Firestore (tempo real)
  - Convidados: localStorage (com eventos customizados)
- **Sincronização Shopify:** Carrinho sincronizado com Shopify via GraphQL
- **Persistência:** Carrinho mantido entre sessões
- **Modal Sidebar:** Carrinho lateral deslizante
- **Quantidade:** Ajuste de quantidade com sincronização

#### Operações
- `cartCreate` - Criar novo carrinho
- `cartLinesAdd` - Adicionar itens
- `cartLinesUpdate` - Atualizar quantidade
- `cartLinesRemove` - Remover itens
- `cartDiscountCodesUpdate` - Aplicar códigos de desconto

### 3. Sistema de Descontos de Coleção

#### Metafields de Coleção
- `custom.discount_percentage` (Integer, 1-99): Percentual de desconto
- `custom.min_items_for_discount` (Integer, 1-10): Itens mínimos para desconto

#### Funcionalidades
- Modal de coleção mostra desconto baseado em metafields
- Desconto aplicado via código (`cartDiscountCodesUpdate`)
- Validação de itens mínimos antes de aplicar desconto
- Suporte a desconto automático no Shopify (configuração alternativa)

### 4. Sistema de Wishlist

#### Funcionalidades
- **Dual Storage:** Firebase (usuários) ou localStorage (convidados)
- **Sincronização em tempo real:** Firebase `onSnapshot` para usuários logados
- **Filtros:** Por categoria, ordenação (preço, nome)
- **Views:** Grid ou Lista
- **Ações:** Adicionar ao carrinho, remover, compartilhar

### 5. Autenticação de Usuários

#### Firebase Auth
- **Login:** Email e senha
- **Registro:** Email, senha, nome
- **Estado:** Monitorado via `onAuthStateChanged`
- **Perfil:** Informações básicas (email, data de criação, último login)

#### Recursos
- Validação de formulários
- Feedback visual (mostrar/ocultar senha)
- Persistência de sessão
- Logout

### 6. Navegação e Menu

#### Header
- **Fixo com scroll:** Esconde ao rolar para baixo, mostra ao rolar para cima
- **Mega Menu Desktop:** Hover para Men, Women, Style com subcategorias
- **Menu Mobile:** Hamburger com navegação hierárquica
- **Ícones:** Wishlist, Account, Cart (com contador)
- **Logo:** VANADUS + "FOR THE UNTAMED"

#### Rotas Principais
```
/ (Home)
/product/:productId (Detalhes do produto)
/tag/:tag (Produtos por tag)
/tag/:tag/:subcategory (Produtos por tag e subcategoria)
/cart (Modal de carrinho)
/wishlist (Lista de desejos)
/account (Login/Registro/Perfil)
/contact (Contato)
/faq (FAQ)
```

---

## 📊 Queries GraphQL Principais

### Produtos
```graphql
# Produtos por tag
query GetProductsByTag($tag: String!, $first: Int = 50) {
  products(first: $first, query: $tag) {
    edges {
      node {
        id, title, tags, handle
        metafields(identifiers: [{namespace: "shopify", key: "target-gender"}])
        images(first: 3) { edges { node { url } } }
        variants(first: 10) {
          edges {
            node {
              id, title, price { amount }, compareAtPrice { amount }
              availableForSale, quantityAvailable, image { url }
            }
          }
        }
      }
    }
  }
}

# Produtos da Home (Hot-Topics, Top, Bottom, etc.)
query {
  hotTopicsProducts: products(first: 10, query: "tag:Hot-Topics") { ... }
  topProducts: products(first: 10, query: "tag:Top") { ... }
  # ... outras queries por tag
}

# Coleções com metafields de desconto
query {
  collections(first: 10) {
    edges {
      node {
        id, title, description, image { url }
        discountPercentage: metafield(namespace: "custom", key: "discount_percentage") { value }
        minItemsForDiscount: metafield(namespace: "custom", key: "min_items_for_discount") { value }
        products(first: 10) { ... }
      }
    }
  }
}
```

### Carrinho
```graphql
# Criar carrinho
mutation {
  cartCreate(input: {}) {
    cart { id, checkoutUrl }
  }
}

# Adicionar itens
mutation ($cartId: ID!, $lines: [CartLineInput!]!) {
  cartLinesAdd(cartId: $cartId, lines: $lines) {
    cart { checkoutUrl }
  }
}

# Aplicar desconto
mutation ($cartId: ID!, $discountCodes: [String!]!) {
  cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
    cart { id, discountCodes { code, applicable } }
    userErrors { field, message }
  }
}
```

---

## 🎯 Funcionalidades Especiais

### Modais de Produto e Coleção
- **Modal de Produto Individual:** Seleção de variantes com carrossel de imagens, adicionar ao carrinho/wishlist
- **Modal de Coleção:** Visualização de produtos da coleção, seleção múltipla, desconto automático baseado em metafields

### Carrosséis e Seções
- **Carrossel de Produtos:** Navegação por setas, responsivo, suporte a 4K+
- **Seção de Coleções:** Grid de coleções com modais interativos
- **Hero Banners:** Banners promocionais com imagens e CTAs

### Sistema de Notificações
- Feedback visual para ações (adicionar ao carrinho, wishlist)
- Notificações de sucesso/erro com auto-dismiss

---

## 🔧 Configurações e Variáveis de Ambiente

### Shopify
- **Storefront Access Token:** Armazenado em `ShopifyClient.js` (dev ser movido para env em produção)
- **API Version:** Hardcoded como `2025-04`

### Firebase
- **Config:** Hardcoded em `firebaseConfig.js` (dev ser movido para env em produção)
- **Persistence:** IndexedDB habilitado para offline

---

## 📦 Estrutura de Dados

### Carrinho (Firestore/localStorage)
```javascript
{
  items: [
    {
      id: "gid://shopify/ProductVariant/...", // variantId
      name: "Nome do Produto",
      price: 99.99,
      image: "url",
      quantity: 1
    }
  ]
}
```

### Wishlist (Firestore/localStorage)
```javascript
{
  items: [
    {
      id: "gid://shopify/ProductVariant/...",
      name: "Nome do Produto",
      price: 99.99,
      image: "url",
      variantId: "...",
      quantity: 1,
      category: "camisetas" // opcional
    }
  ]
}
```

### Produto Transformado (Frontend)
```javascript
{
  id: "gid://shopify/Product/...",
  name: "Nome do Produto",
  image: "url",
  price: 99.99,
  originalPrice: 129.99, // se houver desconto
  discount: 23, // percentual
  tags: ["tag1", "tag2"],
  metafields: { genero_alvo: "WOMEN", ... },
  variants: [
    {
      id: "gid://shopify/ProductVariant/...",
      title: "Tamanho M / Cor Preto",
      price: { amount: "99.99" },
      compareAtPrice: { amount: "129.99" },
      availableForSale: true,
      image: { url: "..." }
    }
  ],
  availableForSale: true,
  stockLevel: 10,
  stockBadge: "Limited stock!" // se < 20
}
```

---

## 🚀 Scripts Disponíveis

```bash
npm start      # Desenvolvimento (http://localhost:3000)
npm run build  # Build de produção
npm test       # Testes
npm run eject  # Ejetar configuração (irreversível)
```

---

## 📝 Notas de Desenvolvimento

### Padrões de Código
- **Hooks Customizados:** `useCart`, hooks de wishlist para reutilização
- **Transformação de Dados:** Funções `transformProduct` e `transformCollection` para padronizar dados do Shopify
- **GraphQL:** Queries e mutations organizadas nos componentes
- **Estilização:** Tailwind CSS como base, CSS modules onde necessário

### Tratamento de Erros
- Try-catch em operações assíncronas
- Alertas para feedback do usuário (pode ser melhorado com toast notifications)
- Fallbacks para dados ausentes

### Performance
- **Cache:** Apollo Client com `cache-first` por padrão
- **Lazy Loading:** Imagens com `loading="lazy"`
- **Responsividade:** Breakpoints otimizados para telas grandes (4K+)
- **Persistência Offline:** Firebase IndexedDB para carrinho

### Melhorias Futuras
- Migrar tokens/chaves para variáveis de ambiente
- Implementar sistema de toast notifications
- Adicionar testes unitários e de integração
- Otimizar imagens (lazy loading, webp)
- Implementar SSR/SSG (Next.js?)
- Internacionalização (i18n)
- Analytics mais detalhados

---

## 🎯 Mercado e Público-Alvo

### Nicho
- Moda alternativa (Goth, Streetwear, Y2K, Grunge, Emo, Punk)
- Mercado do Reino Unido
- Dropshipping (sem estoque próprio)

### Demografia
- Jovens adultos (18-35)
- Interesse em moda alternativa e subculturas
- Confortável com compras online

---

## 📚 Documentação Adicional

- `SHOPIFY_DISCOUNT_SETUP.md` - Guia detalhado de configuração de descontos de coleção
- `CONFIGURE_COLLECTION_METAFIELDS.md` - Como configurar metafields nas coleções
- `README.md` - Documentação básica do Create React App

---

## 🔐 Segurança

### Considerações
- **Tokens Shopify:** Atualmente hardcoded (deve ser movido para env)
- **Firebase Config:** Hardcoded (deve ser movido para env)
- **Autenticação:** Firebase Auth com validação de email/senha
- **Carrinho Convidado:** localStorage (dados não sensíveis)

### Recomendações
- Usar variáveis de ambiente para todas as chaves/tokens
- Implementar rate limiting no backend
- Validar dados no servidor (Shopify já faz isso)
- HTTPS obrigatório em produção

---

**Última Atualização:** Janeiro 2025
**Versão do Projeto:** 0.1.0
