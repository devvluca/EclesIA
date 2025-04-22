"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "@/components/icons";
import Image from "next/image";
import EpiscopalLogo from "@/img/episcopal_logo.png";
import ChurchBanner from "@/img/banner_episcopal.jpg";
import { useRef, useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import Cookies from 'js-cookie';
import { useRouter } from "next/navigation";

export default function Home() {
  const ctaRef = useRef<HTMLDivElement>(null);

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const handleLoginClick = () => {
    if (Cookies.get('access_token')) {
      Cookies.remove('access_token');
      router.push('/');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const handleAuthButtonClick = () => {
    if (Cookies.get('access_token')) {
      Cookies.remove('access_token');
    }
    setIsAuthModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-secondary font-montserrat ">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 w-full z-20 py-4 bg-transparent font-montserrat text-white">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center text-2xl font-bold ">
          <Image src={EpiscopalLogo} alt="EclesIA Logo" width={60} height={60} className="mr-2" />
          EclesIA
          </Link>
          <div className="space-x-4">
            <Link href="/chat" className="text-white">
              Chat
            </Link>
            <Link href="/about" className="text-white">
              Sobre Nós
            </Link>
            <Link href="/contact" className="text-white">
              Contato
            </Link>
            <Button onClick={handleAuthButtonClick} className="text-white bg-transparent hover:bg-[#B8860B]/20 rounded-md p-2 "> <Icons.user className="h-4 w-4"/> </Button>
            </div>
          {isAuthModalOpen && (
            <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />)}
        </div>
      </nav>


      {/* Hero Section and Features Section */}
      <section
        className="relative py-40 bg-cover bg-center bg-warm-beige"
        style={{
          backgroundImage: `url(${ChurchBanner.src})`,
          backgroundPosition: 'top',
        }}
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 text-white text-shadow-lg">
            Bem-vindo à EclesIA
          </h1>
          <p className="text-xl mb-12 text-gray-200 text-shadow-md">
            Explore a fé e a tradição da Igreja Episcopal Carismática do Brasil através da inteligência artificial.
          </p>
          <Button onClick={scrollToCTA} className="bg-primary text-white hover:bg-primary/80 transition-transform active:scale-95 relative overflow-hidden transform hover:shadow-md before:absolute before:top-0 before:left-0 before:w-full before:h-0 before:bg-primary before:opacity-0 before:transition-all before:duration-500 hover:before:h-full hover:before:opacity-20">
            Vamos começar
          </Button>
        </div>

        <div className="container mx-auto px-6 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-background rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Conhecimento Teológico
              </h3>
              <p className="text-muted-foreground">
                Acesse informações teológicas precisas e relevantes sobre a Igreja Episcopal Carismática do Brasil.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="p-6 bg-background rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Respostas Inteligentes
              </h3>
              <p className="text-muted-foreground">
                Obtenha respostas claras e concisas para suas perguntas teológicas.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="p-6 bg-background rounded-lg shadow-md hover:scale-105 transition-transform duration-300">
              <h3 className="text-2xl font-semibold mb-4 text-primary">
                Exploração da Fé
              </h3>
              <p className="text-muted-foreground">
                Explore a fé da Igreja Episcopal Carismática do Brasil de forma interativa e envolvente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-beige relative z-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-8 text-primary">
            Pronto para Começar?
          </h2>
          <p className="text-xl mb-12 text-muted-foreground">
            Inicie sua jornada teológica com a EclesIA hoje mesmo!
          </p>
          <div ref={ctaRef}>
            <Link href="/chat">
              <Button className="bg-primary text-white hover:bg-primary/80 transition-transform active:scale-95 relative overflow-hidden transform hover:shadow-md before:absolute before:top-0 before:left-0 before:w-full before:h-0 before:bg-primary before:opacity-0 before:transition-all before:duration-500 hover:before:h-full hover:before:opacity-20">
                Iniciar Conversa
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-8 shadow-top mt-auto relative z-20">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 EclesIA. Todos os direitos reservados.</p>
        </div>
      </footer>

      <AuthModal open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen} />
    </div>
  );
}
