/**
 * Centralized user-facing strings for Midnight Wire.
 * Single source of truth for branding, UI copy, and error messages.
 */

export const strings = {
  // --- Branding ---
  APP_NAME: 'MIDNIGHT WIRE',
  PROTOCOL_NAME: 'PROTOCOL: MIDNIGHT WIRE',

  // --- Welcome / index ---
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
  LOBBY_ENTER_CODE_SUBTITLE: 'The host has this code',
  LOBBY_OPERATION_CODE_LABEL: 'OPERATION CODE',
  LOBBY_OPERATION_CODE_PLACEHOLDER: 'XXXX',
  LOBBY_CONTINUE: 'CONTINUE',
  LOBBY_WATCH_SPECTATOR: 'WATCH AS SPECTATOR',
  LOBBY_BACK: '← BACK',
  LOBBY_AGENT_DETAILS_TITLE: 'AGENT DETAILS',
  LOBBY_AGENT_DETAILS_SUBTITLE: 'Choose your cover.',
  LOBBY_CALLSIGN_LABEL: 'CALLSIGN',
  LOBBY_CALLSIGN_PLACEHOLDER: 'Agent X',
  LOBBY_AGENT_KEY_LABEL: 'AGENT KEY',
  LOBBY_AGENT_KEY_PLACEHOLDER: '000',
  LOBBY_IDENTITY_CONFLICT_TITLE: 'IDENTITY CONFLICT',
  LOBBY_VERIFY_IDENTITY: 'VERIFY IDENTITY',
  LOBBY_USE_DIFFERENT_CALLSIGN: '← USE DIFFERENT CALLSIGN',
  LOBBY_BRIEFING_TAB: 'BRIEFING',

  // --- Lobby alerts ---
  ALERT_INVALID_CALLSIGN_TITLE: 'Invalid Callsign',
  ALERT_INVALID_CALLSIGN_MESSAGE: 'Please enter a callsign.',
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

  // --- Identity conflict (dynamic) ---
  // identityConflictSubtitle(callsign) used in lobby

  // --- Configure ---
  CONFIGURE_LOADING: 'LOADING TASK LIBRARY...',
  CONFIGURE_HEADER_TITLE: 'MISSION CONTROL',
  CONFIGURE_DIFFICULTY_LABEL: 'DIFFICULTY',
  CONFIGURE_REROLLS_LABEL: 'OBJECTIVE REROLLS',
  CONFIGURE_AUTHORIZE_BUTTON: 'LAUNCH OPERATION',
  CONFIGURE_CANCEL_OPERATION: '← CANCEL OPERATION',
  CONFIGURE_CONNECTION_ERROR_TITLE: 'Connection Error',
  CONFIGURE_CONNECTION_ERROR_MESSAGE: 'Failed to load task packs. Please try again.',
  CONFIGURE_NO_PACKS_TITLE: 'No Packs Selected',
  CONFIGURE_NO_PACKS_MESSAGE: 'Please select at least one task pack.',
  CONFIGURE_SAVE_FAILED_TITLE: 'Save Failed',
  CONFIGURE_SAVE_FAILED_MESSAGE: 'Could not save configuration. Please try again.',

  // --- Game room [id] ---
  GAME_LOADING_SEAL: 'B',
  GAME_LOADING_TEXT: 'ESTABLISHING UPLINK...',
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
  GAME_INVITE_AGENTS: 'INVITE AGENTS',
  GAME_HOLD_INITIATING: 'INITIATING...',
  GAME_HOLD_HOLDING: 'HOLD...',
  GAME_BEGIN_OPERATION: 'BEGIN OPERATION',
  GAME_PRESS_HOLD_START: 'PRESS AND HOLD TO DEPLOY',
  GAME_PLAY_AGAIN: 'PLAY AGAIN',
  GAME_EXIT: 'EXIT',
  GAME_EXIT_OPERATION: '← EXIT OPERATION',
  GAME_TAB_CONTRACT: 'CONTRACT',
  GAME_TAB_SITUATION_ROOM: 'SITUATION ROOM',
  GAME_TAB_ADMIN: 'ADMIN',
  GAME_TAB_BRIEFING: 'BRIEFING',
  GAME_MODAL_FORCE_ELIMINATION_TITLE: 'FORCE ELIMINATION',
  GAME_MODAL_FORCE_ELIMINATE_BUTTON: 'FORCE ELIMINATE',
  GAME_MODAL_CANCEL: 'CANCEL',
  GAME_LINK_COPIED_TITLE: 'Link Copied',
  GAME_LINK_COPIED_MESSAGE: 'Mission link copied to clipboard.',
  GAME_ALERT_UNKNOWN_ERROR: 'Unknown error',
  GAME_ALERT_FAILED_LOG: 'Failed to log elimination',
  GAME_ALERT_FAILED_CONFIRM: 'Failed to confirm status',
  GAME_ALERT_FAILED_DISPUTE: 'Failed to dispute claim',
  GAME_ALERT_FAILED_REASSIGN: 'Failed to reassign objective',
  GAME_ALERT_FAILED_END: 'Failed to end operation: ',

  // --- Contract view ---
  CONTRACT_TAB: 'CONTRACT',
  CONTRACT_TOP_SECRET: 'TOP SECRET',
  CONTRACT_TARGET_IDENTITY: 'TARGET IDENTITY',
  CONTRACT_TARGET_UNKNOWN: 'UNKNOWN',
  CONTRACT_MISSION_OBJECTIVE: 'MISSION OBJECTIVE',
  CONTRACT_PENDING_CONFIRMATION: 'PENDING CONFIRMATION',
  CONTRACT_HOLD_TO_CONFIRM: 'HOLD TO CONFIRM...',
  CONTRACT_NEUTRALIZE_TARGET: 'NEUTRALIZE TARGET',
  CONTRACT_PRESS_AND_HOLD: 'HOLD TO CONFIRM NEUTRALIZATION',

  // --- Command center / Situation room ---
  INTEL_KILLER_HOST: 'BUREAU ORDER',
  INTEL_KILLER_UNKNOWN: 'UNKNOWN AGENT',
  INTEL_CONFIRMED: 'CONFIRMED',
  INTEL_OPERATION_COMPLETE: 'OPERATION COMPLETE',
  INTEL_MISSION_TERMINATED: 'MISSION TERMINATED',
  INTEL_WINNER_SUB: 'LAST AGENT STANDING',
  INTEL_LOSER_SUB: 'WINNER',
  INTEL_HEADER_TITLE: 'SITUATION ROOM',
  INTEL_ACTIVE_AGENTS: 'ACTIVE AGENTS',
  INTEL_INACTIVE_AGENTS: 'INACTIVE AGENTS',
  INTEL_TAG_YOU: '[YOU]',
  INTEL_TAG_HOST: '[HOST]',

  // --- Identity header ---
  IDENTITY_LABEL: 'IDENTITY',
  IDENTITY_UNKNOWN: 'UNKNOWN',
  IDENTITY_OP_CODE: 'OP CODE',

  // --- Pack selector ---
  PACK_SELECT_THEME: 'SELECT OPERATION THEME',
  PACK_HINT: 'Tap to select • Hold to preview',
  PACK_SAMPLE_TASKS: 'SAMPLE TASKS',
  PACK_TAP_TO_CLOSE: 'Tap anywhere to close',

  // --- Agent key reveal ---
  REVEAL_CREDENTIALS_ASSIGNED: 'CREDENTIALS ASSIGNED',
  REVEAL_IDENTITY_VERIFIED: 'IDENTITY VERIFIED',
  REVEAL_AGENT_KEY_LABEL: 'AGENT KEY',
  REVEAL_RECOVERY_BLURB: "This is your recovery key. You'll need it if you get disconnected.",
  REVEAL_PROCEED: 'PROCEED TO OPERATION →',

  // --- Victory overlay ---
  VICTORY_TITLE: 'MISSION\nSUCCESS',
  VICTORY_SUBTEXT: 'LAST AGENT STANDING',

  // --- Host settings ---
  HOST_OVERRIDE_TITLE: 'HOST OVERRIDE',
  HOST_OVERRIDE_SUBTITLE: 'ADMINISTRATIVE CONTROL',
  HOST_ACTIVE_AGENTS: 'ACTIVE AGENTS',
  HOST_ELIMINATE: 'ELIMINATE',
  HOST_NO_ACTIVE_AGENTS: 'NO ACTIVE AGENTS FOUND',
  HOST_TERMINATE_OPERATION: 'TERMINATE OPERATION',
  HOST_END_GAME_HINT: 'Victor: most confirmed neutralizations.\nTied or zero? No victor declared.',
  HOST_END_OPERATION: 'END OPERATION',

  // --- Briefing modal ---
  BRIEFING_TAB: 'CLASSIFIED',
  BRIEFING_CLOSE: 'X',
  BRIEFING_TITLE: 'MISSION BRIEFING',
  BRIEFING_STEP_1: 'You get a target and a mission.',
  BRIEFING_STEP_2: 'Get your target to complete the mission without them knowing.',
  BRIEFING_STEP_3: 'Confirm the elimination.',
  BRIEFING_STEP_4: 'Inherit their contract.',
  BRIEFING_STEP_5: 'Last agent standing wins.',
  BRIEFING_ACKNOWLEDGE: 'ACKNOWLEDGE',

  // --- Shared components ---
  AVATAR_TAP_TO_CHANGE: 'TAP TO CHANGE',
  AGENT_KEY_BADGE_LABEL: 'KEY:',
  AGENT_KEY_BADGE_MASKED: '***',
  ALERT_OK: 'OK',

  // --- Error boundary (default fallback) ---
  ERROR_UNEXPECTED: 'Unrecoverable signal error.',
} as const;

