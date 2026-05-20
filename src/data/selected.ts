export type SelectedItem = {
  title: string;
  year?: string;      // e.g. "2023→" or "2024"
  blurb: string;      // 1–2 sentences
  role?: string;      // e.g. "led design + impl"
  stack?: string[];   // e.g. ["React", "Deck.gl"]
  image?: string;     // optional path under /src/assets/projects/
  link?: string;
};

export const selectedWork: SelectedItem[] = [
  {
    title: 'U.S. Greenhouse Gas Center',
    year: '2023→',
    blurb: 'Public NASA platform for cataloging and visualizing U.S. greenhouse gas datasets across satellite, airborne, and in-situ sources.',
    role: 'Lead engineer',
    link: 'https://earth.gov/ghgcenter',
  },
  {
    title: 'VEDA · NASA EarthData',
    year: '2022→',
    blurb: 'Open-source visualization, exploration, and data analysis platform for NASA earth science.',
    role: 'Platform engineer',
    link: 'https://docs.openveda.cloud/',
  },
  {
    title: 'pyQuARC',
    year: '2020→2022',
    blurb: 'Open-source Python tool for validating Earth science metadata records in NASA\'s Common Metadata Repository (CMR).',
    role: 'Lead engineer',
    link: 'https://github.com/nasa-impact/pyQuARC',
  },
  {
    title: 'Saano Labs',
    year: '2025→',
    blurb: 'Subcontracting to build data systems for the IEEE GRSS community — cataloging, ingestion, and analytics on large-scale geospatial datasets.',
    role: 'Founder · CEO',
    link: 'https://saanolabs.com/',
  },
];

export const selectedMakes: SelectedItem[] = [
  {
    title: "@saanostory — comic series",
    blurb: 'digital short-form comics about everyday observations.',
    link: 'https://www.instagram.com/saanostory/',
  },
  {
    title: 'IKEA greenhouse cabinet',
    blurb: 'turning a plain IKEA cabinet into a tiny indoor greenhouse',
    link: 'https://squiggles.slesa.com.np/posts/ikea-greenhouse/'
  },
  {
    title: 'Native-plant patch · zone 8b',
    blurb: 'Slowly converting a Huntsville lawn into a southeast US native-plant garden. Emphasis on pollinator support.',
  }
];
