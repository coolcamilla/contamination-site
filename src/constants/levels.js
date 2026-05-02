export const TRASH_LEVELS = {
    1: { color: "#00ff00", emoji: "😊", text: "Очень чисто" },
    2: { color: "#88ff00", emoji: "🙂", text: "Чисто" },
    3: { color: "#ffff00", emoji: "😐", text: "Средне" },
    4: { color: "#ff8800", emoji: "😟", text: "Грязно" },
    5: { color: "#ff0000", emoji: "😡", text: "Очень грязно" }
};

export const getLevelInfo = (level) => {
    return TRASH_LEVELS[level] || TRASH_LEVELS[3];
};