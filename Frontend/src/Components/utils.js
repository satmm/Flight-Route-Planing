// src/utils.js
export const encodeBase64 = (username, password = '') => {
    return btoa(`${username}:${password}`);
};
