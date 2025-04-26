
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
  buttonText: string;
}

const FeatureCard = ({ title, description, icon, link, buttonText }: FeatureCardProps) => {
  return (
    <div className="card-feature flex flex-col items-center text-center">
      <div className="feature-icon">
        {icon}
      </div>
      <h3 className="text-xl font-serif mb-2">{title}</h3>
      <p className="text-wood-darkest/70 mb-6">{description}</p>
      <Link to={link} className="mt-auto">
        <Button variant="outline" className="rounded-full border-wood text-wood hover:bg-wood hover:text-cream-light">
          {buttonText}
        </Button>
      </Link>
    </div>
  );
};

export default FeatureCard;
