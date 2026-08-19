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
          <div className="space-y-6 leading-relaxed text-foreground/80">
            <p>
              Atuo na linha de frente da infraestrutura de sistemas, sustentando
              ambientes críticos onde estabilidade não é opcional. Meu trabalho
              vai da orquestração de clusters Kubernetes (Gateway API, GitOps com
              ArgoCD, Kustomize) à gestão de centenas de máquinas virtuais em
              VMware e Nutanix, passando por observabilidade (Signoz, Prometheus,
              Grafana, Zabbix) e estratégias de Disaster Recovery com Veeam Backup.
            </p>
            
            <p>
              Para levar essa visão além da operação e aplicar conceitos avançados 
              de arquitetura, construí a <strong>Nexuno</strong>, uma plataforma SaaS multi-tenant de 
              gestão de PDV e finanças. Ela funciona como meu laboratório pessoal de engenharia: 
              um cluster K3s com deploy 100% GitOps via ArgoCD, exposição segura via Cloudflare 
              Tunnel e NGINX Gateway Fabric, SSO próprio (EcoAuth), backend em FastAPI, frontend 
              em Next.js e banco PostgreSQL 17 com isolamento lógico.
            </p>

            <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 shadow-sm">             
              <div className="mb-4 space-y-2 border-b border-accent/20 pb-4">
                <h4 className="flex items-center text-base font-semibold text-foreground">
                  <span className="mr-2">🚧</span> Ambiente de Demonstração (DEV)
                </h4>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  O link abaixo dá acesso ao ambiente de <strong>Desenvolvimento</strong> da plataforma. 
                  Este ecossistema está em constante evolução e é configurado com acesso estrito de <strong>Somente Leitura</strong>. 
                  Por ser utilizado ativamente para testes de novas <i>releases</i>, a interface ou os dados fictícios podem 
                  apresentar diferenças pontuais em relação à versão oficial de Produção.
                </p>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm font-medium text-foreground">Acesso:</span>
                  <a
                    href="https://dev.nexuno.com.br/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline underline-offset-4 transition-colors hover:text-accent/80 font-medium"
                  >
                    https://dev.nexuno.com.br/
                  </a>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-foreground/80">
                  <span className="flex items-center gap-2">
                    Usuário:
                    <code className="rounded bg-black/20 px-2 py-1 font-mono text-accent border border-white/5">
                      visitante@nexuno.com.br
                    </code>
                  </span>
                  <span className="flex items-center gap-2">
                    Senha:
                    <code className="rounded bg-black/20 px-2 py-1 font-mono text-accent border border-white/5">
                      Visitante@2026
                    </code>
                  </span>
                </div>
              </div>
            </div>
            
            <p>
              É nesse ambiente que testo hipóteses, erro e implemento soluções antes de aplicar qualquer decisão
              de arquitetura em produção. Ter desenhado e administrado essa plataforma de ponta a ponta 
              é o que me permite debugar um problema em qualquer camada da stack — desde uma query pesada no banco 
              de dados até um manifesto de roteamento quebrado no cluster.
            </p>
          </div>

          <div className="sticky top-24 self-start rounded-xl border border-white/5 bg-[#0e131b] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">
              Stack &amp; Ferramentas
            </h3>
            <div className="mt-5 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:bg-white/10 hover:text-foreground"
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