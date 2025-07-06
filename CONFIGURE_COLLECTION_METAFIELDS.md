# Como Configurar os Metafields nas Coleções

## Passo a Passo para Cada Coleção

### 1. Acesse suas Coleções no Shopify Admin

1. No Shopify Admin, vá para `Products` > `Collections`
2. Clique em cada coleção que você quer aplicar desconto

### 2. Configure os Metafields para Cada Coleção

Para **cada uma** das suas coleções (Goth Men, Goth Women, Streetwear Women, etc.):

#### Na seção "Metafields" da coleção:

1. **Scroll down** até a seção "Metafields"
2. Adicione o metafield **Discount Percentage**:
   - Valor: `20`
   
3. Adicione o metafield **Minimum Items for Discount**:
   - Valor: `9` (ou o número que você configurou no desconto)

### 3. Exemplo de Configuração

#### Coleção: "Goth Men"
- **Discount Percentage**: `20`
- **Minimum Items for Discount**: `9`

#### Coleção: "Goth Women"  
- **Discount Percentage**: `20`
- **Minimum Items for Discount**: `9`

#### Coleção: "Streetwear Women"
- **Discount Percentage**: `20`
- **Minimum Items for Discount**: `9`

### 4. Salvar as Alterações

- Clique em **"Save"** em cada coleção após configurar os metafields

## Verificação

Após configurar:

1. **Teste no Frontend**: Abra o modal de uma coleção e veja se aparece a informação de desconto
2. **Console do Navegador**: Abra o DevTools (F12) e veja os logs quando adicionar ao carrinho
3. **Carrinho do Shopify**: Verifique se o desconto aparece no checkout

## Troubleshooting

Se ainda não funcionar:

### Opção 1: Use Desconto Automático (Mais Simples)
1. **Delete** o desconto "Collection 20% OFF" atual
2. Crie um novo **Automatic discount**:
   - Type: "Product discount"
   - Value: 20%
   - Applies to: "Specific collections"
   - Select your collections
   - Minimum quantity: 9 items

### Opção 2: Forçar Código de Desconto
No código, force o desconto sempre:
```javascript
// Em ProductSection.js, na função handleAddToCart
discountCode: 'COLLECTION20', // Sempre aplicar se selecionou items suficientes
```

### Verificar Logs
Abra o Console do navegador (F12) quando adicionar ao carrinho e procure por:
- 🎯 Tentando aplicar desconto
- ✅ Resultado do desconto  
- ❌ Erros (se houver)
