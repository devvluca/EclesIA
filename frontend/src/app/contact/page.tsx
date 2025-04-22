"use client";

const ContactPage = () => {
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

      {/* Contact Information */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6 text-primary">
            Contato
          </h1>
          <p className="text-xl mb-12 text-muted-foreground">
            Entre em contato para mais informações ou suporte.
          </p>
          <div className="text-left">
            <p className="mb-4">
              <strong>Email:</strong> lucanobre1@gmail.com
            </p>
            <p className="mb-4">
              <strong>Telefone:</strong> +55 (81) 99516-7157
            </p>
            <p className="mb-4">
              <strong>Desenvolvido por:</strong> Luca Aguiar
            </p>
          </div>
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

export default ContactPage;

import Link from "next/link";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";

