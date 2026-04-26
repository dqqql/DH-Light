const LOG_PREFIX = "[dh-combat-tracker-dock]";

function emit(level, message, data) {
    if (data === undefined) {
        console[level](`${LOG_PREFIX} ${message}`);
        return;
    }
    console[level](`${LOG_PREFIX} ${message}`, data);
}

export const logger = {
    debug(message, data) {
        emit("debug", message, data);
    },
    info(message, data) {
        emit("info", message, data);
    },
    warn(message, data) {
        emit("warn", message, data);
    },
    error(message, data) {
        emit("error", message, data);
    },
};
