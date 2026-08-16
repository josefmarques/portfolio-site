import { Github, Linkedin, Mail } from "lucide-react";

const contatos = [
  {
    icon: Mail,
    label: "E-mail",
    href: "mailto:josemarques.moc@gmail.com",
    external: false,
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/josefmarques/",
    external: true,
  },
  {
    icon: Github,
    label: "GitHub",
    href: "https://github.com/josefmarques",
    external: true,
  },
];

export default function Contato() {
  return (
    <section
      id="contato"
      className="bg-gradient-to-b from-background via-background to-accent/10 py-20"
    >
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Vamos conversar sobre seu projeto?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-foreground/60">
          Me chame para uma conversa rápida sobre seu desafio de infraestrutura
          — sem compromisso.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {contatos.map(({ icon: Icon, label, href, external }) => (
            <a
              key={label}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center gap-3 rounded-lg border border-white/10 bg-[#0e131b] px-6 py-8 transition-all duration-300 hover:scale-105 hover:border-accent"
            >
              <Icon className="text-accent" size={28} />
              <span className="font-semibold text-foreground">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
