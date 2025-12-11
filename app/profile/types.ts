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

export interface Transaction {
    id: string;
    sender_id: string;
    receiver_id: string;
    amount: number;
    created_at: string;
    sender?: { username: string };
    receiver?: { username: string };
}

export type SortOption = 'NEWEST' | 'OLDEST' | 'RARITY_DESC' | 'RARITY_ASC';