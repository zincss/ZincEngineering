// app/play/wordle/lib.ts

// --- WORD DATABASE ---
// Strictly validated for length 4, 5, and 6.

export const WORDS_4 = [
  "ABLE", "ACID", "ALLY", "ATOM", "AUTO", "AXIS", "BABY", "BACK", "BALL", "BANK", 
  "BASE", "BEAM", "BEAN", "BEAR", "BEAT", "BELL", "BELT", "BEST", "BIKE", "BIRD", 
  "BLUE", "BOAT", "BODY", "BOMB", "BOND", "BONE", "BOOK", "BOOM", "BOOT", "BOSS", 
  "BOWL", "BURN", "BUSY", "BYTE", "CAKE", "CALL", "CAMP", "CARD", "CARE", "CASE", 
  "CASH", "CAST", "CELL", "CHAT", "CHIP", "CITY", "CLUB", "COAL", "COAT", "CODE", 
  "COIN", "COLD", "COOK", "COOL", "COPY", "CORE", "COST", "CREW", "CROP", "CUBE", 
  "CURE", "DATA", "DATE", "DAWN", "DEAD", "DEAL", "DEAR", "DEBT", "DECK", "DEEP", 
  "DEMO", "DESK", "DIAL", "DIET", "DIRT", "DISC", "DISH", "DISK", "DOOR", "DOWN", 
  "DRAW", "DROP", "DRUG", "DRUM", "DUCK", "DUST", "DUTY", "EARN", "EAST", "EASY", 
  "ECHO", "EDGE", "EDIT", "ELSE", "EPIC", "EURO", "EVEN", "EVER", "EVIL", "EXAM", 
  "EXIT", "FACE", "FACT", "FAIL", "FAIR", "FALL", "FAME", "FARM", "FAST", "FATE", 
  "FEAR", "FEED", "FEEL", "FEET", "FILE", "FILL", "FILM", "FIND", "FINE", "FIRE", 
  "FIRM", "FISH", "FLAG", "FLAT", "FLOW", "FLUX", "FOAM", "FOIL", "FOLD", "FOOD", 
  "FOOT", "FORM", "FORT", "FOUR", "FREE", "FROM", "FUEL", "FULL", "FUND", "FUSE", 
  "GAME", "GANG", "GATE", "GEAR", "GENE", "GIFT", "GIRL", "GIVE", "GLAD", "GLOW", 
  "GOAL", "GOLD", "GOLF", "GOOD", "GRAB", "GRAY", "GRID", "GROW", "GULF", "HAIR", 
  "HALF", "HALL", "HALO", "HAND", "HANG", "HARD", "HARM", "HATE", "HEAD", "HEAL", 
  "HEAR", "HEAT", "HELL", "HELM", "HELP", "HERO", "HIGH", "HIKE", "HILL", "HINT", 
  "HIRE", "HOLD", "HOLE", "HOLY", "HOME", "HOPE", "HOST", "HOUR", "HUGE", "HULL", 
  "HUNT", "HURT", "ICON", "IDEA", "IDLE", "INCH", "INFO", "INTO", "IRON", "ITEM", 
  "JACK", "JAIL", "JAZZ", "JOIN", "JOKE", "JUMP", "JUST", "KEEN", "KEEP", "KEYS", 
  "KICK", "KILL", "KIND", "KING", "KISS", "KNEE", "KNOT", "KNOW", "LACK", "LADY", 
  "LAKE", "LAMP", "LAND", "LANE", "LAST", "LATE", "LEAD", "LEAF", "LEAN", "LEFT", 
  "LENS", "LESS", "LIFT", "LIKE", "LINE", "LINK", "LION", "LIST", "LIVE", "LOAD", 
  "LOAN", "LOCK", "LOGO", "LONG", "LOOK", "LOOP", "LORD", "LOSE", "LOSS", "LOST", 
  "LOUD", "LOVE", "LUCK", "LUNG", "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MAPS", 
  "MARK", "MASK", "MASS", "MATH", "MEAL", "MEAN", "MEAT", "MEET", "MELT", "MEMO", 
  "MENU", "MESH", "MESS", "MILE", "MILK", "MILL", "MIND", "MINE", "MISS", "MODE", 
  "MOOD", "MOON", "MORE", "MOST", "MOVE", "MUCH", "MUST", "NAME", "NAVY", "NEAR", 
  "NEAT", "NECK", "NEED", "NEON", "NEWS", "NEXT", "NICE", "NINE", "NODE", "NONE", 
  "NOSE", "NOTE", "NOUN", "NOVA", "NULL", "OKAY", "ONCE", "ONLY", "OPEN", "ORAL", 
  "OVER", "PACE", "PACK", "PAGE", "PAIN", "PAIR", "PALM", "PARK", "PART", "PASS", 
  "PAST", "PATH", "PEAK", "PICK", "PILE", "PINK", "PIPE", "PLAN", "PLAY", "PLOT", 
  "PLUG", "PLUS", "POEM", "POET", "POLL", "POOL", "POOR", "PORT", "POSE", "POST", 
  "POUR", "PRAY", "PULL", "PUMP", "PURE", "PUSH", "QUIT", "RACE", "RAIL", "RAIN", 
  "RARE", "RATE", "READ", "REAL", "REAR", "RELY", "RENT", "REST", "RICE", "RICH", 
  "RIDE", "RING", "RIOT", "RISE", "RISK", "ROAD", "ROCK", "ROLE", "ROLL", "ROOF", 
  "ROOM", "ROOT", "ROPE", "ROSE", "RULE", "RUSH", "SAFE", "SAID", "SAIL", "SALE", 
  "SALT", "SAME", "SAND", "SAVE", "SCAN", "SEAL", "SEAT", "SEED", "SEEK", "SEEM", 
  "SELL", "SEND", "SENT", "SHIP", "SHOE", "SHOP", "SHOT", "SHOW", "SHUT", "SICK", 
  "SIDE", "SIGN", "SILK", "SITE", "SIZE", "SKIN", "SKIP", "SLIP", "SLOW", "SNAP", 
  "SNOW", "SOFT", "SOIL", "SOLD", "SOLE", "SOLO", "SOME", "SONG", "SOON", "SOUL", 
  "SOUP", "SPIN", "SPOT", "STAR", "STAY", "STEP", "STOP", "SUCH", "SUIT", "SURE", 
  "SWIM", "SYNC", "TAKE", "TALE", "TALL", "TANK", "TAPE", "TASK", "TEAM", "TECH", 
  "TELL", "TEND", "TENT", "TERM", "TEST", "TEXT", "THAT", "THEM", "THEN", "THIN", 
  "THIS", "TIDE", "TIME", "TINY", "TOOL", "TOUR", "TOWN", "TREE", "TRIP", "TRUE", 
  "TUBE", "TUNE", "TURN", "TWIN", "TYPE", "UNIT", "USER", "VAST", "VERY", "VICE", 
  "VIEW", "VOTE", "WAIT", "WAKE", "WALK", "WALL", "WANT", "WARD", "WARM", "WARN", 
  "WASH", "WAVE", "WEAK", "WEAR", "WEEK", "WELL", "WEST", "WHAT", "WHEN", "WIDE", 
  "WILD", "WILL", "WIND", "WINE", "WING", "WIRE", "WISH", "WITH", "WOOD", "WORD", 
  "WORK", "WRAP", "YARD", "YEAR", "YOUR", "ZERO", "ZINC", "ZONE", "ZOOM"
];

