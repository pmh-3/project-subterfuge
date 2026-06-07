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
  LOBBY_JOIN_OPERATION: 'JOIN OPERATION',
  LOBBY_START_OPERATION: 'START OPERATION',
  LOBBY_ENTER_CODE_TITLE: 'ENTER CODE',
  LOBBY_OPERATION_CODE_LABEL: 'OPERATION CODE',
  LOBBY_OPERATION_CODE_PLACEHOLDER: 'XXXX',
  LOBBY_CONTINUE: 'CONTINUE',
  LOBBY_WATCH_SPECTATOR: 'WATCH AS SPECTATOR',
  LOBBY_BACK: '← BACK',
  LOBBY_AGENT_DETAILS_TITLE: 'JOIN THE GAME',
  LOBBY_YOUR_NAME_LABEL: 'Enter your name.',
  LOBBY_ICON_LABEL: 'Select an icon.',
  LOBBY_AGENT_KEY_LABEL: 'AGENT KEY',
  LOBBY_AGENT_KEY_PLACEHOLDER: '000',
  LOBBY_IDENTITY_CONFLICT_TITLE: 'IDENTITY CONFLICT',
  LOBBY_VERIFY_IDENTITY: 'VERIFY IDENTITY',
  LOBBY_USE_DIFFERENT_NAME: '← USE A DIFFERENT NAME',
  LOBBY_BRIEFING_TAB: 'BRIEFING',
  LOBBY_CHOOSE_COVER: 'Your identity',

  // --- Lobby alerts ---
  ALERT_INVALID_NAME_TITLE: 'Name Required',
  ALERT_INVALID_NAME_MESSAGE: 'Please enter your name so other players know who you are.',
  ALERT_ESTABLISHING_CONNECTION_TITLE: 'Establishing Connection',
  ALERT_ESTABLISHING_CONNECTION_MESSAGE: 'Please wait a moment and try again.',
  ALERT_OPERATION_FAILED_TITLE: 'Operation Failed',
  ALERT_OPERATION_FAILED_INIT: 'Could not establish operation. Try again.',
  ALERT_INVALID_CODE_TITLE: 'Invalid Code',
  ALERT_INVALID_CODE_MESSAGE: 'Operation Code must be 4 characters',
  ALERT_ACCESS_DENIED_TITLE: 'Access Denied',
  ALERT_ACCESS_DENIED_JOIN: 'Could not join operation',
  ALERT_INVALID_KEY_TITLE: 'Invalid Key',
  ALERT_INVALID_KEY_MESSAGE: 'Agent Key must be 3 digits',
  ALERT_ACCESS_DENIED_INVALID_KEY: 'Invalid Agent Key',
  LOBBY_GAME_NOT_FOUND: 'No game with that code. Check with your host and try again.',
  LOBBY_NAME_REQUIRED: 'Enter your name to continue.',
  LOBBY_CODE_REQUIRED: 'Enter the 4-character code from your host.',
  LOBBY_CONNECTING: 'Connecting… try again in a moment.',
  // identityConflictSubtitle(callsign) used in lobby

  // --- Configure ---
  CONFIGURE_LOADING: 'LOADING TASK LIBRARY...',
  CONFIGURE_HEADER_TITLE: 'MISSION CONTROL',
  CONFIGURE_TASK_PACKS_LABEL: 'TASK PACKS',
  CONFIGURE_TASK_PACKS_HINT: 'Which sets of missions to draw from. Tap a pack to include or exclude it.',
  CONFIGURE_MODE_LABEL: 'GAME MODE',
  CONFIGURE_MODE_ELIMINATION: 'Elimination',
  CONFIGURE_MODE_ELIMINATION_SUB: 'Last player standing wins',
  CONFIGURE_MODE_INFINITE: 'Infinite ∞',
  CONFIGURE_MODE_INFINITE_SUB: 'Score attack. First to reach mission success wins.',
  CONFIGURE_MISSION_SUCCESS_LABEL: 'MISSION SUCCESS',
  CONFIGURE_MISSION_SUCCESS_HINT: 'Number of confirmed eliminations needed to win the operation.',
  CONFIGURE_DIFFICULTY_LABEL: 'MISSION DIFFICULTY',
  CONFIGURE_DIFFICULTY_HINT: 'How hard the assigned missions should be.',
  CONFIGURE_OBJECTIVE_SWAPS_LABEL: 'MISSION SWAPS',
  CONFIGURE_OBJECTIVE_SWAPS_HINT: 'How many times each player can trade their mission for a new random one.',
  CONFIGURE_AUTHORIZE_BUTTON: 'SAVE',
  CONFIGURE_BACK_TO_LOBBY: '← BACK TO LOBBY',
  CONFIGURE_CONNECTION_ERROR_TITLE: 'Connection Error',
  CONFIGURE_CONNECTION_ERROR_MESSAGE: 'Failed to load task packs. Please try again.',
  CONFIGURE_NO_PACKS_TITLE: 'No Task Packs Selected',
  CONFIGURE_NO_PACKS_MESSAGE: 'Select at least one task pack so missions can be assigned.',
  CONFIGURE_SAVE_FAILED_TITLE: 'Save Failed',
  CONFIGURE_SAVE_FAILED_MESSAGE: 'Could not save configuration. Please try again.',

  // --- Game room [id] ---
  GAME_NOT_FOUND: 'Game not found',
  GAME_TRY_DIFFERENT_CODE: 'TRY A DIFFERENT CODE',
  GAME_RETRY_CONNECTION: 'RETRY',
  GAME_CONNECTION_FAILED: 'Connection failed',
  GAME_OPERATION_COMPROMISED: 'OPERATION COMPROMISED',
  GAME_RETURN_TO_BASE: 'RETURN TO BASE',
  GAME_ALERT_TITLE: '⚠ ALERT ⚠',
  GAME_ALERT_COMPROMISED: 'YOU\'VE BEEN COMPROMISED',
  GAME_CONFIRM_ELIMINATION: 'ADMIT DEFEAT',
  GAME_DENY_ELIMINATION: 'DISPUTE: STILL IN PLAY',
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
  GAME_HOLD_TO_START: 'HOLD TO START',
  GAME_HOLD_TO_START_HOLDING: 'KEEP HOLDING…',
  GAME_CUSTOMIZE: 'CUSTOMIZE',
  GAME_CUSTOMIZE_GAME: 'CUSTOMIZE GAME',
  GAME_BEGIN_OPERATION: 'BEGIN OPERATION',
  GAME_STARTING: 'STARTING...',
  GAME_LEAVE: 'LEAVE GAME',
  GAME_PLAY_AGAIN: 'PLAY AGAIN',
  GAME_EXIT: 'EXIT',
  GAME_EXIT_OPERATION: '← EXIT OPERATION',
  GAME_TAB_CONTRACT: 'CONTRACT',
  GAME_TAB_LEADERBOARD: 'LEADERBOARD',
  GAME_TAB_LOBBY: 'LOBBY',
  GAME_TAB_ADMIN: 'ADMIN',
  GAME_TAB_INFO: 'INFO',
  GAME_MODAL_FORCE_ELIMINATION_TITLE: 'FORCE ELIMINATION',
  GAME_MODAL_FORCE_ELIMINATE_BUTTON: 'FORCE ELIMINATE',
  GAME_MODAL_CANCEL: 'CANCEL',
  GAME_LINK_COPIED_MESSAGE: 'Link copied to clipboard.',
  GAME_ALERT_UNKNOWN_ERROR: 'Unknown error',
  GAME_ALERT_FAILED_LOG: 'Failed to log elimination',
  GAME_ALERT_FAILED_CONFIRM: 'Failed to confirm status',
  GAME_ALERT_FAILED_DISPUTE: 'Failed to dispute claim',
  GAME_ALERT_FAILED_REASSIGN: 'Failed to reassign objective',
  GAME_ALERT_FAILED_END: 'Failed to end operation: ',

  // --- Contract view ---
  CONTRACT_HEADER_TITLE: 'CONTRACT',
  CONTRACT_TAB: 'ACTIVE CONTRACT',
  CONTRACT_TOP_SECRET: 'TOP SECRET',
  CONTRACT_TARGET_IDENTITY: 'TARGET',
  CONTRACT_DIRECTIVE: 'DIRECTIVE',
  CONTRACT_SWAP_DIRECTIVE: 'SWAP DIRECTIVE',
  CONTRACT_TARGET_UNKNOWN: 'UNKNOWN',
  CONTRACT_MISSION_OBJECTIVE: 'MISSION OBJECTIVE',
  CONTRACT_PENDING_CONFIRMATION: 'PENDING CONFIRMATION',
  CONTRACT_HOLD_TO_CONFIRM: 'HOLD TO CONFIRM...',
  CONTRACT_HOLD_TO_NEUTRALIZE: 'HOLD TO NEUTRALIZE TARGET',

  // --- Command center / Situation room ---
  INTEL_KILLER_HOST: 'BUREAU ORDER',
  INTEL_KILLER_UNKNOWN: 'UNKNOWN AGENT',
  INTEL_CONFIRMED: 'CONFIRMED',
  INTEL_ELIMINATIONS: 'Eliminations',
  INTEL_ELIMINATION: 'Elimination',
  INTEL_OPERATION_COMPLETE: 'OPERATION COMPLETE',
  INTEL_MISSION_TERMINATED: 'MISSION TERMINATED',
  INTEL_WINNER_SUB: 'LAST AGENT STANDING',
  INTEL_LOSER_SUB: 'WINNER',
  INTEL_HEADER_TITLE: 'LEADERBOARD',
  INTEL_ACTIVE_AGENTS: 'ACTIVE AGENTS',
  INTEL_INACTIVE_AGENTS: 'INACTIVE AGENTS',
  INTEL_LEADERBOARD: 'LEADERBOARD',
  INTEL_OPERATION_CONCLUDED: 'OPERATION CONCLUDED',
  INTEL_INFINITE_WINNER_SUB: 'TOP SCORE',
  INTEL_INFINITE_LOSER_SUB: 'FINAL STANDINGS',
  GAME_JOINED_MID_OPERATION: 'Joined mid-operation. 0 eliminations. Hunt your target.',
  INTEL_TAG_YOU: '[YOU]',
  INTEL_TAG_HOST: '[HOST]',

  // --- Identity header ---
  IDENTITY_LABEL: 'YOUR NAME',
  IDENTITY_UNKNOWN: 'UNKNOWN',
  IDENTITY_OP_CODE: 'OP CODE',

  // --- Task pack cards ---
  PACK_SHOW_EXAMPLES: 'Example missions',
  PACK_HIDE_EXAMPLES: 'Hide examples',

  // --- Agent key reveal ---
  REVEAL_BRAND_TITLE: 'Midnight Wire',
  REVEAL_SCREENSHOT_BLURB:
    "Take a screenshot. You'll need this code to get back into the game.",

  // --- Victory overlay ---
  VICTORY_TITLE: 'MISSION\nSUCCESS',
  VICTORY_SUBTEXT: 'LAST AGENT STANDING',
  VICTORY_INFINITE_TITLE: 'OPERATION\nCONCLUDED',
  VICTORY_INFINITE_SUBTEXT: 'TOP SCORE',
  HOST_MISSION_SUCCESS_LABEL: 'MISSION SUCCESS',

  // --- Host settings ---
  HOST_ADMIN_TITLE: 'ADMIN CONTROL',
  HOST_ACTIVE_AGENTS: 'ACTIVE AGENTS',
  HOST_ELIMINATE: 'ELIMINATE',
  HOST_NO_ACTIVE_AGENTS: 'NO ACTIVE AGENTS FOUND',
  HOST_END_OPERATION: 'END OPERATION',

  // --- Info / briefing ---
  INFO_TITLE: 'INFO',
  INFO_SECTION_HOW_IT_WORKS: 'How it works',
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
  "Each player gets a secret mission and a target: one person in the room you're trying to influence. Your job is to get them to complete your mission without them realizing you set them up.",
  'When a mission succeeds, that player is out. You inherit their target and keep playing. Last person standing wins.',
] as const;

