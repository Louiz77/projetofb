# Configuração de Descontos de Coleção no Shopify

## 1. Configuração dos Metafields (Shopify Admin)

### Passo 1: Criar Metafields para Collections
1. Acesse o Shopify Admin
2. Vá em `Settings` > `Metafields`
3. Selecione `Collections` na lista de recursos
4. Clique em `Add definition`

### Metafield 1: Percentual de Desconto
- **Namespace and key**: `custom.discount_percentage`
- **Name**: `Discount Percentage`
- **Description**: `Collection bundle discount percentage (e.g., 20 for 20% off)`
- **Type**: `Integer`
- **Validation**: Min: 1, Max: 99

### Metafield 2: Itens Mínimos para Desconto
- **Namespace and key**: `custom.min_items_for_discount`
- **Name**: `Minimum Items for Discount`
- **Description**: `Minimum number of items required to activate collection discount`
- **Type**: `Integer`
- **Validation**: Min: 1, Max: 10

## 2. Configuração dos Descontos Automáticos (CORREÇÃO BASEADA NAS SUAS IMAGENS)

### Configuração Correta para o Desconto que Você Criou:

Baseado nas imagens, você criou um desconto "Collection 20% OFF" mas a configuração precisa ser ajustada:

#### Para Desconto Automático (Recomendado):
1. No Shopify Admin, **EDITE** o desconto "Collection 20% OFF"
2. Mude o tipo de **"Compre X, Leve Y"** para **"Desconto de produto"**
3. Configure:
   - **Discount title**: "Collection 20% OFF"
   - **Type**: "Percentage" 
   - **Value**: 20%
   - **Applies to**: "Specific collections"
   - **Collections**: Selecione suas coleções (Goth Men, Goth Women, Streetwear Women, etc.)
   - **Minimum requirements**: "Minimum quantity of items" = 9 (conforme sua configuração)
   - **Customer eligibility**: "All customers"
   - **Active**: Ative o desconto

#### Configuração Alternativa - Código de Desconto:
Se preferir usar código de desconto (mais flexível):
1. **Delete** o desconto atual "Collection 20% OFF"
2. Crie um novo: `Discounts` > `Create discount` > `Discount code`
3. Configure:
   - **Discount code**: `COLLECTION20` (fixo, mais simples)
   - **Type**: "Percentage"
   - **Value**: 20%
   - **Applies to**: "Specific collections"
   - **Collections**: Suas coleções
   - **Minimum requirements**: "Minimum quantity of items" = 9
   - **Usage limits**: Opcional

## 3. Configuração Avançada (Script Editor - Shopify Plus)

Se você tem Shopify Plus, pode usar o Script Editor para lógica mais complexa:

```ruby
# Discount script para aplicar desconto apenas se mantiver itens mínimos
collection_discounts = {
  "gid://shopify/Collection/123456" => {
    percentage: 20,
    min_items: 3
  }
}

Input.cart.line_items.each do |line_item|
  product = line_item.variant.product
  
  product.collections.each do |collection|
    discount_config = collection_discounts[collection.id]
    next unless discount_config
    
    # Contar itens da mesma coleção no carrinho
    collection_items = Input.cart.line_items.select do |item|
      item.variant.product.collections.include?(collection)
    end
    
    total_quantity = collection_items.sum(&:quantity)
    
    if total_quantity >= discount_config[:min_items]
      discount_amount = line_item.line_price * (discount_config[:percentage] / 100.0)
      line_item.change_line_price(line_item.line_price - discount_amount, message: "Collection Bundle #{discount_config[:percentage]}% OFF")
    end
  end
end

Output.cart = Input.cart
```

## 4. Testando a Configuração

### No Admin do Shopify:
1. Vá para uma coleção específica
2. Configure os metafields:
   - `discount_percentage`: 20
   - `min_items_for_discount`: 3 (para coleção de 4 itens)
3. Salve as alterações

### No Frontend:
1. Abra o modal de uma coleção
2. Selecione diferentes quantidades de itens
3. Verifique se o desconto aparece/desaparece corretamente
4. Teste o fluxo de adicionar ao carrinho
5. Verifique no checkout do Shopify se o desconto foi aplicado

## 5. Códigos de Desconto Dinâmicos (Alternativa)

Se preferir usar códigos de desconto dinâmicos, você pode:

1. **Criar códigos pré-configurados** para cada coleção:
   - `COLLECTION-20-BUNDLE`
   - `COLLECTION-25-BUNDLE`
   - etc.

2. **Aplicar via API** quando o usuário adiciona itens ao carrinho:
```javascript
// Aplicar código de desconto
await client.mutate({
  mutation: gql`
    mutation ($cartId: ID!, $discountCodes: [String!]!) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart {
          id
          discountCodes {
            code
          }
        }
      }
    }
  `,
  variables: {
    cartId,
    discountCodes: ['COLLECTION-20-BUNDLE'],
  },
});
```

## 6. Monitoramento e Métricas

### Analytics para acompanhar:
- Taxa de conversão de coleções com desconto
- Ticket médio de pedidos com desconto de coleção
- Itens mais removidos das coleções
- Efetividade dos diferentes percentuais de desconto

### Relatórios no Shopify:
- `Analytics` > `Reports` > `Custom reports`
- Filtrar por códigos de desconto específicos
- Acompanhar performance das coleções

## Observações Importantes

1. **Teste sempre** em ambiente de desenvolvimento antes de implementar em produção
2. **Metafields** podem levar alguns minutos para aparecer na API GraphQL
3. **Descontos automáticos** têm prioridade sobre códigos de desconto manuais
4. **Combine** esta funcionalidade com email marketing para maximizar conversões
5. **Monitor** regularmente o impacto na margem de lucro

## Suporte Técnico

Se encontrar problemas:
1. Verifique os logs do navegador (Console)
2. Teste a query GraphQL no Shopify GraphiQL Explorer
3. Confirme se os metafields estão configurados corretamente
4. Verifique se os produtos estão associados às coleções corretas
