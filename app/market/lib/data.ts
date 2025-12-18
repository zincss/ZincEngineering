export type Category = 'TECH' | 'FINANCE' | 'ENERGY' | 'CONSUMER' | 'HEALTH' | 'COMMODITIES';

export interface Company {
  ticker: string;
  name: string;
  description: string;
  category: Category;
  basePrice: number;
  volatility: number;
}

const CATEGORIES = {
  TECH: [
    { n: 'Fruit', t: 'FRT', d: 'Overpriced aluminum rectangles.', p: 180 },
    { n: 'Microhard', t: 'MHD', d: 'Updating your PC right now.', p: 320 },
    { n: 'Goggle', t: 'GGL', d: 'We know what you searched.', p: 140 },
    { n: 'Amazone', t: 'AMZ', d: 'Delivered before you ordered.', p: 130 },
    { n: 'Faceplant', t: 'FPL', d: 'Selling your data for peanuts.', p: 290 },
    { n: 'Nvidia', t: 'NVDA', d: 'Graphics cards mining crypto.', p: 450 },
    { n: 'Tessla', t: 'TSL', d: 'Electric cars with panel gaps.', p: 210 },
    { n: 'Bintel', t: 'INTC', d: 'Processing heat since 1990.', p: 45 },
    { n: 'Advancd Micro', t: 'AMD', d: 'Red team rules.', p: 110 },
    { n: 'Spotifry', t: 'SPOT', d: 'Ads between every song.', p: 160 },
    { n: 'Snapchat', t: 'SNAP', d: 'Disappearing memories.', p: 15 },
    { n: 'Uuber', t: 'UBR', d: 'Your driver is here.', p: 65 },
    { n: 'DoorDash', t: 'DASH', d: 'Cold food, hot fees.', p: 85 },
    { n: 'Palantir', t: 'PLTR', d: 'Seeing everything.', p: 22 },
    { n: 'Salesforce', t: 'CRM', d: 'Cloudy with a chance of sales.', p: 250 },
    { n: 'Adobe', t: 'ADBE', d: 'Subscription required.', p: 550 },
    { n: 'Oracle', t: 'ORCL', d: 'Lawyers who code.', p: 115 },
    { n: 'Cisco', t: 'CSCO', d: 'Routers and doubts.', p: 50 },
    { n: 'IBM', t: 'IBM', d: 'Big Blue Dinosaur.', p: 140 },
    { n: 'Zoom', t: 'ZM', d: 'You are on mute.', p: 70 },
    { n: 'Slack', t: 'WORK', d: 'Notification fatigue.', p: 45 },
    { n: 'Pinterest', t: 'PINS', d: 'Interior design dreams.', p: 30 },
    { n: 'Reddit', t: 'RDDT', d: 'Front page of the internet.', p: 55 },
    { n: 'Twitter', t: 'X', d: 'Everything app, apparently.', p: 40 },
    { n: 'Airbnb', t: 'ABNB', d: 'Cleaning fees included.', p: 145 },
    { n: 'Roblox', t: 'RBLX', d: 'Oof.', p: 40 },
    { n: 'Unity', t: 'U', d: 'Made with Unity.', p: 35 },
    { n: 'Coinbase', t: 'COIN', d: 'To the moon?', p: 180 }
  ],
  FINANCE: [
    { n: 'Goldman Sacks', t: 'GS', d: 'Vampire squid logic.', p: 350 },
    { n: 'JPMorgue', t: 'JPM', d: 'Too big to fail.', p: 170 },
    { n: 'Bank of Amer.', t: 'BAC', d: 'Overdraft fees apply.', p: 35 },
    { n: 'Wells Fargo', t: 'WFC', d: 'Opening accounts for you.', p: 50 },
    { n: 'Citi', t: 'C', d: 'The city never sleeps.', p: 55 },
    { n: 'Morgan Stan', t: 'MS', d: 'Wealth management for them.', p: 90 },
    { n: 'BlackRock', t: 'BLK', d: 'Owning the world.', p: 780 },
    { n: 'Visa', t: 'V', d: 'Everywhere you want to be.', p: 260 },
    { n: 'Mastercard', t: 'MA', d: 'Priceless fees.', p: 420 },
    { n: 'Amex', t: 'AXP', d: 'Don\'t leave home without it.', p: 210 },
    { n: 'PayPal', t: 'PYPL', d: 'Friendly fraud protection.', p: 60 },
    { n: 'Block', t: 'SQ', d: 'Blockchain payments.', p: 70 },
    { n: 'Robinhood', t: 'HOOD', d: 'Gamified losses.', p: 18 },
    { n: 'Schwab', t: 'SCHW', d: 'Talk to Chuck.', p: 65 },
    { n: 'Fidelity', t: 'FNF', d: 'Loyal to profits.', p: 45 },
    { n: 'Berkshire', t: 'BRK', d: 'Oracle of Omaha.', p: 540 },
    { n: 'S&P Global', t: 'SPGI', d: 'Rating the world.', p: 410 },
    { n: 'Moody\'s', t: 'MCO', d: 'Mood swings.', p: 380 },
    { n: 'AIG', t: 'AIG', d: 'Insurance giants.', p: 70 },
    { n: 'MetLife', t: 'MET', d: 'Snoopy approves.', p: 68 }
  ],
  ENERGY: [
    { n: 'Exxon Mobile', t: 'XOM', d: 'Dinosaurs burning dinosaurs.', p: 110 },
    { n: 'Chevron', t: 'CVX', d: 'Standard Oil legacy.', p: 150 },
    { n: 'Shell', t: 'SHEL', d: 'Sea shells by the sea shore.', p: 65 },
    { n: 'BP', t: 'BP', d: 'Beyond Petroleum (Not really).', p: 38 },
    { n: 'Total', t: 'TTE', d: 'Totally oil.', p: 70 },
    { n: 'Conoco', t: 'COP', d: 'Drill baby drill.', p: 120 },
    { n: 'Schlumberger', t: 'SLB', d: 'Big drills.', p: 50 },
    { n: 'Halliburton', t: 'HAL', d: 'Logistics and crude.', p: 35 },
    { n: 'Occidental', t: 'OXY', d: 'Western oil.', p: 60 },
    { n: 'Kinder Morgan', t: 'KMI', d: 'Pipelines everywhere.', p: 18 },
    { n: 'NextEra', t: 'NEE', d: 'Wind and solar profits.', p: 60 },
    { n: 'Duke Energy', t: 'DUK', d: 'The royal power.', p: 95 },
    { n: 'Southern Co', t: 'SO', d: 'Sweet home Alabama.', p: 70 },
    { n: 'Dominion', t: 'D', d: 'Powering the dominion.', p: 48 },
    { n: 'Enbridge', t: 'ENB', d: 'Bridge to energy.', p: 36 },
    { n: 'Valero', t: 'VLO', d: 'Refining margins.', p: 140 },
    { n: 'Phillips 66', t: 'PSX', d: 'Get your kicks.', p: 130 },
    { n: 'Marathon', t: 'MPC', d: 'Long run energy.', p: 160 },
    { n: 'Hess', t: 'HES', d: 'Toy trucks and oil.', p: 145 },
    { n: 'Devon', t: 'DVN', d: 'Shale revolution.', p: 45 }
  ],
  CONSUMER: [
    { n: 'Wal-Mart', t: 'WMT', d: 'Save money. Live better.', p: 160 },
    { n: 'Target', t: 'TGT', d: 'Expect more. Pay more.', p: 140 },
    { n: 'Costco', t: 'COST', d: 'Bulk buying frenzy.', p: 720 },
    { n: 'Home Depot', t: 'HD', d: 'You can do it.', p: 350 },
    { n: 'Lowes', t: 'LOW', d: 'Blue hardware.', p: 230 },
    { n: 'McDonalds', t: 'MCD', d: 'I\'m lovin it.', p: 290 },
    { n: 'Starbucks', t: 'SBUX', d: 'Expensive bean water.', p: 95 },
    { n: 'Chipotle', t: 'CMG', d: 'Guac is extra.', p: 2800 },
    { n: 'Nike', t: 'NKE', d: 'Just do it.', p: 100 },
    { n: 'Adidas', t: 'ADDYY', d: 'Three stripes.', p: 110 },
    { n: 'Lululemon', t: 'LULU', d: 'Expensive yoga pants.', p: 400 },
    { n: 'Coca-Cola', t: 'KO', d: 'Open happiness.', p: 60 },
    { n: 'Pepsi', t: 'PEP', d: 'Is Pepsi okay?', p: 170 },
    { n: 'Procter', t: 'PG', d: 'Tide pods and razors.', p: 160 },
    { n: 'Unilever', t: 'UL', d: 'Soap and soup.', p: 50 },
    { n: 'Nestle', t: 'NSRGY', d: 'Water is not a right.', p: 110 },
    { n: 'Disney', t: 'DIS', d: 'The Mouse House.', p: 115 },
    { n: 'Netflix', t: 'NFLX', d: 'Streaming wars.', p: 550 },
    { n: 'Comcast', t: 'CMCSA', d: 'Customer service hell.', p: 40 },
    { n: 'Verizon', t: 'VZ', d: 'Can you hear me?', p: 40 }
  ],
  HEALTH: [
    { n: 'Pfizer', t: 'PFE', d: 'Big Pharma.', p: 28 },
    { n: 'Johnson & J', t: 'JNJ', d: 'Baby powder and vaccines.', p: 155 },
    { n: 'Merck', t: 'MRK', d: 'Science for life.', p: 125 },
    { n: 'AbbVie', t: 'ABBV', d: 'Humira profits.', p: 175 },
    { n: 'Eli Lilly', t: 'LLY', d: 'Weight loss gold.', p: 750 },
    { n: 'UnitedHealth', t: 'UNH', d: 'Denied claims.', p: 480 },
    { n: 'CVS Health', t: 'CVS', d: 'Receipts appearing.', p: 75 },
    { n: 'Moderna', t: 'MRNA', d: 'mRNA revolution.', p: 100 },
    { n: 'Gilead', t: 'GILD', d: 'Antiviral masters.', p: 65 },
    { n: 'Amgen', t: 'AMGN', d: 'Biotech giant.', p: 310 },
    { n: 'Bristol Myers', t: 'BMY', d: 'Serious medicine.', p: 50 },
    { n: 'Thermo Fisher', t: 'TMO', d: 'Lab equipment.', p: 580 },
    { n: 'Abbott', t: 'ABT', d: 'Testing testing.', p: 110 },
    { n: 'Medtronic', t: 'MDT', d: 'Heart beats.', p: 85 },
    { n: 'Stryker', t: 'SYK', d: 'Medical robots.', p: 340 },
    { n: 'Intuitive', t: 'ISRG', d: 'Da Vinci surgery.', p: 380 },
    { n: 'Regeneron', t: 'REGN', d: 'Gene masters.', p: 950 },
    { n: 'Vertex', t: 'VRTX', d: 'Cystic fibrosis.', p: 420 },
    { n: 'Biogen', t: 'BIIB', d: 'Brain matters.', p: 220 },
    { n: 'Cigna', t: 'CI', d: 'Insurance group.', p: 340 }
  ],
  COMMODITIES: [
    { n: 'Gold Corp', t: 'GLD', d: 'Shiny rocks.', p: 190 },
    { n: 'Silver Inc', t: 'SLV', d: 'Poor man\'s gold.', p: 22 },
    { n: 'Copper Co', t: 'COPX', d: 'Wiring the world.', p: 40 },
    { n: 'Lithium Ltd', t: 'LIT', d: 'Battery juice.', p: 50 },
    { n: 'Steel Dyn', t: 'STLD', d: 'Heavy metal.', p: 120 },
    { n: 'Alcoa', t: 'AA', d: 'Aluminum cans.', p: 35 },
    { n: 'Freeport', t: 'FCX', d: 'Copper & Gold.', p: 45 },
    { n: 'Newmont', t: 'NEM', d: 'Gold mining.', p: 35 },
    { n: 'Barrick', t: 'GOLD', d: 'More gold mining.', p: 16 },
    { n: 'Rio Tinto', t: 'RIO', d: 'Digging holes.', p: 65 },
    { n: 'BHP', t: 'BHP', d: 'Big Australian.', p: 60 },
    { n: 'Vale', t: 'VALE', d: 'Iron ore.', p: 12 },
    { n: 'Glencore', t: 'GLEN', d: 'Trading everything.', p: 10 },
    { n: 'Wheat Trust', t: 'WEAT', d: 'Bread basket.', p: 6 },
    { n: 'Corn Fund', t: 'CORN', d: 'Ethanol fuel.', p: 20 },
    { n: 'Soybean', t: 'SOYB', d: 'Tofu base.', p: 25 },
    { n: 'Coffee', t: 'JO', d: 'Morning mud.', p: 50 },
    { n: 'Sugar', t: 'CANE', d: 'Sweet tooth.', p: 12 },
    { n: 'Cotton', t: 'BAL', d: 'Fabric of life.', p: 80 },
    { n: 'Water', t: 'PHO', d: 'Liquid gold.', p: 55 }
  ]
};

export const COMPANIES: Company[] = Object.entries(CATEGORIES).flatMap(([cat, list]) => 
  list.map(c => ({
    ticker: c.t,
    name: c.n,
    description: c.d,
    basePrice: c.p,
    category: cat as Category,
    volatility: 0.08 + Math.random() * 0.15 
  }))
);