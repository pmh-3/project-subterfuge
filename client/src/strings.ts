/**
 * Centralized user-facing strings for Midnight Wire.
 * Single source of truth for branding, UI copy, and error messages.
 */

export const strings = {
  // --- Branding ---
  APP_NAME: 'MIDNIGHT WIRE',

  // --- Home ---
  HOME_TITLE: 'Midnight\nWire',
  HOME_TAGLINE: 'A game of social deception: receive a mission, deceive a target.',
  HOME_TAGLINE_ROTATE_1: "Don't get caught.",
  HOME_TAGLINE_ROTATE_2: 'Last one standing wins.',
  HOME_TAGLINE_ROTATE_3: 'How smooth are you?',
  HOME_TAGLINE_ROTATE_4: "Everyone's a target.",
  HOME_TAGLINE_ROTATE_5: 'Keep your eyes open.',
  HOME_HELP_LABEL: 'How to play',

  // --- Welcome / index (legacy auth states) ---
  WELCOME_STATUS_LOADING: 'SCANNING NETWORK...',
  WELCOME_STATUS_AUTHENTICATED: 'IDENTITY VERIFIED',
  WELCOME_STATUS_INIT: 'INITIALIZING...',

  // --- Error boundary / layout ---
  ERROR_BOUNDARY_TITLE: 'SYSTEM MALFUNCTION',
  ERROR_BOUNDARY_MESSAGE: 'SIGNAL LOST. Tap RETRY to re-establish connection.',
  ERROR_BOUNDARY_RETRY: 'RETRY',

  // --- Lobby ---
  LOBBY_JOIN_OPERATION: 'JOIN GAME',
  LOBBY_START_OPERATION: 'START GAME',
  LOBBY_ENTER_CODE_TITLE: 'ENTER CODE',
  LOBBY_OPERATION_CODE_LABEL: 'GAME CODE',
  LOBBY_GAME_CODE_PLACEHOLDER: 'XXXX',
  LOBBY_CONTINUE: 'CONTINUE',
  LOBBY_WATCH_SPECTATOR: 'WATCH AS SPECTATOR',
  LOBBY_BACK: '← BACK',
  LOBBY_AGENT_DETAILS_TITLE: 'JOIN THE GAME',
  LOBBY_YOUR_NAME_LABEL: 'Enter your callsign.',
  LOBBY_ICON_LABEL: 'Select an icon.',
  LOBBY_AGENT_KEY_LABEL: 'AGENT KEY',
  LOBBY_AGENT_KEY_PLACEHOLDER: '000',
  LOBBY_IDENTITY_CONFLICT_TITLE: 'CALLSIGN TAKEN',
  LOBBY_VERIFY_IDENTITY: 'RECLAIM CALLSIGN',
  LOBBY_USE_DIFFERENT_NAME: '← USE A DIFFERENT CALLSIGN',
  LOBBY_BRIEFING_TAB: 'HOW TO PLAY',
  LOBBY_CHOOSE_COVER: 'Your callsign',

  // --- Lobby alerts ---
  ALERT_INVALID_NAME_TITLE: 'Callsign Required',
  ALERT_INVALID_NAME_MESSAGE: 'Please enter your callsign so other agents know who you are.',
  ALERT_ESTABLISHING_CONNECTION_TITLE: 'Establishing Connection',
  ALERT_ESTABLISHING_CONNECTION_MESSAGE: 'Please wait a moment and try again.',
  ALERT_OPERATION_FAILED_TITLE: 'Something Went Wrong',
  ALERT_OPERATION_FAILED_INIT: 'Could not create the game. Try again.',
  ALERT_INVALID_CODE_TITLE: 'Invalid Code',
  ALERT_INVALID_CODE_MESSAGE: 'Game Code must be 4 characters',
  ALERT_ACCESS_DENIED_TITLE: 'Access Denied',
  ALERT_ACCESS_DENIED_JOIN: 'Could not join game',
  ALERT_INVALID_KEY_TITLE: 'Invalid Key',
  ALERT_INVALID_KEY_MESSAGE: 'Agent Key must be 3 digits',
  ALERT_ACCESS_DENIED_INVALID_KEY: 'Invalid Agent Key',
  LOBBY_GAME_NOT_FOUND: 'No game with that code. Check with your host and try again.',
  LOBBY_NAME_REQUIRED: 'Enter your callsign to continue.',
  LOBBY_CODE_REQUIRED: 'Enter the 4-character code from your host.',
  LOBBY_CONNECTING: 'Connecting… try again in a moment.',
  // identityConflictSubtitle(callsign) used in lobby

  // --- Configure ---
  CONFIGURE_LOADING: 'LOADING MISSIONS...',
  CONFIGURE_HEADER_TITLE: 'GAME SETTINGS',
  CONFIGURE_TASK_PACKS_LABEL: 'MISSION PACKS',
  CONFIGURE_TASK_PACKS_HINT: 'Which sets of missions to draw from. Tap a pack to include or exclude it.',
  CONFIGURE_MODE_LABEL: 'GAME MODE',
  CONFIGURE_MODE_ELIMINATION: 'Classic',
  CONFIGURE_MODE_ELIMINATION_SUB: 'Last agent standing wins',
  CONFIGURE_MODE_INFINITE: 'Infinite ∞',
  CONFIGURE_MODE_INFINITE_SUB: 'First to reach the score to win.',
  CONFIGURE_MISSION_SUCCESS_LABEL: 'SCORE TO WIN',
  CONFIGURE_MISSION_SUCCESS_HINT: 'Number of confirmed eliminations needed to win the game.',
  CONFIGURE_DIFFICULTY_LABEL: 'MISSION DIFFICULTY',
  CONFIGURE_DIFFICULTY_HINT: 'How hard the assigned missions should be.',
  CONFIGURE_OBJECTIVE_SWAPS_LABEL: 'MISSION SWAPS',
  CONFIGURE_OBJECTIVE_SWAPS_HINT:
    'How many times each agent can swap their mission over the whole game. A fixed budget, not per target.',
  CONFIGURE_AUTHORIZE_BUTTON: 'SAVE',
  CONFIGURE_BACK_TO_LOBBY: '← BACK TO LOBBY',
  CONFIGURE_CONNECTION_ERROR_TITLE: 'Connection Error',
  CONFIGURE_CONNECTION_ERROR_MESSAGE: 'Failed to load task packs. Please try again.',
  CONFIGURE_NO_PACKS_TITLE: 'No Mission Packs Selected',
  CONFIGURE_NO_PACKS_MESSAGE: 'Select at least one mission pack so missions can be assigned.',
  CONFIGURE_SAVE_FAILED_TITLE: 'Save Failed',
  CONFIGURE_SAVE_FAILED_MESSAGE: 'Could not save configuration. Please try again.',

  // --- Game room [id] ---
  GAME_NOT_FOUND: 'Game not found',
  GAME_TRY_DIFFERENT_CODE: 'TRY A DIFFERENT CODE',
  GAME_RETRY_CONNECTION: 'RETRY',
  GAME_CONNECTION_FAILED: 'Connection failed',
  GAME_OPERATION_COMPROMISED: 'CONNECTION LOST',
  GAME_RETURN_TO_BASE: 'RETURN TO BASE',
  GAME_ALERT_TITLE: '⚠ ALERT ⚠',
  GAME_ALERT_COMPROMISED: "YOU'VE BEEN CAUGHT",
  GAME_CONFIRM_ELIMINATION: 'CONFIRM: I WAS CAUGHT',
  GAME_DENY_ELIMINATION: 'NO, STILL IN PLAY',
  GAME_SPECTATOR_MODE: 'SPECTATOR MODE',
  GAME_SPECTATOR_HOST: 'HOST CONTROLS AVAILABLE',
  GAME_SPECTATOR_READONLY: 'OBSERVATION ONLY',
  GAME_WAITING_FOR_HOST: 'WAITING FOR HOST...',
  GAME_SHARE_LINK: 'SHARE LINK',
  GAME_INVITE_AGENTS: 'INVITE AGENTS',
  GAME_INVITE_SHEET_TITLE: 'Invite Agents',
  GAME_INVITE_COPY_LINK: 'COPY LINK',
  GAME_INVITE_COPY_CODE: 'COPY CODE',
  GAME_INVITE_SHARE: 'SHARE',
  GAME_LOBBY_TITLE: 'GAME LOBBY',
  GAME_CODE_LABEL: 'GAME CODE',
  GAME_CODE_COPIED: 'Game code copied.',
  GAME_LOBBY_NEED_PLAYERS: 'Need at least 2 agents to begin.',
  GAME_CUSTOMIZE: 'SETTINGS',
  GAME_CUSTOMIZE_GAME: 'GAME SETTINGS',
  GAME_BEGIN_OPERATION: 'START GAME',
  GAME_STARTING: 'STARTING...',
  GAME_LEAVE: 'LEAVE GAME',
  GAME_PLAY_AGAIN: 'PLAY AGAIN',
  GAME_EXIT: 'EXIT',
  GAME_EXIT_OPERATION: '← EXIT GAME',
  GAME_TAB_CONTRACT: 'MISSION',
  GAME_TAB_LEADERBOARD: 'LEADERBOARD',
  GAME_TAB_LOBBY: 'LOBBY',
  GAME_TAB_ADMIN: 'HOST',
  GAME_TAB_INFO: 'HOW TO PLAY',
  GAME_MODAL_FORCE_ELIMINATION_TITLE: 'FORCE ELIMINATION',
  GAME_MODAL_FORCE_ELIMINATE_BUTTON: 'FORCE ELIMINATE',
  GAME_MODAL_CANCEL: 'CANCEL',
  GAME_LINK_COPIED_MESSAGE: 'Link copied to clipboard.',
  GAME_ALERT_UNKNOWN_ERROR: 'Unknown error',
  GAME_ALERT_FAILED_LOG: 'Failed to log elimination',
  GAME_ALERT_FAILED_CONFIRM: 'Failed to confirm status',
  GAME_ALERT_FAILED_DISPUTE: 'Failed to dispute claim',
  GAME_ALERT_FAILED_REASSIGN: 'Failed to swap mission',
  GAME_ALERT_FAILED_SWAP_TARGET: 'Failed to swap target',
  GAME_ALERT_FAILED_END: 'Failed to end game: ',

  // --- Contract view ---
  CONTRACT_HEADER_TITLE: 'MISSION',
  CONTRACT_TAB: 'ACTIVE MISSION',
  CONTRACT_TOP_SECRET: 'TOP SECRET',
  CONTRACT_TARGET_IDENTITY: 'TARGET',
  CONTRACT_DIRECTIVE: 'MISSION',
  CONTRACT_SWAP_MISSION: 'SWAP MISSION',
  CONTRACT_SWAP_TARGET: 'SWAP TARGET',
  CONTRACT_TARGET_UNKNOWN: 'UNKNOWN',
  CONTRACT_MISSION_OBJECTIVE: 'MISSION',
  CONTRACT_PENDING_CONFIRMATION: 'PENDING CONFIRMATION',
  CONTRACT_NEUTRALIZE_TARGET: 'CATCH TARGET',
  CONTRACT_NEUTRALIZE_HINT: 'Tap once your mission on them succeeds.',
  CONTRACT_SWAP_HINT: 'Trade this mission or target for a new one. Swaps are limited.',
  CONTRACT_SWAP_TARGET_NEEDS_AGENTS: 'Need 3+ agents to swap target.',
  NO_MORE_SWAPS: 'No swaps left this game.',

  // --- First-run coach card (D9, #9) ---
  COACH_CONTRACT_TITLE: 'HOW THIS WORKS',
  COACH_CONTRACT_BODY:
    "You have a secret target and a mission for them to complete. Get them to do it, then tap CATCH TARGET to confirm the catch. Score points until someone hits the score to win, or, in Classic mode, until you're the last agent standing.",
  COACH_DISMISS: 'GOT IT',

  // --- Command center / Situation room ---
  INTEL_KILLER_HOST: 'HOST',
  INTEL_KILLER_UNKNOWN: 'UNKNOWN AGENT',
  INTEL_CONFIRMED: 'CONFIRMED',
  INTEL_ELIMINATIONS_MADE: 'Eliminations made',
  INTEL_TIMES_ELIMINATED: 'Times eliminated',
  INTEL_OPERATION_COMPLETE: 'GAME OVER',
  INTEL_MISSION_TERMINATED: 'GAME OVER',
  INTEL_WINNER_SUB: 'LAST AGENT STANDING',
  INTEL_LOSER_SUB: 'WINNER',
  INTEL_HEADER_TITLE: 'LEADERBOARD',
  INTEL_ACTIVE_AGENTS: 'ACTIVE AGENTS',
  INTEL_INACTIVE_AGENTS: 'INACTIVE AGENTS',
  INTEL_LEADERBOARD: 'LEADERBOARD',
  INTEL_OPERATION_CONCLUDED: 'GAME OVER',
  INTEL_INFINITE_WINNER_SUB: 'TOP SCORE',
  INTEL_INFINITE_LOSER_SUB: 'FINAL STANDINGS',
  GAME_JOINED_MID_OPERATION: 'Joined mid-game. 0 eliminations. Hunt your target.',
  INTEL_TAG_YOU: '[YOU]',
  INTEL_TAG_HOST: '[HOST]',
  TARGET_LEFT_REASSIGNED: 'Your target left the game. New target assigned.',

  // --- Identity header ---
  IDENTITY_LABEL: 'YOUR CALLSIGN',
  IDENTITY_UNKNOWN: 'UNKNOWN',
  IDENTITY_OP_CODE: 'GAME CODE',

  // --- Task pack cards ---
  PACK_SHOW_EXAMPLES: 'Example missions',
  PACK_HIDE_EXAMPLES: 'Hide examples',

  // --- Agent key reveal ---
  REVEAL_BRAND_TITLE: 'Midnight Wire',
  REVEAL_SCREENSHOT_BLURB:
    "Take a screenshot. You'll need this code to get back into the game.",

  // --- Victory overlay ---
  VICTORY_TITLE: 'VICTORY',
  VICTORY_SUBTEXT: 'LAST AGENT STANDING',
  VICTORY_INFINITE_TITLE: 'VICTORY',
  VICTORY_INFINITE_SUBTEXT: 'TOP SCORE',
  HOST_MISSION_SUCCESS_LABEL: 'SCORE TO WIN',

  // --- Host settings ---
  HOST_ADMIN_TITLE: 'HOST CONTROLS',
  HOST_ACTIVE_AGENTS: 'ACTIVE AGENTS',
  HOST_ELIMINATE: 'ELIMINATE',
  HOST_NO_ACTIVE_AGENTS: 'NO ACTIVE AGENTS FOUND',
  HOST_END_OPERATION: 'END GAME',

  // --- Host settings: mid-game editable settings (D6) ---
  HOST_MISSION_SETTINGS_SECTION: 'MISSION SETTINGS',
  HOST_SWAPS_BUDGET_LABEL: 'MISSION SWAPS',
  HOST_DIFFICULTY_LABEL: 'MISSION DIFFICULTY',
  HOST_TASK_PACKS_LABEL: 'MISSION PACKS',
  HOST_FUTURE_MISSIONS_ONLY_HINT:
    'Applies to future missions only. Current assignments are unchanged.',
  HOST_KILL_GOAL_LOCKED_HINT: 'Locked once the game starts.',

  // --- Host settings: Pending Confirmations panel (D7) ---
  HOST_PENDING_CONFIRMATIONS_LABEL: 'PENDING CONFIRMATIONS',
  HOST_PENDING_CONFIRM_BUTTON: 'CONFIRM',
  HOST_PENDING_DENY_BUTTON: 'DENY',

  // --- Host settings: roster chips ---
  HOST_CHIP_TARGET_PREFIX: 'TARGET:',
  HOST_CHIP_PENDING_PREFIX: 'PENDING:',

  // --- Info / briefing ---
  INFO_TITLE: 'HOW TO PLAY',
  INFO_SECTION_HOW_IT_WORKS: 'How to play',
  BRIEFING_CLOSE: 'Close',

  // --- Shared components ---
  AVATAR_TAP_TO_CHANGE: 'TAP TO CHANGE',
  AGENT_KEY_BADGE_LABEL: 'KEY:',
  AGENT_KEY_BADGE_MASKED: '***',
  ALERT_OK: 'OK',

  // --- Error boundary (default fallback) ---
  ERROR_UNEXPECTED: 'Unrecoverable signal error.',
} as const;

