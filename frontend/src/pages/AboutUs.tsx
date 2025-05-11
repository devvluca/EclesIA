import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const AboutUs = ({ onAuthModalToggle }) => {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onAuthModalToggle={onAuthModalToggle} />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 bg-gradient-to-b from-cream to-cream-light">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-serif">Sobre a EclesIA</h1>
          <p className="text-lg text-wood-darkest/80 max-w-2xl mx-auto">
            Uma iniciativa para conectar fiéis e interessados com o conhecimento da Igreja Episcopal Carismática do Brasil através da inteligência artificial.
          </p>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 font-serif">Igreja Episcopal Carismática do Brasil</h2>
              <p className="mb-4 text-wood-darkest/80">
                A Igreja Episcopal Carismática do Brasil é uma denominação cristã que combina a rica tradição litúrgica e teológica anglicana com a experiência pentecostal/carismática do Espírito Santo.
              </p>
              <p className="mb-4 text-wood-darkest/80">
                Fundamentada nas Escrituras Sagradas, valorizamos tanto os aspectos sacramentais da fé quanto a manifestação dos dons espirituais, buscando um equilíbrio entre tradição e renovação.
              </p>
              <p className="mb-6 text-wood-darkest/80">
                Nossa missão é proclamar o Evangelho de Jesus Cristo, nutrida pela tradição anglicana histórica e pela experiência contemporânea do Espírito Santo.
              </p>
              <Link to="/chat">
                <Button className="btn-primary">Converse conosco</Button>
              </Link>
            </div>
            <div className="flex justify-center">
              <img 
                src="/img/iecb_logo.png" 
                alt="Logo IECB" 
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* FAQ and CTA Section */}
      <section className="py-16 bg-white text-wood-dark">
        <div className="container mx-auto px-4">
          {/* Perguntas Frequentes */}
          <h2 className="text-3xl font-bold mb-10 text-center font-serif">Perguntas Frequentes</h2>
          <div className="max-w-3xl mx-auto mb-16">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-wood/20">
                <AccordionTrigger className="hover:text-wood font-medium">
                  O que é a tradição Anglicana?
                </AccordionTrigger>
                <AccordionContent className="text-wood-dark/70">
                  A tradição Anglicana surgiu no século XVI durante a Reforma Inglesa. É conhecida como uma "via média" que combina elementos católicos e protestantes, mantendo um equilíbrio entre Escritura, Tradição e Razão. Valoriza a liturgia histórica, os sacramentos e a sucessão apostólica, mas com abertura para reformas e contextualização.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className="border-wood/20">
                <AccordionTrigger className="hover:text-wood font-medium">
                  O que significa ser uma igreja "carismática"?
                </AccordionTrigger>
                <AccordionContent className="text-wood-dark/70">
                  O termo "carismático" se refere à ênfase nos carismas ou dons do Espírito Santo mencionados em 1 Coríntios 12-14 e em outras partes do Novo Testamento. Como igreja carismática, acreditamos na manifestação contemporânea desses dons, como profecia, línguas, cura, discernimento e outros, mantendo-os em equilíbrio com nossa tradição litúrgica e sacramental.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border-wood/20">
                <AccordionTrigger className="hover:text-wood font-medium">
                  Como é o culto na Igreja Episcopal Carismática?
                </AccordionTrigger>
                <AccordionContent className="text-wood-dark/70">
                  Nossos cultos combinam elementos da liturgia anglicana tradicional com expressões contemporâneas de adoração. Isso inclui o uso do Livro de Oração Comum, celebração regular da Eucaristia, leituras bíblicas estruturadas, mas também momentos de louvor espontâneo, oração pelos dons do Espírito, cura e ministração.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="border-wood/20">
                <AccordionTrigger className="hover:text-wood font-medium">
                  Qual a importância dos sacramentos?
                </AccordionTrigger>
                <AccordionContent className="text-wood-dark/70">
                  Na tradição episcopal, os sacramentos são sinais externos e visíveis de uma graça interna e espiritual. Reconhecemos os sete sacramentos históricos: Batismo, Eucaristia, Confirmação, Reconciliação, Matrimônio, Ordenação e Unção dos Enfermos. O Batismo e a Eucaristia são considerados os "sacramentos maiores" por terem sido instituídos diretamente por Cristo.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className="border-wood/20">
                <AccordionTrigger className="hover:text-wood font-medium">
                  Como funciona o EclesIA?
                </AccordionTrigger>
                <AccordionContent className="text-wood-dark/70">
                  O EclesIA é um chatbot baseado em inteligência artificial, treinado com informações sobre a Igreja Episcopal Carismática do Brasil e conta com uma Bíblia interativa. Ele foi desenvolvido para responder perguntas e fornecer informações sobre nossa fé, práticas, doutrinas e tradições. A IA continua aprendendo e melhorando com cada interação.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-6 font-serif">Tire suas dúvidas com o EclesIA</h2>
            <p className="text-wood-dark/90 max-w-2xl mx-auto mb-8">
              Inicie uma conversa com nossa IA e aprenda mais sobre a Igreja Episcopal Carismática do Brasil e a tradição Anglicana.
            </p>
            <Link to="/chat">
              <Button className="bg-wood text-white hover:bg-wood-dark transition-all duration-300">
                Conversar agora
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
