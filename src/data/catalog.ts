// Sample data for the catalog
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  subcategory?: string;
  model: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  specifications: { label: string; value: string }[];
  applications: string[];
  features: string[];
  image: string;
  images: string[];
  featured: boolean;
  status: 'active' | 'inactive';
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

export const categories: Category[] = [
  { id: '1', name: 'Glassware', slug: 'glassware', description: 'Premium borosilicate glass beakers, flasks, and laboratory glassware.', image: '/placeholder.svg', productCount: 45 },
  { id: '2', name: 'Consumables', slug: 'consumables', description: 'Laboratory consumables including pipette tips, tubes, and filters.', image: '/placeholder.svg', productCount: 120 },
  { id: '3', name: 'Laboratory Instruments', slug: 'laboratory-instruments', description: 'Precision analytical and measurement instruments for your lab.', image: '/placeholder.svg', productCount: 78 },
  { id: '4', name: 'Safety Equipment', slug: 'safety-equipment', description: 'Personal protective equipment and laboratory safety solutions.', image: '/placeholder.svg', productCount: 35 },
  { id: '5', name: 'Fume Hood', slug: 'fume-hood', description: 'Chemical fume hoods for safe handling of hazardous materials.', image: '/placeholder.svg', productCount: 12 },
  { id: '6', name: 'Laminar Flow', slug: 'laminar-flow', description: 'Laminar air flow cabinets for clean and sterile working environments.', image: '/placeholder.svg', productCount: 15 },
  { id: '7', name: 'Laboratory Furniture', slug: 'laboratory-furniture', description: 'Durable, chemical-resistant furniture designed for modern laboratories.', image: '/placeholder.svg', productCount: 28 },
];

export const brands: Brand[] = [
  { id: '1', name: 'Borosil', slug: 'borosil', logo: '/placeholder.svg', description: 'Leading manufacturer of laboratory glassware and scientific instruments.' },
  { id: '2', name: 'Tarsons', slug: 'tarsons', logo: '/placeholder.svg', description: 'Premium plastic labware and consumables for modern laboratories.' },
  { id: '3', name: 'Remi', slug: 'remi', logo: '/placeholder.svg', description: 'Centrifuges, stirrers, and laboratory equipment manufacturer.' },
  { id: '4', name: 'Riviera', slug: 'riviera', logo: '/placeholder.svg', description: 'High-quality laboratory instruments and analytical solutions.' },
  { id: '5', name: 'Labindia', slug: 'labindia', logo: '/placeholder.svg', description: 'Analytical instruments and laboratory solutions provider.' },
  { id: '6', name: 'Eppendorf', slug: 'eppendorf', logo: '/placeholder.svg', description: 'Global leader in laboratory equipment and consumables.' },
  { id: '7', name: 'Thermo Fisher', slug: 'thermo-fisher', logo: '/placeholder.svg', description: 'World-class scientific instruments and lab supplies.' },
  { id: '8', name: 'Merck', slug: 'merck', logo: '/placeholder.svg', description: 'Chemicals, reagents, and life science products.' },
];

