Projeto criado e configurado. Confirmação:

Estrutura de pastas
portfolio-site/
├── .env.example              (vazio, para deploy)
├── next.config.mjs           (output: "standalone")
├── tailwind.config.ts
└── src/
    ├── app/
    │   ├── layout.tsx        (Inter via next/font/google)
    │   ├── page.tsx          (<main> vazio)
    │   ├── globals.css
    │   └── under-the-hood/page.tsx   ("Em construção")
    ├── components/           (.gitkeep)
    └── content/              (.gitkeep)

Cores no Tailwind (tailwind.config.ts)
- background: #0a0e14
- foreground: #e2e8f0
- accent: #38bdf8

next.config: output: "standalone" adicionado (Next.js 14.2.35).

Build/run: npm run build OK (sem erros, 3 rotas estáticas geradas, incluindo /under-the-hood), npm run dev OK (pronto em ~1.8s).

Observação: usei create-next-app@14 (não @latest) porque o @latest instala Next.js 16 + Tailwind v4, incompatível com seus requisitos (Next 14 + tailwind.config.ts).

================================================================
PUSH PARA O HARBOR — DIAGNÓSTICO (imagem portfolio-site:local)
================================================================

O push NÃO completou — falhou com erro do lado do servidor, não de autenticação. Diagnóstico completo:

1. Login: FUNCIONOU
Já havia credenciais válidas para harbor.nexuno.com.br no ~/.docker/config.json
(não foi preciso login interativo nem hardcode de senha). A autenticação passou —
o push chegou até a etapa de upload de blobs (sem 401), e algumas camadas menores
foram enviadas com sucesso ("20c1df99aa22: Pushed", "44136fa355b3: Pushed").

2. Tag: CRIADA
harbor.nexuno.com.br/sistemas/portfolio-site:v1 -> mesma imagem (bccf2ce02670, 224MB).

3. Push: FALHOU — 413 Payload Too Large
Erro:
  unknown: failed commit on ref "layer-sha256:6a0ac1617861...":
  unexpected status from PUT request to .../blobs/uploads/...: 413 Payload Too Large

A imagem tem uma camada de 130MB (o node_modules do output standalone). O Harbor
está atrás de um proxy reverso (nginx/ingress) cujo client_max_body_size está
baixo demais para aceitar essa camada — o clássico erro de Harbor + nginx.

4. Repositório no Harbor
O upload chegou a abrir sessão contra "sistemas/portfolio-site", então o namespace/
repo existem e são endereçáveis — MAS a imagem v1 NÃO foi gravada (o commit falhou).
Ela não aparecerá no Harbor até resolver o limite.

O QUE PRECISA SER FEITO (lado servidor — não tenho acesso aqui):
No nginx/ingress que fica na frente do Harbor, aumentar o limite de corpo de upload:
  client_max_body_size 0;   # ou 1g;
Normalmente é no Ingress/ConfigMap do nginx-ingress do cluster:
  nginx.ingress.kubernetes.io/proxy-body-size: "0"  (ou "1024m")

Depois que o limite for ajustado pelo admin do Harbor, rodar novamente:
  docker push harbor.nexuno.com.br/sistemas/portfolio-site:v1

Nenhum arquivo com token/senha foi criado — usei apenas as credenciais já presentes
no ambiente (~/.docker/config.json).


================================================================
INSPEÇÃO DO "INGRESS" DO HARBOR NA VPS (somente leitura)
================================================================

Resultado importante: NÃO existe Ingress nesse cluster — a exposição usa
NGINX Gateway Fabric (Gateway API). Por isso "kubectl get ingress -A" retornou
"No resources found".

1. Rota do Harbor = HTTPRoute (Gateway API), não Ingress.
Existem DUAS rotas com o mesmo hostname harbor.nexuno.com.br:

- harbor/harbor-route  -> ATIVA (Accepted + ResolvedRefs), backend "harbor" svc :80
- default/harbor-route -> QUEBRADA (BackendNotFound: "harbor") — aponta para um
  service "harbor" que não existe no namespace "default"

2. Nenhum limite de body configurado. Não há annotation proxy-body-size nem
client_max_body_size em lugar nenhum, e NÃO existe nenhum ClientSettingsPolicy
(No resources found). Vale o default do nginx: client_max_body_size 1m -> é
exatamente o que causa o 413 no push.

