import { PLANET_DATA } from '../../data'; 
import { Tour, CinematicShot } from './types';
import { addTour, COMMERCIAL_FACTS } from './data';

// --- MATH HELPERS ---
export const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;
export const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2);

// --- GENERATOR: RANDOM COMMERCIAL FLIGHT (UPDATED TO SPLINE) ---
export function generateCommercialFlight(): string {
    const validBodies = PLANET_DATA.filter(b => b.type !== 'Star' && b.type !== 'Black Hole'); 
    const origin = validBodies[Math.floor(Math.random() * validBodies.length)];
    let dest = validBodies[Math.floor(Math.random() * validBodies.length)];
    
    // Ensure we don't fly to the same place
    while (dest.id === origin.id) {
        dest = validBodies[Math.floor(Math.random() * validBodies.length)];
    }

    const distanceAU = Math.abs(origin.distance - dest.distance); 
    
    // DYNAMIC DURATION: Base 20s + 2s per AU. Min 30s, Max 180s.
    const cruiseDuration = Math.min(180, Math.max(30, Math.round(distanceAU * 2)));
    
    const flightNum = Math.floor(Math.random() * 8000) + 1000;
    const tourId = `flight_${flightNum}_${Date.now()}`;
    const gateNum = Math.floor(Math.random() * 20) + 1;

    // Radius multipliers for scaling camera positions
    const oR = origin.radius;
    const dR = dest.radius;

    const shots: CinematicShot[] = [
        // 1. PRE-FLIGHT (Static - T-Minus Countdown)
        { 
            targetId: origin.id, 
            subtitle: `FLIGHT ${flightNum} // GATE ${gateNum}`,
            countdownStart: 5,
            showFlightComputer: true, originName: origin.name.toUpperCase(), destName: dest.name.toUpperCase(), facts: COMMERCIAL_FACTS,
            type: 'static', transition: 'cut', duration: 5, distance: 0, height: 0, speed: 0, dampening: 1,
            keyframes: [{ targetId: origin.id, offset: [oR * 2, oR * 0.5, oR * 2], roll: 0, fov: 50 }],
            lookAtKeyframes: [{ targetId: origin.id, offset: [0, 0, 0] }]
        },
        
        // 2. LIFTOFF (Spline - Dynamic Launch Curve)
        {
            title: 'LIFTOFF', subtitle: 'LEAVING SURFACE', titleDelay: 0.5,
            type: 'spline', transition: 'smooth', duration: 25, distance: 0, height: 0, speed: 0, dampening: 0.9, shakeIntensity: 0.05,
            showFlightComputer: true, originName: origin.name.toUpperCase(), destName: 'ORBIT', facts: COMMERCIAL_FACTS,
            keyframes: [
                { targetId: origin.id, offset: [oR * 2.0, oR * 0.5, oR * 2.0], roll: 0, fov: 50 },
                { targetId: origin.id, offset: [oR * 4.0, oR * 2.0, oR * 4.0], roll: 10, fov: 60 },
                { targetId: origin.id, offset: [oR * 8.0, oR * 4.0, oR * 8.0], roll: 20, fov: 65 }
            ],
            lookAtKeyframes: [
                { targetId: origin.id, offset: [0, 0, 0] },
                { targetId: origin.id, offset: [0, 0, 0] },
                { targetId: origin.id, offset: [0, 0, 0] }
            ]
        },
        
        // 3. INTERPLANETARY CRUISE (Spline - Origin -> Destination)
        {
            title: 'INTERPLANETARY CRUISE', subtitle: `DISTANCE: ${Math.round(distanceAU)} AU`, titleDelay: 3.0,
            type: 'spline', transition: 'smooth', duration: cruiseDuration, distance: 0, height: 0, speed: 0, dampening: 0.95,
            showFlightComputer: true, originName: origin.name.toUpperCase(), destName: dest.name.toUpperCase(), facts: COMMERCIAL_FACTS,
            keyframes: [
                { targetId: origin.id, offset: [oR * 15.0, oR * 5.0, oR * 15.0], roll: 20, fov: 65 },
                { targetId: dest.id, offset: [dR * -20, dR * 10, dR * -20], roll: -10, fov: 50 } 
            ],
            // Look at Origin -> Sun -> Destination for a natural camera pan
            lookAtKeyframes: [
                { targetId: origin.id, offset: [0, 0, 0] },
                { targetId: 'sun', offset: [0, 0, 0] },
                { targetId: dest.id, offset: [0, 0, 0] }
            ]
        },
        
        // 4. APPROACH (Spline - Curve into Orbit)
        {
            title: 'ARRIVAL', subtitle: 'INITIATING DOCKING', titleDelay: 2.0,
            type: 'spline', transition: 'smooth', duration: 30, distance: 0, height: 0, speed: 0, dampening: 0.9,
            showFlightComputer: true, originName: 'DEEP SPACE', destName: dest.name.toUpperCase(), facts: COMMERCIAL_FACTS,
            keyframes: [
                { targetId: dest.id, offset: [dR * -20, dR * 10, dR * -20], roll: -10, fov: 50 },
                { targetId: dest.id, offset: [dR * -5, dR * 2, dR * -5], roll: -20, fov: 60 },
                { targetId: dest.id, offset: [dR * 2, dR * 1, dR * 2], roll: 0, fov: 55 }
            ],
            lookAtKeyframes: [
                { targetId: dest.id, offset: [0, 0, 0] },
                { targetId: dest.id, offset: [0, 0, 0] },
                { targetId: dest.id, offset: [0, 0, 0] }
            ]
        },
        
        // 5. LANDED (Static)
        {
            title: 'WELCOME', subtitle: `TO ${dest.name.toUpperCase()}`,
            type: 'static', transition: 'smooth', duration: 10, distance: 0, height: 0, speed: 0, dampening: 0.9,
            showFlightComputer: true, originName: origin.name.toUpperCase(), destName: dest.name.toUpperCase(), facts: COMMERCIAL_FACTS,
            keyframes: [{ targetId: dest.id, offset: [dR * 2, dR * 1, dR * 2], roll: 0, fov: 55 }],
            lookAtKeyframes: [{ targetId: dest.id, offset: [0, 0, 0] }]
        }
    ];

    const tour: Tour = {
        id: tourId,
        name: `Flight ${flightNum}: ${origin.name} to ${dest.name}`,
        description: `Approx travel time: ${Math.round(cruiseDuration)}s`,
        shots: shots
    };
    addTour(tour);
    return tourId;
}