/** Dynamic strings with interpolation */
export const dynamicStrings = {
  operationSubtitle: (gameId: string) => `OP CODE: ${gameId}`,
  identityConflictSubtitle: (callsign: string) =>
    `"${callsign}" is already active in this operation.\nEnter your Agent Key to reclaim this identity.`,
  rerollsLeft: (n: number) => `CHANGE OBJECTIVE — ${n} LEFT`,
  forceEliminateConfirm: (callsign: string) =>
    `Force remove agent ${callsign}? Their target will be re-assigned.`,
  theirObjectiveWas: (task: string) => `THEIR CONTRACT: ${task}`,
  rosterSectionTitle: (title: string, count: number) => `${title} (${count})`,
  killedBy: (killerName: string) => `by ${killerName}`,
  activeAgentsCount: (count: number) => `ACTIVE AGENTS (${count})`,
  packTasksCount: (n: number) => `${n} tasks`,
  operationFailedWithMessage: (message: string) => `Failed to force eliminate: ${message}`,
  endOperationFailed: (message: string) => `Failed to end operation: ${message}`,
} as const;

/** Service error messages (thrown and shown in alerts) */
export const serviceErrors = {
  OPERATION_NOT_FOUND: 'Operation not found',
  IDENTITY_ACTIVE_INVALID_CREDENTIALS: 'That callsign is taken. Enter the correct Agent Key or choose a different name.',
  OPERATION_ALREADY_IN_PROGRESS: 'Operation already in progress',
  GAME_NOT_FOUND: 'Game not found',
  NEED_AT_LEAST_2_PLAYERS: 'Need at least 2 players to start',
  TARGET_NOT_FOUND: 'Target not found',
  NO_PENDING_ELIMINATION: 'No pending elimination found',
  ASSASSIN_NOT_FOUND: 'Assassin not found',
  PLAYER_NOT_FOUND: 'Player not found',
  NO_MORE_OBJECTIVE_CHANGES: 'No more objective changes allowed',
  INVALID_RECOVERY_PIN: 'Invalid Recovery PIN or Game ID',
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