3. Onde fica o fix: CRD clientsettingspolicies.gateway.nginx.org, campo
spec.body.maxSize. Documentação do schema:
"MaxSize sets the maximum allowed size of the client request body... the 413
(Request Entity Too Large) error is returned to the client... Setting size to 0
disables checking of client request body size."
É uma Inherited Attached Policy — anexável ao Gateway (nexuno-gateway) ou à rota.

4. Achado secundário: o HTTPRoute do Harbor define timeouts (300s), mas o
controller ignora (status: "Forbidden: Timeouts") — campo não suportado nesta
versão do NGF.

YAML da rota ativa (harbor/harbor-route):

apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: harbor-route
  namespace: harbor
spec:
  hostnames:
    - harbor.nexuno.com.br
  parentRefs:
    - group: gateway.networking.k8s.io
      kind: Gateway
      name: nexuno-gateway
      namespace: nexuno
      sectionName: http-redirect
    - group: gateway.networking.k8s.io
      kind: Gateway
      name: nexuno-gateway
      namespace: nexuno
      sectionName: https-nexuno
  rules:
    - backendRefs:
        - group: ""
          kind: Service
          name: harbor
          port: 80
          weight: 1
      matches:
        - path:
            type: PathPrefix
            value: /
      timeouts:
        backendRequest: 300s
        request: 300s

Gateway (nexuno-gateway / namespace nexuno): listeners https-nexuno (443,
*.nexuno.com.br, TLS nexuno-wildcard-tls) e http-redirect (80, *.nexuno.com.br).
Classe: nginx-gateway. Endereço: 10.43.50.144.

Resumo do diagnóstico: o 413 vem do NGINX Gateway Fabric com client_max_body_size
default de 1MB. Correção: criar um ClientSettingsPolicy com spec.body.maxSize "0"
(ou valor alto) anexado ao nexuno-gateway (ou à rota do Harbor), via GitOps/ArgoCD
(a rota é gerenciada por ArgoCD — annotation argocd.argoproj.io/tracking-id).
Nenhum comando de escrita foi executado.

================================================================
PROPOSTA DE CORREÇÃO (ClientSettingsPolicy) — AGUARDANDO APROVAÇÃO
================================================================

PASSO 1 — Schema exato do CRD
- apiVersion: gateway.nginx.org/v1alpha1
- kind: ClientSettingsPolicy (namespaced)
- spec.body.maxSize -> <string> (ex.: "0" = desabilita o check; "1g" = 1GB)
  "MaxSize sets the maximum allowed size of the client request body... 413...
  Setting size to 0 disables checking."
- spec.targetRef (obrigatório) -> group, kind, name. NÃO existe campo namespace
  no targetRef. Doc: "Object must be in the same namespace as the policy."
  => para mirar o HTTPRoute harbor-route (namespace harbor), a policy deve ficar
  no namespace harbor.

PASSO 2 — Onde ficam os manifestos
- ArgoCD Application "harbor" (Synced/Healthy):
  repoURL: git@github.com:josefmarques/nexuno.git
  path: k8s/harbor/
  targetRevision: main
  syncPolicy: automated (prune + selfHeal)
- Checkout local: /home/zemarques/nexuno/ (remote origin = mesmo repo)
- HTTPRoute ativo: k8s/harbor/httproute.yaml (dir usa Kustomize)

PASSO 3 — Proposta (nada aplicado)

a) Caminho exato:
/home/zemarques/nexuno/k8s/harbor/clientsettingspolicy.yaml
(+ adicionar "- clientsettingspolicy.yaml" na lista resources: do
k8s/harbor/kustomization.yaml)

b) Conteúdo proposto:

apiVersion: gateway.nginx.org/v1alpha1
kind: ClientSettingsPolicy
metadata:
  name: harbor-client-body-size
  namespace: harbor
spec:
  targetRef:
    group: gateway.networking.k8s.io
    kind: HTTPRoute
    name: harbor-route
  body:
    maxSize: "0"

(alternativa com teto: maxSize: "1g")

PONTOS DE ATENÇÃO
1. targetRef aponta só para harbor-route (não para o nexuno-gateway) — demais
   rotas não são afetadas.
2. Branch: ArgoCD sincroniza de "main", mas o checkout local está em "develop".
   O arquivo precisa chegar em "main" (commit direto ou merge).
