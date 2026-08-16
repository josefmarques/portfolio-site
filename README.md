# Portfolio — José Marques

Site de portfólio pessoal de **José Marques**, DevOps & Infraestrutura Cloud-Native. Apresenta experiência profissional, serviços, estudos de caso e uma página de bastidores ("Arquitetura") com decisões de arquitetura.

Produção: <https://portfolio.nexuno.com.br>

## Stack técnica

- **Next.js 14** (App Router) — framework React
- **TypeScript**
- **Tailwind CSS 3** — estilização
- **lucide-react** — ícones
- **next/font/google** — fonte Inter

Node.js: a imagem Docker usa **Node 20** (alpine); localmente, qualquer versão >= 18.17 (mínimo exigido pelo Next.js 14) funciona.

## Estrutura do projeto

```
src/
├── app/
│   ├── layout.tsx        # layout raiz (fonte Inter, metadados, Header e Footer)
│   ├── page.tsx          # página inicial — compõe as seções
│   ├── globals.css       # Tailwind + variáveis de cor do tema
│   └── arquitetura/
│       └── page.tsx      # "Arquitetura" — decisões de arquitetura em detalhe
├── components/
│   ├── Header.tsx        # navegação fixa (com menu mobile)
│   ├── Hero.tsx          # seção de abertura (nome, título, chamada, CTAs)
│   ├── Sobre.tsx         # "Sobre" + card sticky "Stack & Ferramentas"
│   ├── Servicos.tsx      # grade de serviços
│   ├── Cases.tsx         # estudos de caso em acordeão
│   ├── Contato.tsx       # cards de contato (e-mail, LinkedIn, GitHub)
│   └── Footer.tsx        # rodapé com links sociais e "Arquitetura"
└── content/              # reservado para conteúdo futuro (vazio por ora)
```

## Rodando localmente

```bash
git clone https://github.com/josefmarques/portfolio-site.git
cd portfolio-site
npm install
npm run dev
```

Acesse <http://localhost:3000>.

Não há variáveis de ambiente obrigatórias — o `.env.example` está vazio.

## Build e Deploy

O projeto é **containerizado** via Dockerfile multi-stage (dependências → build → runtime), tirando proveito do `output: "standalone"` do Next.js para gerar uma imagem enxuta contendo apenas o necessário para produção. O container roda como usuário não-root na porta 3000.

Fluxo de deploy (em nível conceitual):

1. **Build da imagem** Docker a partir do Dockerfile.
2. **Publicação** da imagem em um registry privado.
3. **Atualização da tag** da imagem no manifesto do Deployment.
4. **GitOps** — o ArgoCD detecta a mudança no repositório e aplica o novo estado automaticamente.
5. **Exposição** — roteamento via Kubernetes Gateway API, com a borda protegida por Cloudflare Tunnel.

O ambiente de produção roda em um **cluster Kubernetes próprio (K3s)**, gerenciado 100% via GitOps.

## Convenção de versionamento de imagem

A tag da imagem é incrementada **manualmente** a cada deploy (`v1`, `v2`, `v3`, ...). Para que um novo deploy aconteça, o `Deployment` no Kubernetes precisa ser atualizado com a nova tag — cada versão recebe uma tag nova, e a imagem anterior não é sobrescrita.

## Licença e autoria

Autor: **José Marques**.

O conteúdo do site (textos, casos e demais materiais) é **autoral** e não deve ser reutilizado sem permissão. O código-fonte, porém, fica disponível como referência e para estudo.
