/*
 * -------------------------------------------------------------
 * Community Maintained
 * -------------------------------------------------------------
 *
 * This file is maintained by the community and is subject to the
 * terms of the MIT License.
 *
 * For more information, please visit:
 * https://opensource.org/licenses/MIT
 *
 * -------------------------------------------------------------
 */

import { MODULE_ID } from "./main.js";

export function isDaggerheartSystem() {
    return game.system.id === "daggerheart";
}

export function isDaggerheartCharacter(combatantOrActor) {
    const actor = combatantOrActor?.actor ?? combatantOrActor;
    const isNPC = combatantOrActor?.isNPC ?? false;
    return actor?.type === "character" && !isNPC;
}

export function isDaggerheartSpotlightRequesting(combatant) {
    return !!combatant?.system?.spotlight?.requesting;
}

export function getDaggerheartActionTokenConfig() {
    if (!isDaggerheartSystem()) return { enabled: false, tokens: 0 };
    return game.settings.get(CONFIG.DH.id, CONFIG.DH.SETTINGS.gameSettings.variantRules)?.actionTokens ?? { enabled: false, tokens: 0 };
}

export function defaultAttributesConfig() {
    return {
        daggerheart: [
            {
                attr: "resources.hitPoints.value",
                icon: "fas fa-heart",
                units: game.i18n.localize(`${MODULE_ID}.daggerheart.stats.hitPoints`),
            },
            {
                attr: "resources.stress.value",
                icon: "fas fa-brain",
                units: game.i18n.localize(`${MODULE_ID}.daggerheart.stats.stress`),
            },
            {
                attr: "evasion",
                icon: "fas fa-feather-pointed",
                units: game.i18n.localize(`${MODULE_ID}.daggerheart.stats.evasion`),
            },
        ],
    };
}

export function generateDescription(actor) {
    if (!isDaggerheartSystem()) return null;

    const { type, system } = actor;
    switch (type) {
        case "character": {
            const level = system.levelData?.level?.changed ?? system.levelData?.level?.current ?? 0;
            const parts = [
                system.class?.value?.name,
                system.class?.subclass?.name,
                system.community?.name,
                system.ancestry?.name,
            ].filter(Boolean);
            return `${game.i18n.localize(`${MODULE_ID}.daggerheart.description.level`)} ${level}${parts.length ? ` ${parts.join(" / ")}` : ""}`;
        }
        case "adversary":
            return system.difficulty
                ? `${game.i18n.localize(`${MODULE_ID}.daggerheart.description.difficulty`)} ${system.difficulty}`
                : game.i18n.localize(`${MODULE_ID}.daggerheart.description.adversary`);
        case "companion":
            return game.i18n.localize(`${MODULE_ID}.daggerheart.description.companion`);
        case "environment":
            return game.i18n.localize(`${MODULE_ID}.daggerheart.description.environment`);
        default:
            return null;
    }
}

export function getSystemIcons() {
    return [];
}
