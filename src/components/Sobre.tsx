const stack = [
  "Kubernetes",
  "ArgoCD",
  "GitOps",
  "Kustomize",
  "Gateway API",
  "VMware",
  "Nutanix",
  "Linux",
  "Windows Server",
  "Veeam",
  "Signoz",
  "Prometheus",
  "Grafana",
  "Zabbix",
];

export default function Sobre() {
  return (
    <section id="sobre" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-foreground">Sobre</h2>

        <div className="mt-8 grid gap-10 md:grid-cols-[2fr_1fr]">
          <div className="space-y-5 leading-relaxed text-foreground/80">
            <p>
              Atuo na linha de frente da infraestrutura de sistemas, sustentando
              ambientes críticos onde estabilidade não é opcional. Meu trabalho
              vai da orquestração de clusters Kubernetes (Gateway API, GitOps com
              ArgoCD, Kustomize) à gestão de centenas de máquinas virtuais em
              VMware e Nutanix, passando por observabilidade (Signoz, Prometheus,
              Grafana, Zabbix) e estratégias de Disaster Recovery com Veeam Backup.
            </p>
            <p>
              Para levar essa visão além da operação e para o design de
              arquitetura, criei a Nexuno (<a
                href="https://dev.nexuno.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-2 transition-colors hover:text-accent/80"
              >dev.nexuno.com.br</a>): uma plataforma SaaS multi-tenant que
              projetei, implementei e administro. Atualmente funciona como ambiente de
              desenvolvimento avançado (Landing Page e Tenants com ambiente DEV para testes de novas realeses e PROD para posterior lançamento efetivamente em produção) — já rodando dois tenants reais com
              sistemas de PDV e financeiro. É meu laboratório pessoal de
              arquitetura: cluster K3s com deploy 100% GitOps via ArgoCD,
              exposição segura via Cloudflare Tunnel e NGINX Gateway Fabric,
              autenticação SSO própria (EcoAuth, JWT), backend em FastAPI,
              frontend em Next.js, banco PostgreSQL 17 com isolamento lógico por
              tenant, e observabilidade completa com SigNoz e OpenTelemetry.
            </p>

            <div className="rounded-lg border border-accent/20 bg-accent/5 px-4 py-3">
              <p className="text-sm font-medium text-foreground">
                Acesso de demonstração (ambiente dev, somente leitura):
              </p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/80">
                <span>
                  Usuário:{" "}
                  <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-accent">
                    visitante@nexuno.com.br
                  </code>
                </span>
                <span>
                  Senha:{" "}
                  <code className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-accent">
                    Visitante@2026
                  </code>
                </span>
              </div>
            </div>
            <p>
              É nele que testo, erro e resolvo antes de aplicar qualquer decisão
              de arquitetura em ambiente crítico — e é o que me permite debugar um
              problema em qualquer camada da stack, da query no banco de dados ao
              manifesto de roteamento do cluster, porque eu desenhei cada peça
              dessa arquitetura.
            </p>
          </div>

          <div className="sticky top-24 self-start rounded-xl border border-white/5 bg-[#0e131b] p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Stack &amp; Ferramentas
            </h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-white/5 px-3 py-1 text-sm text-foreground/80"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
