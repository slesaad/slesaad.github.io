export type SelectedItem = {
  title: string;
  year: string;       // e.g. "2023→" or "2024"
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
    role: 'Lead engineer · UI + data pipelines',
    stack: ['React', 'Deck.gl', 'STAC', 'AWS', 'CDK'],
    link: 'https://earth.gov/ghgcenter',
  },
  {
    title: 'VEDA · NASA EarthData',
    year: '2022→',
    blurb: 'Open-source visualization, exploration, and data analysis platform for NASA earth science.',
    role: 'Platform engineer',
    stack: ['React', 'Mapbox GL', 'TiTiler', 'COG'],
    link: 'https://www.earthdata.nasa.gov/dashboard',
  },
  {
    title: 'MAAP biomass platform',
    year: '2021→',
    blurb: 'Multi-mission Algorithm and Analysis Platform — interactive 3D visualization of global biomass datasets.',
    stack: ['Cesium', 'Python', 'FastAPI'],
    link: 'https://maap-project.org',
  },
  {
    title: 'Saano Labs',
    year: '2025→',
    blurb: 'Founded to build earth-science data systems — cataloging, ingestion, and analytics on large-scale geospatial datasets.',
    role: 'Founder · CEO',
  },
];

export const selectedMakes: SelectedItem[] = [
  {
    title: "'Small Things' — comic series",
    year: '2024',
    blurb: 'Pen-and-watercolor short-form comics about everyday observations.',
    link: 'https://www.instagram.com/saanostory/',
  },
  {
    title: 'Hand-built clay vessels',
    year: '2023→',
    blurb: 'Slab and coil-built ceramics. Cone 6 stoneware, mostly utilitarian.',
  },
  {
    title: 'Native-plant patch · zone 7b',
    year: '2022→',
    blurb: 'Slowly converting a Huntsville lawn into a southeast US native-plant garden. Emphasis on pollinator support.',
  },
  {
    title: 'Interior projects',
    year: '2020→',
    blurb: 'Spatial planning, DIY builds, lighting design across apartments and a home.',
  },
];
