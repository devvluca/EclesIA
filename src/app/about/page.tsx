"use client";

const AboutPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Navbar */}
      <nav className="bg-background py-4 shadow-md">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center text-primary text-2xl font-bold">
            <Icons.shield className="mr-2" />
            EclesIA
          </Link>
          <div className="space-x-4">
            <Link href="/chat" className="text-foreground hover:text-primary">
              Chat
            </Link>
            <Link href="/about" className="text-foreground hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-foreground hover:text-primary">
              Contact
            </Link>
            <Button variant="outline">Login</Button>
          </div>
        </div>
      </nav>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 text-primary">
            Sobre Nós
          </h1>
          <p className="text-xl mb-12 text-muted-foreground">
            EclesIA é um protótipo desenvolvido com o objetivo de colaborar com o Reino de Deus,
            fornecendo informações teológicas sobre a Igreja Episcopal Carismática do Brasil
            de forma acessível e interativa.
          </p>
          <p className="text-muted-foreground">
            Este projeto busca ser uma ferramenta para o aprendizado e aprofundamento na fé,
            utilizando a inteligência artificial como um meio de disseminar o conhecimento teológico.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 shadow-top mt-auto">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2024 EclesIA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;

import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