/** Briefing modal body copy (paragraphs) */
export const briefingParagraphs = [
  'Midnight Wire is a party game of social deception.',
  "Every agent has a secret target and a mission: get that one person to do something without them realizing you set them up.",
  "Pull it off and you catch them, scoring a point. Getting caught is not the end. Caught agents keep playing, back in the game with a fresh start.",
  'After a catch you get a brand-new target and a brand-new mission. Nothing is inherited, so keep your eyes open: the person hunting you may have just changed.',
  'First agent to reach the score to win takes the game. Your host can also run Classic mode instead, where getting caught knocks you out and the last agent standing wins.',
] as const;

/** Dynamic strings with interpolation */
export const dynamicStrings = {
  operationSubtitle: (gameId: string) => `GAME CODE: ${gameId}`,
  identityConflictSubtitle: (name: string) =>
    `"${name}" is already in this game on another device.\nEnter your Agent Key to reclaim that spot.`,
  swapsLeftThisGame: (n: number) => `${n} swap${n === 1 ? '' : 's'} left`,
  forceEliminateConfirm: (name: string) =>
    `Remove ${name} from the game? Their target will be reassigned to someone else.`,
  theirObjectiveWas: (task: string) => `THEIR MISSION: ${task}`,
  // Shown when several assassins have stacked claims against the same victim (D5).
  multiClaimVictim: (n: number) => `${n} agents are claiming you. Confirm each.`,
  rosterSectionTitle: (title: string, count: number) => `${title} (${count})`,
  killedBy: (killerName: string) => `by ${killerName}`,
  activeAgentsCount: (count: number) => `ACTIVE AGENTS (${count})`,
  agentKeySubtitle: (key: string) => `KEY ${key}`,
  packTasksCount: (n: number) => `${n} mission${n === 1 ? '' : 's'}`,
  operationFailedWithMessage: (message: string) => `Failed to force eliminate: ${message}`,
  endOperationFailed: (message: string) => `Failed to end game: ${message}`,
  // Pending Confirmations panel row (D7): "assassin → target : mission"
  pendingRowSummary: (assassinCallsign: string, targetCallsign: string) =>
    `${assassinCallsign} → ${targetCallsign}`,
} as const;

