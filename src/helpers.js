export function yocto_string_to_near(yocto_string, decimal_places) {
    return (Number(BigInt(yocto_string) / BigInt(10**(24-decimal_places))) / 10**decimal_places).toFixed(1);
}

// returns BigInt
export function near_to_yocto(near) {
    return BigInt(near * 10**24);
}

// expects BigInt
export function yocto_to_near(yocto, decimalPlaces = 6) {
    const near = yocto * BigInt(10**decimalPlaces) / BigInt(10**24);
    return Number(near) / 10**decimalPlaces;
}