// app/collections/planetarium/components/Scene/Spaceship/index.ts
// Barrel exports for backwards compatibility

export { SpaceshipController } from './SpaceshipController';
export { SpaceshipHUD } from './SpaceshipHUD';
export { 
    SPACESHIP_UPDATE_EVENT, 
    SPACESHIP_CONTROL_EVENT, 
    SPACESHIP_EXIT_EVENT,
    NO_LANDING_IDS,
    DOCKING_RANGE,
    DISTANCE_MULTIPLIER,
    MOVEMENT_KEYS,
    isDockableStructure,
    formatDistance
} from './constants';
export type { OrbitTarget, SpaceshipUpdateEventDetail } from './constants';
