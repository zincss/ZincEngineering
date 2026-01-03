import { PLANET_DATA } from '../../data'; 
import { Tour, CinematicShot } from './types';
import { addTour, COMMERCIAL_FACTS } from './data';

// --- MATH HELPERS ---
export const easeInOutSine = (x: number): number => -(Math.cos(Math.PI * x) - 1) / 2;
export const easeOutSine = (x: number): number => Math.sin((x * Math.PI) / 2);

// --- GENERATOR: RANDOM COMMERCIAL FLIGHT ---
export function generateCommercialFlight(): string {
    const validBodies = PLANET_DATA.filter(b => b.type !== 'Star' && b.type !== 'Black Hole'); 
    const origin = validBodies[Math.floor(Math.random() * validBodies.length)];
    let dest = validBodies[Math.floor(Math.random() * validBodies.length)];
    while (dest.id === origin.id) {
        dest = validBodies[Math.floor(Math.random() * validBodies.length)];
    }

    const distanceAU = Math.abs(origin.distance - dest.distance); 
    const cruiseDuration = Math.max(30, Math.min(120, (distanceAU / 100) + 30));
    const flightNum = Math.floor(Math.random() * 8000) + 1000;
    const tourId = `flight_${flightNum}_${Date.now()}`;
    const gateNum = Math.floor(Math.random() * 20) + 1;

    const shots: CinematicShot[] = [];
    shots.push({ targetId: origin.id, title: `FLIGHT ${flightNum}`, subtitle: `DEPARTING ${origin.name.toUpperCase()} // GATE ${gateNum}`, titleDelay: 0.5, type: 'static', transition: 'cut', duration: 8, distance: origin.radius * 1.5, height: origin.radius * 0.1, speed: 0, dampening: 1, fov: 50, shakeIntensity: 0 });
    shots.push({ targetId: origin.id, title: 'PRE-FLIGHT CHECKS', subtitle: 'T-MINUS 10 SECONDS', type: 'static', duration: 7, distance: origin.radius * 1.3, height: origin.radius * 0.1, speed: 0, dampening: 1, fov: 48, shakeIntensity: 0.002 });
    shots.push({ targetId: origin.id, title: 'MAIN IGNITION', subtitle: 'STABILIZERS LOCKED', type: 'static', duration: 3, distance: origin.radius * 1.3, height: origin.radius * 0.1, speed: 0, dampening: 0.2, fov: 46, shakeIntensity: 0.05 });
    shots.push({ targetId: origin.id, title: 'LIFTOFF', subtitle: 'MAX Q', type: 'travel', duration: 15, distance: origin.radius * 8, height: origin.radius * 4, speed: 0, dampening: 0.8, fov: 65, shakeIntensity: 0.02 });
    shots.push({ targetId: dest.id, type: 'travel', duration: cruiseDuration, distance: dest.radius * 15, height: dest.radius * 2, speed: 0, dampening: 0.5, showFlightComputer: true, originName: origin.name.toUpperCase(), destName: dest.name.toUpperCase(), facts: COMMERCIAL_FACTS, fov: 90, shakeIntensity: 0.0005 });
    shots.push({ targetId: dest.id, title: 'APPROACH VECTOR', subtitle: 'RETRO-ROCKETS FIRED', titleDelay: 1, type: 'travel', duration: 20, distance: dest.radius * 2.5, height: dest.radius * 0.5, speed: 0, dampening: 0.7, fov: 60, shakeIntensity: 0.01 });
    shots.push({ targetId: dest.id, title: `ENTERING ORBITAL ALIGNMENT`, subtitle: `ALIGNING TO ${dest.name.toUpperCase()}`, titleDelay: 0.5, type: 'orbit', duration: 15, distance: dest.radius * 2.5, height: dest.radius * 0.5, speed: 0.05, dampening: 0.8, fov: 50, shakeIntensity: 0 });
    shots.push({ targetId: dest.id, type: 'orbit', duration: 20, distance: dest.radius * 1.5, height: dest.radius * 0.1, speed: 0.1, dampening: 0.6, fov: 60, shakeIntensity: 0 });
    shots.push({ targetId: dest.id, title: 'DESTINATION REACHED', subtitle: 'ENJOY YOUR STAY', type: 'static', duration: 15, distance: dest.radius * 3.0, height: dest.radius * 1.0, speed: 0.02, dampening: 0.9, fov: 45 });

    const tour: Tour = {
        id: tourId,
        name: `Flight ${flightNum}: ${origin.name} to ${dest.name}`,
        description: `Approx travel time: ${Math.round(cruiseDuration)}s`,
        shots: shots
    };
    addTour(tour);
    return tourId;
}