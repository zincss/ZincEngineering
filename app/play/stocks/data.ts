export type Category = 'TECH' | 'FINANCE' | 'ENERGY' | 'CONSUMER' | 'HEALTH' | 'COMMODITIES' | 'AEROSPACE';

export interface Company {
  ticker: string;
  name: string;
  description: string;
  category: Category;
  basePrice: number;
  volatility: number;
  // New Fields
  ceo: string;
  founded: string;
  hq: string;
  employees: string;
  slogan: string;
  y2dStatement: string;
}

const CATEGORIES = {
  AEROSPACE: [
    { 
      n: 'Zinc Aerospace', t: 'ZINC', p: 1250, 
      d: 'The default option. Reliable, mostly because they own the physics engine.',
      ceo: 'The Architect', founded: '2024', hq: 'Low Earth Orbit', employees: '42',
      slogan: 'It Just Works (Mostly)',
      y2dStatement: '+14.2% // Higher margins due to charging for breathable oxygen in economy class.'
    },
    { 
      n: 'Australian Dynamics', t: 'ADYN', p: 850, 
      d: 'Spacecraft built like utes. Guaranteed to upside-down in zero-g.',
      ceo: 'Bruce "Rocket" Mate', founded: '2088', hq: 'Neo-Canberra, Mars', employees: '50,000',
      slogan: 'She\'ll Be Right',
      y2dStatement: '-2.4% // Losses attributed to "The Great Kangaroo Infiltration" of the fuel lines.'
    },
    { 
      n: 'Ares-Miltech', t: 'ARES', p: 2100, 
      d: 'If it doesn\'t have a gun attached, they aren\'t interested. Surprisingly high insurance premiums.',
      ceo: 'General K. Boom', founded: '2150', hq: 'Phobos Forward Base', employees: 'Classified',
      slogan: 'Peace Through Superior Firepower',
      y2dStatement: '+42.0% // Record profits following the "Total Peace" initiative (by blowing everything up).'
    },
    { 
      n: 'Titan Industries', t: 'TITN', p: 600, 
      d: 'Heavy industrial mining vessels. 0-60 in three business days.',
      ceo: 'Magnus Steel', founded: '2105', hq: 'Titan (Obviously)', employees: '2.5 Million',
      slogan: 'We Dig It',
      y2dStatement: '+5.1% // Growth stagnated as miners discovered "unionization" was more than just a fancy word.'
    },
    { 
      n: 'inTAKE racing', t: 'TAKE', p: 1500, 
      d: 'Glass cannons with engines. Safety features are sold separately.',
      ceo: 'Speedy McFast', founded: '2201', hq: 'Lagrange Point 5', employees: '300 (High Turnover)',
      slogan: 'Brakes Are For Cowards',
      y2dStatement: '+88% // Revenue up after replacing legal department with a "Don\'t Sue Us" waiver printed on every ticket.'
    },
    { 
      n: 'Orbital Mechanics', t: 'ORB', p: 920, 
      d: 'Experimental gravity drives. 50% chance of arriving at destination, 50% chance of spaghetti-fication.',
      ceo: 'Dr. Quantum', founded: '2199', hq: 'The Void', employees: 'Unknown',
      slogan: 'Physics is a Suggestion',
      y2dStatement: 'NULL // Financial data currently trapped in a localized singularity. We assume we made money.'
    },
    { 
      n: 'Fishworx Staryard', t: 'FISH', p: 450, 
      d: 'Budget haulers made from recycled soup cans. Smells faintly of tuna.',
      ceo: 'Captain Haddock', founded: '2140', hq: 'Europa Depths', employees: '8,000',
      slogan: 'It Floats... In Space',
      y2dStatement: '-12% // Significant write-downs after a crate of "Grade A Kelp" turned out to be regular space-trash.'
    },
    { 
      n: 'Marse Movement', t: 'MARS', p: 3200, 
      d: 'Luxury yachts for the galactic 1%. Gold-plated airlocks standard.',
      ceo: 'Viscount V. Rich', founded: '2120', hq: 'Olympus Mons Penthouse', employees: '1,000 Artisans',
      slogan: 'Better Than You',
      y2dStatement: '+215% // Extremely profitable after launching the "Billionaire Escape Pod" subscription service.'
    }
  ],
  TECH: [
    { 
      n: 'Fruit', t: 'FRT', p: 180, 
      d: 'Selling the same rectangle every year for slightly more money.',
      ceo: 'Tim Apple', founded: '1976', hq: 'Infinite Loop', employees: '160,000',
      slogan: 'Think Expensive',
      y2dStatement: '+12.5% // Profits up after removing the charging port and replacing it with "Wireless Dreams".'
    },
    { 
      n: 'Microhard', t: 'MHD', p: 320, 
      d: 'Your device will restart in 5 minutes for updates. You cannot stop it.',
      ceo: 'Satya Nadella', founded: '1975', hq: 'Redmond', employees: '220,000',
      slogan: 'Updating 99%...',
      y2dStatement: '+8.2% // Strong earnings from the new "Skip-Update" premium monthly pass.'
    },
    { 
      n: 'Goggle', t: 'GGL', p: 140, 
      d: 'We canceled that project you liked. Also, we are reading your email.',
      ceo: 'Sundar Pichai', founded: '1998', hq: 'Mountain View', employees: '180,000',
      slogan: 'Don\'t Be Evil (Optional)',
      y2dStatement: '+15.0% // Revenue boosted by "Accidental Click" optimization in mobile search results.'
    },
    { 
      n: 'Amazone', t: 'AMZ', p: 130, 
      d: 'Delivering packages before you even order them. Bathroom breaks discouraged.',
      ceo: 'Jeff B.', founded: '1994', hq: 'Seattle', employees: '1.5 Million',
      slogan: 'Work Hard. Have Fun. Make History.',
      y2dStatement: '+4.5% // Margin improvement achieved by replacing drivers with sentient drones that don\'t sleep.'
    },
    { 
      n: 'Faceplant', t: 'FPL', p: 290, 
      d: 'Connecting the world so your uncle can share conspiracy theories.',
      ceo: 'Mark Z.', founded: '2004', hq: 'Metaverse', employees: '80,000',
      slogan: 'Move Fast and Break Democracies',
      y2dStatement: '-55% // Heavy losses in the Metaverse. Marking down "Virtual Leg" development costs.'
    },
    { 
      n: 'Nvidia', t: 'NVDA', p: 450, 
      d: 'Powering AI overlords and crypto farms. The more you buy, the more you save.',
      ceo: 'Jensen Huang', founded: '1993', hq: 'Santa Clara', employees: '26,000',
      slogan: 'The Way It\'s Meant To Be Played',
      y2dStatement: '+1,240% // Sold out of H100s to a customer who turned out to be just three AI bots in a trench coat.'
    },
    { 
      n: 'Tessla', t: 'TSL', p: 210, 
      d: 'Self-driving coming "next year" since 2014. Panel gaps included.',
      ceo: 'Elon M.', founded: '2003', hq: 'Texas', employees: '120,000',
      slogan: 'S3XY',
      y2dStatement: '-1.2% // Costs up due to frequent "X" rebranding sessions at 3 AM.'
    }
  ],
  FINANCE: [
    { 
      n: 'Goldman Sacks', t: 'GS', p: 350, 
      d: 'Doing God\'s work, if God charged a 2% management fee.',
      ceo: 'David Solomon', founded: '1869', hq: 'NYC', employees: '45,000',
      slogan: 'Money Never Sleeps',
      y2dStatement: '+22.4% // Record performance after shorting the existence of the middle class.'
    },
    { 
      n: 'JPMorgue', t: 'JPM', p: 170, 
      d: 'Too big to fail, too rich to care. We own everything anyway.',
      ceo: 'Jamie Dimon', founded: '2000', hq: 'NYC', employees: '290,000',
      slogan: 'The House Always Wins',
      y2dStatement: '+9.8% // Successfully acquired three failing banks for the price of a ham sandwich.'
    },
    { 
      n: 'Visa', t: 'V', p: 260, 
      d: 'Everywhere you want to be, taking 3% of every transaction.',
      ceo: 'Ryan McInerney', founded: '1958', hq: 'San Francisco', employees: '26,000',
      slogan: 'Priceless Fees',
      y2dStatement: '+11.2% // Profit growth perfectly correlates with your increasing debt.'
    }
  ],
  ENERGY: [
    { 
      n: 'Exxon Mobile', t: 'XOM', p: 110, 
      d: 'Melting ice caps for shareholder value since 1870.',
      ceo: 'Darren Woods', founded: '1999', hq: 'Texas', employees: '62,000',
      slogan: 'Energy Lives Here (And Dies Here)',
      y2dStatement: '+18.5% // Record profits. The heat is definitely making us more money.'
    },
    { 
      n: 'Shell', t: 'SHEL', p: 65, 
      d: 'We are totally green now. Look at this picture of a leaf.',
      ceo: 'Wael Sawan', founded: '1907', hq: 'London', employees: '90,000',
      slogan: 'Go Well',
      y2dStatement: '+14% // Carbon capture offsets successfully captured several million dollars in subsidies.'
    }
  ],
  CONSUMER: [
    { 
      n: 'Wal-Mart', t: 'WMT', p: 160, 
      d: 'Destroying small businesses in a town near you.',
      ceo: 'Doug McMillon', founded: '1962', hq: 'Arkansas', employees: '2.3 Million',
      slogan: 'Save Money. Live Better.',
      y2dStatement: '+3.2% // Gains from self-checkout "efficiency" (making you do the work for free).'
    },
    { 
      n: 'McDonalds', t: 'MCD', p: 290, 
      d: 'The ice cream machine is broken. Come back tomorrow.',
      ceo: 'Chris K.', founded: '1940', hq: 'Chicago', employees: '200,000',
      slogan: 'I\'m Lovin\' It',
      y2dStatement: '+6.7% // Profit growth led by the new "Ice Cream Machine Repair" premium loyalty tier.'
    },
    { 
      n: 'Starbucks', t: 'SBUX', p: 95, 
      d: 'Burnt bean water with 80g of sugar for $9.',
      ceo: 'Laxman N.', founded: '1971', hq: 'Seattle', employees: '400,000',
      slogan: 'Your Name Spelled Wrong',
      y2dStatement: '+2.1% // Revenue up after charging $0.50 for "vibes" in city locations.'
    }
  ],
  HEALTH: [
    { 
      n: 'Pfizer', t: 'PFE', p: 28, 
      d: 'Creating problems and selling the solutions.',
      ceo: 'Albert Bourla', founded: '1849', hq: 'NYC', employees: '80,000',
      slogan: 'Science Will Win',
      y2dStatement: '-15.4% // Losses attributed to everyone accidentally becoming healthy for a week.'
    },
    { 
      n: 'UnitedHealth', t: 'UNH', p: 480, 
      d: 'Your claim has been denied. Have a nice day.',
      ceo: 'Andrew Witty', founded: '1977', hq: 'Minnesota', employees: '400,000',
      slogan: 'Coverage (Terms Apply)',
      y2dStatement: '+32% // Record earnings after denying 99% of claims for "Excessive Living".'
    }
  ],
  COMMODITIES: [
    { 
      n: 'Gold Corp', t: 'GLD', p: 190, 
      d: 'It\'s shiny and heavy. That makes it valuable, apparently.',
      ceo: 'King Midas', founded: 'Ancient', hq: 'Vault 101', employees: 'Miners',
      slogan: 'Shiny Rock Good',
      y2dStatement: '+0.5% // Flat growth. Still just a rock.'
    },
    { 
      n: 'Lithium Ltd', t: 'LIT', p: 50, 
      d: 'Powering your phone until it explodes.',
      ceo: 'Elon M. (Probably)', founded: '2010', hq: 'Salt Flats', employees: 'Robots',
      slogan: 'Charge It',
      y2dStatement: '+45.2% // Skyrocketing demand for batteries that last exactly 366 days.'
    }
  ]
};

export const COMPANIES: Company[] = Object.entries(CATEGORIES).flatMap(([cat, list]) => 
  list.map(c => ({
    ticker: c.t,
    name: c.n,
    description: c.d,
    basePrice: c.p,
    category: cat as Category,
    volatility: 0.08 + Math.random() * 0.15,
    ceo: c.ceo,
    founded: c.founded,
    hq: c.hq,
    employees: c.employees,
    slogan: c.slogan,
    y2dStatement: c.y2dStatement
  }))
);
