import { getModulePath, MODULE_ID } from "../main.js";
import { HandlebarsApplication, mergeClone } from "../lib/utils.js";
import { logger } from "../lib/logger.js";

export class AddEvent extends HandlebarsApplication {
    constructor(combat) {
        super();
        this.combat = combat;
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: "combat-dock-add-event",
            title: `combat-tracker-dock.add-event.title`,
            template: `${getModulePath()}/templates/add-event.hbs`,
            width: 400,
            height: "auto",
            closeOnSubmit: true,
        });
    }

    static get DEFAULT_OPTIONS() {
        return {
            tag: "form",
            id: "combat-dock-add-event",
            window: {
                title: `combat-tracker-dock.add-event.title`,
            },
            actions: {},
            form: {
                handler: this.#onSubmit,
                closeOnSubmit: true,
            },
            position: {
                width: 400,
            },
        };
    }

    static get PARTS() {
        return mergeClone(super.PARTS, {
            content: {
                classes: ["standard-form"],
            },
            footer: {
                template: "templates/generic/form-footer.hbs",
            },
        });
    }

    _prepareContext(options) {
        const submitButton = {
            type: "submit",
            action: "submit",
            icon: "fas fa-plus",
            label: "combat-tracker-dock.add-event.title",
        };
        const recentEvents = game.settings.get(MODULE_ID, "events");
        return { recentEvents, buttons: [submitButton] };
    }

    _onRender(context, options) {
        super._onRender(context, options);
        logger.debug("AddEvent render", { combatId: this.combat?.id ?? null, recentEvents: game.settings.get(MODULE_ID, "events").length });
        const html = this.element;
        html.querySelectorAll(".cct-event").forEach((eventButton) => {
            eventButton.addEventListener("click", (e) => {
                const eventIndex = e.currentTarget.dataset.index;
                const recentEvents = game.settings.get(MODULE_ID, "events");
                const event = recentEvents[eventIndex];
                html.querySelector("[name='name']").value = event.name;
                html.querySelector("[name='img']").value = event.img;
                html.querySelector("[name='duration']").value = event.duration;
                html.querySelector("[name='hidden']").checked = event.hidden;
            });
        });
    }

    static async #onSubmit(event) {
        const form = this.element;
        const formData = new foundry.applications.ux.FormDataExtended(form).object;
        if (!formData.name || !formData.img) {
            logger.warn("AddEvent validation failed", { combatId: this.combat?.id ?? null, formData });
            return ui.notifications.error(game.i18n.localize("combat-tracker-dock.add-event.error"));
        }
        logger.info("AddEvent submit", {
            combatId: this.combat?.id ?? null,
            name: formData.name,
            duration: formData.duration ?? null,
            hidden: !!formData.hidden,
        });
        try {
            await this.combat.createEmbeddedDocuments("Combatant", [
                {
                    name: formData.name,
                    img: formData.img,
                    initiative: this.combat.combatant?.initiative ?? 0,
                    hidden: formData.hidden || false,
                    [`flags.${MODULE_ID}`]: {
                        event: true,
                        duration: formData.duration || false,
                        roundCreated: this.combat.round,
                    },
                },
            ]);
            let recentEvents = game.settings.get(MODULE_ID, "events");
            const newRecentEvent = { name: formData.name, img: formData.img, duration: formData.duration, hidden: formData.hidden };
            recentEvents = recentEvents.filter((event) => event.name !== newRecentEvent.name && event.img !== newRecentEvent.img);
            recentEvents.unshift(newRecentEvent);
            recentEvents = recentEvents.slice(0, 10);
            await game.settings.set(MODULE_ID, "events", recentEvents);
        } catch (error) {
            logger.error("AddEvent submit failed", { combatId: this.combat?.id ?? null, error });
            ui.notifications.error(game.i18n.localize("combat-tracker-dock.add-event.error"));
        }
    }
}
