"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const cases = [
  {
    numero: "01",
    titulo: "Falha crítica de roteamento no Kubernetes Gateway API",
    blocos: [
      {
        label: "O Problema",
        texto:
          "Durante a configuração de rotas de tráfego em um cluster Kubernetes, os manifestos de infraestrutura passaram a ser rejeitados pelo cluster, impedindo a aplicação das regras de roteamento (HTTPRoutes) e colocando em risco a disponibilidade do serviço.",
      },
      {
        label: "O Diagnóstico",
        texto:
          "Analisando os logs de deploy, identifiquei um strict decoding error. O problema não era a infraestrutura em si, mas uma mudança de sintaxe na Gateway API que passou a rejeitar manifestos estruturados fora do novo padrão.",
      },
      {
        label: "A Solução",
        texto:
          "Refatorei os manifestos YAML, movendo os campos de timeout — que estavam soltos dentro de spec.rules — para dentro do objeto timeouts correto. Em paralelo, ajustei os patches do Kustomize para os diferentes ambientes (dev/prod) e revisei o gerenciamento dos SealedSecrets envolvidos no deploy.",
      },
      {
        label: "O Resultado",
        texto:
          "Roteamento restaurado com tráfego estável e seguro, sem necessidade de rollback ou downtime prolongado.",
      },
    ],
  },
  {
    numero: "02",
    titulo: "Recuperação de crash por incompatibilidade de versão no PostgreSQL",
    blocos: [
      {
        label: "O Problema",
        texto:
          "Queda catastrófica de conexão com o banco de dados em ambiente containerizado, derrubando completamente o backend da aplicação.",
      },
      {
        label: "O Diagnóstico",
        texto:
          "Nos logs do contêiner, encontrei o erro fatal database files are incompatible. Investigando a causa raiz, identifiquei um desalinhamento de versões: os arquivos físicos de dados pertenciam a um PostgreSQL 15, mas o contêiner que havia subido estava rodando PostgreSQL 17.",
      },
      {
        label: "A Solução",
        texto:
          "Isolei imediatamente o banco para evitar corrupção adicional dos dados, e realinhei as versões dos contêineres com os volumes de dados correspondentes, restabelecendo a compatibilidade entre o motor do banco e os arquivos lógicos existentes.",
      },
      {
        label: "O Resultado",
        texto:
          "Conexão e backend totalmente restaurados, sem perda de dados — o ponto mais crítico em qualquer incidente de banco de dados em produção.",
      },
    ],
  },
  {
    numero: "03",
    titulo: "Expansão de volume Linux (LVM) a quente, sem downtime",
    blocos: [
      {
        label: "O Problema",
        texto:
          "Uma máquina de gerência crítica atingiu o limite de armazenamento físico, com risco iminente de travamento dos serviços e impossibilidade de gravar novos logs ou dados operacionais.",
      },
      {
        label: "O Diagnóstico",
        texto:
          "Monitorando o uso de disco via terminal, identifiquei que o gargalo estava no volume lógico principal (ubuntu-lv), que estava estrangulando os processos do sistema operacional.",
      },
      {
        label: "A Solução",
        texto:
          "Mapeei a estrutura de discos com lvdisplay e executei um lvextend para expandir o volume lógico, alocando o espaço livre disponível no grupo de volumes (VG).",
      },
      {
        label: "O Resultado",
        texto:
          "Armazenamento expandido a quente, sem interrupção de serviço e sem necessidade de migração de dados.",
      },
    ],
  },
  {
    numero: "04",
    titulo: "Modernização de autenticação e segurança em pipelines Git/CI-CD",
    blocos: [
      {
        label: "O Problema",
        texto:
          "Falhas intermitentes e bloqueios de autenticação ao sincronizar repositórios e executar pipelines de infraestrutura, comprometendo a confiabilidade da esteira de deploy.",
      },
      {
        label: "O Diagnóstico",
        texto:
          "O fluxo utilizava autenticação legada via senha sobre HTTPS — método descontinuado pelos provedores Git e que representa risco de segurança para o acesso a repositórios de código de infraestrutura.",
      },
      {
        label: "A Solução",
        texto:
          "Migrei todo o fluxo de autenticação para chaves SSH com criptografia moderna (ed25519), registrei as chaves públicas corretamente e configurei o SSH Agent para automatizar o processo no ambiente de trabalho (WSL).",
      },
      {
        label: "O Resultado",
        texto:
          "Autenticação blindada e falhas de conexão eliminadas permanentemente, alinhando o processo de deploy aos padrões atuais de segurança de acesso.",
      },
    ],
  },
  {
    numero: "05",
    titulo: "Padronização de pipelines CI/CD para múltiplos projetos",
    blocos: [
      {
        label: "O Problema",
        texto:
          "Boa parte dos projetos de desenvolvimento de uma organização não tinha pipeline de CI/CD configurada — o deploy era feito manualmente via scripts locais. Os poucos projetos que já tinham alguma pipeline exigiam execução manual a cada alteração. Na prática, uma simples atualização de código dependia de abertura de chamado, fila de atendimento e execução manual por outra pessoa — um processo lento, sujeito a erro humano e que tirava autonomia do desenvolvedor sobre o próprio trabalho.",
      },
      {
        label: "O Diagnóstico",
        texto:
          "O gargalo não era técnico isoladamente — era a ausência de um padrão reutilizável de pipeline que os times de desenvolvimento pudessem simplesmente herdar, sem precisar reinventar a esteira de CI/CD a cada novo projeto.",
      },
      {
        label: "A Solução",
        texto:
          "Criei um conjunto de templates de pipeline reutilizáveis (GitLab CI), com build de imagem via Kaniko, cobrindo múltiplos ambientes (dev, homologação e produção) com regras de gatilho distintas por branch/tag. O deploy é integrado diretamente com o repositório de manifestos Kubernetes, aplicando a nova versão automaticamente após o build, e encerrando com uma etapa de validação HTTP que confirma se a aplicação subiu corretamente. Qualquer novo projeto passou a poder adotar o mesmo padrão apenas referenciando os templates centrais, sem reescrever a esteira do zero.",
      },
      {
        label: "O Resultado",
        texto:
          "O que antes dependia de abertura de chamado, espera na fila de atendimento e execução manual por terceiros — um processo que levava horas ou dias — passou a acontecer automaticamente a cada push. O desenvolvedor agora visualiza e confirma o resultado do próprio deploy em minutos, sem intermediários, com redução direta de erro humano no processo.",
      },
    ],
  },
];

export default function Cases() {
  const [open, setOpen] = useState<Set<number>>(new Set());

  function toggle(index: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <section id="cases" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-foreground">Casos Técnicos</h2>
        <p className="mt-3 text-foreground/60">
          Problemas reais, resolvidos na prática. Clique para ver o diagnóstico
          completo.
        </p>

        <div className="mt-10 flex flex-col gap-4">
          {cases.map((c, index) => {
            const isOpen = open.has(index);
            return (
              <div
                key={c.numero}
                className="rounded-lg border border-white/5 bg-[#0e131b]"
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-accent">
                      {c.numero}
                    </span>
                    <span className="font-semibold text-foreground">
                      {c.titulo}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-foreground/60 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="space-y-6 px-6 pb-6">
                      {c.blocos.map((b) => (
                        <div key={b.label}>
                          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                            {b.label}
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                            {b.texto}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