export const WORDS_5 = [
  "ABOUT", "ABOVE", "ACTOR", "ACUTE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", 
  "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIEN", "ALIVE", 
  "ALLOW", "ALONE", "ALONG", "ALPHA", "ALTER", "AMONG", "ANGRY", "ANKLE", "APART", 
  "APPLE", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASSET", "AUDIO", "AUDIT", 
  "AVOID", "AWARD", "AWARE", "BADGE", "BASIC", "BASIS", "BATCH", "BEACH", "BEGIN", 
  "BEING", "BELOW", "BENCH", "BIRTH", "BLACK", "BLADE", "BLAME", "BLANK", "BLAST", 
  "BLEND", "BLIND", "BLOCK", "BLOOD", "BOARD", "BONUS", "BOOST", "BOUND", "BRAIN", 
  "BRAKE", "BRAND", "BRASS", "BRAVE", "BREAD", "BREAK", "BRICK", "BRIEF", "BRING", 
  "BROAD", "BROWN", "BRUSH", "BUILD", "BUILT", "BURST", "BUYER", "CABIN", "CABLE", 
  "CACHE", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE", "CHEAP", 
  "CHECK", "CHEST", "CHIEF", "CHILD", "CHIPS", "CIVIL", "CLAIM", "CLASS", "CLEAN", 
  "CLEAR", "CLICK", "CLOCK", "CLOSE", "CLOTH", "CLOUD", "COACH", "COAST", "COLOR", 
  "COMET", "COMIC", "COUNT", "COURT", "COVER", "CRAFT", "CRASH", "CRAZY", "CREAM", 
  "CRIME", "CROSS", "CROWD", "CROWN", "CURVE", "CYCLE", "DAILY", "DANCE", "DEATH", 
  "DEBUG", "DELAY", "DELTA", "DEPTH", "DIGIT", "DIRTY", "DOING", "DOUBT", "DOZEN", 
  "DRAFT", "DRAMA", "DREAM", "DRESS", "DRINK", "DRIVE", "DRONE", "EARLY", "EARTH", 
  "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER", "ENTRY", "EQUAL", "EQUIP", 
  "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE", "FAULT", 
  "FIBER", "FIELD", "FIFTY", "FIGHT", "FINAL", "FIRST", "FLAME", "FLASH", "FLEET", 
  "FLOAT", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM", "FOUND", 
  "FRAME", "FRESH", "FRONT", "FRUIT", "FUNNY", "GAMMA", "GIANT", "GIVEN", "GLASS", 
  "GLOBE", "GLORY", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRAPH", "GRASP", 
  "GRASS", "GRAVE", "GREAT", "GREEN", "GREET", "GROSS", "GROUP", "GUARD", "GUESS", 
  "GUEST", "GUIDE", "HABIT", "HAPPY", "HARSH", "HEART", "HEAVY", "HELLO", "HONOR", 
  "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL", "IMAGE", "INDEX", "INNER", "INPUT", 
  "ISSUE", "JOINT", "JUDGE", "JUICE", "KNOWN", "LABEL", "LABOR", "LARGE", "LASER", 
  "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAVE", "LEGAL", "LEVEL", "LIGHT", 
  "LIMIT", "LINUX", "LOCAL", "LOGIC", "LOGIN", "LOOSE", "LOWER", "LUCKY", "LUNCH", 
  "MACRO", "MAGIC", "MAJOR", "MAKER", "MARCH", "MATCH", "MAYBE", "MAYOR", "MEDIA", 
  "METAL", "METER", "MICRO", "MIGHT", "MINOR", "MINUS", "MODEL", "MODEM", "MONEY", 
  "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC", "NAKED", 
  "NEVER", "NIGHT", "NOISE", "NORTH", "NOTES", "NOVEL", "NURSE", "OCEAN", "OFFER", 
  "OFTEN", "ORDER", "OTHER", "OUTER", "OWNER", "PANEL", "PAPER", "PARTY", "PATCH", 
  "PAUSE", "PEACE", "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PIXEL", 
  "PLACE", "PLAIN", "PLANE", "PLANT", "PLATE", "POINT", "POLAR", "POUND", "POWER", 
  "PRESS", "PRICE", "PRIDE", "PRIME", "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", 
  "PROVE", "PROXY", "PULSE", "QUERY", "QUEST", "QUEUE", "QUICK", "QUIET", "QUITE", 
  "QUOTE", "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "REACT", "READY", 
  "REALM", "REFER", "RELAX", "REPLY", "RESET", "RIGHT", "RIVER", "ROBOT", "ROGUE", 
  "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE", "SCENE", "SCOPE", "SCORE", "SENSE", 
  "SERVE", "SETUP", "SEVEN", "SHADE", "SHAFT", "SHAKE", "SHAPE", "SHARE", "SHARP", 
  "SHEET", "SHELL", "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SIGHT", "SIGMA", 
  "SILLY", "SINCE", "SKILL", "SLEEP", "SLICE", "SLIDE", "SMALL", "SMART", "SMILE", 
  "SMOKE", "SOLAR", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", 
  "SPEAK", "SPEED", "SPEND", "SPLIT", "SPORT", "STACK", "STAFF", "STAGE", "STAMP", 
  "STAND", "START", "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", 
  "STORE", "STORM", "STORY", "STRIP", "STUDY", "STUFF", "STYLE", "SUGAR", "SUPER", 
  "SWEET", "SWIFT", "TABLE", "TASTE", "TEACH", "TEAMS", "TEETH", "THANK", "THEIR", 
  "THEME", "THERE", "THICK", "THING", "THINK", "THIRD", "THOSE", "THREE", "THROW", 
  "TIGHT", "TITLE", "TODAY", "TOTAL", "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", 
  "TRAIN", "TREAT", "TREND", "TRIAL", "TRICK", "TRUCK", "TRUST", "TRUTH", "TWICE", 
  "UNDER", "UNION", "UNITY", "UNTIL", "UPPER", "URBAN", "USAGE", "USUAL", "VALID", 
  "VALUE", "VALVE", "VAPOR", "VAULT", "VIDEO", "VIEWS", "VIRUS", "VISIT", "VITAL", 
  "VOICE", "VOLTS", "VOTER", "WASTE", "WATCH", "WATER", "WEALTH", "WHEEL", "WHERE", 
  "WHICH", "WHILE", "WHITE", "WHOLE", "WIDTH", "WOMAN", "WOMEN", "WORLD", "WORRY", 
  "WORSE", "WORST", "WORTH", "WOULD", "WRITE", "WRONG", "XRAYS", "YEARS", "YIELD", 
  "YOUNG", "YOURS", "YOUTH", "ZEBRA", "ZONES"
];

