import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';
import { BookOpen, MessageCircle, Home } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: 'url("/img/banner_episcopal.jpg")',
          backgroundSize: '100% 100%', // Ajusta a imagem para caber no container sem cortar
          // Outras opções:
          // 'auto': Usa o tamanho original da imagem
          // 'cover': Preenche o container, pode cortar a imagem
          // '100% 100%': Estica a imagem para preencher o container
          // 'initial': Usa o valor padrão do navegador
          // 'inherit': Herda o valor do elemento pai
    backgroundRepeat: 'no-repeat', // Evita repetição
    backgroundPosition: 'center', // Centraliza a imagem
  }}
/>
        
        {/* Overlay for better text visibility */}
        <div className="absolute inset-0 bg-wood-darkest/40 z-1" />
        
        {/* Content */}
        <div className="container mx-auto px-2 relative z-20">
          <div className="md:w-1/2 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-serif leading-tight text-cream">
              Conversas Sagradas <br/>com <span className="text-cream-light">EclesIA</span>
            </h1>
            <p className="text-lg md:text-xl text-cream-light mb-8 max-w-lg">
              Tire suas dúvidas sobre a Igreja Episcopal Carismática do Brasil e a tradição Anglicana com nossa IA especializada.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/chat">
                <Button className="btn-primary w-full sm:w-auto">Iniciar conversa</Button>
              </Link>
              <Link to="/sobre">
                <Button variant="outline" className="bg-cream/10 border-cream text-cream hover:bg-cream hover:text-wood-dark w-full sm:w-auto">Saiba mais</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Como podemos ajudar?</h2>
            <p className="text-wood-darkest/70 max-w-2xl mx-auto">
              Nossa plataforma oferece recursos para aprender mais sobre a fé episcopal carismática e encontrar respostas para suas dúvidas espirituais.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              title="IGREJA"
              description="Um chatbot projetado para auxiliar em dúvidas sobre a Igreja Episcopal Carismática"
              icon={<Home className="w-10 h-10 text-wood" />}
              link="/sobre"
              buttonText="Saiba Mais"
            />
            <FeatureCard 
              title="CHATBOT IA"
              description="Um chatbot de IA é utilizado para fornecer informações e responder perguntas sobre a igreja"
              icon={<MessageCircle className="w-10 h-10 text-wood" />}
              link="/chat"
              buttonText="Saiba Mais"
            />
            <FeatureCard 
              title="EPISCOPAL"
              description="Parte da Igreja Episcopal Carismática, que está enraizada na antiga fé histórica"
              icon={<BookOpen className="w-10 h-10 text-wood" />}
              link="/sobre"
              buttonText="Saiba Mais"
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-wood text-cream">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 font-serif">Pronto para explorar sua espiritualidade?</h2>
          <p className="text-cream-light/90 max-w-2xl mx-auto mb-8">
            Inicie uma conversa com nossa IA e descubra mais sobre a Igreja Episcopal Carismática do Brasil e a tradição Anglicana.
          </p>
          <Link to="/chat">
            <Button className="bg-cream-light text-wood hover:bg-cream hover:text-wood-dark transition-all duration-300">
              Iniciar conversa agora
            </Button>
          </Link>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
