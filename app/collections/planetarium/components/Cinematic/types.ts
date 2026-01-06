export type ShotType = 'orbit' | 'flyby' | 'static' | 'travel' | 'eclipse' | 'spline';

export interface Keyframe {
    targetId?: string;                 
    offset?: [number, number, number]; 
    roll?: number;                     
    fov?: number;                      
}

export interface CinematicShot {
    targetId?: string;      
    title?: string;         
    subtitle?: string;      
    titleDelay?: number;    
    type: ShotType;
    duration: number;       
    distance: number;       
    height: number;         
    speed: number;          
    fov?: number;          
    dampening?: number;     
    side?: 'lit' | 'dark' | 'any';
    transition?: 'smooth' | 'cut';
    initialAngle?: number; 
    
    // --- NEW: COUNTDOWN LOGIC ---
    countdownStart?: number; // If set, title becomes a countdown from this number
    
    // V2 SPLINE ENGINE
    keyframes?: Keyframe[];       
    lookAtKeyframes?: Keyframe[]; 
    closedSpline?: boolean;
    
    // Camera Shake
    shakeIntensity?: number;
    shakeFrequency?: number;
    
    // UI
    showFlightComputer?: boolean;
    originName?: string;
    destName?: string;
    facts?: string[]; 
}

export interface Tour {
    id: string;
    name: string;
    description: string;
    shots: CinematicShot[];
}

export interface OverlayData {
    title?: string;
    subtitle?: string;
    show: boolean;
}

export interface FlightData {
    active: boolean;
    startTime?: number;
    duration?: number;
    origin?: string;
    destination?: string;
    facts?: string[];
}