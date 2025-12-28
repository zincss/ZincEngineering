import { Target, MoveRight, MoveLeft, ArrowDownToLine, Waves, Zap, Anchor, Compass, Mountain, ShieldAlert, Crosshair } from 'lucide-react';

// --- TYPES ---
export type Handedness = 'RIGHT' | 'LEFT';

export interface DrillStep {
  text: string;
  focus?: string;
}

export interface Drill {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  difficulty: 'ROOKIE' | 'PRO' | 'ELITE';
  equipment: string[];
  steps: DrillStep[];
}

export interface Prescription {
  diagnosis: string;
  scientificTerm: string;
  explanation: string;
  swingThought: string; // Technical cue (Left Brain)
  swingFeel: string;    // Sensory cue (Right Brain)
  drills: Drill[];
  flightPathConfig: { curvature: number; launchDir: number };
}

export interface DiagnosticNode {
  id: string;
  question: string;
  options: {
    label: string;
    nextId?: string;
    prescriptionId?: string;
  }[];
}

export interface Symptom {
  id: string;
  label: string;
  description: string;
  icon: any;
  startNodeId: string;
}

// --- DRILL DATABASE ---
export const DRILLS: Record<string, Drill> = {
  // ... (Keeping existing drills)
  headcover_drill: {
    id: 'headcover_drill',
    title: 'The Gatekeeper',
    description: 'Neutralize the "Over-the-Top" move by creating a physical barrier for the clubhead.',
    durationSeconds: 600,
    difficulty: 'ROOKIE',
    equipment: ['Driver Headcover', '3 Balls'],
    steps: [
      { text: 'Place ball on tee.', focus: 'Setup' },
      { text: 'Place headcover 2 inches outside the ball (farther from you).', focus: 'Constraint' },
      { text: 'Make slow swings trying to miss the headcover.', focus: 'Path' },
      { text: 'If you hit the headcover, you came "Over the Top".', focus: 'Feedback' }
    ]
  },
  split_hands: {
    id: 'split_hands',
    title: 'Split-Hand Synchronization',
    description: 'Forces the lead arm to extend and the trail arm to fold correctly, fixing an open face.',
    durationSeconds: 300,
    difficulty: 'PRO',
    equipment: ['Iron (7 or 8)'],
    steps: [
      { text: 'Take your normal grip.', focus: 'Grip' },
      { text: 'Slide your trail hand down the grip by 3-4 inches.', focus: 'Split' },
      { text: 'Take half-swings. Feel the toe of the club passing the heel.', focus: 'Release' },
      { text: 'This exaggerated release cures the slice.', focus: 'Result' }
    ]
  },
  towel_drill: {
    id: 'towel_drill',
    title: 'Connection Protocol',
    description: 'Syncs the arms with the torso rotation to prevent "armsy" swings.',
    durationSeconds: 900,
    difficulty: 'ROOKIE',
    equipment: ['Towel'],
    steps: [
      { text: 'Place a towel across your chest, under both armpits.', focus: 'Setup' },
      { text: 'Hold the towel in place with arm pressure.', focus: 'Pressure' },
      { text: 'Hit punch shots (50% power) without dropping the towel.', focus: 'Execution' },
      { text: 'If the towel drops, your arms disconnected from your pivot.', focus: 'Feedback' }
    ]
  },
  flamingo_drill: {
    id: 'flamingo_drill',
    title: 'Flamingo Balance',
    description: 'Forces weight transfer to the lead side to prevent "hanging back" (Fat/Thin shots).',
    durationSeconds: 450,
    difficulty: 'PRO',
    equipment: ['Iron'],
    steps: [
      { text: 'Address the ball normally.', focus: 'Setup' },
      { text: 'Pull your trail foot back so only the toe touches the ground.', focus: 'Balance' },
      { text: 'Keep 90% of weight on lead foot throughout swing.', focus: 'Stability' },
      { text: 'Strike the ball crisp. Do not fall backward.', focus: 'Contact' }
    ]
  },
  // NEW DRILLS
  wall_drill: {
    id: 'wall_drill',
    title: 'The Wall Butt Drill',
    description: 'Fixes early extension (thrusting hips) by maintaining tush line.',
    durationSeconds: 300,
    difficulty: 'ROOKIE',
    equipment: ['Wall or Chair'],
    steps: [
      { text: 'Setup without a club, butt touching a wall.', focus: 'Contact' },
      { text: 'Cross arms over chest.', focus: 'Posture' },
      { text: 'Make a backswing. Trail cheek stays on wall.', focus: 'Load' },
      { text: 'Make a downswing. Lead cheek replaces trail cheek on wall.', focus: 'Clear' }
    ]
  },
  line_drill: {
    id: 'line_drill',
    title: 'Line in the Sand',
    description: 'The ultimate bunker drill to control entry point.',
    durationSeconds: 600,
    difficulty: 'PRO',
    equipment: ['Sand Wedge', 'Bunker'],
    steps: [
      { text: 'Draw a long line in the sand.', focus: 'Setup' },
      { text: 'Straddle the line. The line is your ball position.', focus: 'Stance' },
      { text: 'Make swings trying to splash the sand starting exactly at the line.', focus: 'Precision' },
      { text: 'Move down the line, repeating the splash.', focus: 'Repetition' }
    ]
  },
  anti_shank_setup: {
    id: 'anti_shank_setup',
    title: 'Two Ball Nightmare',
    description: 'Psychological drill to force center-face contact and stop the shanks.',
    durationSeconds: 400,
    difficulty: 'ELITE',
    equipment: ['2 Balls', 'Iron'],
    steps: [
      { text: 'Place two balls 1 inch apart.', focus: 'Setup' },
      { text: 'Address the INNER ball (closest to you).', focus: 'Aim' },
      { text: 'Try to hit the OUTER ball instead.', focus: 'Reach' },
      { text: 'This forces your hands away from your body, curing the shank.', focus: 'Mechanics' }
    ]
  },
  lag_putt_eyes_closed: {
    id: 'lag_putt_eyes_closed',
    title: 'Blind Distance Control',
    description: 'Removes visual distraction to heighten feel for speed.',
    durationSeconds: 600,
    difficulty: 'ROOKIE',
    equipment: ['Putter', '3 Balls'],
    steps: [
      { text: 'Look at the hole (20-30ft away).', focus: 'Visualize' },
      { text: 'Close your eyes.', focus: 'Feel' },
      { text: 'Stroke the putt.', focus: 'Trust' },
      { text: 'Guess where it finished (Short/Long) before opening eyes.', focus: 'Feedback' }
    ]
  }
};

