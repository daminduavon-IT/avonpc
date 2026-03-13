import { Link } from 'react-router-dom';
import { industries } from '@/data/catalog';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Industries = () => (
  <div>
    <section className="bg-primary py-16 lg:py-20">
      <div className="container-main text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Industries We Serve</h1>
        <p className="text-primary-foreground/70 max-w-2xl mx-auto">Providing tailored laboratory solutions across diverse industry sectors.</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container-main grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {industries.map(ind => (
          <div key={ind.id} className="bg-card rounded-xl border p-8 card-hover text-center">
            <div className="text-5xl mb-4">{ind.icon}</div>
            <h3 className="text-lg font-bold text-foreground mb-2">{ind.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{ind.description}</p>
            <Link to="/products">
              <Button variant="outline" size="sm">Browse Products <ArrowRight className="h-3 w-3" /></Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  </div>
);

export default Industries;