/** Dynamic strings with interpolation */
export const dynamicStrings = {
  operationSubtitle: (gameId: string) => `OP CODE: ${gameId}`,
  identityConflictSubtitle: (name: string) =>
    `"${name}" is already in this game on another device.\nEnter your Agent Key to reclaim that spot.`,
  objectiveSwapsLeft: (n: number) => `${n} swap${n === 1 ? '' : 's'} left`,
  eliminationCount: (n: number) =>
    `${n} ${n === 1 ? strings.INTEL_ELIMINATION : strings.INTEL_ELIMINATIONS}`,
  forceEliminateConfirm: (name: string) =>
    `Remove ${name} from the game? Their target will be reassigned to someone else.`,
  theirObjectiveWas: (task: string) => `THEIR CONTRACT: ${task}`,
  rosterSectionTitle: (title: string, count: number) => `${title} (${count})`,
  killedBy: (killerName: string) => `by ${killerName}`,
  activeAgentsCount: (count: number) => `ACTIVE AGENTS (${count})`,
  agentKeySubtitle: (key: string) => `KEY ${key}`,
  packTasksCount: (n: number) => `${n} mission${n === 1 ? '' : 's'}`,
  operationFailedWithMessage: (message: string) => `Failed to force eliminate: ${message}`,
  endOperationFailed: (message: string) => `Failed to end operation: ${message}`,
} as const;