// --- PRESCRIPTIONS ---
export const PRESCRIPTIONS: Record<string, Prescription> = {
  // SLICE FAMILY
  slice_ott: {
    diagnosis: 'OUT_TO_IN_PATH',
    scientificTerm: 'Negative Club Path > Face Angle',
    explanation: 'Your upper body is dominating the downswing, throwing the club "over" your shoulder plane. You are chopping across the ball like an axe.',
    swingThought: 'Hit the inside quadrant of the ball.',
    swingFeel: 'Keep your back to the target as long as possible.',
    drills: [DRILLS.headcover_drill, DRILLS.split_hands],
    flightPathConfig: { curvature: 1, launchDir: -1 }
  },
  slice_open_face: {
    diagnosis: 'FACE_CONTROL_FAILURE',
    scientificTerm: 'Extreme Open Face to Path',
    explanation: 'Your path is actually decent, but your hands are passive through impact, leaving the face wide open.',
    swingThought: 'Knuckles down at impact.',
    swingFeel: 'Feel like you are shaking hands with the target.',
    drills: [DRILLS.split_hands],
    flightPathConfig: { curvature: 0.8, launchDir: 0 }
  },

  // HOOK FAMILY
  hook_closed: {
    diagnosis: 'STALLED_ROTATION',
    scientificTerm: 'Closed Face > Positive Path',
    explanation: 'Your body rotation has stopped, forcing your hands to flip the club over to save the shot. This shuts the face rapidly.',
    swingThought: 'Chest covers the ball.',
    swingFeel: 'Feel the grip end of the club winning the race to the ball.',
    drills: [DRILLS.towel_drill, DRILLS.flamingo_drill],
    flightPathConfig: { curvature: -1, launchDir: 1 }
  },

  // CONTACT FAMILY
  fat_early_extension: {
    diagnosis: 'EARLY_EXTENSION',
    scientificTerm: 'Loss of Posture / Pelvic Thrust',
    explanation: 'Your hips are moving towards the ball in the downswing, causing you to stand up. To reach the ball, you cast the club, hitting the ground early.',
    swingThought: 'Keep your tush on the imaginary wall.',
    swingFeel: 'Squat into your heels during transition.',
    drills: [DRILLS.wall_drill, DRILLS.flamingo_drill],
    flightPathConfig: { curvature: 0, launchDir: 0 }
  },
  thin_hanging_back: {
    diagnosis: 'REVERSE_WEIGHT_SHIFT',
    scientificTerm: 'Low Point Behind Ball',
    explanation: 'You are falling away from the target at impact, trying to help the ball up. This raises the low point of the arc to the ball\'s equator.',
    swingThought: 'Transfer energy to the lead heel.',
    swingFeel: 'Finish tall on your front leg like a statue.',
    drills: [DRILLS.flamingo_drill],
    flightPathConfig: { curvature: 0, launchDir: 0 }
  },
  shank_hosel: {
    diagnosis: 'HOSEL_ROCKET',
    scientificTerm: 'Extreme Heel Bias / Path Shift',
    explanation: 'The most feared shot. Your hands are moving significantly closer to the ball at impact than they were at address, presenting the hosel to the ball.',
    swingThought: 'Swing through a gate near your toes.',
    swingFeel: 'Keep your elbows close to your ribcage.',
    drills: [DRILLS.anti_shank_setup, DRILLS.headcover_drill],
    flightPathConfig: { curvature: 1.5, launchDir: 1.5 }
  },

  // SHORT GAME
  bunker_digging: {
    diagnosis: 'STEEP_ANGLE_OF_ATTACK',
    scientificTerm: 'Leading Edge Dig',
    explanation: 'You are driving the sharp leading edge into the sand instead of using the bounce (the wide bottom) of the club.',
    swingThought: 'Thump the sand, don\'t dig.',
    swingFeel: 'Imagine sliding a glass of water off a table without spilling.',
    drills: [DRILLS.line_drill],
    flightPathConfig: { curvature: 0, launchDir: 0 }
  },
  putt_speed: {
    diagnosis: 'DEPTH_PERCEPTION_ERROR',
    scientificTerm: 'Sensory Feedback Loop Failure',
    explanation: 'You are focused too much on the mechanics of the stroke rather than the athleticism of the distance.',
    swingThought: 'Stroke to the picture in your mind.',
    swingFeel: 'Roll the ball with your hand (visualize the toss).',
    drills: [DRILLS.lag_putt_eyes_closed],
    flightPathConfig: { curvature: 0, launchDir: 0 }
  }
};

