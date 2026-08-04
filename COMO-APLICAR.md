# Onde colocar cada arquivo no repositório

Copie o conteúdo de cada arquivo desta pasta para o caminho correspondente no seu
repositório `segundo-cerebro` e faça commit. Nada aqui apaga suas anotações — são só
mudanças de aparência.

| Arquivo aqui         | Vai para (no repositório)                  |
| -------------------- | ------------------------------------------ |
| cerebro-logo.png     | public/cerebro-logo.png  (NOVO arquivo)    |
| globals.css          | src/app/globals.css                        |
| layout.tsx           | src/app/layout.tsx                         |
| page.tsx             | src/app/page.tsx                           |
| Sidebar.tsx          | src/components/Sidebar.tsx                 |
| GraphView.tsx        | src/components/GraphView.tsx               |
| NewSpaceButton.tsx   | src/components/NewSpaceButton.tsx          |

## Ordem sugerida
1. Adicione **public/cerebro-logo.png** primeiro (o logo recortado do cérebro com cartola).
2. Substitua **globals.css** (base de tudo: textura mais suave, cartões com contraste,
   paleta ampliada, animações do grafo).
3. Substitua os componentes: **layout.tsx, page.tsx, Sidebar.tsx, GraphView.tsx,
   NewSpaceButton.tsx**.

## O que muda
- **Logo**: cérebro com cartola recortado, no topo da barra lateral e no cabeçalho do Painel.
- **Nome**: "Segundo cérebro de Alan".
- **Textura**: bem mais suave (véu de pergaminho sobre a imagem).
- **Cartões**: fundo claro sobre fundo escuro = contraste real, com faixa colorida por tema.
- **Paleta**: além do marrom — terracota, musgo, ameixa, azul-aço, latão, oliva, sépia.
- **Conexões neurais**: linha cheia = conexão confirmada; tracejado dourado animado =
  sugerida automaticamente (itens do mesmo tema ainda não ligados). Nós flutuam de leve,
  destacam ao passar o mouse, arrastam e abrem no clique.

## Observação técnica (GraphView)
As conexões "sugeridas automaticamente" são calculadas no próprio componente: itens que
compartilham o mesmo tema e ainda não têm conexão manual são ligados em cadeia (tracejado
dourado). É uma heurística visual — se quiser que virem conexões reais/salvas no banco,
me avise que eu adapto para gravar via API.
