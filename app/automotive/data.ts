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
  image: string; // Kept for manual overrides
  searchQuery?: string; // New field for Wikipedia/Image search
  accentColor: string;
}

export const CARS: Car[] = [
  // ===========================================================================
  // ZENITH (1/5 Drop Rate - The Ultimate)
  // ===========================================================================
  {
    id: '919-hybrid-evo',
    name: '919 Hybrid Evo',
    manufacturer: 'Porsche',
    year: '2018',
    class: 'Le Mans Prototype',
    specs: { engine: '2.0L V4 Turbo + Hybrid', power: '1,160 hp', torque: 'Unknown', weight: '849 kg', acceleration: '2.2s', topSpeed: '369 km/h', drivetrain: 'AWD' },
    history: 'Freed from regulation restrictions, the 919 Evo destroyed the Nürburgring lap record with a 5:19.546. It is the ultimate evolution of the LMP1 platform.',
    image: '',
    searchQuery: 'Porsche 919 Hybrid',
    accentColor: '#525252'
  },

  // ===========================================================================
  // ULTRA (Formula 1, Le Mans Icons, Hypercars)
  // ===========================================================================
  {
    id: 'mp4-4',
    name: 'McLaren MP4/4',
    manufacturer: 'McLaren',
    year: '1988',
    class: 'Formula 1',
    specs: { engine: '1.5L V6 Turbo (Honda)', power: '650+ hp', torque: 'Unknown', weight: '540 kg', acceleration: '2.5s', topSpeed: '330 km/h', drivetrain: 'RWD' },
    history: 'Driven by Senna and Prost, this car won 15 out of 16 races in the 1988 season, making it statistically the most dominant F1 car in history.',
    image: '',
    searchQuery: 'McLaren MP4/4',
    accentColor: '#ef4444'
  },
  {
    id: 'f2004',
    name: 'Ferrari F2004',
    manufacturer: 'Ferrari',
    year: '2004',
    class: 'Formula 1',
    specs: { engine: '3.0L V10', power: '900+ hp', torque: 'Unknown', weight: '605 kg', acceleration: '2.0s', topSpeed: '360 km/h', drivetrain: 'RWD' },
    history: 'Michael Schumacher\'s greatest weapon. The F2004 set lap records that stood for over a decade, representing the absolute peak of the V10 era.',
    image: '',
    searchQuery: 'Ferrari F2004',
    accentColor: '#dc2626'
  },
  {
    id: 'w11',
    name: 'Mercedes-AMG W11',
    manufacturer: 'Mercedes-AMG',
    year: '2020',
    class: 'Formula 1',
    specs: { engine: '1.6L V6 Turbo Hybrid', power: '1000+ hp', torque: 'Unknown', weight: '746 kg', acceleration: '2.3s', topSpeed: '350 km/h', drivetrain: 'RWD' },
    history: 'Often cited as the fastest F1 car over a single lap ever built. It featured the controversial DAS system and delivered Lewis Hamilton his 7th title.',
    image: '',
    searchQuery: 'Mercedes-AMG F1 W11 EQ Performance',
    accentColor: '#000000'
  },
  {
    id: '787b',
    name: 'Mazda 787B',
    manufacturer: 'Mazda',
    year: '1991',
    class: 'Le Mans Prototype',
    specs: { engine: '2.6L 4-Rotor (R26B)', power: '700 hp', torque: '608 Nm', weight: '830 kg', acceleration: '2.9s', topSpeed: '340 km/h', drivetrain: 'RWD' },
    history: 'The only rotary-powered car to ever win the 24 Hours of Le Mans. Its screaming exhaust note is legendary among motorsport fans.',
    image: '',
    searchQuery: 'Mazda 787B',
    accentColor: '#f97316'
  },
  {
    id: 'gt40-mk2',
    name: 'Ford GT40 Mk II',
    manufacturer: 'Ford',
    year: '1966',
    class: 'Le Mans Prototype',
    specs: { engine: '7.0L V8', power: '485 hp', torque: '644 Nm', weight: '1,200 kg', acceleration: '4.0s', topSpeed: '330 km/h', drivetrain: 'RWD' },
    history: 'The car built to beat Ferrari. It secured a historic 1-2-3 finish at Le Mans in 1966, ending Italian dominance in endurance racing.',
    image: '',
    searchQuery: 'Ford GT40',
    accentColor: '#1e3a8a'
  },
  {
    id: 'mclaren-f1',
    name: 'McLaren F1',
    manufacturer: 'McLaren',
    year: '1993',
    class: 'Hypercar',
    specs: { engine: '6.1L V12 (BMW)', power: '627 hp', torque: '650 Nm', weight: '1,138 kg', acceleration: '3.2s', topSpeed: '386 km/h', drivetrain: 'RWD' },
    history: 'Gordon Murray\'s masterpiece. With a central driving position and gold-lined engine bay, it held the production speed record for over a decade.',
    image: '',
    searchQuery: 'McLaren F1',
    accentColor: '#ea580c'
  },
  {
    id: 'veyron-ss',
    name: 'Veyron Super Sport',
    manufacturer: 'Bugatti',
    year: '2010',
    class: 'Hypercar',
    specs: { engine: '8.0L Quad-Turbo W16', power: '1,200 hp', torque: '1500 Nm', weight: '1,888 kg', acceleration: '2.5s', topSpeed: '431 km/h', drivetrain: 'AWD' },
    history: 'The first production car to break the 430 km/h barrier. It redefined what was physically possible for a road-legal vehicle.',
    image: '',
    searchQuery: 'Bugatti Veyron',
    accentColor: '#000000'
  },
  {
    id: 'chiron-ss-300',
    name: 'Chiron Super Sport 300+',
    manufacturer: 'Bugatti',
    year: '2019',
    class: 'Hypercar',
    specs: { engine: '8.0L Quad-Turbo W16', power: '1,578 hp', torque: '1600 Nm', weight: '1,978 kg', acceleration: '2.4s', topSpeed: '490 km/h', drivetrain: 'AWD' },
    history: 'The first production car to break the 300 mph barrier, hitting 304.773 mph at Ehra-Lessien.',
    image: '',
    searchQuery: 'Bugatti Chiron',
    accentColor: '#ea580c'
  },
  {
    id: 'jesko-absolut',
    name: 'Jesko Absolut',
    manufacturer: 'Koenigsegg',
    year: '2022',
    class: 'Hypercar',
    specs: { engine: '5.0L Twin-Turbo V8', power: '1,600 hp', torque: '1500 Nm', weight: '1,320 kg', acceleration: '2.5s', topSpeed: '530+ km/h', drivetrain: 'RWD' },
    history: 'Koenigsegg\'s fastest ever car. Designed purely for straight-line speed with a drag coefficient of just 0.278Cd.',
    image: '',
    searchQuery: 'Koenigsegg Jesko',
    accentColor: '#9ca3af'
  },
  {
    id: 'valkyrie',
    name: 'Aston Martin Valkyrie',
    manufacturer: 'Aston Martin',
    year: '2021',
    class: 'Hypercar',
    specs: { engine: '6.5L V12 Hybrid', power: '1,160 hp', torque: '900 Nm', weight: '1,030 kg', acceleration: '2.5s', topSpeed: '400 km/h', drivetrain: 'RWD' },
    history: 'A Formula 1 car for the road, designed by Adrian Newey. It generates more downforce than its own weight at high speeds.',
    image: '',
    searchQuery: 'Aston Martin Valkyrie',
    accentColor: '#047857'
  },
  {
    id: 'laferrari',
    name: 'LaFerrari',
    manufacturer: 'Ferrari',
    year: '2013',
    class: 'Hypercar',
    specs: { engine: '6.3L V12 Hybrid', power: '950 hp', torque: '900 Nm', weight: '1,255 kg', acceleration: '2.4s', topSpeed: '350 km/h', drivetrain: 'RWD' },
    history: 'The definitive hybrid Ferrari. Part of the "Holy Trinity," it combines a screaming V12 with KERS technology derived from F1.',
    image: '',
    searchQuery: 'LaFerrari',
    accentColor: '#dc2626'
  },
  {
    id: 'p1',
    name: 'McLaren P1',
    manufacturer: 'McLaren',
    year: '2013',
    class: 'Hypercar',
    specs: { engine: '3.8L Twin-Turbo V8 Hybrid', power: '903 hp', torque: '900 Nm', weight: '1,395 kg', acceleration: '2.8s', topSpeed: '350 km/h', drivetrain: 'RWD' },
    history: 'Designed to be the best driver\'s car in the world on road and track. Its "Race Mode" lowers the car by 50mm and stiffens suspension by 300%.',
    image: '',
    searchQuery: 'McLaren P1',
    accentColor: '#facc15'
  },
  {
    id: '918-spyder',
    name: 'Porsche 918 Spyder',
    manufacturer: 'Porsche',
    year: '2013',
    class: 'Hypercar',
    specs: { engine: '4.6L V8 Hybrid', power: '875 hp', torque: '1280 Nm', weight: '1,634 kg', acceleration: '2.6s', topSpeed: '345 km/h', drivetrain: 'AWD' },
    history: 'The first production car to break the 7-minute barrier at the Nürburgring. It proved that hybrid power could enhance, not dilute, the driving experience.',
    image: '',
    searchQuery: 'Porsche 918 Spyder',
    accentColor: '#a1a1aa'
  },
  {
    id: 'venom-f5',
    name: 'Hennessey Venom F5',
    manufacturer: 'Hennessey',
    year: '2022',
    class: 'Hypercar',
    specs: { engine: '6.6L Twin-Turbo V8', power: '1,817 hp', torque: '1617 Nm', weight: '1,360 kg', acceleration: '2.6s', topSpeed: '500+ km/h', drivetrain: 'RWD' },
    history: 'Named after the highest rating on the Fujita tornado scale, built to exceed 300 mph.',
    image: '',
    searchQuery: 'Hennessey Venom GT',
    accentColor: '#facc15'
  },
  {
    id: 'zonda-r',
    name: 'Pagani Zonda R',
    manufacturer: 'Pagani',
    year: '2009',
    class: 'Hypercar',
    specs: { engine: '6.0L V12 (AMG)', power: '740 hp', torque: '710 Nm', weight: '1,070 kg', acceleration: '2.7s', topSpeed: '350 km/h', drivetrain: 'RWD' },
    history: 'A track-only laboratory for Pagani. It shares less than 10% of its parts with the road-going Zonda and is known for its ear-splitting exhaust note.',
    image: '',
    searchQuery: 'Pagani Zonda R',
    accentColor: '#000000'
  },

  // ===========================================================================
  // SUPER RARE
  // ===========================================================================
  {
    id: 'quattro-s1',
    name: 'Sport Quattro S1 E2',
    manufacturer: 'Audi',
    year: '1985',
    class: 'Group B',
    specs: { engine: '2.1L Inline-5 Turbo', power: '550 hp', torque: '590 Nm', weight: '1,090 kg', acceleration: '3.1s', topSpeed: '220 km/h', drivetrain: 'Quattro AWD' },
    history: 'The ultimate Group B monster. The distinctive 5-cylinder scream and massive aero make it a rally icon.',
    image: '',
    searchQuery: 'Audi Sport Quattro S1',
    accentColor: '#fbbf24'
  },
  {
    id: 'delta-s4',
    name: 'Lancia Delta S4',
    manufacturer: 'Lancia',
    year: '1985',
    class: 'Group B',
    specs: { engine: '1.8L Twincharged I4', power: '500+ hp', torque: '450 Nm', weight: '890 kg', acceleration: '2.4s', topSpeed: '225 km/h', drivetrain: 'AWD' },
    history: 'Twincharged (turbo + supercharger) to eliminate lag. Henri Toivonen famously noted it was scary to drive even for him.',
    image: '',
    searchQuery: 'Lancia Delta S4',
    accentColor: '#b91c1c'
  },
  {
    id: '205-t16',
    name: 'Peugeot 205 T16',
    manufacturer: 'Peugeot',
    year: '1984',
    class: 'Group B',
    specs: { engine: '1.8L Turbo I4', power: '450 hp', torque: '490 Nm', weight: '910 kg', acceleration: '2.9s', topSpeed: '210 km/h', drivetrain: 'AWD' },
    history: 'The most successful Group B car, winning two constructors\' and two drivers\' titles with its mid-engine layout.',
    image: '',
    searchQuery: 'Peugeot 205 Turbo 16',
    accentColor: '#fcd34d'
  },
  {
    id: 'rs200',
    name: 'Ford RS200',
    manufacturer: 'Ford',
    year: '1984',
    class: 'Group B',
    specs: { engine: '1.8L Turbo I4', power: '450 hp', torque: '490 Nm', weight: '1,050 kg', acceleration: '3.0s', topSpeed: '250 km/h', drivetrain: 'AWD' },
    history: 'Purpose-built for rallying with a Ghia-designed body. It arrived late to the Group B party but remains a cult icon.',
    image: '',
    searchQuery: 'Ford RS200',
    accentColor: '#2563eb'
  },
  {
    id: 'f40',
    name: 'Ferrari F40',
    manufacturer: 'Ferrari',
    year: '1987',
    class: 'Supercar',
    specs: { engine: '2.9L Twin-Turbo V8', power: '471 hp', torque: '577 Nm', weight: '1,100 kg', acceleration: '4.1s', topSpeed: '324 km/h', drivetrain: 'RWD' },
    history: 'The last car approved by Enzo Ferrari. Raw, visceral, and devoid of driver aids. The first production car to break 200 mph.',
    image: '',
    searchQuery: 'Ferrari F40',
    accentColor: '#ef4444'
  },
  {
    id: 'f50',
    name: 'Ferrari F50',
    manufacturer: 'Ferrari',
    year: '1995',
    class: 'Supercar',
    specs: { engine: '4.7L V12', power: '512 hp', torque: '471 Nm', weight: '1,230 kg', acceleration: '3.8s', topSpeed: '325 km/h', drivetrain: 'RWD' },
    history: 'Featuring an F1-derived V12 bolted directly to the chassis, the F50 offers one of the most immersive driving experiences ever created.',
    image: '',
    searchQuery: 'Ferrari F50',
    accentColor: '#ef4444'
  },
  {
    id: 'enzo',
    name: 'Enzo Ferrari',
    manufacturer: 'Ferrari',
    year: '2002',
    class: 'Supercar',
    specs: { engine: '6.0L V12', power: '651 hp', torque: '657 Nm', weight: '1,255 kg', acceleration: '3.1s', topSpeed: '355 km/h', drivetrain: 'RWD' },
    history: 'Named after the founder, it brought F1 technology like carbon-ceramic brakes and automated shift paddles to the street.',
    image: '',
    searchQuery: 'Enzo Ferrari',
    accentColor: '#dc2626'
  },
  {
    id: 'carrera-gt',
    name: 'Porsche Carrera GT',
    manufacturer: 'Porsche',
    year: '2004',
    class: 'Supercar',
    specs: { engine: '5.7L V10', power: '603 hp', torque: '590 Nm', weight: '1,380 kg', acceleration: '3.5s', topSpeed: '330 km/h', drivetrain: 'RWD' },
    history: 'Powered by a V10 originally developed for Le Mans, renowned for its challenging handling, wooden shift knob, and incredible sound.',
    image: '',
    searchQuery: 'Porsche Carrera GT',
    accentColor: '#d4d4d8'
  },
  {
    id: 'lfa',
    name: 'Lexus LFA',
    manufacturer: 'Lexus',
    year: '2010',
    class: 'Supercar',
    specs: { engine: '4.8L V10', power: '552 hp', torque: '480 Nm', weight: '1,480 kg', acceleration: '3.7s', topSpeed: '325 km/h', drivetrain: 'RWD' },
    history: 'A carbon-fiber masterpiece. Its engine revs so fast analog gauges couldn\'t keep up, requiring a digital display.',
    image: '',
    searchQuery: 'Lexus LFA',
    accentColor: '#fef08a'
  },
  {
    id: 'aventador-svj',
    name: 'Aventador SVJ',
    manufacturer: 'Lamborghini',
    year: '2018',
    class: 'Supercar',
    specs: { engine: '6.5L V12', power: '759 hp', torque: '720 Nm', weight: '1,525 kg', acceleration: '2.8s', topSpeed: '350 km/h', drivetrain: 'AWD' },
    history: 'The ultimate iteration of the Aventador. It held the production car lap record at the Nürburgring using active aerodynamics (ALA).',
    image: '',
    searchQuery: 'Lamborghini Aventador',
    accentColor: '#84cc16'
  },
  {
    id: 'murcielago-sv',
    name: 'Murciélago LP670-4 SV',
    manufacturer: 'Lamborghini',
    year: '2009',
    class: 'Supercar',
    specs: { engine: '6.5L V12', power: '661 hp', torque: '660 Nm', weight: '1,565 kg', acceleration: '3.2s', topSpeed: '342 km/h', drivetrain: 'AWD' },
    history: 'The final evolution of the Bizzarrini V12 engine block. Aggressive, loud, and delightfully old-school.',
    image: '',
    searchQuery: 'Lamborghini Murciélago',
    accentColor: '#f97316'
  },
  {
    id: 'countach',
    name: 'Countach LP5000 QV',
    manufacturer: 'Lamborghini',
    year: '1985',
    class: 'Supercar',
    specs: { engine: '5.2L V12', power: '455 hp', torque: '500 Nm', weight: '1,490 kg', acceleration: '4.8s', topSpeed: '298 km/h', drivetrain: 'RWD' },
    history: 'The poster car of the 80s. Designed by Gandini, its scissor doors and wedge shape defined the supercar aesthetic for decades.',
    image: '',
    searchQuery: 'Lamborghini Countach',
    accentColor: '#ffffff'
  },
  {
    id: 'miura',
    name: 'Miura P400 SV',
    manufacturer: 'Lamborghini',
    year: '1971',
    class: 'Supercar',
    specs: { engine: '3.9L V12', power: '380 hp', torque: '400 Nm', weight: '1,298 kg', acceleration: '6.5s', topSpeed: '290 km/h', drivetrain: 'RWD' },
    history: 'Widely considered the first "supercar" and the most beautiful car ever made. It pioneered the mid-engine two-seat layout.',
    image: '',
    searchQuery: 'Lamborghini Miura',
    accentColor: '#facc15'
  },
  {
    id: 'ford-gt-05',
    name: 'Ford GT (2005)',
    manufacturer: 'Ford',
    year: '2005',
    class: 'Supercar',
    specs: { engine: '5.4L Supercharged V8', power: '550 hp', torque: '678 Nm', weight: '1,538 kg', acceleration: '3.5s', topSpeed: '330 km/h', drivetrain: 'RWD' },
    history: 'A retro-modern homage to the GT40. Famous for its bulletproof engine and lack of electronic aids.',
    image: '',
    searchQuery: 'Ford GT 2005',
    accentColor: '#1e3a8a'
  },
  {
    id: 'ford-gt-17',
    name: 'Ford GT (2017)',
    manufacturer: 'Ford',
    year: '2017',
    class: 'Supercar',
    specs: { engine: '3.5L Twin-Turbo V6', power: '647 hp', torque: '746 Nm', weight: '1,385 kg', acceleration: '3.0s', topSpeed: '347 km/h', drivetrain: 'RWD' },
    history: 'Built to win Le Mans again (which it did in 2016). It features a radical carbon fiber monocoque and flying buttresses for aero.',
    image: '',
    searchQuery: 'Ford GT 2017',
    accentColor: '#2563eb'
  },
  {
    id: 'ccx',
    name: 'Koenigsegg CCX',
    manufacturer: 'Koenigsegg',
    year: '2006',
    class: 'Supercar',
    specs: { engine: '4.7L Twin-Supercharged V8', power: '806 hp', torque: '920 Nm', weight: '1,280 kg', acceleration: '3.2s', topSpeed: '395 km/h', drivetrain: 'RWD' },
    history: 'The car that put Koenigsegg on the map globally. Famous for crashing the Top Gear lap board (before they added the wing).',
    image: '',
    searchQuery: 'Koenigsegg CCX',
    accentColor: '#d4d4d8'
  },
  {
    id: 'xj220',
    name: 'Jaguar XJ220',
    manufacturer: 'Jaguar',
    year: '1992',
    class: 'Supercar',
    specs: { engine: '3.5L Twin-Turbo V6', power: '542 hp', torque: '644 Nm', weight: '1,470 kg', acceleration: '3.6s', topSpeed: '341 km/h', drivetrain: 'RWD' },
    history: 'Once the fastest production car in the world. Despite controversy over its engine (V6 instead of V12), it remains a design icon.',
    image: '',
    searchQuery: 'Jaguar XJ220',
    accentColor: '#0f172a'
  },
  {
    id: 'slr-mclaren',
    name: 'SLR McLaren',
    manufacturer: 'Mercedes-Benz',
    year: '2003',
    class: 'Supercar',
    specs: { engine: '5.4L Supercharged V8', power: '617 hp', torque: '780 Nm', weight: '1,750 kg', acceleration: '3.8s', topSpeed: '334 km/h', drivetrain: 'RWD' },
    history: 'A grand tourer on steroids. Born from the F1 partnership between Mercedes and McLaren, featuring a side-exit exhaust and airbrake.',
    image: '',
    searchQuery: 'Mercedes-Benz SLR McLaren',
    accentColor: '#d4d4d8'
  },
  {
    id: 'one-77',
    name: 'Aston Martin One-77',
    manufacturer: 'Aston Martin',
    year: '2009',
    class: 'Supercar',
    specs: { engine: '7.3L V12', power: '750 hp', torque: '750 Nm', weight: '1,630 kg', acceleration: '3.7s', topSpeed: '354 km/h', drivetrain: 'RWD' },
    history: 'Only 77 were made. At launch, it featured the most powerful naturally aspirated production engine in the world.',
    image: '',
    searchQuery: 'Aston Martin One-77',
    accentColor: '#1e3a8a'
  },
  {
    id: 'gtr-nismo',
    name: 'GT-R Nismo (R35)',
    manufacturer: 'Nissan',
    year: '2020',
    class: 'Supercar',
    specs: { engine: '3.8L Twin-Turbo V6', power: '600 hp', torque: '652 Nm', weight: '1,703 kg', acceleration: '2.5s', topSpeed: '330 km/h', drivetrain: 'AWD' },
    history: 'The ultimate iteration of Godzilla. It defies physics with its weight, using advanced AWD computing to slay hypercars on track.',
    image: '',
    searchQuery: 'Nissan GT-R',
    accentColor: '#ffffff'
  },

  // ===========================================================================
  // RARE
  // ===========================================================================
  {
    id: 'impreza-22b',
    name: 'Impreza 22B STi',
    manufacturer: 'Subaru',
    year: '1998',
    class: 'JDM Legend',
    specs: { engine: '2.2L Turbo Flat-4', power: '280 hp', torque: '363 Nm', weight: '1,270 kg', acceleration: '4.7s', topSpeed: '248 km/h', drivetrain: 'AWD' },
    history: 'The holy grail of Subarus. Widebody coupe built to celebrate 3 consecutive WRC titles. Only 400 were made.',
    image: '',
    searchQuery: 'Subaru Impreza WRX STI',
    accentColor: '#2563eb'
  },
  {
    id: 'evo-vi-tme',
    name: 'Lancer Evo VI TME',
    manufacturer: 'Mitsubishi',
    year: '1999',
    class: 'JDM Legend',
    specs: { engine: '2.0L Turbo I4', power: '276 hp', torque: '373 Nm', weight: '1,360 kg', acceleration: '4.4s', topSpeed: '240 km/h', drivetrain: 'AWD' },
    history: 'The Tommi Mäkinen Edition. Tuned for tarmac responsiveness to celebrate the Finnish driver\'s 4 consecutive WRC titles.',
    image: '',
    searchQuery: 'Mitsubishi Lancer Evolution VI',
    accentColor: '#ef4444'
  },
  {
    id: 'r34-gtr',
    name: 'Skyline GT-R R34',
    manufacturer: 'Nissan',
    year: '2002',
    class: 'JDM Legend',
    specs: { engine: '2.6L Twin-Turbo I6', power: '276 hp', torque: '392 Nm', weight: '1,560 kg', acceleration: '4.9s', topSpeed: '250 km/h', drivetrain: 'AWD' },
    history: 'Godzilla. Known for its advanced ATTESA E-TS Pro all-wheel drive and immense tuning potential. A cultural icon.',
    image: '',
    searchQuery: 'Nissan Skyline GT-R R34',
    accentColor: '#2563eb'
  },
  {
    id: 'nsx-r',
    name: 'Honda NSX-R',
    manufacturer: 'Honda',
    year: '2002',
    class: 'JDM Legend',
    specs: { engine: '3.2L V6 VTEC', power: '290 hp', torque: '304 Nm', weight: '1,270 kg', acceleration: '4.7s', topSpeed: '280 km/h', drivetrain: 'RWD' },
    history: 'The everyday supercar. The R version stripped weight (no A/C, no radio) and tuned the suspension for pure track performance.',
    image: '',
    searchQuery: 'Honda NSX',
    accentColor: '#f9fafb'
  },
  {
    id: 'supra-mk4',
    name: 'Toyota Supra RZ',
    manufacturer: 'Toyota',
    year: '1998',
    class: 'JDM Legend',
    specs: { engine: '3.0L Twin-Turbo I6', power: '320 hp', torque: '427 Nm', weight: '1,510 kg', acceleration: '4.6s', topSpeed: '250 km/h', drivetrain: 'RWD' },
    history: 'Famous for the 2JZ-GTE engine, an iron-block monster capable of handling 1000+ hp with stock internals. Fast and Furious star.',
    image: '',
    searchQuery: 'Toyota Supra (A80)',
    accentColor: '#f97316'
  },
  {
    id: 'rx7-fd',
    name: 'Mazda RX-7 Spirit R',
    manufacturer: 'Mazda',
    year: '2002',
    class: 'JDM Legend',
    specs: { engine: '1.3L Twin-Turbo Rotary', power: '276 hp', torque: '314 Nm', weight: '1,280 kg', acceleration: '5.0s', topSpeed: '250 km/h', drivetrain: 'RWD' },
    history: 'The ultimate rotary sports car. Timeless design, perfect balance, and a sequential twin-turbo system that hits like a hammer.',
    image: '',
    searchQuery: 'Mazda RX-7',
    accentColor: '#1e3a8a'
  },
  {
    id: 'c4-wrc',
    name: 'Citroën C4 WRC',
    manufacturer: 'Citroën',
    year: '2007',
    class: 'WRC',
    specs: { engine: '2.0L Turbo I4', power: '315 hp', torque: '580 Nm', weight: '1,230 kg', acceleration: '3.8s', topSpeed: '200+ km/h', drivetrain: 'AWD' },
    history: 'The car that cemented Loeb\'s dominance. It was practically untouchable on tarmac surfaces during its tenure.',
    image: '',
    searchQuery: 'Citroën C4 WRC',
    accentColor: '#dc2626'
  },
  {
    id: 'escort-cossie',
    name: 'Escort RS Cosworth',
    manufacturer: 'Ford',
    year: '1992',
    class: 'WRC',
    specs: { engine: '2.0L Turbo I4', power: '224 hp', torque: '304 Nm', weight: '1,275 kg', acceleration: '5.7s', topSpeed: '232 km/h', drivetrain: 'AWD' },
    history: 'Famous for its massive "whale tail" spoiler. A homologation special that defined 90s rallying for Ford.',
    image: '',
    searchQuery: 'Ford Escort RS Cosworth',
    accentColor: '#2563eb'
  },
  {
    id: 'stratos',
    name: 'Lancia Stratos HF',
    manufacturer: 'Lancia',
    year: '1974',
    class: 'WRC',
    specs: { engine: '2.4L V6 (Ferrari)', power: '190 hp', torque: '226 Nm', weight: '980 kg', acceleration: '6.8s', topSpeed: '232 km/h', drivetrain: 'RWD' },
    history: 'The first car designed from scratch specifically for rallying. Powered by a Ferrari Dino V6, it won the WRC three times in a row.',
    image: '',
    searchQuery: 'Lancia Stratos',
    accentColor: '#ef4444'
  },
  {
    id: 'celica-gt4',
    name: 'Celica GT-Four (ST205)',
    manufacturer: 'Toyota',
    year: '1994',
    class: 'WRC',
    specs: { engine: '2.0L Turbo I4', power: '252 hp', torque: '304 Nm', weight: '1,390 kg', acceleration: '5.9s', topSpeed: '240 km/h', drivetrain: 'AWD' },
    history: 'Infamous for the clever turbo restrictor cheat in WRC. A true rally homologation special with unique suspension bits.',
    image: '',
    searchQuery: 'Toyota Celica GT-Four',
    accentColor: '#ffffff'
  },
  {
    id: 'focus-rs-wrc',
    name: 'Focus RS WRC',
    manufacturer: 'Ford',
    year: '1999',
    class: 'WRC',
    specs: { engine: '2.0L Turbo I4', power: '300 hp', torque: '550 Nm', weight: '1,230 kg', acceleration: '4.2s', topSpeed: '200 km/h', drivetrain: 'AWD' },
    history: 'Driven by Colin McRae. Known for its ruggedness and the famous "If in doubt, flat out" driving style it encouraged.',
    image: '',
    searchQuery: 'Ford Focus RS WRC',
    accentColor: '#2563eb'
  },
  {
    id: 'polo-r-wrc',
    name: 'Polo R WRC',
    manufacturer: 'Volkswagen',
    year: '2013',
    class: 'WRC',
    specs: { engine: '1.6L Turbo I4', power: '318 hp', torque: '430 Nm', weight: '1,200 kg', acceleration: '3.9s', topSpeed: '200 km/h', drivetrain: 'AWD' },
    history: 'A dominant force in modern rallying, winning four consecutive championships with Ogier before VW pulled out.',
    image: '',
    searchQuery: 'Volkswagen Polo R WRC',
    accentColor: '#1e3a8a'
  },
  {
    id: 'r32-gtr',
    name: 'Skyline GT-R R32',
    manufacturer: 'Nissan',
    year: '1989',
    class: 'JDM Legend',
    specs: { engine: '2.6L Twin-Turbo I6', power: '276 hp', torque: '353 Nm', weight: '1,430 kg', acceleration: '5.6s', topSpeed: '251 km/h', drivetrain: 'AWD' },
    history: 'The original Godzilla. It dominated Group A racing so thoroughly that the rules were changed to ban it.',
    image: '',
    searchQuery: 'Nissan Skyline GT-R R32',
    accentColor: '#374151'
  },
  {
    id: 's2000-cr',
    name: 'S2000 CR',
    manufacturer: 'Honda',
    year: '2008',
    class: 'JDM Legend',
    specs: { engine: '2.2L I4 VTEC', power: '237 hp', torque: '220 Nm', weight: '1,250 kg', acceleration: '6.2s', topSpeed: '241 km/h', drivetrain: 'RWD' },
    history: 'Club Racer. The ultimate S2000 with stiffer chassis, aero, and deleted sound insulation. The shifter is legendary.',
    image: '',
    searchQuery: 'Honda S2000',
    accentColor: '#facc15'
  },
  {
    id: 'dc2-type-r',
    name: 'Integra Type R (DC2)',
    manufacturer: 'Honda',
    year: '1995',
    class: 'JDM Legend',
    specs: { engine: '1.8L I4 VTEC', power: '197 hp', torque: '181 Nm', weight: '1,120 kg', acceleration: '6.5s', topSpeed: '233 km/h', drivetrain: 'FWD' },
    history: 'Widely considered the best handling front-wheel-drive car ever made. The B18C engine screams to 8,400 rpm.',
    image: '',
    searchQuery: 'Honda Integra Type R',
    accentColor: '#ffffff'
  },
  {
    id: 'silvia-s15',
    name: 'Silvia Spec-R (S15)',
    manufacturer: 'Nissan',
    year: '1999',
    class: 'JDM Legend',
    specs: { engine: '2.0L Turbo I4', power: '247 hp', torque: '274 Nm', weight: '1,240 kg', acceleration: '5.6s', topSpeed: '235 km/h', drivetrain: 'RWD' },
    history: 'The final Silvia. A drift icon thanks to its lightweight chassis and potent SR20DET engine.',
    image: '',
    searchQuery: 'Nissan Silvia S15',
    accentColor: '#2563eb'
  },
  {
    id: 'fairlady-z432',
    name: 'Fairlady Z432',
    manufacturer: 'Nissan',
    year: '1969',
    class: 'JDM Legend',
    specs: { engine: '2.0L I6 (S20)', power: '160 hp', torque: '177 Nm', weight: '1,040 kg', acceleration: '8.0s', topSpeed: '210 km/h', drivetrain: 'RWD' },
    history: 'A 240Z powered by the GT-R engine. 4 valves, 3 carburetors, 2 cams (4-3-2). Rare and highly collectible.',
    image: '',
    searchQuery: 'Nissan Fairlady Z',
    accentColor: '#f97316'
  },
  {
    id: '2000gt',
    name: 'Toyota 2000GT',
    manufacturer: 'Toyota',
    year: '1967',
    class: 'JDM Legend',
    specs: { engine: '2.0L I6', power: '148 hp', torque: '175 Nm', weight: '1,120 kg', acceleration: '8.6s', topSpeed: '217 km/h', drivetrain: 'RWD' },
    history: 'Japan\'s first supercar. Developed with Yamaha, it proved that Japan could build world-class sports cars. James Bond drove a convertible version.',
    image: '',
    searchQuery: 'Toyota 2000GT',
    accentColor: '#ffffff'
  },
  {
    id: 'gt3-rs-992',
    name: '911 GT3 RS (992)',
    manufacturer: 'Porsche',
    year: '2022',
    class: 'Track Special',
    specs: { engine: '4.0L NA Flat-6', power: '518 hp', torque: '465 Nm', weight: '1,450 kg', acceleration: '3.2s', topSpeed: '296 km/h', drivetrain: 'RWD' },
    history: 'Features F1-style DRS. Its active aerodynamics produce 860kg of downforce, more than a GT3 Cup car. The ultimate track weapon.',
    image: '',
    searchQuery: 'Porsche 911 GT3',
    accentColor: '#ef4444'
  },
  {
    id: 'amg-gt-black',
    name: 'AMG GT Black Series',
    manufacturer: 'Mercedes-AMG',
    year: '2021',
    class: 'Track Special',
    specs: { engine: '4.0L V8 Bi-Turbo', power: '720 hp', torque: '800 Nm', weight: '1,588 kg', acceleration: '3.2s', topSpeed: '325 km/h', drivetrain: 'RWD' },
    history: 'Flat-plane crank V8. It held the production car lap record at the Nürburgring. The most focused AMG ever.',
    image: '',
    searchQuery: 'Mercedes-AMG GT Black Series',
    accentColor: '#f97316'
  },
  {
    id: 'viper-acr',
    name: 'Viper ACR',
    manufacturer: 'Dodge',
    year: '2016',
    class: 'Track Special',
    specs: { engine: '8.4L V10', power: '645 hp', torque: '813 Nm', weight: '1,500 kg', acceleration: '3.3s', topSpeed: '285 km/h', drivetrain: 'RWD' },
    history: 'A street-legal race car that famously broke 13 track records across America. Massive aero and mechanical grip.',
    image: '',
    searchQuery: 'Dodge Viper ACR',
    accentColor: '#ffffff'
  },
  {
    id: '488-pista',
    name: '488 Pista',
    manufacturer: 'Ferrari',
    year: '2018',
    class: 'Track Special',
    specs: { engine: '3.9L Twin-Turbo V8', power: '710 hp', torque: '770 Nm', weight: '1,385 kg', acceleration: '2.85s', topSpeed: '340 km/h', drivetrain: 'RWD' },
    history: '"Pista" means track. It uses the most powerful V8 in Ferrari history and features the S-Duct for aerodynamic efficiency.',
    image: '',
    searchQuery: 'Ferrari 488 Pista',
    accentColor: '#ef4444'
  },
  {
    id: 'huracan-sto',
    name: 'Huracán STO',
    manufacturer: 'Lamborghini',
    year: '2021',
    class: 'Track Special',
    specs: { engine: '5.2L V10', power: '630 hp', torque: '565 Nm', weight: '1,339 kg', acceleration: '3.0s', topSpeed: '310 km/h', drivetrain: 'RWD' },
    history: 'Super Trofeo Omologata. A road-legal version of the Super Trofeo race car. RWD, aggressive aero, and a roof scoop.',
    image: '',
    searchQuery: 'Lamborghini Huracán',
    accentColor: '#3b82f6'
  },

  // ===========================================================================
  // UNCOMMON
  // ===========================================================================
  // Using generic search queries for common models to ensure high quality results
  {
    id: 'm3-e30',
    name: 'BMW M3 E30',
    manufacturer: 'BMW',
    year: '1986',
    class: 'Touring',
    specs: { engine: '2.3L I4', power: '200 hp', torque: '240 Nm', weight: '1,200 kg', acceleration: '6.7s', topSpeed: '235 km/h', drivetrain: 'RWD' },
    history: 'The most successful touring car ever raced. Boxy fenders and pure driving dynamics make it a homologation icon.',
    image: '',
    searchQuery: 'BMW M3 E30',
    accentColor: '#dc2626'
  },
  // ... (Other uncommons will use their name which is usually fine)
];