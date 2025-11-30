// app/automotive/data.ts

export interface Car {
  id: string;
  name: string;
  manufacturer: string;
  year: string;
  class: string;
  specs: {
    engine: string;
    power: string;
    torque: string;
    weight: string;
    acceleration: string;
    topSpeed: string;
    drivetrain: string;
  };
  history: string;
  image: string;
  accentColor: string; // Dynamic color for UI accents
}

export const CARS: Car[] = [
  {
    id: 'polo-r-wrc',
    name: 'Polo R WRC',
    manufacturer: 'Volkswagen',
    year: '2013',
    class: 'WRC',
    specs: {
      engine: '1.6L Turbo Inline-4',
      power: '318 hp',
      torque: '430 Nm',
      weight: '1,200 kg',
      acceleration: '3.9s',
      topSpeed: '200 km/h',
      drivetrain: 'AWD'
    },
    history: 'A dominant force in rallying, the Polo R WRC won four consecutive World Rally Championships (2013-2016) with Sébastien Ogier. Its compact chassis and reliable powertrain made it nearly unbeatable on gravel and tarmac alike.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Volkswagen_Polo_R_WRC_WOB_VW_365_001.jpg',
    accentColor: '#1e3a8a' // Blue
  },
  {
    id: '911-gt3-rs',
    name: '911 GT3 RS (992)',
    manufacturer: 'Porsche',
    year: '2022',
    class: 'Track Special',
    specs: {
      engine: '4.0L NA Flat-6',
      power: '518 hp',
      torque: '465 Nm',
      weight: '1,450 kg',
      acceleration: '3.2s',
      topSpeed: '296 km/h',
      drivetrain: 'RWD'
    },
    history: 'The 992 GT3 RS brings Formula 1 DRS technology to the road. Its active aerodynamics produce 860kg of downforce, more than a GT3 Cup car. It is widely regarded as the ultimate driver\'s 911.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/2022_Porsche_911_(992)_GT3_RS.jpg',
    accentColor: '#ef4444' // Red
  },
  {
    id: '919-hybrid-evo',
    name: '919 Hybrid Evo',
    manufacturer: 'Porsche',
    year: '2018',
    class: 'LMP1-H',
    specs: {
      engine: '2.0L V4 Turbo + Hybrid',
      power: '1,160 hp',
      torque: 'Unknown',
      weight: '849 kg',
      acceleration: '2.2s',
      topSpeed: '369 km/h',
      drivetrain: 'AWD'
    },
    history: 'Freed from regulation restrictions, the 919 Evo destroyed the Nürburgring lap record with a 5:19.546. It is a testament to what an LMP1 car can do without fuel flow limits or aero restrictions.',
    // UPDATED: Ultra-high resolution 5K museum shot
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Porsche_919_Hybrid_Evo_in_the_Porsche-Museum_(2009)_IMG_2785.jpg',
    accentColor: '#525252' // Grey
  },
  {
    id: 'amg-gt-black',
    name: 'AMG GT Black Series',
    manufacturer: 'Mercedes-AMG',
    year: '2021',
    class: 'Supercar',
    specs: {
      engine: '4.0L V8 Bi-Turbo',
      power: '720 hp',
      torque: '800 Nm',
      weight: '1,588 kg',
      acceleration: '3.2s',
      topSpeed: '325 km/h',
      drivetrain: 'RWD'
    },
    history: 'Featuring a unique flat-plane crank V8, the Black Series is the most track-focused AMG ever produced. It held the production car lap record at the Nürburgring Nordschleife.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-AMG_GT_Black_Series_IMG_0324.jpg',
    accentColor: '#f97316' // Orange
  },
  {
    id: 'subaru-22b',
    name: 'Impreza 22B STi',
    manufacturer: 'Subaru',
    year: '1998',
    class: 'JDM Legend',
    specs: {
      engine: '2.2L Turbo Flat-4',
      power: '280 hp',
      torque: '363 Nm',
      weight: '1,270 kg',
      acceleration: '4.7s',
      topSpeed: '248 km/h',
      drivetrain: 'AWD'
    },
    history: 'The holy grail of Subarus. Built to celebrate their 40th anniversary and 3rd WRC title. Only 400 were made. It features a unique widebody kit directly inspired by the rally car.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Subaru_Impreza_22B_STi-Version.jpg',
    accentColor: '#2563eb' // Rally Blue
  },
  {
    id: 'w14-f1',
    name: 'W14 E Performance',
    manufacturer: 'Mercedes-AMG F1',
    year: '2023',
    class: 'Formula 1',
    specs: {
      engine: '1.6L V6 Turbo Hybrid',
      power: '1,000+ hp',
      torque: 'Unknown',
      weight: '798 kg',
      acceleration: '2.6s',
      topSpeed: '350+ km/h',
      drivetrain: 'RWD'
    },
    history: 'The W14 marked a return to the stealthy black livery for weight saving. Driven by Lewis Hamilton and George Russell, it represents the cutting edge of ground-effect aerodynamics.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes-AMG_F1_W14_E_Performance_(53439699202).jpg',
    accentColor: '#000000' // Black
  },
  {
    id: 'audi-quattro-s1',
    name: 'Sport Quattro S1 E2',
    manufacturer: 'Audi',
    year: '1985',
    class: 'Group B',
    specs: {
      engine: '2.1L Inline-5 Turbo',
      power: '550 hp',
      torque: '590 Nm',
      weight: '1,090 kg',
      acceleration: '3.1s',
      topSpeed: '220 km/h',
      drivetrain: 'Quattro AWD'
    },
    history: 'The ultimate evolution of the Group B monster. With its massive wings and distinctive 5-cylinder scream, the S1 E2 remains one of the most iconic and terrifying rally cars ever built.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Audi_Sport_Quattro_S1_E2_-_Flickr_-_andrewbasterfield.jpg',
    accentColor: '#fbbf24' // Yellow
  },
  {
    id: 'citroen-c4-wrc',
    name: 'C4 WRC',
    manufacturer: 'Citroën',
    year: '2007',
    class: 'WRC',
    specs: {
      engine: '2.0L Turbo Inline-4',
      power: '315 hp',
      torque: '580 Nm',
      weight: '1,230 kg',
      acceleration: '3.8s',
      topSpeed: '200+ km/h',
      drivetrain: 'AWD'
    },
    history: 'Sébastien Loeb\'s weapon of choice. The C4 WRC won the Driver\'s title every single year it competed (2007-2010), cementing Citroën\'s dominance on tarmac surfaces.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Citroen_C4_WRC.JPG',
    accentColor: '#dc2626' // Red
  },
  {
    id: 'ferrari-f40',
    name: 'Ferrari F40',
    manufacturer: 'Ferrari',
    year: '1987',
    class: 'Supercar',
    specs: {
      engine: '2.9L Twin-Turbo V8',
      power: '471 hp',
      torque: '577 Nm',
      weight: '1,100 kg',
      acceleration: '4.1s',
      topSpeed: '324 km/h',
      drivetrain: 'RWD'
    },
    history: 'The last car approved by Enzo Ferrari. Raw, visceral, and devoid of driver aids. It was the first production car to break the 200 mph barrier and remains a benchmark for analog driving.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Red_Ferrari_F40.jpg',
    accentColor: '#ef4444' // Rosso Corsa
  },
  {
    id: 'lexus-lfa',
    name: 'Lexus LFA',
    manufacturer: 'Lexus',
    year: '2010',
    class: 'Supercar',
    specs: {
      engine: '4.8L V10 (1LR-GUE)',
      power: '552 hp',
      torque: '480 Nm',
      weight: '1,480 kg',
      acceleration: '3.7s',
      topSpeed: '325 km/h',
      drivetrain: 'RWD'
    },
    history: 'A masterpiece of engineering. Its V10 revs so fast a digital tachometer was required. The exhaust note, tuned by Yamaha, is widely considered the greatest sound in automotive history.',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lexus_LFA.jpg',
    accentColor: '#fde047' // Yellow/White
  }
];