import { initConfig } from './config.js';
import {registerSettings} from './settings.js';
import {CombatDock} from './app/CombatDock.js';
import {CombatantPortrait} from './app/CombatantPortrait.js';
import {defaultAttributesConfig, generateDescription} from './systems.js';
import { registerGMActions } from './gm-actions.js';
import { logger } from './lib/logger.js';

export const MODULE_ID = 'combat-tracker-dock';

export function getModulePath() {
    return game.modules.get(MODULE_ID)?.path ?? `/modules/${MODULE_ID}`;
}

export function getCurrentCombat(){
    return ui.combat.viewed;
}

Hooks.once('init', function () {
    logger.info("init start", { system: game.system.id, module: MODULE_ID });
    registerWrappers();
    registerHotkeys();
    CONFIG.combatTrackerDock = {
        CombatDock,
        CombatantPortrait,
        defaultAttributesConfig,
        generateDescription,
        INTRO_ANIMATION_DURATION: 1000,
        INTRO_ANIMATION_DELAY: 0.25,
    }

    Hooks.callAll(`${MODULE_ID}-init`, CONFIG.combatTrackerDock);
    logger.info("init complete");
});

Hooks.on('ready', () => {
    logger.info("ready start");
    registerGMActions();
    registerSettings();
    initConfig();
    const currentCombat = getCurrentCombat();
    if(currentCombat && !ui.combatDock && game.settings.get("core", "noCanvas")) {
        logger.debug("opening dock in noCanvas mode", { combatId: currentCombat.id });
        new CONFIG.combatTrackerDock.CombatDock(currentCombat).render(true);
    }
    logger.info("ready complete", { combatId: currentCombat?.id ?? null });
});

Hooks.on('createCombat', (combat) => {
    if (game.combat === combat) {
        logger.info("createCombat matched active combat", { combatId: combat.id });
        new CONFIG.combatTrackerDock.CombatDock(combat).render(true);
    }
});

Hooks.on('updateCombat', (combat, updates) => {
    logger.debug("updateCombat", { combatId: combat.id, keys: Object.keys(updates ?? {}) });
    if(updates.active || updates.scene === null) {
        logger.debug("re-rendering dock after combat update", { combatId: combat.id });
        new CONFIG.combatTrackerDock.CombatDock(combat).render(true);
    }
    if(updates.scene && combat.scene !== game.scenes.viewed && ui.combatDock?.combat === combat) {
        logger.info("closing dock after scene change", { combatId: combat.id });
        ui.combatDock.close();
    }
});

Hooks.on('canvasReady', () => {
    logger.debug("canvasReady");
    Hooks.once("renderCombatTracker", (tab) => {
        const currentCombat = getCurrentCombat();
            if(currentCombat) {
                logger.debug("renderCombatTracker after canvasReady", { combatId: currentCombat.id });
                new CONFIG.combatTrackerDock.CombatDock(currentCombat).render(true);
            } else {
                logger.debug("renderCombatTracker found no active combat");
                ui.combatDock?.close();
            }
    })
});


function registerWrappers() {
    if (!game.modules.get("lib-wrapper")?.active) return;

    logger.debug("registering libWrapper visibility override");
    libWrapper.register(MODULE_ID, "Combatant.prototype.visible", function (wrapped, ...args) {
        const visible = wrapped(...args);
        if (!ui.combatDock?.rendered) return visible;
        const cDVisible = ui.combatDock.portraits.find((p) => p.combatant == this)?.firstTurnHidden;
        return visible && !cDVisible;
    });
}

function registerHotkeys() {
    logger.debug("registering hotkeys");
    game.keybindings.register(MODULE_ID, "combatPrev", {
        name: `${MODULE_ID}.hotkeys.combatPrev.name`,
        editable: [{ key: "KeyN", modifiers: [foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.SHIFT] }],
        restricted: false,
        onDown: () => {},
        onUp: () => {
            if (!game.combat) return;
            const isOwner = game.combat.combatant?.isOwner;
            if (!isOwner) return;
            game.combat.previousTurn();
        },
    });

    game.keybindings.register(MODULE_ID, "combatNext", {
        name: `${MODULE_ID}.hotkeys.combatNext.name`,
        editable: [{ key: "KeyM", modifiers: [foundry.helpers.interaction.KeyboardManager.MODIFIER_KEYS.SHIFT] }],
        restricted: false,
        onDown: () => {},
        onUp: () => {
            if (!game.combat) return;
            const isOwner = game.combat.combatant?.isOwner;
            if (!isOwner) return;
            game.combat.nextTurn();
        },
    });
}
