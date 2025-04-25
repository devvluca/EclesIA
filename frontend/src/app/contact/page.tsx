"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import Image from "next/image";
import EpiscopalLogo from "@/img/episcopal_logo.png";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";

const ContactPage = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const handleAuthButtonClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-20 py-4 bg-transparent font-montserrat text-white">
        <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors">
        <Image
              src={EpiscopalLogo}
              alt="EclesIA Logo"
              width={60}
              height={60}
              className="mr-2"
            />
              EclesIA
          </Link>
          <div className="space-x-4">
            <Link href="/chat" className="text-gray-800 hover:text-gray-600 transition-colors">Chat</Link>
            <Link href="/about" className="text-gray-800 hover:text-gray-600 transition-colors">Sobre Nós</Link>
            <Link href="/contact" className="text-gray-800 hover:text-gray-600 transition-colors">Contato</Link>
            <Button onClick={handleAuthButtonClick} className="text-gray-800 bg-transparent hover:bg-[#B8860B]/20 rounded-md p-2 ">
              {" "}
              <Icons.user className="h-4 w-4" />{" "}
            </Button>
            {isAuthModalOpen && (
            <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
          )}
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

