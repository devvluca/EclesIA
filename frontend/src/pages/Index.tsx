import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, MessageCircle, Home } from 'lucide-react';

const Index = ({ onAuthModalToggle }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAuthModalToggle={onAuthModalToggle} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{
            backgroundImage: 'url("/img/banner_episcopal.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center -15%',
          }}
        />
        <div className="absolute inset-0 bg-wood-darkest/40 z-1" />
        <div className="container mx-auto px-4 relative z-20">
          <div className="md:w-1/2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif leading-tight text-cream">
              Conversas Sagradas <br /> com <span className="text-cream-light">EclesIA</span>
            </h1>
            <p className="text-lg md:text-xl text-cream-light mb-8 max-w-lg">
              Tire suas dúvidas sobre a Igreja Episcopal Carismática do Brasil e a tradição Anglicana com nossa IA especializada.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/chat">
                <Button className="btn-primary w-full sm:w-auto">Iniciar conversa</Button>
              </Link>
              <Link to="/sobre">
                <Button variant="outline" className="bg-cream/10 border-cream text-cream hover:bg-cream hover:text-wood-dark w-full sm:w-auto">
                  Saiba mais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-b from-cream to-cream-light">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif text-wood-dark">
              Descubra Nossos Recursos
            </h2>
            <p className="text-wood-darkest/70 max-w-2xl mx-auto">
              Explore as ferramentas que preparamos para enriquecer sua jornada espiritual e seu conhecimento sobre a Igreja Episcopal Carismática.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Igreja */}
            <div className="bg-[#f5e8dc] shadow-lg rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
              <Home className="w-12 h-12 text-wood-dark mx-auto mb-4" />
              <h3 className="text-xl font-bold text-wood-dark mb-2">Igreja</h3>
              <p className="text-wood-darkest/70 mb-4">
                Conheça mais sobre a Igreja Episcopal Carismática, sua história, missão e valores que guiam nossa fé.
              </p>
              <Link to="/sobre">
                <Button className="bg-wood text-cream-light hover:bg-wood-dark">Saiba Mais</Button>
              </Link>
            </div>

            {/* Chatbot IA */}
            <div className="bg-[#f5e8dc] shadow-lg rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
              <MessageCircle className="w-12 h-12 text-wood-dark mx-auto mb-4" />
              <h3 className="text-xl font-bold text-wood-dark mb-2">Chatbot IA</h3>
              <p className="text-wood-darkest/70 mb-4">
                Converse com nossa inteligência artificial para tirar dúvidas e aprender mais sobre a tradição Anglicana.
              </p>
              <Link to="/chat">
                <Button className="bg-wood text-cream-light hover:bg-wood-dark">Converse Agora</Button>
              </Link>
            </div>

            {/* Bíblia Interativa */}
            <div className="bg-[#f5e8dc] shadow-lg rounded-lg p-6 text-center hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-12 h-12 text-wood-dark mx-auto mb-4" />
              <h3 className="text-xl font-bold text-wood-dark mb-2">Bíblia Interativa</h3>
              <p className="text-wood-darkest/70 mb-4">
                Explore a Bíblia de forma interativa, selecione capítulos e receba explicações sobre os textos.
              </p>
              <Link to="/bible">
                <Button className="bg-wood text-cream-light hover:bg-wood-dark">Acessar Bíblia</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#f5e8dc]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl text-wood-dark font-bold mb-6 font-serif">
            Pronto para explorar sua espiritualidade?
          </h2>
          <p className="text-wood-dark/75 max-w-2xl mx-auto mb-8">
            Inicie uma conversa com nossa IA ou explore a Bíblia interativa para aprofundar seu conhecimento e sua fé.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to="/chat">
              <Button className="bg-wood text-cream-light hover:bg-wood-dark transition-all duration-300">
                Iniciar Conversa
              </Button>
            </Link>
            <Link to="/bible">
              <Button className="bg-wood text-cream-light hover:bg-wood-dark transition-all duration-300">
                Acessar Bíblia
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