/** Service error messages (thrown and shown in alerts) */
export const serviceErrors = {
  OPERATION_NOT_FOUND: 'Operation not found',
  IDENTITY_ACTIVE_INVALID_CREDENTIALS: 'That name is already in use. Enter the correct Agent Key or choose a different name.',
  OPERATION_ALREADY_IN_PROGRESS: 'Operation already in progress',
  GAME_NOT_FOUND: 'Game not found',
  NEED_AT_LEAST_2_PLAYERS: 'Need at least 2 players to start',
  TARGET_NOT_FOUND: 'Target not found',
  NO_PENDING_ELIMINATION: 'No pending elimination found',
  ASSASSIN_NOT_FOUND: 'Assassin not found',
  PLAYER_NOT_FOUND: 'Player not found',
  NO_MORE_OBJECTIVE_CHANGES: 'No more objective changes allowed',
  INVALID_RECOVERY_PIN: 'Invalid Recovery PIN or Game ID',
  OPERATION_FULL: 'This operation is at capacity (40 agents max)',
  PLAYER_NOT_ALIVE: 'You are not active in this operation',
  TARGET_NOT_ALIVE: 'That agent is not active',
} as const;

/** useGame error state messages */
export const useGameErrors = {
  OPERATION_NOT_FOUND: 'Operation not found',
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
