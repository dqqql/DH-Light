import { AttributesConfig } from "./app/AttributesConfig.js";
import { MODULE_ID } from "./main.js";
import { logger } from "./lib/logger.js";

export function registerSettings() {
    logger.debug("registerSettings start");
    game.settings.register(MODULE_ID, "attributes", {
        scope: "world",
        config: false,
        type: Array,
        default: CONFIG.dhCombatTrackerDock.defaultAttributesConfig().daggerheart,
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "events", {
        scope: "world",
        config: false,
        type: Array,
        default: [],
    });

    game.settings.registerMenu(MODULE_ID, "attributesMenu", {
        name: game.i18n.localize(`${MODULE_ID}.settings.attributesMenu.name`),
        label: game.i18n.localize(`${MODULE_ID}.settings.attributesMenu.label`),
        hint: game.i18n.localize(`${MODULE_ID}.settings.attributesMenu.hint`),
        icon: "fas fa-cogs",
        scope: "world",
        restricted: true,
        type: AttributesConfig,
    });

    game.settings.register(MODULE_ID, "direction", {
        name: "dh-combat-tracker-dock.settings.direction.name",
        hint: "dh-combat-tracker-dock.settings.direction.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            rowDocked: "dh-combat-tracker-dock.settings.direction.choices.rowDocked",
            rowFloat: "dh-combat-tracker-dock.settings.direction.choices.rowFloat",
            columnFloat: "dh-combat-tracker-dock.settings.direction.choices.columnFloat",
        },
        default: "rowDocked",
        onChange: async () => {
            await ui.dhCombatDock?.restart();
            setDirection();
            setOverflowStyle();
            setFlex();
            ui.dhCombatDock?.autosize();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "portraitSize", {
        name: "dh-combat-tracker-dock.settings.portraitSize.name",
        hint: "dh-combat-tracker-dock.settings.portraitSize.hint",
        scope: "client",
        config: true,
        type: String,
        choices: {
            "30px": "dh-combat-tracker-dock.settings.portraitSize.choices.30px",
            "50px": "dh-combat-tracker-dock.settings.portraitSize.choices.50px",
            "70px": "dh-combat-tracker-dock.settings.portraitSize.choices.70px",
            "90px": "dh-combat-tracker-dock.settings.portraitSize.choices.90px",
            "110px": "dh-combat-tracker-dock.settings.portraitSize.choices.110px",
            "150px": "dh-combat-tracker-dock.settings.portraitSize.choices.150px",
            "180px": "dh-combat-tracker-dock.settings.portraitSize.choices.180px",
        },
        default: "70px",
        onChange: () => {
            setPortraitSize();
            ui.dhCombatDock?.autosize();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "overflowStyle", {
        name: "dh-combat-tracker-dock.settings.overflowStyle.name",
        hint: "dh-combat-tracker-dock.settings.overflowStyle.hint",
        scope: "client",
        config: true,
        type: String,
        choices: {
            autofit: "dh-combat-tracker-dock.settings.overflowStyle.choices.autofit",
            hidden: "dh-combat-tracker-dock.settings.overflowStyle.choices.hidden",
            scroll: "dh-combat-tracker-dock.settings.overflowStyle.choices.scroll",
        },
        default: "autofit",
        onChange: () => {
            setOverflowStyle();
            ui.dhCombatDock?.autosize();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "carouselStyle", {
        name: "dh-combat-tracker-dock.settings.carouselStyle.name",
        hint: "dh-combat-tracker-dock.settings.carouselStyle.hint",
        scope: "world",
        config: true,
        type: Number,
        choices: {
            0: "dh-combat-tracker-dock.settings.carouselStyle.choices.centerCarousel",
            1: "dh-combat-tracker-dock.settings.carouselStyle.choices.leftCarousel",
            2: "dh-combat-tracker-dock.settings.carouselStyle.choices.basic",
        },
        default: 0,
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "alignment", {
        name: "dh-combat-tracker-dock.settings.alignment.name",
        hint: "dh-combat-tracker-dock.settings.alignment.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            left: "dh-combat-tracker-dock.settings.alignment.choices.left",
            center: "dh-combat-tracker-dock.settings.alignment.choices.center",
            right: "dh-combat-tracker-dock.settings.alignment.choices.right",
        },
        default: "center",
        onChange: () => {
            setAlignment();
            setFlex();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "floatingSize", {
        name: "dh-combat-tracker-dock.settings.floatingSize.name",
        hint: "dh-combat-tracker-dock.settings.floatingSize.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 60,
        range: {
            min: 30,
            max: 100,
            step: 1,
        },
        onChange: () => {
            setFloatingSize();
            ui.dhCombatDock?.refresh();
        }
    });

    game.settings.register(MODULE_ID, "portraitAspect", {
        name: "dh-combat-tracker-dock.settings.portraitAspect.name",
        hint: "dh-combat-tracker-dock.settings.portraitAspect.hint",
        scope: "world",
        config: true,
        type: Number,
        choices: {
            1: "dh-combat-tracker-dock.settings.portraitAspect.choices.square",
            1.5: "dh-combat-tracker-dock.settings.portraitAspect.choices.portrait",
            2: "dh-combat-tracker-dock.settings.portraitAspect.choices.long",
        },
        default: 1.5,
        onChange: () => {
            setPortraitAspect();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "roundness", {
        name: "dh-combat-tracker-dock.settings.roundness.name",
        hint: "dh-combat-tracker-dock.settings.roundness.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "0%": "dh-combat-tracker-dock.settings.roundness.choices.sharp",
            "10%": "dh-combat-tracker-dock.settings.roundness.choices.soft",
            "20%": "dh-combat-tracker-dock.settings.roundness.choices.round",
        },
        default: "0%",
        onChange: () => {
            setRoundness();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "attributeColor", {
        name: "dh-combat-tracker-dock.settings.attributeColor.name",
        hint: "dh-combat-tracker-dock.settings.attributeColor.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#41AA7D",
        onChange: () => {
            setAttributeColor();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "attributeColor2", {
        name: "dh-combat-tracker-dock.settings.attributeColor2.name",
        hint: "dh-combat-tracker-dock.settings.attributeColor2.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#ffcd00",
        onChange: () => {
            setAttributeColor();
            ui.dhCombatDock?.refresh();
        },
    });
    //
    game.settings.register(MODULE_ID, "attributeColorPortrait", {
        name: "dh-combat-tracker-dock.settings.attributeColorPortrait.name",
        hint: "dh-combat-tracker-dock.settings.attributeColorPortrait.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#e62121",
        onChange: () => {
            setAttributeColor();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "barsPlacement", {
        name: "dh-combat-tracker-dock.settings.barsPlacement.name",
        hint: "dh-combat-tracker-dock.settings.barsPlacement.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            left: "dh-combat-tracker-dock.settings.barsPlacement.choices.left",
            right: "dh-combat-tracker-dock.settings.barsPlacement.choices.right",
            twinned: "dh-combat-tracker-dock.settings.barsPlacement.choices.twinned",
        },
        default: "left",
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "attributeVisibility", {
        name: "dh-combat-tracker-dock.settings.attributeVisibility.name",
        hint: "dh-combat-tracker-dock.settings.attributeVisibility.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            text: "dh-combat-tracker-dock.settings.attributeVisibility.choices.text",
            bars: "dh-combat-tracker-dock.settings.attributeVisibility.choices.bars",
            both: "dh-combat-tracker-dock.settings.attributeVisibility.choices.both",
        },
        default: "both",
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "displayDescriptions", {
        name: "dh-combat-tracker-dock.settings.displayDescriptions.name",
        hint: "dh-combat-tracker-dock.settings.displayDescriptions.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "none": "dh-combat-tracker-dock.settings.displayDescriptions.choices.none",
            "owner": "dh-combat-tracker-dock.settings.displayDescriptions.choices.owner",
            "all": "dh-combat-tracker-dock.settings.displayDescriptions.choices.all",
        },
        default: "owner",
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "hideDefeated", {
        name: "dh-combat-tracker-dock.settings.hideDefeated.name",
        hint: "dh-combat-tracker-dock.settings.hideDefeated.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "showDispositionColor", {
        name: "dh-combat-tracker-dock.settings.showDispositionColor.name",
        hint: "dh-combat-tracker-dock.settings.showDispositionColor.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "portraitImage", {
        name: "dh-combat-tracker-dock.settings.portraitImage.name",
        hint: "dh-combat-tracker-dock.settings.portraitImage.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            actor: "dh-combat-tracker-dock.settings.portraitImage.choices.actor",
            token: "dh-combat-tracker-dock.settings.portraitImage.choices.token",
        },
        default: "actor",
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "displayName", {
        name: "dh-combat-tracker-dock.settings.displayName.name",
        hint: "dh-combat-tracker-dock.settings.displayName.hint",
        scope: "world",
        config: true,
        type: String,
        choices: {
            default: "dh-combat-tracker-dock.settings.displayName.choices.default",
            token: "dh-combat-tracker-dock.settings.displayName.choices.token",
            owner: "dh-combat-tracker-dock.settings.displayName.choices.owner",
        },
        default: "default",
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "playerPlayerPermission", {
        name: "dh-combat-tracker-dock.settings.playerPlayerPermission.name",
        hint: "dh-combat-tracker-dock.settings.playerPlayerPermission.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "hideFirstRound", {
        name: "dh-combat-tracker-dock.settings.hideFirstRound.name",
        hint: "dh-combat-tracker-dock.settings.hideFirstRound.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "portraitImageBorder", {
        name: "dh-combat-tracker-dock.settings.portraitImageBorder.name",
        hint: "dh-combat-tracker-dock.settings.portraitImageBorder.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.FilePathField({categories: ["IMAGE"]}),
        default: `modules/${MODULE_ID}/assets/border.png`,
        onChange: function () {
            setPortraitImageBorder();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "portraitImageBackground", {
        name: "dh-combat-tracker-dock.settings.portraitImageBackground.name",
        hint: "dh-combat-tracker-dock.settings.portraitImageBackground.hint",
        scope: "world",
        config: true,
        type: new foundry.data.fields.FilePathField({categories: ["IMAGE"]}),
        default: "ui/denim075.png",
        onChange: function () {
            setPortraitImageBackground();
            ui.dhCombatDock?.refresh();
        },
    });

    game.settings.register(MODULE_ID, "hideConflictingUIs", {
        name: "dh-combat-tracker-dock.settings.hideConflictingUIs.name",
        hint: "dh-combat-tracker-dock.settings.hideConflictingUIs.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: () => setHideConflictingUIs(),
    });

    setAllSettings();

    game.settings.register(MODULE_ID, "resource", {
        name: "dh-combat-tracker-dock.settings.resource.name",
        hint: "dh-combat-tracker-dock.settings.resource.hint",
        scope: "world",
        config: true,
        type: String,
        default: game.system.id === "daggerheart" ? (game.system.secondaryTokenAttribute ?? "resources.stress") : "",
        onChange: () => ui.dhCombatDock?.refresh(),
    });

    game.settings.register(MODULE_ID, "portraitResource", {
        name: "dh-combat-tracker-dock.settings.portraitResource.name",
        hint: "dh-combat-tracker-dock.settings.portraitResource.hint",
        scope: "world",
        config: true,
        type: String,
        default: game.system.id === "daggerheart" ? (game.system.primaryTokenAttribute ?? "resources.hitPoints") : "",
        onChange: () => ui.dhCombatDock?.refresh(),
    });
    logger.info("registerSettings complete");
}

function setAllSettings() {
    logger.debug("setAllSettings");
    setDirection();
    setOverflowStyle();
    setAlignment();
    setFlex();
    setPortraitAspect();
    setRoundness();
    setAttributeColor();
    setPortraitImageBorder();
    setPortraitImageBackground();
    setHideConflictingUIs();
    setFloatingSize();
}

function setFloatingSize() {
    const floatingSize = game.settings.get(MODULE_ID, "floatingSize");
    logger.debug("setFloatingSize", { floatingSize });
    document.documentElement.style.setProperty("--dhctd-carousel-floating-size", floatingSize + "%");
}

function setPortraitSize() {
    const portraitSize = game.settings.get(MODULE_ID, "portraitSize");
    logger.debug("setPortraitSize", { portraitSize });
    document.documentElement.style.setProperty("--dhctd-combatant-portrait-size", portraitSize);
}

function setPortraitAspect() {
    const portraitAspect = game.settings.get(MODULE_ID, "portraitAspect");
    logger.debug("setPortraitAspect", { portraitAspect });
    document.documentElement.style.setProperty("--dhctd-combatant-portrait-aspect", portraitAspect);
}

function setAlignment() {
    const alignment = game.settings.get(MODULE_ID, "alignment");
    logger.debug("setAlignment", { alignment });
    document.documentElement.style.setProperty("--dhctd-carousel-alignment", alignment);
    ui.dhCombatDock?.setControlsOrder();
}

function setPortraitImageBorder() {
    let portraitImageBorder = game.settings.get(MODULE_ID, "portraitImageBorder");
    document.documentElement.style.setProperty("--dhctd-combatant-portrait-image-border", `url('${portraitImageBorder}')`);
}

function setPortraitImageBackground() {
    let portraitImageBackground = game.settings.get(MODULE_ID, "portraitImageBackground");
    document.documentElement.style.setProperty("--dhctd-combatant-portrait-image-background", `url('${portraitImageBackground}')`);
}

function setHideConflictingUIs() {
    const hideConflictingUIs = game.settings.get(MODULE_ID, "hideConflictingUIs");
    logger.debug("setHideConflictingUIs", { hideConflictingUIs });
    document.querySelector("#ui-top")?.classList.toggle("dhctd-hide-conflicting-uis", hideConflictingUIs);
}

function setRoundness() {
    const roundness = game.settings.get(MODULE_ID, "roundness");
    logger.debug("setRoundness", { roundness });
    document.documentElement.style.setProperty("--dhctd-combatant-portrait-border-radius", roundness);
}

function setAttributeColor() {
    const attributeColor = game.settings.get(MODULE_ID, "attributeColor") || "#41AA7D";
    logger.debug("setAttributeColor", {
        attributeColor,
        attributeColor2: game.settings.get(MODULE_ID, "attributeColor2") || "#ffcd00",
        attributeColorPortrait: game.settings.get(MODULE_ID, "attributeColorPortrait") || "#e62121",
    });
    document.documentElement.style.setProperty("--dhctd-attribute-bar-primary-color", attributeColor);

    const color = Color.from(attributeColor);
    const darkened = color.mix(Color.from("#000"), 0.5);

    document.documentElement.style.setProperty("--dhctd-attribute-bar-secondary-color", darkened.toString());

    const attributeColor2 = game.settings.get(MODULE_ID, "attributeColor2") || "#ffcd00";
    document.documentElement.style.setProperty("--dhctd-attribute-bar-primary-color2", attributeColor2);

    const color2 = Color.from(attributeColor2);
    const darkened2 = color2.mix(Color.from("#000"), 0.5);

    document.documentElement.style.setProperty("--dhctd-attribute-bar-secondary-color2", darkened2.toString());

    const attributeColorPortrait = game.settings.get(MODULE_ID, "attributeColorPortrait") || "#e62121";
    document.documentElement.style.setProperty("--dhctd-attribute-bar-portrait-color", attributeColorPortrait);

}

function setOverflowStyle() {
    let overflowStyle = game.settings.get(MODULE_ID, "overflowStyle");
    logger.debug("setOverflowStyle", { overflowStyle, direction: game.settings.get(MODULE_ID, "direction") });
    if (overflowStyle === "autofit") overflowStyle = "hidden";
    if (overflowStyle === "scroll") {
        const direction = game.settings.get(MODULE_ID, "direction");
        if (direction !== "columnFloat") overflowStyle = "scroll hidden";
        else overflowStyle = "hidden scroll";
    }
    document.documentElement.style.setProperty("--dhctd-carousel-overflow", overflowStyle);
}

function setDirection() {
    let direction = game.settings.get(MODULE_ID, "direction");
    logger.debug("setDirection", { direction });
    if(!(direction in game.settings.settings.get(`${MODULE_ID}.direction`).choices)) {
        direction = direction.includes("column") ? "columnFloat" : "rowDocked"; 
        game.settings.set(MODULE_ID, "direction", direction);
    }
    document.documentElement.style.setProperty("--dhctd-carousel-direction", direction === "columnFloat" ? "column" : "row");
    document.documentElement.style.setProperty("--dhctd-combatant-portrait-margin", direction !== "columnFloat" ? "0 calc(var(--dhctd-combatant-portrait-size) * 0.1)" : "0");
    ui.dhCombatDock?.setControlsOrder();
}

function setFlex() {
    const alignment = game.settings.get(MODULE_ID, "alignment");
    const direction = game.settings.get(MODULE_ID, "direction");
    let flexD = "flex-start";
    if (direction == "columnFloat" && alignment == "right") flexD = "flex-end";
    if (direction == "columnFloat" && alignment == "center") flexD = "center";

    document.documentElement.style.setProperty("--dhctd-carousel-align-items", flexD);
}