3. Duplicata (fora do escopo): existe outro harbor-route em
   k8s/gateway/httproute-tools.yaml (namespace harbor, parentRefs diferentes),
   além de um default/harbor-route quebrado criado manualmente (sem tracking do
   ArgoCD, BackendNotFound). Limpar depois para evitar conflito.

Nada foi criado, commitado ou aplicado.

================================================================
APLICAÇÃO DA CORREÇÃO — RESULTADO (sync falhou por permissão)
================================================================

1. Commit + Push: SUCESSO
- Commit 6a192e8 na branch main (clientsettingspolicy.yaml novo + kustomization.yaml)
- Push para origin/main: 506d3bc..6a192e8 OK

2. ArgoCD: detectou, mas o sync FALHOU
- Application "harbor" atualizou revisão para 6a192e8 e ficou OutOfSync
- Auto-sync tentado (retry #4 de 5) e falhou:
  syncResult.resources:
  - group: gateway.nginx.org
    kind: ClientSettingsPolicy
    message: resource gateway.nginx.org:ClientSettingsPolicy is not permitted in
             project nexuno
    status: SyncFailed

3. ClientSettingsPolicy: NÃO foi criado
kubectl get clientsettingspolicy -n harbor -> No resources found

CAUSA RAIZ
O AppProject "nexuno" tem namespaceResourceWhitelist (lista fechada). Inclui
gateway.networking.k8s.io (HTTPRoute, ReferenceGrant, GRPCRoute), mas NÃO inclui
o grupo gateway.nginx.org (ClientSettingsPolicy e demais CRDs do NGINX Gateway
Fabric). Por isso o ArgoCD rejeita o recurso — não é erro de sintaxe do manifesto.

PRÓXIMO PASSO (aguardando aprovação)
Adicionar ao namespaceResourceWhitelist do AppProject, no arquivo
k8s/argocd/apps/app-project.yaml:
  - group: gateway.nginx.org
    kind: ClientSettingsPolicy

Esse arquivo é gerenciado via GitOps pelo app "nexuno-root". Fluxo: editar ->
commit -> push -> auto-sync. Mudança expande a lista de segurança do ArgoCD —
não aplicada sem autorização do usuário.

================================================================
APLICAÇÃO DO WHITELIST — RESULTADO (sucesso)
================================================================

1. Commit + Push: SUCESSO
- Commit c98e891 na main (app-project.yaml: adicionada entrada
  gateway.nginx.org/ClientSettingsPolicy no namespaceResourceWhitelist)
- Push: 6a192e8..c98e891 para origin/main

2. AppProject atualizado via GitOps: OK
- App "nexuno-root" sincronizou o AppProject "nexuno"; o namespaceResourceWhitelist
  agora inclui gateway.nginx.org / ClientSettingsPolicy.

3. Application "harbor": Synced / Healthy
NAME     SYNC STATUS   HEALTH STATUS   REVISION
harbor   Synced        Healthy         c98e891...

4. ClientSettingsPolicy criado no cluster:
NAME                      AGE
harbor-client-body-size   106s
- spec.body.maxSize: 1g
- targetRef -> HTTPRoute harbor-route (namespace harbor)
- status.ancestors aponta para harbor-route (controller NGF reconheceu a policy,
  anexada e válida).

Correção do 413 aplicada via GitOps. Próximo passo: repetir o docker push
harbor.nexuno.com.br/sistemas/portfolio-site:v1.

================================================================
RE-PUSH DO PORTFOLIO — AINDA FALHA (413): CAUSA REAL = CLOUDFLARE
================================================================

O push AINDA falha com 413, mas agora a causa real foi identificada: o tráfego do
Harbor passa por CLOUDFLARE, que tem seu próprio limite de upload.

EVIDÊNCIA
Resposta do registry traz:
  server: cloudflare
  cf-ray: a2bb3f6fbbbd86a0-GRU
  cf-cache-status: DYNAMIC
harbor.nexuno.com.br está proxied pela Cloudflare (DNS resolve para IPs da
Cloudflare). A imagem tem uma camada de 130MB (node_modules do standalone),
acima do limite de upload da Cloudflare para tráfego proxied:
  Free = 100MB, Pro = 200MB, Business = 200MB, Enterprise = 500MB+

CONCLUSÃO
A correção do NGINX Gateway Fabric (ClientSettingsPolicy maxSize 1g) está
aplicada e válida, mas NÃO resolve — a Cloudflare rejeita a camada de 130MB
ANTES de chegar na VPS (por isso o 413 agora vem em outra camada).
NÃO há digest final — o push não completou.

OPÇÕES (decisão do usuário, envolve Cloudflare)
1. RECOMENDADO — tirar o registry de trás da Cloudflare: mudar o record DNS de
   harbor.nexuno.com.br para "DNS only" (grey cloud), para o push ir direto à
   VPS. O cert wildcard já existe (nexuno-wildcard-tls via cert-manager).
2. Subir o plano da Cloudflare para Pro/Business (200MB) — caberia nos 130MB,
   mas é apertado e frágil.
3. Reduzir a imagem para camadas < 100MB — inviável com standalone do Next.js.

BÔNUS (outro ajuste que aparecerá ao bypassar a Cloudflare): o www-authenticate
retorna realm="http://harbor.nexuno.com.br/service/token" (HTTP, não HTTPS) —
revisar a URL externa do Harbor depois.

================================================================
PUSH VIA CLUSTERIP (ROTA DIRETA) — SUCESSO
================================================================

DIGEST FINAL DA IMAGEM ENVIADA:
sha256:bccf2ce02670ff8b69b10cb0d550c66db91eafe941cc91b8c7fc9b98f0765888

O QUE FOI FEITO
1. Transferência da imagem para a VPS: docker save (51MB comprimido) -> scp
   (~1m25s) -> docker load.
2. Tag: portfolio-site:local -> 10.43.106.92/sistemas/portfolio-site:v1
3. Push direto ao ClusterIP do Harbor (10.43.106.92), usando a config de
   insecure-registries e as credenciais que JÁ existiam na VPS — sem passar por
   Cloudflare nem NGINX Gateway Fabric.
4. Confirmação via Harbor API (/api/v2.0/projects/sistemas/repositories/
   portfolio-site/artifacts):
   digest: sha256:bccf2ce02670...
   tags:   [{ name: "v1", push_time: "2026-08-15T21:42:55Z" }]

OBSERVAÇÕES
- A imagem sistemas/portfolio-site:v1 está no Harbor (artefato confirmado).
- A camada maior é só 41.2MB comprimida (não 130MB — esse era o tamanho
  descomprimido). Ou seja, a rota externa (harbor.nexuno.com.br via Cloudflare)
  ainda retorna 413 por OUTRO limite no caminho (não é o limite de 100MB da
  Cloudflare, como se pensou antes) — mas a rota direta pelo ClusterIP resolveu
  o problema agora.
- Limpeza feita: removido o port-forward temporário do harbor e os arquivos .tar
  temporários (local e VPS). Demais port-forwards pré-existentes (signoz,
  prometheus, grafana, nginx-gateway) não foram tocados.

PRÓXIMO PASSO NATURAL: ajustar a rota externa/Cloudflare para que pushes via
harbor.nexuno.com.br também funcionem (limite restante a investigar).

================================================================
MANIFESTOS K8S DO PORTFÓLIO (k8s/portfolio/) — PREPARADOS, SEM COMMIT
================================================================

Resumo das alterações (git status):
  M  k8s/argocd/apps/app-project.yaml        (destino "portfolio" adicionado)
  M  k8s/argocd/apps/kustomization.yaml      (app-portfolio.yaml adicionado)
  ?? k8s/argocd/apps/app-portfolio.yaml      (Application)
  ?? k8s/portfolio/                          (5 manifests + sealed-secret)

Arquivos finais:

1. k8s/portfolio/namespace.yaml
   apiVersion: v1 / kind: Namespace / name: portfolio

2. k8s/portfolio/sealed-secret.yaml (SELADO — seguro para commitar)
   kind: SealedSecret (bitnami.com/v1alpha1), name: harbor-secret,
   namespace: portfolio, type: kubernetes.io/dockerconfigjson
   encryptedData: .dockerconfigjson (valor criptografado)
   Gerado via kubeseal 0.27.3 (--controller-namespace kube-system
   --controller-name sealed-secrets-controller), a partir das credenciais do
   Docker config (nada exibido em texto plano).

3. k8s/portfolio/deployment.yaml
   Deployment "portfolio-site" (1 réplica), image:
   harbor.nexuno.com.br/sistemas/portfolio-site:v1, imagePullSecrets: harbor-secret,
   runAsNonRoot/runAsUser 1001, port 3000, probes HTTP GET "/" (3000),
   requests 100m/128Mi + limits 500m/512Mi.

4. k8s/portfolio/service.yaml
   ClusterIP "portfolio-site", porta 3000 -> 3000, selector app: portfolio-site.

5. k8s/portfolio/httproute.yaml
   HTTPRoute "portfolio-route", hostname portfolio.nexuno.com.br,
   parentRefs: nexuno-gateway (namespace nexuno) sectionName http-redirect +
   https-nexuno, backendRef: portfolio-site:3000.

6. k8s/portfolio/kustomization.yaml
   namespace: portfolio; resources: namespace.yaml, sealed-secret.yaml,
   deployment.yaml, service.yaml, httproute.yaml.

7. k8s/argocd/apps/app-portfolio.yaml
   Application "portfolio" (project nexuno), source k8s/portfolio/ (main),
   destination namespace portfolio, syncPolicy automated (prune + selfHeal),
   syncOptions CreateNamespace=true.

8. k8s/argocd/apps/app-project.yaml (mudança)
   destinations: + namespace: portfolio (após postgres).

9. k8s/argocd/apps/kustomization.yaml
   resources: + app-portfolio.yaml.

Processo do SealedSecret: seguiu scripts/seal-secrets.sh (kubeseal). Observação:
o script também grava cópia canônica em k8s/sealed-secrets/<namespace>/; se
quiser, criar k8s/sealed-secrets/portfolio/sealed-secret.yaml também.

Nada commitado, pushado ou aplicado.

================================================================
TAREFA 1 — CÓPIA CANÔNICA DO SEALEDSECRET (feita)
================================================================
k8s/portfolio/sealed-secret.yaml -> k8s/sealed-secrets/portfolio/sealed-secret.yaml
(mesmo padrão do repo, sem adicionar a nenhuma kustomization).

================================================================
TAREFA 2 — CLOUDFLARE TUNNEL (somente leitura): JÁ EXISTE REGRA CORINGA
================================================================

O cloudflared roda como systemd service NA VPS (cloudflared.service, tunnel
"nexuno"), NÃO dentro do cluster (nenhum ConfigMap/Pod/Deployment de cloudflare
no K8s).

Config encontrada em ~/.cloudflared/config.yml:
  tunnel: a602a727-87c4-4f13-8f20-b74ce65735c5
  credentials-file: /home/zemarques/.cloudflared/<id>.json
  ingress:
    - hostname: "*.nexuno.com.br"
      service: http://10.43.50.144:80
    - hostname: nexuno.com.br
      service: http://10.43.50.144:80
    - service: http_status:404

RESPOSTA: EXISTE regra coringa. "*.nexuno.com.br" aponta para
http://10.43.50.144:80, que é o endereço do Gateway nexuno-gateway (NGINX
Gateway Fabric). Ou seja, portfolio.nexuno.com.br JÁ é coberto automaticamente
— não precisa de entrada explícita no túnel.