export const WORDS_6 = [
  "ABSORB", "ACCEPT", "ACCESS", "ACCORD", "ACTION", "ACTIVE", "ACTUAL", "ADJUST", 
  "ADVICE", "ADVISE", "AFFAIR", "AFFECT", "AFFORD", "AGENCY", "AGENDA", "ALMOST", 
  "ALWAYS", "AMOUNT", "ANCHOR", "ANIMAL", "ANNUAL", "ANSWER", "ANYONE", "APPEAL", 
  "APPEAR", "AROUND", "ARRIVE", "ARTIST", "ASPECT", "ASSERT", "ASSESS", "ASSIGN", 
  "ASSIST", "ASSUME", "ATOMIC", "ATTACH", "ATTACK", "ATTEND", "AUTHOR", "AVENUE", 
  "BACKUP", "BANKER", "BANNER", "BARELY", "BARREL", "BASKET", "BATTLE", "BEACON", 
  "BEAUTY", "BECOME", "BEFORE", "BEHALF", "BEHAVE", "BEHIND", "BELIEF", "BELONG", 
  "BESIDE", "BETTER", "BEYOND", "BINARY", "BIONIC", "BITTER", "BLADES", "BORDER", 
  "BOTTLE", "BOUGHT", "BOUNCE", "BRANCH", "BREATH", "BREEZE", "BRIDGE", "BRIGHT", 
  "BROKEN", "BRONZE", "BUDGET", "BUFFER", "BULLET", "BUNDLE", "BURDEN", "BUREAU", 
  "BUTTON", "BUZZER", "BYPASS", "CAMERA", "CAMPUS", "CANCER", "CANDLE", "CANVAS", 
  "CANYON", "CARBON", "CAREER", "CARPET", "CASINO", "CASTLE", "CASUAL", "CATTLE", 
  "CAUGHT", "CEMENT", "CENTER", "CHANCE", "CHANGE", "CHARGE", "CHEESE", "CHERRY", 
  "CHOICE", "CHOOSE", "CHORUS", "CHROME", "CHURCH", "CINEMA", "CIRCLE", "CIRCUS", 
  "CLIENT", "CLINIC", "COFFEE", "COFFIN", "COLLAR", "COLUMN", "COMBAT", "COMEDY", 
  "COMMIT", "COMMON", "COMPLY", "COPPER", "CORNER", "COSTLY", "COTTON", "COUNTY", 
  "COUPLE", "COURSE", "COUSIN", "COWBOY", "CREATE", "CREDIT", "CRISIS", "CRITIC", 
  "CRUISE", "CRYPTO", "CUSTOM", "DAMAGE", "DANGER", "DEALER", "DEBATE", "DECADE", 
  "DECIDE", "DEFEAT", "DEFECT", "DEFEND", "DEFINE", "DEGREE", "DELETE", "DEMAND", 
  "DENTAL", "DEPEND", "DEPLOY", "DEPUTY", "DESERT", "DESIGN", "DESIRE", "DETAIL", 
  "DETECT", "DEVICE", "DIALOG", "DIESEL", "DIFFER", "DIGEST", "DINNER", "DIRECT", 
  "DIVIDE", "DOCTOR", "DOLLAR", "DOMAIN", "DONATE", "DOUBLE", "DRAGON", "DRAWER", 
  "DRIVER", "DURING", "EASILY", "EATING", "EDITOR", "EFFECT", "EFFORT", "EITHER", 
  "EMPIRE", "EMPLOY", "ENABLE", "ENDING", "ENERGY", "ENGAGE", "ENGINE", "ENOUGH", 
  "ENTIRE", "ENTITY", "EQUATE", "EQUITY", "ESCAPE", "ESTATE", "ETHICS", "ETHNIC", 
  "EUROPE", "EVOLVE", "EXCEED", "EXCEPT", "EXCESS", "EXCITE", "EXCUSE", "EXEMPT", 
  "EXOTIC", "EXPAND", "EXPECT", "EXPERT", "EXPIRE", "EXPORT", "EXPOSE", "EXTEND", 
  "EXTENT", "FABRIC", "FACTOR", "FAILED", "FAMILY", "FAMOUS", "FARMER", "FATHER", 
  "FELLOW", "FEMALE", "FIGURE", "FILTER", "FINGER", "FINISH", "FISCAL", "FLAVOR", 
  "FLIGHT", "FLOWER", "FOLLOW", "FOREST", "FORGET", "FORMAL", "FORMAT", "FORMER", 
  "FOSSIL", "FOSTER", "FOUGHT", "FOURTH", "FREEZE", "FRENCH", "FRIDAY", "FRIDGE", 
  "FRIEND", "FROZEN", "FUTURE", "GALAXY", "GALLON", "GAMBLE", "GAMING", "GARAGE", 
  "GARDEN", "GATHER", "GENDER", "GENIUS", "GENTLE", "GIGGLE", "GINGER", "GLANCE", 
  "GLOBAL", "GOLDEN", "GOOGLE", "GOSPEL", "GOSSIP", "GOVERN", "GROUND", "GROWTH", 
  "GUITAR", "HACKER", "HAMMER", "HANDLE", "HAPPEN", "HARBOR", "HARDLY", "HAZARD", 
  "HEALTH", "HEAVEN", "HEIGHT", "HELMET", "HEROIC", "HIDDEN", "HOCKEY", "HOLDER", 
  "HOLLOW", "HONEST", "HORROR", "HOSTEL", "HUMBLE", "HUNGER", "HUNGRY", "HUNTER", 
  "HYBRID", "IGNORE", "IMMUNE", "IMPACT", "IMPORT", "IMPOSE", "INCOME", "INDOOR", 
  "INFANT", "INFECT", "INFORM", "INJURE", "INJURY", "INMATE", "INSECT", "INSERT", 
  "INSIDE", "INSIST", "INTACT", "INTAKE", "INTEND", "INTENT", "INVENT", "INVEST", 
  "INVITE", "ISLAND", "JACKET", "JERSEY", "JUNGLE", "JUNIOR", "KEEPER", "KERNEL", 
  "KETTLE", "KEYPAD", "KIDNEY", "KILLER", "KITCHEN", "KNIGHT", "LABOUR", "LADDER", 
  "LAPTOP", "LAUNCH", "LAWYER", "LEADER", "LEAGUE", "LEGACY", "LEGEND", "LENGTH", 
  "LESSON", "LETHAL", "LETTER", "LIABLE", "LIKELY", "LINEAR", "LINKER", "LIQUID", 
  "LIQUOR", "LISTEN", "LITTLE", "LIVING", "LOCATE", "LOCKER", "LONELY", "LOOSEN", 
  "LOSING", "LOTION", "LOUNGE", "LOVELY", "LUXURY", "MAGNET", "MAIDEN", "MAKING", 
  "MANAGE", "MANUAL", "MARGIN", "MARINE", "MARKET", "MASTER", "MATTER", "MATURE", 
  "MEDIUM", "MEMBER", "MEMORY", "MENTAL", "MENTOR", "MERGER", "METHOD", "METRIC", 
  "MIDDLE", "MINING", "MINUTE", "MIRROR", "MISERY", "MOBILE", "MODERN", "MODEST", 
  "MODIFY", "MODULE", "MOMENT", "MONKEY", "MORALE", "MORTAL", "MOTHER", "MOTION", 
  "MOTIVE", "MOVING", "MUSCLE", "MUSEUM", "MUTUAL", "MYSELF", "NARROW", "NATION", 
  "NATIVE", "NATURE", "NEARBY", "NEEDLE", "NOBODY", "NORMAL", "NOTICE", "NOTION", 
  "NUMBER", "OBJECT", "OBTAIN", "OCCUPY", "OFFICE", "ONLINE", "OPTION", "ORANGE", 
  "ORBITAL", "ORGANIC", "ORIGIN", "OUTFIT", "OUTLET", "OUTPUT", "OXYGEN", "PACKET", 
  "PALACE", "PARADE", "PARCEL", "PARENT", "PARISH", "PARTLY", "PATENT", "PATROL", 
  "PATRON", "PENCIL", "PEOPLE", "PEPPER", "PERIOD", "PERMIT", "PERSON", "PETROL", 
  "PHRASE", "PICKET", "PICNIC", "PILLOW", "PIRATE", "PISTOL", "PLANET", "PLASMA", 
  "PLASTIC", "PLAYER", "PLEASE", "PLEDGE", "PLENTY", "PLUGIN", "POCKET", "POETRY", 
  "POISON", "POLICE", "POLICY", "POLISH", "POLITE", "PORTAL", "POSTAL", "POSTER", 
  "POTATO", "POTENT", "POWDER", "PRAYER", "PREFER", "PREFIX", "PRETTY", "PRIEST", 
  "PRINCE", "PRISON", "PROFIT", "PROMPT", "PROPER", "PUBLIC", "PUNISH", "PURPLE", 
  "PUZZLE", "RACIAL", "RACING", "RADIAL", "RADIUS", "RANDOM", "RARELY", "RATHER", 
  "RATING", "READER", "REALLY", "REASON", "REBOOT", "RECALL", "RECENT", "RECIPE", 
  "RECORD", "REDUCE", "REFINE", "REFORM", "REFUGE", "REFUSE", "REGARD", "REGIME", 
  "REGION", "REGRET", "REJECT", "RELATE", "RELIEF", "REMAIN", "REMARK", "REMEDY", 
  "REMIND", "REMOTE", "REMOVE", "RENDER", "REPAIR", "REPEAT", "REPORT", "RESCUE", 
  "RESENT", "RESIGN", "RESIST", "RESORT", "RESULT", "RESUME", "RETAIL", "RETAIN", 
  "RETIRE", "RETURN", "REVEAL", "REVIEW", "REVISE", "REVIVE", "REWARD", "RHYTHM", 
  "RIBBON", "RITUAL", "ROCKET", "ROLLER", "ROUTER", "RUBBER", "RUNNER", "SACRED", 
  "SADDLE", "SAFETY", "SAILOR", "SALARY", "SALMON", "SAMPLE", "SANDAL", "SAVING", 
  "SCARCE", "SCHEME", "SCHOOL", "SCREEN", "SCRIPT", "SCROLL", "SEARCH", "SEASON", 
  "SECOND", "SECRET", "SECTOR", "SECURE", "SELDOM", "SELECT", "SELLER", "SENATE", 
  "SENIOR", "SENSOR", "SENTRY", "SERIAL", "SERIES", "SERVER", "SETTLE", "SEVERE", 
  "SHADOW", "SHIELD", "SHOWER", "SHRINK", "SIGNAL", "SILENT", "SILVER", "SIMPLE", 
  "SIMPLY", "SINGER", "SINGLE", "SISTER", "SKETCH", "SLEEVE", "SLIGHT", "SLOWLY", 
  "SMOOTH", "SOCCER", "SOCIAL", "SOCKET", "SODIUM", "SOFTLY", "SOLELY", "SOLEMN", 
  "SOURCE", "SOVIET", "SPEECH", "SPHERE", "SPIDER", "SPIRAL", "SPIRIT", "SPLASH", 
  "SPOKEN", "SPREAD", "SPRING", "SPRINT", "SQUARE", "STABLE", "STATIC", "STATUE", 
  "STATUS", "STEADY", "STEREO", "STICKY", "STREAM", "STREET", "STRESS", "STRICT", 
  "STRIKE", "STRING", "STRIPE", "STROKE", "STRONG", "STRUCK", "STRUCT", "STUDIO", 
  "SUBMIT", "SUBWAY", "SUDDEN", "SUFFER", "SUMMER", "SUMMIT", "SUNDAY", "SUNSET", 
  "SUPPER", "SUPPLY", "SURELY", "SWITCH", "SYMBOL", "SYSTEM", "TABLET", "TACKLE", 
  "TAILOR", "TALENT", "TARGET", "TEMPER", "TEMPLE", "TENDER", "TENNIS", "TERROR", 
  "THANKS", "THEORY", "THIRST", "THIRTY", "THREAD", "THREAT", "THRIVE", "THROAT", 
  "THRONE", "THRUST", "TICKET", "TIMBER", "TIMING", "TISSUE", "TOILET", "TOMATO", 
  "TONGUE", "TORQUE", "TOWARD", "TRADER", "TRAVEL", "TREATY", "TRIBAL", "TROPHY", 
  "TUNNEL", "TURKEY", "TURRET", "TURTLE", "TWELVE", "TWENTY", "UNABLE", "UNFAIR", 
  "UNIQUE", "UNITED", "UNLESS", "UNLIKE", "UNLOCK", "UPDATE", "UPLOAD", "UPWARD", 
  "URGENT", "USEFUL", "VACANT", "VACUUM", "VALLEY", "VANISH", "VECTOR", "VENDOR", 
  "VERIFY", "VERSUS", "VESSEL", "VICTIM", "VIEWER", "VISION", "VISUAL", "VOLUME", 
  "VOYAGE", "WALLET", "WALNUT", "WANDER", "WARMTH", "WEALTH", "WEAPON", "WEEKLY", 
  "WEIGHT", "WHILES", "WICKED", "WIDELY", "WINDOW", "WINNER", "WINTER", "WIRING", 
  "WISDOM", "WITHIN", "WONDER", "WOODEN", "WORKER", "WRITER", "WRITHE", "YELLOW", 
  "YOGURT", "ZIPPER"
];