export const products: Product[] = [
  {
    id: '1', name: 'Borosilicate Glass Beaker Set', slug: 'borosilicate-glass-beaker-set',
    brand: 'Borosil', category: 'Glassware', model: 'BKR-1000', sku: 'APC-GL-001',
    shortDescription: 'High-quality borosilicate 3.3 glass beakers with graduated markings.',
    fullDescription: 'Premium borosilicate 3.3 glass beakers manufactured to exacting standards. These beakers feature precise graduated markings, excellent chemical resistance, and can withstand temperatures up to 500°C. Available in sets of 5 with varying capacities.',
    specifications: [{ label: 'Material', value: 'Borosilicate Glass 3.3' }, { label: 'Capacity', value: '50ml, 100ml, 250ml, 500ml, 1000ml' }, { label: 'Max Temperature', value: '500°C' }, { label: 'Graduation', value: 'White enamel' }],
    applications: ['Chemical analysis', 'Sample preparation', 'Titration', 'General laboratory use'],
    features: ['Excellent chemical resistance', 'Precise graduations', 'High thermal shock resistance', 'Uniform wall thickness'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: true, status: 'active', tags: ['glassware', 'beaker', 'borosil']
  },
  {
    id: '2', name: 'Digital Analytical Balance', slug: 'digital-analytical-balance',
    brand: 'Riviera', category: 'Laboratory Instruments', model: 'AB-220', sku: 'APC-IN-001',
    shortDescription: 'High-precision analytical balance with 0.0001g readability.',
    fullDescription: 'State-of-the-art digital analytical balance with electromagnetic force compensation sensor. Features internal calibration, GLP-compliant data output, and an anti-static draft shield for precise measurements.',
    specifications: [{ label: 'Capacity', value: '220g' }, { label: 'Readability', value: '0.0001g' }, { label: 'Pan Size', value: '80mm diameter' }, { label: 'Calibration', value: 'Internal automatic' }],
    applications: ['Pharmaceutical weighing', 'Quality control', 'Research', 'Formulation'],
    features: ['Internal calibration', 'Anti-static draft shield', 'USB & RS232 connectivity', 'GLP/GMP compliant'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: true, status: 'active', tags: ['balance', 'analytical', 'instrument']
  },
  {
    id: '3', name: 'Micropipette Set (Variable Volume)', slug: 'micropipette-set-variable',
    brand: 'Tarsons', category: 'Consumables', model: 'MP-SET-3', sku: 'APC-CO-001',
    shortDescription: 'Ergonomic variable volume micropipette set with 3 pipettes.',
    fullDescription: 'A complete set of three variable volume micropipettes covering the most common volume ranges in the laboratory. Features a lightweight, ergonomic design with a comfortable finger rest and a soft plunger mechanism to reduce repetitive strain.',
    specifications: [{ label: 'Volume Range', value: '0.5-10µL, 10-100µL, 100-1000µL' }, { label: 'Accuracy', value: '±0.8% to ±1.0%' }, { label: 'Autoclavable', value: 'Lower part' }],
    applications: ['Molecular biology', 'Cell culture', 'Clinical diagnostics', 'Biochemistry'],
    features: ['Ergonomic design', 'Volume lock', 'Autoclavable lower part', 'Universal tip fitting'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: true, status: 'active', tags: ['pipette', 'consumable']
  },
  {
    id: '4', name: 'Chemical Fume Hood (4ft)', slug: 'chemical-fume-hood-4ft',
    brand: 'Labindia', category: 'Fume Hood', model: 'FH-1200', sku: 'APC-FH-001',
    shortDescription: 'Ducted chemical fume hood with variable air volume control.',
    fullDescription: 'A 4-foot ducted fume hood designed for handling hazardous chemicals. Features a robust steel structure with chemical-resistant epoxy coating, a tempered glass sash with counterbalance mechanism, and integrated LED lighting.',
    specifications: [{ label: 'Width', value: '1200mm (4ft)' }, { label: 'Air Flow', value: '0.5 m/s face velocity' }, { label: 'Worktop', value: 'Epoxy resin' }, { label: 'Sash', value: 'Tempered safety glass' }],
    applications: ['Chemical handling', 'Sample digestion', 'Solvent work', 'Acid fuming'],
    features: ['VAV control', 'Integrated LED light', 'Airfoil entry', 'Baffle system'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: true, status: 'active', tags: ['fume hood', 'safety']
  },
  {
    id: '5', name: 'Laboratory Safety Goggles', slug: 'laboratory-safety-goggles',
    brand: 'Borosil', category: 'Safety Equipment', model: 'SG-200', sku: 'APC-SE-001',
    shortDescription: 'Chemical splash-proof safety goggles with anti-fog coating.',
    fullDescription: 'Premium chemical splash-proof safety goggles with indirect ventilation system, polycarbonate lenses with anti-fog coating and UV protection. Designed for comfortable extended wear over prescription glasses.',
    specifications: [{ label: 'Lens', value: 'Polycarbonate' }, { label: 'Coating', value: 'Anti-fog, Anti-scratch' }, { label: 'Ventilation', value: 'Indirect' }, { label: 'UV Protection', value: 'Up to 385nm' }],
    applications: ['Chemical handling', 'Biological work', 'General laboratory', 'Industrial safety'],
    features: ['Over-glasses design', 'Adjustable strap', 'Indirect ventilation', 'Lightweight'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: false, status: 'active', tags: ['safety', 'goggles', 'PPE']
  },
  {
    id: '6', name: 'Vertical Laminar Air Flow Cabinet', slug: 'vertical-laminar-flow',
    brand: 'Labindia', category: 'Laminar Flow', model: 'VLF-4', sku: 'APC-LF-001',
    shortDescription: 'Vertical laminar air flow with HEPA filtration for sterile work.',
    fullDescription: 'A vertical laminar air flow cabinet providing ISO Class 5 clean air environment. Features HEPA filter with 99.99% efficiency at 0.3 microns, UV germicidal lamp, and stainless steel work surface.',
    specifications: [{ label: 'Clean Class', value: 'ISO Class 5' }, { label: 'Filter', value: 'HEPA 99.99% @ 0.3µm' }, { label: 'Work Area', value: '1200 x 600mm' }, { label: 'UV Lamp', value: 'Included' }],
    applications: ['Tissue culture', 'Microbiology', 'Electronics assembly', 'Pharmaceutical compounding'],
    features: ['HEPA filtration', 'UV germicidal lamp', 'Pre-filter', 'Digital display'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: true, status: 'active', tags: ['laminar flow', 'clean bench']
  },
  {
    id: '7', name: 'Anti-Vibration Laboratory Table', slug: 'anti-vibration-lab-table',
    brand: 'Riviera', category: 'Laboratory Furniture', model: 'AVT-900', sku: 'APC-LF-002',
    shortDescription: 'Heavy-duty anti-vibration table for sensitive instruments.',
    fullDescription: 'A precision anti-vibration table designed for analytical balances and sensitive measuring instruments. Features a granite top on a heavy steel frame with vibration-dampening pads for a stable weighing environment.',
    specifications: [{ label: 'Top', value: 'Black Granite, 40mm' }, { label: 'Dimensions', value: '900 x 600 x 750mm' }, { label: 'Load Capacity', value: '200 kg' }, { label: 'Frame', value: 'Powder-coated steel' }],
    applications: ['Balance weighing', 'Microscopy', 'Optical measurements', 'Precision testing'],
    features: ['Granite top', 'Vibration dampening pads', 'Leveling feet', 'Corrosion-resistant frame'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: false, status: 'active', tags: ['furniture', 'table']
  },
  {
    id: '8', name: 'Erlenmeyer Flask Set', slug: 'erlenmeyer-flask-set',
    brand: 'Borosil', category: 'Glassware', model: 'EF-SET-5', sku: 'APC-GL-002',
    shortDescription: 'Narrow-mouth Erlenmeyer flasks in borosilicate glass.',
    fullDescription: 'A set of five narrow-mouth Erlenmeyer flasks made from borosilicate glass 3.3. Ideal for mixing, heating, and storage of solutions. Features durable white enamel graduations and uniform wall thickness for even heat distribution.',
    specifications: [{ label: 'Material', value: 'Borosilicate Glass 3.3' }, { label: 'Capacity', value: '100ml, 250ml, 500ml, 1000ml, 2000ml' }, { label: 'Mouth', value: 'Narrow' }],
    applications: ['Mixing solutions', 'Titration', 'Culture media preparation', 'Storage'],
    features: ['Narrow mouth reduces evaporation', 'Uniform wall thickness', 'White enamel graduations', 'Chemical resistant'],
    image: '/placeholder.svg', images: ['/placeholder.svg'], featured: false, status: 'active', tags: ['glassware', 'flask']
  },
];

export const industries = [
  { id: '1', name: 'Pharmaceutical', icon: '💊', description: 'Complete lab solutions for pharmaceutical manufacturing, QC, and R&D facilities.' },
  { id: '2', name: 'Research Laboratories', icon: '🔬', description: 'Advanced instruments and consumables for cutting-edge research.' },
  { id: '3', name: 'Universities', icon: '🎓', description: 'Educational lab equipment and supplies for academic institutions.' },
  { id: '4', name: 'Hospitals', icon: '🏥', description: 'Clinical laboratory equipment and diagnostic supplies.' },
  { id: '5', name: 'Food Industry', icon: '🍽️', description: 'Quality testing equipment and lab supplies for food safety.' },
  { id: '6', name: 'Chemical Industry', icon: '⚗️', description: 'Industrial-grade laboratory equipment for chemical processing.' },
];
