export function jsonStringifySafe(input: any) {
    return JSON.stringify(input, getCircularReplacer());
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: string, value: any) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};