/** Service error messages (thrown and shown in alerts) */
export const serviceErrors = {
  OPERATION_NOT_FOUND: 'Game not found',
  IDENTITY_ACTIVE_INVALID_CREDENTIALS: 'That callsign is already in use. Enter the correct Agent Key or choose a different callsign.',
  OPERATION_ALREADY_IN_PROGRESS: 'Game already in progress',
  GAME_NOT_FOUND: 'Game not found',
  NEED_AT_LEAST_2_PLAYERS: 'Need at least 2 agents to start',
  TARGET_NOT_FOUND: 'Target not found',
  NO_PENDING_ELIMINATION: 'No pending elimination found',
  ASSASSIN_NOT_FOUND: 'Agent not found',
  PLAYER_NOT_FOUND: 'Agent not found',
  NO_MORE_SWAPS: 'No swaps left.',
  TARGET_SWAP_CLASSIC_ONLY: 'Target swaps are only available in infinite mode',
  NO_ELIGIBLE_SWAP_TARGET: 'No other agent available to swap to.',
  INVALID_RECOVERY_PIN: 'Invalid Agent Key or Game Code',
  OPERATION_FULL: 'This game is full (40 agents max)',
  PLAYER_NOT_ALIVE: 'You are not active in this game',
  TARGET_NOT_ALIVE: 'That agent is not active',
} as const;

/** useGame error state messages */
export const useGameErrors = {
  OPERATION_NOT_FOUND: 'Game not found',
  CONNECTION_FAILED: 'Connection failed',
} as const;

/** Task pack metadata (taskService fallbacks and pack descriptions) */
export const taskPackStrings = {
  basic_training_description: 'Essential tradecraft for new agents. Standard difficulty.',
  party_description: 'Social engineering in a crowded environment. Blend in.',
  ice_breaker_description: 'Establish rapport with potential assets. Conversation starters.',
  far_away_description: 'Remote operations. Digital surveillance and communication.',
  fallback_description: 'Classified',
  fallback_difficulty: 'Operative',
} as const;
