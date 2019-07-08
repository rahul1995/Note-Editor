export default {
    sanitizeHex: hex => {
        if(hex.startsWith('#')) hex = hex.substring(1);
        if (/^[0-9a-f]+$/i.test(hex)) {
            if (hex.length === 3)
                hex = hex.charAt(0) + hex.charAt(0) + hex.charAt(1) + hex.charAt(1) + hex.charAt(2) + hex.charAt(2);
            if (hex.length === 6)
                return '#' + hex;
        }
    }
};