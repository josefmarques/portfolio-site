import Link from "next/link";

const decisoes = [
  {
    titulo: "Orquestração e Deploy",
    descricao:
      "Cluster K3s (Kubernetes leve) com fluxo de deploy 100% gerenciado por GitOps via ArgoCD — toda mudança de infraestrutura é versionada e auditável. Isolamento entre ambientes e tenants via namespaces dedicados e patches Kustomize.",
  },
  {
    titulo: "Rede e Exposição",
    descricao:
      "Borda protegida por Cloudflare Tunnel, eliminando exposição de IP público. Tráfego interno roteado pelo NGINX Gateway Fabric sob o padrão Gateway API do Kubernetes.",
  },
  {
    titulo: "Aplicação",
    descricao:
      "Frontend em Next.js, servindo landing page central e interfaces customizadas por tenant via proxy de rotas dinâmicas em middleware. Backend em FastAPI (Python).",
  },
  {
    titulo: "Autenticação",
    descricao:
      "Sistema próprio de SSO (EcoAuth), baseado em JWT e cookies de sessão, permitindo autenticação fluida entre subdomínios dos diferentes tenants.",
  },
  {
    titulo: "Dados",
    descricao:
      "Instância única de PostgreSQL 17, com isolamento lógico rígido — database exclusivo por tenant e por ambiente, evitando vazamento cruzado de dados entre clientes.",
  },
  {
    titulo: "Segurança Operacional",
    descricao:
      "Imagens Docker versionadas em registry próprio (Harbor), certificados TLS automatizados via cert-manager, credenciais protegidas com SealedSecrets — nenhum segredo em texto plano no repositório GitOps.",
  },
  {
    titulo: "Observabilidade",
    descricao:
      "Métricas, traces e logs centralizados no SigNoz via OpenTelemetry, dando visibilidade ponta a ponta desde a requisição HTTP até a query no banco.",
  },
];

export default function UnderTheHood() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="inline-flex items-center rounded-full border border-accent bg-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-accent">
        PROJETO PESSOAL — EM DESENVOLVIMENTO ATIVO
      </span>

      <h1 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
        Nexuno: arquitetura SaaS multi-tenant do zero
      </h1>

      <p className="mt-4 max-w-2xl leading-relaxed text-foreground/60">
        Este não é um case de resolução de incidente — é a demonstração de como
        projeto arquitetura completa, do design à operação em produção.
      </p>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-foreground">O Desafio</h2>
        <p className="mt-4 leading-relaxed text-foreground/70">
          Projetar, do zero, uma plataforma SaaS B2B multi-tenant capaz de
          atender múltiplos clientes isolados logicamente sob um único domínio —
          incluindo sistemas de missão relevante para cada cliente, como PDV
          (ponto de venda) e módulo financeiro — sem comprometer segurança,
          isolamento de dados ou capacidade de evoluir a plataforma de forma
          independente por tenant.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-foreground">
          Decisões de Arquitetura
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {decisoes.map((d) => (
            <div
              key={d.titulo}
              className="rounded-xl border border-white/5 bg-[#0e131b] p-6"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {d.titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {d.descricao}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-foreground">Status Atual</h2>
        <div className="mt-4 rounded-xl border border-accent/50 bg-accent/5 p-6">
          <p className="leading-relaxed text-foreground/80">
            O Nexuno está em desenvolvimento ativo, com dois tenants reais em
            operação de testes (sistemas de PDV e financeiro), validando a
            arquitetura multi-tenant com dados e fluxos de uso reais antes de um
            lançamento formal em produção.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-foreground">
          Por que isso importa
        </h2>
        <p className="mt-4 leading-relaxed text-foreground/70">
          Esse projeto mostra a diferença entre saber operar Kubernetes e saber
          decidir a arquitetura certa para o problema certo. Cada peça da stack
          acima foi uma escolha deliberada — não um template copiado — e cada uma
          delas pode ser explicada e defendida tecnicamente, porque foi este
          profissional quem tomou a decisão e quem sustenta o resultado no dia a
          dia.
        </p>
      </section>

      <div className="mt-16 flex justify-center">
        <Link
          href="/"
          className="text-sm font-medium text-accent transition-colors hover:text-accent/80"
        >
          ← Voltar para o portfólio
        </Link>
      </div>
    </div>
  );
}
