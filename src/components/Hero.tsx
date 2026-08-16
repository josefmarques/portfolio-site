export default function Hero() {
  return (
    <section id="hero" className="flex min-h-[45vh] items-center py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
          José Marques
        </h1>
        <h2 className="mt-4 text-xl font-medium text-accent sm:text-2xl">
          DevOps &amp; Infraestrutura Cloud-Native
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
          Sustento ambientes de missão crítica e projeto arquiteturas
          cloud-native do zero — como a Nexuno, uma plataforma SaaS multi-tenant
          que arquitetei, implementei e administro, do cluster Kubernetes ao
          código da aplicação.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a
            href="#servicos"
            className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent/90"
          >
            Ver Serviços
          </a>
          <a
            href="#contato"
            className="rounded-md border border-accent px-6 py-3 text-sm font-semibold text-accent transition-colors hover:bg-accent/10"
          >
            Falar Comigo
          </a>
        </div>
      </div>
    </section>
  );
}