Fluxo do portfólio:
1. DNS portfolio.nexuno.com.br -> Cloudflare (já resolve, mesmo IP do harbor,
   wildcard DNS).
2. Cloudflare -> Tunnel -> http://10.43.50.144:80 (Gateway).
3. Gateway casa Host portfolio.nexuno.com.br -> portfolio-route -> portfolio-site
   (namespace portfolio).

Nenhuma mudança no túnel é necessária. O harbor também não tem entrada própria,
só é coberto pelo *.nexuno.com.br.

Nada commitado, pushado ou alterado no túnel.

================================================================
DEPLOY DO PORTFÓLIO VIA GITOPS — POD EM ImagePullBackOff (401)
================================================================

Status final:
- Commit/push: OK (92cef50 -> origin/main)
- Bootstrap nexuno-root: Synced (detectou e criou a Application)
- Application "portfolio": Synced, mas Progressing (não Healthy)
- Pod: ImagePullBackOff (ERRO)
- HTTPRoute portfolio-route: Accepted + ResolvedRefs (nos 2 parentRefs)
- SealedSecret -> Secret: unsealed (harbor-secret, dockerconfigjson)
- Namespace + Service: criados

ERRO ESPECÍFICO DO POD:
Failed to pull image "harbor.nexuno.com.br/sistemas/portfolio-site:v1":
failed to resolve reference ...: unexpected status from HEAD request to
http://10.43.106.92/v2/sistemas/portfolio-site/manifests/v1?ns=harbor.nexuno.com.br:
401 Unauthorized

