
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow flex items-center justify-center bg-cream-light">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold mb-4 font-serif text-wood-dark">404</h1>
          <p className="text-xl text-wood-darkest/70 mb-8">Página não encontrada</p>
          <p className="text-wood-darkest/70 mb-8 max-w-md mx-auto">
            A página que você está procurando não existe ou foi movida para outro endereço.
          </p>
          <Link to="/">
            <Button className="bg-wood hover:bg-wood-dark text-cream-light">
              Voltar para o início
            </Button>
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
