import { Shield, CheckCircle2, FileText } from 'lucide-react';

const certifications = [
  'ISO 9001:2015 Quality Management System',
  'ISO 14001:2015 Environmental Management',
  'CE Marking Compliance',
  'GMP Standards Compliance',
  'NABL Certified Testing',
];

const Quality = () => (
  <div>
    <section className="bg-primary py-16 lg:py-20">
      <div className="container-main text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">Quality & Certifications</h1>
        <p className="text-primary-foreground/70 max-w-2xl mx-auto">Our commitment to quality ensures you receive the best products for your laboratory.</p>
      </div>
    </section>

    <section className="section-padding bg-background">
      <div className="container-main max-w-3xl">
        <div className="bg-card border rounded-xl p-8 mb-8">
          <Shield className="h-10 w-10 text-primary mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-3">Our Quality Commitment</h2>
          <p className="text-muted-foreground leading-relaxed">
            At Avon Pharmo Chem, quality is at the heart of everything we do. Every product in our catalog undergoes rigorous quality checks and is sourced from certified manufacturers. We maintain strict quality control processes to ensure that our customers receive products that meet international standards.
          </p>
        </div>

        <h2 className="text-xl font-bold text-foreground mb-4">Certifications & Standards</h2>
        <div className="space-y-3 mb-8">
          {certifications.map((cert, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border rounded-lg p-4">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{cert}</span>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold text-foreground mb-4">Documentation</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {['Quality Policy', 'ISO Certificate', 'Product Compliance', 'Safety Data Sheets'].map((doc, i) => (
            <div key={i} className="flex items-center gap-3 bg-card border rounded-lg p-4 card-hover cursor-pointer">
              <FileText className="h-5 w-5 text-accent flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{doc}</span>
              <span className="text-xs text-muted-foreground ml-auto">PDF</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Quality;