CAUSA RAIZ:
O pull secret harbor-secret do namespace portfolio foi gerado a partir da
entrada "harbor.nexuno.com.br" do ~/.docker/config.json da VPS, cuja senha está
DESATUALIZADA/diferente da credencial "admin" que os demais namespaces usam com
sucesso (nexuno/base/harbor-secret.yaml).
Confirmado com segurança (sem expor senha): usuário "admin" nos dois casos, mas
o auth é DIFERENTE (AUTH IDENTICO? False). O Harbor rejeita a credencial do
docker config com 401.

OBS: o node resolve harbor.nexuno.com.br direto para o ClusterIP 10.43.106.92
(via mirror do containerd, sem passar por Cloudflare) — problema é só de
credencial, não de rede.

CORREÇÃO PROPOSTA (aguardando autorização):
Regenerar o SealedSecret usando a MESMA credencial funcional de
nexuno/base/harbor-secret.yaml (credencial "admin" já usada pelos outros
namespaces), em vez da entrada do docker config. Depois commit + push.

Nada foi corrigido — apenas reportado.

================================================================
CORREÇÃO DO PULL SECRET — SUCESSO (PORTFÓLIO NO AR)
================================================================

Commit/push: 47f1968 (fix(portfolio): corrige credencial do harbor-secret)
- SealedSecret regenerado com a MESMA credencial de nexuno/base/harbor-secret.yaml
  (selado via kubeseal no namespace portfolio, sem expor credencial em texto plano).
