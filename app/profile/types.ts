export interface ItemTemplate {
    id: string;
    name: string;
    rarity: string;
    description: string;
    image_url?: string;
}

export interface InventoryItem {
    id: string;
    serial_number: number;
    is_shiny: boolean;
    obtained_at: string;
    item_templates: ItemTemplate;
}

export interface Material {
    id: string;
    user_id: string;
    material_type: string;
    quantity: number;
    updated_at: string;
}

export interface Pet {
    id: string;
    name: string;
    type: 'CYBER_NEKO' | 'ROBO_PUP' | 'DATA_GHOST';
    stats: {
        hunger: number;
        happiness: number;
        energy: number;
        hygiene: number;
    };
    cosmetics: any[];
    last_interacted: string;
    created_at: string;
}

export type SortOption = 'NEWEST' | 'OLDEST' | 'RARITY_DESC' | 'RARITY_ASC';