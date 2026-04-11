import { getDaggerheartSpotlightTurnIndex, isDaggerheartCharacter, isDaggerheartSystem } from "./systems.js";
import { logger } from "./lib/logger.js";

const SOCKET_NAME = "module.combat-tracker-dock";
const REQUEST_TYPE = "request";
const RESPONSE_TYPE = "response";
const REQUEST_TIMEOUT_MS = 10000;

const pendingRequests = new Map();

export function registerGMActions() {
    logger.debug("registering GM action socket", { socket: SOCKET_NAME });
    game.socket.off(SOCKET_NAME, onSocketMessage);
    game.socket.on(SOCKET_NAME, onSocketMessage);
}

export async function requestGMAction(action, payload = {}) {
    if (game.user.isGM) {
        return executeGMAction(action, payload);
    }

    const activeGM = game.users.activeGM;
    if (!activeGM) {
        throw new Error("An active GM is required for this action.");
    }

    const requestId = foundry.utils.randomID();
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            pendingRequests.delete(requestId);
            reject(new Error("Timed out waiting for the GM to process the request."));
        }, REQUEST_TIMEOUT_MS);

        pendingRequests.set(requestId, { resolve, reject, timeout });
        game.socket.emit(SOCKET_NAME, {
            type: REQUEST_TYPE,
            requestId,
            userId: game.user.id,
            action,
            payload,
        });
    });
}

async function onSocketMessage(message = {}) {
    if (message.type === RESPONSE_TYPE) {
        return handleSocketResponse(message);
    }

    if (message.type !== REQUEST_TYPE) return;
    if (!game.user.isGM) return;
    if (game.users.activeGM?.id !== game.user.id) return;

    try {
        logger.debug("processing GM action request", {
            action: message.action,
            requestId: message.requestId,
            userId: message.userId,
        });
        await executeGMAction(message.action, message.payload ?? {});
        game.socket.emit(SOCKET_NAME, {
            type: RESPONSE_TYPE,
            requestId: message.requestId,
            userId: message.userId,
            result: true,
        });
    } catch (error) {
        logger.error("GM action request failed", {
            action: message.action,
            requestId: message.requestId,
            error,
        });
        game.socket.emit(SOCKET_NAME, {
            type: RESPONSE_TYPE,
            requestId: message.requestId,
            userId: message.userId,
            error: error?.message ?? String(error),
        });
    }
}

function handleSocketResponse(message) {
    if (message.userId !== game.user.id) return;

    const pending = pendingRequests.get(message.requestId);
    if (!pending) return;

    pendingRequests.delete(message.requestId);
    clearTimeout(pending.timeout);

    if (message.error) {
        pending.reject(new Error(message.error));
        return;
    }

    pending.resolve(message.result);
}

async function executeGMAction(action, payload) {
    switch (action) {
        case "toggleSpotlightRequest":
            return toggleSpotlightRequest(payload);
        case "clearSpotlightRequest":
            return clearSpotlightRequest(payload);
        case "clearSpotlight":
            return clearSpotlight(payload);
        case "setActionTokens":
            return setActionTokens(payload);
        default:
            throw new Error(`Unknown GM action: ${action}`);
    }
}

function getCombatant({ combatId, combatantId }) {
    const combat = game.combats.get(combatId);
    if (!combat) {
        throw new Error(`Combat ${combatId} was not found.`);
    }

    const combatant = combat.combatants.get(combatantId);
    if (!combatant) {
        throw new Error(`Combatant ${combatantId} was not found.`);
    }

    return combatant;
}

async function toggleSpotlightRequest({ combatId, combatantId }) {
    const combatant = getCombatant({ combatId, combatantId });
    const requesting = !!combatant.system?.spotlight?.requesting;

    if (requesting) {
        return clearSpotlightRequest({ combatId, combatantId });
    }

    const characters = combatant.combat.combatants.contents.filter((entry) => isDaggerheartCharacter(entry));
    const maxRequestIndex = Math.max(0, ...characters.map((entry) => entry.system?.spotlight?.requestOrderIndex ?? 0));
    return combatant.update({
        "system.spotlight.requesting": true,
        "system.spotlight.requestOrderIndex": maxRequestIndex + 1,
    });
}

async function clearSpotlightRequest({ combatId, combatantId }) {
    const combatant = getCombatant({ combatId, combatantId });
    return combatant.update({
        "system.spotlight.requesting": false,
        "system.spotlight.requestOrderIndex": 0,
    });
}

async function clearSpotlight({ combatId, combatantId }) {
    const combatant = getCombatant({ combatId, combatantId });
    const combat = combatant.combat;
    const currentTurn = getDaggerheartSpotlightTurnIndex(combat, combatantId);

    if (combat.turn !== currentTurn) {
        return clearSpotlightRequest({ combatId, combatantId });
    }

    if (isDaggerheartSystem()) {
        return setDaggerheartCombatantSpotlight(combat, combatant);
    }

    await combat.update({
        turn: null,
        round: (combat.round ?? 0) + 1,
    });

    return clearSpotlightRequest({ combatId, combatantId });
}

async function setActionTokens({ combatId, combatantId, newIndex }) {
    const combatant = getCombatant({ combatId, combatantId });
    return combatant.update({ "system.actionTokens": newIndex });
}

async function setDaggerheartCombatantSpotlight(combat, combatant) {
    const update = {
        system: {
            "spotlight.requesting": false,
            "spotlight.requestOrderIndex": 0,
        },
    };
    const toggleTurn = getDaggerheartSpotlightTurnIndex(combat, combatant.id);

    if (toggleTurn === -1) {
        throw new Error(`Combatant ${combatant.id} could not be resolved in combat ${combat.id}.`);
    }

    if (combat.turn !== toggleTurn) {
        const updateCountdowns = game.system?.api?.applications?.ui?.DhCountdowns?.updateCountdowns;
        if (typeof updateCountdowns === "function") {
            if (combatant.actor?.type === "character") {
                await updateCountdowns(
                    CONFIG.DH.GENERAL.countdownProgressionTypes.spotlight.id,
                    CONFIG.DH.GENERAL.countdownProgressionTypes.characterSpotlight.id
                );
            } else {
                await updateCountdowns(CONFIG.DH.GENERAL.countdownProgressionTypes.spotlight.id);
            }
        }

        const automationSettings = game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.Automation);
        if (automationSettings?.actionPoints) {
            update.system.actionTokens = Math.max((combatant.system?.actionTokens ?? 0) - 1, 0);
        }
    }

    await combat.update({
        turn: combat.turn === toggleTurn ? null : toggleTurn,
        round: (combat.round ?? 0) + 1,
    });
    await combatant.update(update);
}
