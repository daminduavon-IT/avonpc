import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Award, Users, Target, ArrowRight, CheckCircle2 } from 'lucide-react';

const strengths = [
  'ISO 9001:2015 Compliant Processes',
  '30+ Years of Industry Experience',
  '5000+ Products in Catalog',
  'Pan-India Distribution Network',
  'Dedicated Technical Support',
  'Competitive Pricing',
];

const About = () => (
  <div>
    {/* Hero */}
    <section className="bg-primary py-16 lg:py-20">
      <div className="container-main text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">About Avon Pharmo Chem</h1>
        <p className="text-primary-foreground/70 max-w-2xl mx-auto">
          Your trusted partner for laboratory equipment and scientific supplies since 1992.
        </p>
      </div>
    </section>

    {/* Company Intro */}
    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Avon Pharmo Chem Pvt Ltd is a leading supplier of laboratory equipment, scientific instruments,
            glassware, consumables, and safety equipment to pharmaceutical, research, educational, and industrial
            sectors across India. With over three decades of experience, we are committed to delivering quality
            products and exceptional service.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our extensive catalog features products from top global and Indian manufacturers, ensuring that
            our clients have access to the best tools and equipment for their laboratories.
          </p>
        </div>
      </div>
    </section>

    {/* Mission / Vision */}
    <section className="section-padding bg-muted">
      <div className="container-main">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-xl border p-8">
            <Target className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Our Mission</h3>
            <p className="text-muted-foreground leading-relaxed">
              To provide world-class laboratory equipment and scientific solutions with unmatched quality,
              reliability, and customer service, empowering laboratories to achieve excellence.
            </p>
          </div>
          <div className="bg-card rounded-xl border p-8">
            <Award className="h-10 w-10 text-accent mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-3">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              To be India's most trusted and preferred supplier of laboratory and scientific products,
              setting industry benchmarks in quality, innovation, and customer satisfaction.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Strengths */}
    <section className="section-padding bg-background">
      <div className="container-main">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Our Strengths</h2>
        </div>
        <div className="max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strengths.map((s, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border rounded-lg p-4">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Choose */}
    <section className="section-padding bg-muted">
      <div className="container-main grid md:grid-cols-3 gap-6 text-center">
        {[
          { icon: Shield, title: 'Quality Assured', desc: 'Every product undergoes strict quality checks before dispatch.' },
          { icon: Users, title: 'Expert Team', desc: 'Our trained professionals help you choose the right products.' },
          { icon: Award, title: 'Trusted Brand', desc: 'Serving 2000+ laboratories across India with trust and excellence.' },
        ].map((f, i) => (
          <div key={i} className="bg-card rounded-xl border p-6 card-hover">
            <f.icon className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary py-12">
      <div className="container-main text-center">
        <h2 className="text-2xl font-bold text-primary-foreground mb-4">Ready to Get Started?</h2>
        <Link to="/request-quote">
          <Button variant="hero" size="lg">Request a Quotation <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    </section>
  </div>
);

export default About;