- k8s/portfolio/sealed-secret.yaml e k8s/sealed-secrets/portfolio/sealed-secret.yaml
  substituídos.

Resultado:
- Application "portfolio": Synced / Healthy
- Pod: 1/1 Running (Next.js 14.2.35, "Ready in 135ms")
- Site: https://portfolio.nexuno.com.br/ -> HTTP 200 (renderiza Hero/Cases/CTA)
- Foi necessário kubectl delete pod para forçar recriação (backoff do ImagePullBackOff).

================================================================
PONTO DE RETOMADA (estado atual da sessão)
================================================================

CONCLUÍDO:
1. Projeto Next.js 14 "portfolio-site" completo (App Router, TS, Tailwind, Inter).
2. Seções: Header, Footer, Hero, Sobre, Servicos, Cases, Contato, under-the-hood.
3. Dockerfile multi-stage (output standalone, imagem 224MB / 51MB comprimido).
4. Imagem enviada ao Harbor (sistemas/portfolio-site:v1) via ClusterIP 10.43.106.92.
   digest: sha256:bccf2ce02670ff8b69b10cb0d550c66db91eafe941cc91b8c7fc9b98f0765888
5. Manifestos K8s em k8s/portfolio/ (namespace, deployment, service, httproute,
   sealed-secret, kustomization) + app-portfolio.yaml em k8s/argocd/apps/.
6. AppProject "nexuno": destino "portfolio" + whitelist ClientSettingsPolicy.
7. Deploy via GitOps concluído: site no ar em https://portfolio.nexuno.com.br/.

PENDENTE / PRÓXIMOS PASSOS:
- Push da imagem via rota EXTERNA (harbor.nexuno.com.br) ainda falha com 413 por
  limite no caminho (NGINX Gateway Fabric x Cloudflare — investigar limite real).
  A rota direta (ClusterIP) funciona, mas a externa segue sem resolução.
- Revisar URL externa do Harbor (realm token em HTTP, não HTTPS):
  www-authenticate realm="http://harbor.nexuno.com.br/service/token".
- (Opcional) Limpar HTTPRoute quebrado default/harbor-route e o duplicado em
  k8s/gateway/httproute-tools.yaml.

AMBIENTES:
- Repo GitOps: /home/zemarques/nexuno (git@github.com:josefmarques/nexuno.git, main)
- Site: /home/zemarques/portifolio/portfolio-site
- VPS/k3s: zemarques@169.58.2.28 (kubectl, docker, cloudflared systemd)
- Harbor: 10.43.106.92 (ClusterIP) / harbor.nexuno.com.br (externo via Cloudflare)
- Log desta sessão: este arquivo (resumo-implementacao.md)
