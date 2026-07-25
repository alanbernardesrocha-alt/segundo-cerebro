# Segundo Cérebro

Um app pessoal para escrever anotações, guardar referências (arquivos, links,
artigos) e conectar tudo isso entre si, organizado por temas.

## Funcionalidades

- **Temas** (espaços): organize suas anotações e referências por assunto, cada
  um com uma cor própria.
- **Itens**: três tipos — anotação em markdown, link externo, ou arquivo
  enviado (PDF, imagem, doc, etc).
- **Conexões**: ligue qualquer item a outro para registrar relações entre
  ideias, referências e anotações.
- **Grafo visual**: veja as conexões entre itens como um grafo interativo
  (arraste os nós, clique para abrir), geral ou filtrado por tema.
- **Busca**: encontre qualquer anotação, link ou arquivo pelo título ou
  conteúdo.

Sem login — feito para uso pessoal em um único usuário.

## Stack técnica

- [Next.js](https://nextjs.org/) (App Router) + TypeScript
- [Prisma](https://www.prisma.io/) + SQLite (banco em arquivo local)
- [Tailwind CSS](https://tailwindcss.com/)
- Arquivos enviados ficam salvos em `uploads/` no disco local
- Grafo renderizado com `d3-force` + SVG

## Como rodar

```bash
npm install
npx prisma migrate deploy   # cria/atualiza o banco em prisma/dev.db
npm run dev                 # http://localhost:3000
```

Para build de produção:

```bash
npm run build
npm start
```

> Importante: rode `npx prisma migrate deploy` (ou `migrate dev` em
> desenvolvimento) antes do primeiro `build`/`start` — as páginas consultam o
> banco durante a geração, então ele precisa existir e estar migrado.

## Estrutura

```
prisma/schema.prisma      Modelos: Space (tema), Item (nota/arquivo/link), Connection
src/app/                  Páginas (App Router) e rotas de API
src/components/           Componentes de UI (client-side)
src/lib/                  Prisma client, tipos e utilitários
uploads/                  Arquivos enviados pelo usuário (não versionado)
```

## Dados e armazenamento

- O banco de dados fica em `prisma/dev.db` (SQLite), ignorado pelo git.
- Os arquivos enviados ficam em `uploads/`, também ignorado pelo git.
- Para fazer backup, basta copiar `prisma/dev.db` e a pasta `uploads/`.