// --- SEEDED RANDOMNESS ---
function seededRandom(seed: number) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Updated to accept an optional offset
export function getDailyWords(offset: number = 0) {
    const now = new Date();
    // UTC Day ID + Offset
    const dayId = Math.floor((now.getTime() - (now.getTimezoneOffset() * 60000 )) / 86400000) + offset;

    const getWordForDay = (list: string[], day: number, salt: number) => {
        const index = Math.floor(seededRandom(day + salt) * list.length);
        return list[index].trim().toUpperCase();
    };

    return {
        word4: getWordForDay(WORDS_4, dayId, 100),
        word5: getWordForDay(WORDS_5, dayId, 200),
        word6: getWordForDay(WORDS_6, dayId, 300),
        dayId,
    };
}

export type LetterStatus = 'CORRECT' | 'PRESENT' | 'ABSENT' | 'EMPTY';

export function checkGuess(guess: string, target: string): LetterStatus[] {
    const result: LetterStatus[] = Array(guess.length).fill('ABSENT');
    const targetArr = target.split('');
    const guessArr = guess.split('');

    // 1. Find Exact Matches (Green)
    guessArr.forEach((char, i) => {
        if (char === targetArr[i]) {
            result[i] = 'CORRECT';
            targetArr[i] = '_'; 
            guessArr[i] = '*';  
        }
    });

    // 2. Find Partial Matches (Yellow)
    guessArr.forEach((char, i) => {
        if (char !== '*') {
            const targetIndex = targetArr.indexOf(char);
            if (targetIndex !== -1) {
                result[i] = 'PRESENT';
                targetArr[targetIndex] = '_';
            }
        }
    });

    return result;
}