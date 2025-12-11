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
    history: 'Freed from regulation restrictions, the 919 Evo destroyed the Nürburgring lap record with a 5:19.546. It is the ultimate evolution of the LMP1 platform and a testament to engineering freedom.',
    image: '',
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
    accentColor: '#000000'
  },

  // ===========================================================================
  // SUPER RARE (Group B, Flagship Supercars)
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
    accentColor: '#ffffff'
  },

  // ===========================================================================
  // RARE (WRC Heroes, JDM Legends)
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
    accentColor: '#3b82f6'
  },

  // ===========================================================================
  // UNCOMMON (Touring, Muscle, Sports)
  // ===========================================================================
  {
    id: 'm3-e30',
    name: 'BMW M3 E30',
    manufacturer: 'BMW',
    year: '1986',
    class: 'Touring',
    specs: { engine: '2.3L I4', power: '200 hp', torque: '240 Nm', weight: '1,200 kg', acceleration: '6.7s', topSpeed: '235 km/h', drivetrain: 'RWD' },
    history: 'The most successful touring car ever raced. Boxy fenders and pure driving dynamics make it a homologation icon.',
    image: '',
    accentColor: '#dc2626'
  },
  {
    id: '190e-evo2',
    name: '190E 2.5-16 Evo II',
    manufacturer: 'Mercedes-Benz',
    year: '1990',
    class: 'Touring',
    specs: { engine: '2.5L I4', power: '232 hp', torque: '245 Nm', weight: '1,340 kg', acceleration: '7.1s', topSpeed: '250 km/h', drivetrain: 'RWD' },
    history: 'The DTM legend. Its aggressive body kit was wind-tunnel tested to beat the M3. Only 502 were produced.',
    image: '',
    accentColor: '#18181b'
  },
  {
    id: 'giulia-gtam',
    name: 'Giulia GTAm',
    manufacturer: 'Alfa Romeo',
    year: '2021',
    class: 'Touring',
    specs: { engine: '2.9L Twin-Turbo V6', power: '533 hp', torque: '600 Nm', weight: '1,520 kg', acceleration: '3.6s', topSpeed: '300 km/h', drivetrain: 'RWD' },
    history: 'The ultimate Alfa sedan. Wider tracks, carbon fiber everywhere, and a massive wing. A celebration of Alfa\'s 110th anniversary.',
    image: '',
    accentColor: '#b91c1c'
  },
  {
    id: 'm5-e39',
    name: 'BMW M5 (E39)',
    manufacturer: 'BMW',
    year: '1998',
    class: 'Touring',
    specs: { engine: '4.9L V8', power: '394 hp', torque: '500 Nm', weight: '1,795 kg', acceleration: '4.8s', topSpeed: '250 km/h', drivetrain: 'RWD' },
    history: 'Widely regarded as the perfect sports sedan. The first M5 with a V8, balancing luxury and tire-shredding performance.',
    image: '',
    accentColor: '#1e3a8a'
  },
  {
    id: 'rs6-avant',
    name: 'RS6 Avant (C8)',
    manufacturer: 'Audi',
    year: '2020',
    class: 'Touring',
    specs: { engine: '4.0L Twin-Turbo V8', power: '591 hp', torque: '800 Nm', weight: '2,075 kg', acceleration: '3.6s', topSpeed: '305 km/h', drivetrain: 'AWD' },
    history: 'The ultimate grocery getter. Aggressive styling and supercar performance in a practical wagon body.',
    image: '',
    accentColor: '#525252'
  },
  {
    id: 'mustang-gt350',
    name: 'Shelby GT350R',
    manufacturer: 'Ford',
    year: '1965',
    class: 'Muscle',
    specs: { engine: '4.7L V8', power: '306 hp', torque: '446 Nm', weight: '1,268 kg', acceleration: '6.5s', topSpeed: '216 km/h', drivetrain: 'RWD' },
    history: 'Carroll Shelby transformed the Mustang from a secretary\'s car into a race winner. Stripped out and stiffened for the track.',
    image: '',
    accentColor: '#1e3a8a'
  },
  {
    id: 'corvette-c2',
    name: 'Corvette Sting Ray',
    manufacturer: 'Chevrolet',
    year: '1963',
    class: 'Muscle',
    specs: { engine: '5.4L V8', power: '360 hp', torque: '477 Nm', weight: '1,400 kg', acceleration: '5.8s', topSpeed: '230 km/h', drivetrain: 'RWD' },
    history: 'The Split-Window coupe. An icon of American design and speed, featuring independent rear suspension for the first time.',
    image: '',
    accentColor: '#991b1b'
  },
  {
    id: 'charger-rt',
    name: 'Dodge Charger R/T',
    manufacturer: 'Dodge',
    year: '1969',
    class: 'Muscle',
    specs: { engine: '7.0L Hemi V8', power: '425 hp', torque: '664 Nm', weight: '1,700 kg', acceleration: '5.2s', topSpeed: '217 km/h', drivetrain: 'RWD' },
    history: 'The quintessential muscle car. Massive size, massive engine, and immortalized by "The Dukes of Hazzard" and "Bullitt".',
    image: '',
    accentColor: '#f97316'
  },
  {
    id: 'camaro-z28',
    name: 'Camaro Z/28',
    manufacturer: 'Chevrolet',
    year: '1969',
    class: 'Muscle',
    specs: { engine: '4.9L V8', power: '290 hp', torque: '393 Nm', weight: '1,420 kg', acceleration: '7.4s', topSpeed: '210 km/h', drivetrain: 'RWD' },
    history: 'Built for Trans-Am racing. The engine was underrated from the factory and loved to rev high.',
    image: '',
    accentColor: '#1e3a8a'
  },
  {
    id: 'cuda-hemi',
    name: 'Plymouth Hemi \'Cuda',
    manufacturer: 'Plymouth',
    year: '1971',
    class: 'Muscle',
    specs: { engine: '7.0L Hemi V8', power: '425 hp', torque: '664 Nm', weight: '1,550 kg', acceleration: '5.8s', topSpeed: '210 km/h', drivetrain: 'RWD' },
    history: 'One of the rarest and most sought-after muscle cars. The 426 Hemi engine was a street-legal race engine.',
    image: '',
    accentColor: '#84cc16'
  },
  {
    id: 'cobra-427',
    name: 'Shelby Cobra 427',
    manufacturer: 'Shelby',
    year: '1965',
    class: 'Muscle',
    specs: { engine: '7.0L V8', power: '425 hp', torque: '651 Nm', weight: '1,068 kg', acceleration: '4.2s', topSpeed: '264 km/h', drivetrain: 'RWD' },
    history: 'British chassis, American engine. A terrifyingly fast roadster that defined the "big engine in small car" formula.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'gto-judge',
    name: 'Pontiac GTO Judge',
    manufacturer: 'Pontiac',
    year: '1969',
    class: 'Muscle',
    specs: { engine: '6.6L V8', power: '366 hp', torque: '603 Nm', weight: '1,600 kg', acceleration: '6.0s', topSpeed: '200 km/h', drivetrain: 'RWD' },
    history: '"Here comes the Judge." A pop-culture icon that represents the peak of the muscle car era with wild decals and spoilers.',
    image: '',
    accentColor: '#f97316'
  },
  {
    id: 'gnx',
    name: 'Buick GNX',
    manufacturer: 'Buick',
    year: '1987',
    class: 'Muscle',
    specs: { engine: '3.8L Turbo V6', power: '276 hp', torque: '488 Nm', weight: '1,590 kg', acceleration: '4.6s', topSpeed: '200 km/h', drivetrain: 'RWD' },
    history: 'Darth Vader\'s car. Built with McLaren engines, it was faster than the Corvette and Ferrari F40 in the quarter mile in 1987.',
    image: '',
    accentColor: '#000000'
  },
  {
    id: 'db5',
    name: 'Aston Martin DB5',
    manufacturer: 'Aston Martin',
    year: '1963',
    class: 'Classic',
    specs: { engine: '4.0L I6', power: '282 hp', torque: '390 Nm', weight: '1,502 kg', acceleration: '8.0s', topSpeed: '233 km/h', drivetrain: 'RWD' },
    history: 'The most famous car in the world. James Bond\'s gadget-laden ride. Elegance and British engineering combined.',
    image: '',
    accentColor: '#9ca3af'
  },
  {
    id: 'e-type',
    name: 'Jaguar E-Type',
    manufacturer: 'Jaguar',
    year: '1961',
    class: 'Classic',
    specs: { engine: '3.8L I6', power: '265 hp', torque: '353 Nm', weight: '1,315 kg', acceleration: '7.0s', topSpeed: '241 km/h', drivetrain: 'RWD' },
    history: 'Enzo Ferrari called it "the most beautiful car ever made." It offered supercar performance for a fraction of the price.',
    image: '',
    accentColor: '#047857'
  },
  {
    id: '300sl',
    name: '300 SL Gullwing',
    manufacturer: 'Mercedes-Benz',
    year: '1954',
    class: 'Classic',
    specs: { engine: '3.0L I6', power: '215 hp', torque: '275 Nm', weight: '1,295 kg', acceleration: '8.8s', topSpeed: '260 km/h', drivetrain: 'RWD' },
    history: 'The first production car with fuel injection. The gullwing doors were a necessity due to the high tubular spaceframe chassis.',
    image: '',
    accentColor: '#d4d4d8'
  },
  {
    id: '911-turbo-930',
    name: '911 Turbo (930)',
    manufacturer: 'Porsche',
    year: '1975',
    class: 'Sports',
    specs: { engine: '3.0L Turbo Flat-6', power: '260 hp', torque: '343 Nm', weight: '1,195 kg', acceleration: '5.5s', topSpeed: '250 km/h', drivetrain: 'RWD' },
    history: 'The Widowmaker. Famous for its massive turbo lag and tricky handling characteristics. The first turbocharged 911.',
    image: '',
    accentColor: '#000000'
  },
  {
    id: 'testarossa',
    name: 'Ferrari Testarossa',
    manufacturer: 'Ferrari',
    year: '1984',
    class: 'Sports',
    specs: { engine: '4.9L Flat-12', power: '390 hp', torque: '490 Nm', weight: '1,506 kg', acceleration: '5.3s', topSpeed: '290 km/h', drivetrain: 'RWD' },
    history: 'Miami Vice icon. Its side strakes were functional, feeding air to the side-mounted radiators. Powered by a flat-12 engine.',
    image: '',
    accentColor: '#ffffff'
  },
  {
    id: 'm1',
    name: 'BMW M1',
    manufacturer: 'BMW',
    year: '1978',
    class: 'Sports',
    specs: { engine: '3.5L I6', power: '273 hp', torque: '330 Nm', weight: '1,300 kg', acceleration: '5.6s', topSpeed: '260 km/h', drivetrain: 'RWD' },
    history: 'BMW\'s only mid-engine supercar until the i8. Designed by Giugiaro and originally intended to be built by Lamborghini.',
    image: '',
    accentColor: '#f97316'
  },
  {
    id: 'countach-lp400',
    name: 'Countach LP400',
    manufacturer: 'Lamborghini',
    year: '1974',
    class: 'Sports',
    specs: { engine: '3.9L V12', power: '370 hp', torque: '361 Nm', weight: '1,065 kg', acceleration: '5.4s', topSpeed: '290 km/h', drivetrain: 'RWD' },
    history: 'The original "Periscopio" Countach. Cleaner lines than later models, without the massive wings and flares.',
    image: '',
    accentColor: '#facc15'
  },
  {
    id: 'cayman-gt4',
    name: '718 Cayman GT4',
    manufacturer: 'Porsche',
    year: '2020',
    class: 'Sports',
    specs: { engine: '4.0L Flat-6', power: '414 hp', torque: '420 Nm', weight: '1,420 kg', acceleration: '4.4s', topSpeed: '304 km/h', drivetrain: 'RWD' },
    history: 'The car enthusiasts begged for. Mid-engine, naturally aspirated flat-six, and a manual transmission.',
    image: '',
    accentColor: '#facc15'
  },
  {
    id: 'lotus-exige',
    name: 'Lotus Exige Sport 410',
    manufacturer: 'Lotus',
    year: '2018',
    class: 'Sports',
    specs: { engine: '3.5L Supercharged V6', power: '410 hp', torque: '420 Nm', weight: '1,054 kg', acceleration: '3.3s', topSpeed: '290 km/h', drivetrain: 'RWD' },
    history: 'Simplify, then add lightness. A road-legal go-kart that prioritizes handling and feedback over comfort.',
    image: '',
    accentColor: '#16a34a'
  },
  {
    id: 'viper-gts',
    name: 'Viper GTS',
    manufacturer: 'Dodge',
    year: '1996',
    class: 'Sports',
    specs: { engine: '8.0L V10', power: '450 hp', torque: '664 Nm', weight: '1,530 kg', acceleration: '4.0s', topSpeed: '298 km/h', drivetrain: 'RWD' },
    history: 'A brute. No ABS, no traction control, just massive torque. The GTS coupe added the "double bubble" roof.',
    image: '',
    accentColor: '#1e3a8a'
  },
  {
    id: 'c6-zr1',
    name: 'Corvette ZR1 (C6)',
    manufacturer: 'Chevrolet',
    year: '2009',
    class: 'Sports',
    specs: { engine: '6.2L Supercharged V8', power: '638 hp', torque: '819 Nm', weight: '1,515 kg', acceleration: '3.4s', topSpeed: '330 km/h', drivetrain: 'RWD' },
    history: 'The "Blue Devil". It featured a polycarbonate window in the hood to show off the supercharger intercooler.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'sagaris',
    name: 'TVR Sagaris',
    manufacturer: 'TVR',
    year: '2005',
    class: 'Sports',
    specs: { engine: '4.0L I6', power: '400 hp', torque: '473 Nm', weight: '1,078 kg', acceleration: '3.7s', topSpeed: '298 km/h', drivetrain: 'RWD' },
    history: 'Insane styling with sideways exhausts. Known for being raw, dangerous, and utterly unique.',
    image: '',
    accentColor: '#84cc16'
  },

  // ===========================================================================
  // COMMON (Hot Hatches, Cult Classics, Daily Drivers)
  // ===========================================================================
  {
    id: 'miata-na',
    name: 'MX-5 Miata (NA)',
    manufacturer: 'Mazda',
    year: '1989',
    class: 'Roadster',
    specs: { engine: '1.6L I4', power: '116 hp', torque: '135 Nm', weight: '950 kg', acceleration: '8.3s', topSpeed: '203 km/h', drivetrain: 'RWD' },
    history: 'Jinba Ittai. The best selling roadster of all time. Pop-up headlights and pure driving joy.',
    image: '',
    accentColor: '#dc2626'
  },
  {
    id: 'golf-gti-mk1',
    name: 'Golf GTI Mk1',
    manufacturer: 'Volkswagen',
    year: '1976',
    class: 'Hot Hatch',
    specs: { engine: '1.6L I4', power: '110 hp', torque: '140 Nm', weight: '810 kg', acceleration: '9.0s', topSpeed: '182 km/h', drivetrain: 'FWD' },
    history: 'The original hot hatch. It combined practicality with fun in a way that changed the car industry forever.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'mini-cooper-s',
    name: 'Mini Cooper S',
    manufacturer: 'Austin',
    year: '1963',
    class: 'Classic',
    specs: { engine: '1.1L I4', power: '70 hp', torque: '84 Nm', weight: '640 kg', acceleration: '11.0s', topSpeed: '148 km/h', drivetrain: 'FWD' },
    history: 'A giant killer. It won the Monte Carlo Rally three times against much more powerful cars thanks to its go-kart handling.',
    image: '',
    accentColor: '#b91c1c'
  },
  {
    id: 'beetle',
    name: 'Volkswagen Beetle',
    manufacturer: 'Volkswagen',
    year: '1960',
    class: 'Classic',
    specs: { engine: '1.2L Flat-4', power: '34 hp', torque: '82 Nm', weight: '800 kg', acceleration: '25.0s', topSpeed: '115 km/h', drivetrain: 'RWD' },
    history: 'The people\'s car. Over 21 million were built, making it an industrial design icon of the 20th century.',
    image: '',
    accentColor: '#fbbf24'
  },
  {
    id: 'ae86',
    name: 'Sprinter Trueno',
    manufacturer: 'Toyota',
    year: '1983',
    class: 'Drift',
    specs: { engine: '1.6L I4 (4A-GE)', power: '128 hp', torque: '149 Nm', weight: '950 kg', acceleration: '8.5s', topSpeed: '193 km/h', drivetrain: 'RWD' },
    history: 'The Hachiroku. Made legendary by Initial D and Keiichi Tsuchiya. The ultimate trainer car for drifting.',
    image: '',
    accentColor: '#f9fafb'
  },
  {
    id: 'civic-ek9',
    name: 'Civic Type R (EK9)',
    manufacturer: 'Honda',
    year: '1997',
    class: 'Hot Hatch',
    specs: { engine: '1.6L I4 VTEC', power: '182 hp', torque: '160 Nm', weight: '1,050 kg', acceleration: '6.7s', topSpeed: '225 km/h', drivetrain: 'FWD' },
    history: 'The first Civic Type R. Its B16B engine had the highest specific output per liter of any naturally aspirated engine at the time.',
    image: '',
    accentColor: '#ffffff'
  },
  {
    id: '205-gti',
    name: 'Peugeot 205 GTI',
    manufacturer: 'Peugeot',
    year: '1984',
    class: 'Hot Hatch',
    specs: { engine: '1.9L I4', power: '126 hp', torque: '161 Nm', weight: '875 kg', acceleration: '7.8s', topSpeed: '206 km/h', drivetrain: 'FWD' },
    history: 'Widely considered the best hot hatch of the 80s. Known for its lift-off oversteer and lively chassis.',
    image: '',
    accentColor: '#dc2626'
  },
  {
    id: 'clio-v6',
    name: 'Clio V6 Renault Sport',
    manufacturer: 'Renault',
    year: '2003',
    class: 'Hot Hatch',
    specs: { engine: '3.0L V6', power: '252 hp', torque: '300 Nm', weight: '1,400 kg', acceleration: '5.9s', topSpeed: '246 km/h', drivetrain: 'RWD' },
    history: 'A mid-engine hatchback. Ridiculous, impractical, and absolutely brilliant. A spiritual successor to the R5 Turbo.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'megane-rs',
    name: 'Mégane R.S. Trophy-R',
    manufacturer: 'Renault',
    year: '2019',
    class: 'Hot Hatch',
    specs: { engine: '1.8L Turbo I4', power: '296 hp', torque: '400 Nm', weight: '1,306 kg', acceleration: '5.4s', topSpeed: '262 km/h', drivetrain: 'FWD' },
    history: 'Held the FWD record at the Nürburgring. Stripped of rear seats and features carbon wheels.',
    image: '',
    accentColor: '#facc15'
  },
  {
    id: '500-abarth',
    name: 'Fiat 500 Abarth',
    manufacturer: 'Fiat',
    year: '2008',
    class: 'Hot Hatch',
    specs: { engine: '1.4L Turbo I4', power: '160 hp', torque: '230 Nm', weight: '1,100 kg', acceleration: '7.4s', topSpeed: '210 km/h', drivetrain: 'FWD' },
    history: 'A scorpion in a small box. Known for its exhaust note which sounds like a mini Ferrari.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'integrale',
    name: 'Delta HF Integrale',
    manufacturer: 'Lancia',
    year: '1991',
    class: 'Hot Hatch',
    specs: { engine: '2.0L Turbo I4', power: '210 hp', torque: '300 Nm', weight: '1,300 kg', acceleration: '5.7s', topSpeed: '220 km/h', drivetrain: 'AWD' },
    history: 'The Evoluzione model. Box flares and rally pedigree. It dominated the WRC even after Group B ended.',
    image: '',
    accentColor: '#b91c1c'
  },
  {
    id: 'focus-rs',
    name: 'Focus RS (Mk3)',
    manufacturer: 'Ford',
    year: '2016',
    class: 'Hot Hatch',
    specs: { engine: '2.3L Turbo I4', power: '350 hp', torque: '475 Nm', weight: '1,599 kg', acceleration: '4.7s', topSpeed: '266 km/h', drivetrain: 'AWD' },
    history: 'Introduced "Drift Mode" to the masses. Its clever AWD system could send 70% of power to the rear wheels.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'golf-r32',
    name: 'Golf R32 (Mk4)',
    manufacturer: 'Volkswagen',
    year: '2003',
    class: 'Hot Hatch',
    specs: { engine: '3.2L VR6', power: '240 hp', torque: '320 Nm', weight: '1,477 kg', acceleration: '6.4s', topSpeed: '247 km/h', drivetrain: 'AWD' },
    history: 'The first production car with a dual-clutch gearbox (DSG). The VR6 engine note is legendary.',
    image: '',
    accentColor: '#1e3a8a'
  },
  {
    id: 'crx-sir',
    name: 'CR-X SiR',
    manufacturer: 'Honda',
    year: '1990',
    class: 'Hot Hatch',
    specs: { engine: '1.6L I4 VTEC', power: '158 hp', torque: '150 Nm', weight: '970 kg', acceleration: '7.5s', topSpeed: '212 km/h', drivetrain: 'FWD' },
    history: 'A pocket rocket. Light, agile, and featuring the VTEC engine that punched way above its weight.',
    image: '',
    accentColor: '#000000'
  },
  {
    id: 'mr2-sw20',
    name: 'MR2 Turbo (SW20)',
    manufacturer: 'Toyota',
    year: '1995',
    class: 'Sports',
    specs: { engine: '2.0L Turbo I4', power: '245 hp', torque: '304 Nm', weight: '1,270 kg', acceleration: '6.2s', topSpeed: '240 km/h', drivetrain: 'RWD' },
    history: 'The "Poor Man\'s Ferrari." Known for its snap oversteer if mistreated, but incredible balance in the right hands.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: '180sx',
    name: '180SX Type X',
    manufacturer: 'Nissan',
    year: '1996',
    class: 'Drift',
    specs: { engine: '2.0L Turbo I4', power: '202 hp', torque: '275 Nm', weight: '1,220 kg', acceleration: '6.5s', topSpeed: '230 km/h', drivetrain: 'RWD' },
    history: 'The sister car to the Silvia. Pop-up headlights and hatchback practicality made it a street drift favorite.',
    image: '',
    accentColor: '#ffffff'
  },
  {
    id: 'cappuccino',
    name: 'Suzuki Cappuccino',
    manufacturer: 'Suzuki',
    year: '1991',
    class: 'Kei Car',
    specs: { engine: '657cc Turbo I3', power: '63 hp', torque: '85 Nm', weight: '725 kg', acceleration: '8.0s', topSpeed: '140 km/h', drivetrain: 'RWD' },
    history: 'A tiny roadster that weighs almost nothing. It proves you don\'t need big power to have big fun.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'az1',
    name: 'Autozam AZ-1',
    manufacturer: 'Mazda',
    year: '1992',
    class: 'Kei Car',
    specs: { engine: '657cc Turbo I3', power: '63 hp', torque: '85 Nm', weight: '720 kg', acceleration: '9.0s', topSpeed: '140 km/h', drivetrain: 'RWD' },
    history: 'A mid-engine Kei car with gullwing doors. Designed by Suzuki, sold by Mazda. A true micro-supercar.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'beat',
    name: 'Honda Beat',
    manufacturer: 'Honda',
    year: '1991',
    class: 'Kei Car',
    specs: { engine: '656cc I3 ITB', power: '63 hp', torque: '60 Nm', weight: '760 kg', acceleration: '13.0s', topSpeed: '135 km/h', drivetrain: 'RWD' },
    history: 'The last car approved by Soichiro Honda. Individual Throttle Bodies (ITBs) on a tiny engine that revs to 8,500 rpm.',
    image: '',
    accentColor: '#facc15'
  },
  {
    id: 'delorean',
    name: 'DMC-12',
    manufacturer: 'DeLorean',
    year: '1981',
    class: 'Classic',
    specs: { engine: '2.85L V6', power: '130 hp', torque: '207 Nm', weight: '1,230 kg', acceleration: '8.8s', topSpeed: '175 km/h', drivetrain: 'RWD' },
    history: 'Stainless steel body, gullwing doors, and a flux capacitor (optional). Made immortal by "Back to the Future".',
    image: '',
    accentColor: '#d4d4d8'
  },
  {
    id: 'defender-90',
    name: 'Defender 90',
    manufacturer: 'Land Rover',
    year: '1995',
    class: 'Offroad',
    specs: { engine: '3.9L V8', power: '182 hp', torque: '314 Nm', weight: '1,750 kg', acceleration: '10.0s', topSpeed: '145 km/h', drivetrain: 'AWD' },
    history: 'The go-anywhere vehicle. Boxy, rugged, and uncomfortable, but capable of crossing continents.',
    image: '',
    accentColor: '#16a34a'
  },
  {
    id: 'wrangler-tj',
    name: 'Wrangler (TJ)',
    manufacturer: 'Jeep',
    year: '2004',
    class: 'Offroad',
    specs: { engine: '4.0L I6', power: '190 hp', torque: '319 Nm', weight: '1,500 kg', acceleration: '9.0s', topSpeed: '160 km/h', drivetrain: 'AWD' },
    history: 'The last Wrangler with the legendary 4.0L inline-six. A rock-crawling icon.',
    image: '',
    accentColor: '#f97316'
  },
  {
    id: 'bronco',
    name: 'Ford Bronco',
    manufacturer: 'Ford',
    year: '1970',
    class: 'Offroad',
    specs: { engine: '5.0L V8', power: '205 hp', torque: '400 Nm', weight: '1,600 kg', acceleration: '10.0s', topSpeed: '150 km/h', drivetrain: 'AWD' },
    history: 'The original SUV. Small, boxy, and capable. It created a segment that is still booming today.',
    image: '',
    accentColor: '#3b82f6'
  },
  {
    id: 'volvo-850r',
    name: 'Volvo 850 R Estate',
    manufacturer: 'Volvo',
    year: '1996',
    class: 'Touring',
    specs: { engine: '2.3L Turbo I5', power: '240 hp', torque: '330 Nm', weight: '1,450 kg', acceleration: '6.7s', topSpeed: '250 km/h', drivetrain: 'FWD' },
    history: 'The Flying Brick. Volvo famously entered the estate version in the British Touring Car Championship (BTCC).',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'saab-900',
    name: 'Saab 900 Turbo',
    manufacturer: 'Saab',
    year: '1988',
    class: 'Classic',
    specs: { engine: '2.0L Turbo I4', power: '175 hp', torque: '273 Nm', weight: '1,285 kg', acceleration: '8.5s', topSpeed: '210 km/h', drivetrain: 'FWD' },
    history: 'Born from jets. Unique styling, quirky ergonomics, and pioneering turbo technology.',
    image: '',
    accentColor: '#18181b'
  },
  {
    id: 'ds',
    name: 'Citroën DS',
    manufacturer: 'Citroën',
    year: '1970',
    class: 'Classic',
    specs: { engine: '2.1L I4', power: '109 hp', torque: '164 Nm', weight: '1,320 kg', acceleration: '11.0s', topSpeed: '175 km/h', drivetrain: 'FWD' },
    history: 'The Goddess. Features hydropneumatic suspension that allows it to float over bumps. A design masterpiece.',
    image: '',
    accentColor: '#fef08a'
  },
  {
    id: '2cv',
    name: 'Citroën 2CV',
    manufacturer: 'Citroën',
    year: '1980',
    class: 'Classic',
    specs: { engine: '602cc Flat-2', power: '29 hp', torque: '39 Nm', weight: '600 kg', acceleration: '33.0s', topSpeed: '115 km/h', drivetrain: 'FWD' },
    history: 'Designed to carry a basket of eggs across a plowed field without breaking them. Minimalist motoring.',
    image: '',
    accentColor: '#9ca3af'
  },
  {
    id: 'isetta',
    name: 'BMW Isetta 300',
    manufacturer: 'BMW',
    year: '1956',
    class: 'Micro',
    specs: { engine: '298cc 1-cyl', power: '13 hp', torque: '18 Nm', weight: '350 kg', acceleration: '52.0s', topSpeed: '85 km/h', drivetrain: 'RWD' },
    history: 'The bubble car. The entire front of the car is the door. It saved BMW from bankruptcy in the 50s.',
    image: '',
    accentColor: '#facc15'
  },
  {
    id: 'multipla',
    name: 'Fiat Multipla',
    manufacturer: 'Fiat',
    year: '1999',
    class: 'Oddity',
    specs: { engine: '1.6L I4', power: '102 hp', torque: '145 Nm', weight: '1,300 kg', acceleration: '12.6s', topSpeed: '170 km/h', drivetrain: 'FWD' },
    history: 'Often voted the ugliest car ever made. But with 3+3 seating and incredible visibility, it was a packaging genius.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'p50',
    name: 'Peel P50',
    manufacturer: 'Peel',
    year: '1962',
    class: 'Micro',
    specs: { engine: '49cc 1-cyl', power: '4 hp', torque: 'Unknown', weight: '59 kg', acceleration: 'N/A', topSpeed: '60 km/h', drivetrain: 'RWD' },
    history: 'The smallest production car ever made. It has no reverse gear; you have to get out and lift it with a handle.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'cybertruck',
    name: 'Cybertruck Cyberbeast',
    manufacturer: 'Tesla',
    year: '2024',
    class: 'EV',
    specs: { engine: 'Tri-Motor Electric', power: '845 hp', torque: '1396 Nm', weight: '3,100 kg', acceleration: '2.6s', topSpeed: '210 km/h', drivetrain: 'AWD' },
    history: 'Love it or hate it, it looks like nothing else. Bulletproof stainless steel exoskeleton and steer-by-wire.',
    image: '',
    accentColor: '#a1a1aa'
  },
  {
    id: 'model-s-plaid',
    name: 'Model S Plaid',
    manufacturer: 'Tesla',
    year: '2021',
    class: 'EV',
    specs: { engine: 'Tri-Motor Electric', power: '1,020 hp', torque: '1420 Nm', weight: '2,162 kg', acceleration: '1.99s', topSpeed: '322 km/h', drivetrain: 'AWD' },
    history: 'The car that reset the benchmark for acceleration. A family sedan that out-accelerates multi-million dollar hypercars.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'rimac-nevera',
    name: 'Rimac Nevera',
    manufacturer: 'Rimac',
    year: '2022',
    class: 'EV Hypercar',
    specs: { engine: 'Quad-Motor Electric', power: '1,914 hp', torque: '2360 Nm', weight: '2,150 kg', acceleration: '1.85s', topSpeed: '412 km/h', drivetrain: 'AWD' },
    history: 'An electric masterpiece from Croatia. It holds numerous speed records, including 0-400-0 km/h.',
    image: '',
    accentColor: '#2563eb'
  },
  {
    id: 'mc12',
    name: 'Maserati MC12',
    manufacturer: 'Maserati',
    year: '2004',
    class: 'Supercar',
    specs: { engine: '6.0L V12', power: '621 hp', torque: '652 Nm', weight: '1,335 kg', acceleration: '3.8s', topSpeed: '330 km/h', drivetrain: 'RWD' },
    history: 'Built on the Enzo chassis but longer, wider, and designed for GT racing domination.',
    image: '',
    accentColor: '#ffffff'
  },
  {
    id: 'clk-gtr',
    name: 'CLK GTR',
    manufacturer: 'Mercedes-Benz',
    year: '1998',
    class: 'Supercar',
    specs: { engine: '6.9L V12', power: '604 hp', torque: '775 Nm', weight: '1,440 kg', acceleration: '3.8s', topSpeed: '344 km/h', drivetrain: 'RWD' },
    history: 'A race car for the road. Built to homologate the GT1 racer. Extremely wide, extremely low, and extremely expensive.',
    image: '',
    accentColor: '#d4d4d8'
  },
  {
    id: 'gt1-strassenversion',
    name: '911 GT1 Strassenversion',
    manufacturer: 'Porsche',
    year: '1998',
    class: 'Supercar',
    specs: { engine: '3.2L Twin-Turbo Flat-6', power: '536 hp', torque: '600 Nm', weight: '1,150 kg', acceleration: '3.9s', topSpeed: '308 km/h', drivetrain: 'RWD' },
    history: 'The mid-engined 911. Only 25 were built to satisfy Le Mans regulations.',
    image: '',
    accentColor: '#ffffff'
  },
  {
    id: 'saleen-s7',
    name: 'Saleen S7 Twin Turbo',
    manufacturer: 'Saleen',
    year: '2005',
    class: 'Supercar',
    specs: { engine: '7.0L Twin-Turbo V8', power: '750 hp', torque: '949 Nm', weight: '1,338 kg', acceleration: '2.8s', topSpeed: '399 km/h', drivetrain: 'RWD' },
    history: 'America\'s first true production supercar. It featured advanced aerodynamics that generated massive downforce.',
    image: '',
    accentColor: '#facc15'
  },
  {
    id: 'reventon',
    name: 'Lamborghini Reventón',
    manufacturer: 'Lamborghini',
    year: '2007',
    class: 'Supercar',
    specs: { engine: '6.5L V12', power: '641 hp', torque: '660 Nm', weight: '1,665 kg', acceleration: '3.4s', topSpeed: '340 km/h', drivetrain: 'AWD' },
    history: 'Inspired by the F-22 Raptor fighter jet. It previewed the design language for the Aventador.',
    image: '',
    accentColor: '#525252'
  },
  {
    id: 'huayra',
    name: 'Pagani Huayra',
    manufacturer: 'Pagani',
    year: '2012',
    class: 'Hypercar',
    specs: { engine: '6.0L Twin-Turbo V12', power: '720 hp', torque: '1000 Nm', weight: '1,350 kg', acceleration: '2.8s', topSpeed: '383 km/h', drivetrain: 'RWD' },
    history: 'Named after the God of Wind. It features active aerodynamic flaps on all four corners.',
    image: '',
    accentColor: '#d4d4d8'
  },
  {
    id: 'koenigsegg-agera-rs',
    name: 'Agera RS',
    manufacturer: 'Koenigsegg',
    year: '2015',
    class: 'Hypercar',
    specs: { engine: '5.0L Twin-Turbo V8', power: '1,160 hp', torque: '1280 Nm', weight: '1,395 kg', acceleration: '2.8s', topSpeed: '447 km/h', drivetrain: 'RWD' },
    history: 'Held the production top speed record after a run on a closed Nevada highway in 2017.',
    image: '',
    accentColor: '#ef4444'
  },
  {
    id: 'ssc-tuatara',
    name: 'SSC Tuatara',
    manufacturer: 'SSC',
    year: '2020',
    class: 'Hypercar',
    specs: { engine: '5.9L Twin-Turbo V8', power: '1,750 hp', torque: '1735 Nm', weight: '1,247 kg', acceleration: '2.5s', topSpeed: '455+ km/h', drivetrain: 'RWD' },
    history: 'An American hypercar chasing the 300mph barrier. Its aerodynamic shape is inspired by a fighter jet canopy.',
    image: '',
    accentColor: '#000000'
  },
  {
    id: 'apollo-ie',
    name: 'Apollo IE',
    manufacturer: 'Apollo',
    year: '2019',
    class: 'Hypercar',
    specs: { engine: '6.3L V12', power: '780 hp', torque: '760 Nm', weight: '1,250 kg', acceleration: '2.7s', topSpeed: '335 km/h', drivetrain: 'RWD' },
    history: 'Intensa Emozione. One of the most aggressive designs ever put on wheels, powered by a Ferrari V12.',
    image: '',
    accentColor: '#8b5cf6'
  },
  {
    id: 'bac-mono',
    name: 'BAC Mono R',
    manufacturer: 'BAC',
    year: '2020',
    class: 'Track Special',
    specs: { engine: '2.5L I4', power: '340 hp', torque: '330 Nm', weight: '555 kg', acceleration: '2.5s', topSpeed: '274 km/h', drivetrain: 'RWD' },
    history: 'A single-seater for the road. It uses graphene in its body panels to save weight.',
    image: '',
    accentColor: '#ffffff'
  }
];