// --- SYMPTOMS ---
export const SYMPTOMS: Symptom[] = [
  {
    id: 'slice',
    label: 'The Slice',
    description: 'Ball curves weakly away from you.',
    icon: MoveRight,
    startNodeId: 'q_slice_start'
  },
  {
    id: 'hook',
    label: 'The Hook',
    description: 'Ball dives aggressively towards your feet side.',
    icon: MoveLeft,
    startNodeId: 'q_hook_start'
  },
  {
    id: 'contact',
    label: 'Poor Contact',
    description: 'Fat, Thin, or Topped shots.',
    icon: ArrowDownToLine,
    startNodeId: 'q_contact_type'
  },
  {
    id: 'shank',
    label: 'The Shank',
    description: 'Ball shoots 90 degrees sideways.',
    icon: ShieldAlert,
    startNodeId: 'q_shank_freq'
  },
  {
    id: 'bunker',
    label: 'Bunker Struggles',
    description: 'Can\'t get out or skulling it.',
    icon: Mountain,
    startNodeId: 'q_bunker_miss'
  },
  {
    id: 'putting',
    label: 'Putting',
    description: '3-Putting or missing short ones.',
    icon: Anchor,
    startNodeId: 'q_putt_issue'
  }
];

// --- DIAGNOSTIC TREE (DEEP DIVE) ---
export const DIAGNOSTIC_NODES: Record<string, DiagnosticNode> = {
  // SLICE BRANCH
  q_slice_start: {
    id: 'q_slice_start',
    question: 'Where does the ball START before curving?',
    options: [
      { label: 'Starts {LEAD_SIDE}, then curves {TRAIL_SIDE} (Pull-Slice)', nextId: 'q_slice_divot' },
      { label: 'Starts Straight, then curves {TRAIL_SIDE}', nextId: 'q_slice_severity' },
      { label: 'Starts {TRAIL_SIDE}, then curves {TRAIL_SIDE} (Push-Slice)', prescriptionId: 'slice_open_face' },
    ]
  },
  q_slice_divot: {
    id: 'q_slice_divot',
    question: 'Check your divots. How do they look?',
    options: [
      { label: 'Deep and pointing {LEAD_SIDE}', prescriptionId: 'slice_ott' }, // Classic Chop
      { label: 'Shallow or None (Picking it)', prescriptionId: 'slice_ott' },
    ]
  },
  q_slice_severity: {
    id: 'q_slice_severity',
    question: 'How severe is the curve?',
    options: [
      { label: 'Unplayable (20+ yards)', prescriptionId: 'slice_ott' },
      { label: 'Manageable (5-10 yards)', prescriptionId: 'slice_open_face' },
    ]
  },

  // HOOK BRANCH
  q_hook_start: {
    id: 'q_hook_start',
    question: 'Is this happening with Driver or Irons?',
    options: [
      { label: 'Driver (Low Duck Hook)', prescriptionId: 'hook_closed' },
      { label: 'Irons (Over-drawing)', prescriptionId: 'hook_closed' },
    ]
  },

  // CONTACT BRANCH
  q_contact_type: {
    id: 'q_contact_type',
    question: 'What is the most common miss?',
    options: [
      { label: 'Fat / Heavy (Ground first)', nextId: 'q_fat_weight' },
      { label: 'Thin / Top (Ball equator)', nextId: 'q_thin_balance' },
    ]
  },
  q_fat_weight: {
    id: 'q_fat_weight',
    question: 'Where is your weight when you finish?',
    options: [
      { label: 'Stuck on back foot', prescriptionId: 'thin_hanging_back' },
      { label: 'Falling forward / Toes', prescriptionId: 'fat_early_extension' },
    ]
  },
  q_thin_balance: {
    id: 'q_thin_balance',
    question: 'Do you feel like you are standing up through impact?',
    options: [
      { label: 'Yes, I lose posture', prescriptionId: 'fat_early_extension' },
      { label: 'No, I just pull my arms in', prescriptionId: 'thin_hanging_back' }, // simplified chicken wing diagnosis
    ]
  },

  // SHANK BRANCH
  q_shank_freq: {
    id: 'q_shank_freq',
    question: 'Panic Check: Is it every shot or random?',
    options: [
      { label: 'Every shot (Mechanical)', prescriptionId: 'shank_hosel' },
      { label: 'Random (Mental/Fatigue)', prescriptionId: 'shank_hosel' },
    ]
  },

  // BUNKER BRANCH
  q_bunker_miss: {
    id: 'q_bunker_miss',
    question: 'Are you leaving it in or flying the green?',
    options: [
      { label: 'Leaving it in (Digging)', prescriptionId: 'bunker_digging' },
      { label: 'Flying the green (Blading)', prescriptionId: 'bunker_digging' }, // Usually same root cause (leading edge)
    ]
  },

  // PUTTING BRANCH
  q_putt_issue: {
    id: 'q_putt_issue',
    question: 'What costs you the most strokes?',
    options: [
      { label: 'Speed (Leaving short/long)', prescriptionId: 'putt_speed' },
      { label: 'Line (Missing left/right)', prescriptionId: 'putt_speed' }, // Simplified for now, mapped to same drill for general feel
    ]
  }
};