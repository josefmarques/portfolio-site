import {
  Activity,
  AlertTriangle,
  Boxes,
  GitBranch,
  Network,
  ShieldCheck,
} from "lucide-react";

const servicos = [
  {
    icon: AlertTriangle,
    titulo: "Troubleshooting Emergencial",
    descricao:
      "Ambiente caiu ou está instável? Diagnóstico rápido e resolução de incidentes críticos em produção.",
  },
  {
    icon: Boxes,
    titulo: "Migração para Kubernetes",
    descricao:
      "Saia de servidores tradicionais para uma arquitetura cloud-native, com Gateway API e GitOps desde o primeiro dia.",
  },
  {
    icon: GitBranch,
    titulo: "Automação de Deploys (CI/CD)",
    descricao:
      "Pipelines confiáveis que eliminam deploy manual e reduzem risco de erro humano em produção.",
  },
  {
    icon: Activity,
    titulo: "Observabilidade & Monitoramento",
    descricao:
      "Visibilidade real do seu ambiente com Prometheus, Grafana, Zabbix ou Signoz — veja problemas antes do cliente.",
  },
  {
    icon: ShieldCheck,
    titulo: "Disaster Recovery & Backup",
    descricao:
      "Estratégias de backup e recuperação de desastres com Veeam, para seu negócio nunca ficar exposto a perda de dados.",
  },
  {
    icon: Network,
    titulo: "Arquitetura de Infraestrutura",
    descricao:
      "Desenho de arquitetura sob medida para o seu ambiente, do datacenter à nuvem.",
  },
];

export default function Servicos() {
  return (
    <section id="servicos" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-foreground">Serviços</h2>
        <p className="mt-3 text-foreground/60">
          Soluções diretas para problemas reais de infraestrutura — sem enrolação.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicos.map(({ icon: Icon, titulo, descricao }) => (
            <div
              key={titulo}
              className="rounded-xl border border-white/5 bg-[#0e131b] p-6 transition-colors duration-300 hover:border-accent"
            >
              <Icon className="text-accent" size={28} />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {titulo}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
