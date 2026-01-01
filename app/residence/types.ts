export type SlotType = 'DISPLAY' | 'OPERATIONS' | 'GARAGE';

export interface PropertyTemplate {
  id: string;
  name: string;
  description: string;
  image_url: string;
  price: number;
  rarity: 'STANDARD' | 'HIGH_END' | 'LUXURY' | 'EXOTIC';
  
  // Economy & Zoning
  base_yield_rate: number; // Credits per hour
  max_display_slots: number;
  max_ops_slots: number;
  max_garage_slots: number;
}

export interface UserProperty {
  id: string;
  user_id: string;
  template_id: string;
  template: PropertyTemplate;
  purchased_at: string;
  is_primary: boolean;
  
  // Economy State
  last_yield_collection: string; // ISO Date String
  upgrades: string[]; // List of installed upgrade slugs e.g., ['security_v1']
  
  // Joined Data from DB
  slots?: PropertySlot[];
}

export interface PropertySlot {
  id: string;
  user_property_id: string;
  slot_index: number;
  type: SlotType; // "Zoning" for this specific slot
  inventory_item_id?: string | null;
  
  // Joined Data (for display)
  inventory_item?: {
    id: string;
    item_template: {
        name: string;
        image_url?: string;
        rarity: string;
    }
  };
}

// Hardcoded Upgrade Definitions (Used for the Shop UI)
export interface UpgradeDefinition {
    slug: string;
    name: string;
    type: 'SECURITY' | 'INCOME' | 'AESTHETIC';
    cost: number;
    description: string;
    modifier: number; // e.g. +50 credits or +0.1% security
}