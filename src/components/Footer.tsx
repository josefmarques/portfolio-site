import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/josefmarques/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://github.com/josefmarques",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "mailto:josemarques.moc@gmail.com",
    label: "Email",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#070a0f]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-foreground/60">
          © 2026 José Francisco Marques de Souza
        </p>

        <div className="flex items-center gap-5">
          {socialLinks.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-foreground/60 transition-colors hover:text-accent"
            >
              <Icon size={20} />
            </a>
          ))}
          <Link
            href="/under-the-hood"
            className="text-sm text-foreground/60 transition-colors hover:text-foreground"
          >
            Under the Hood ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}
