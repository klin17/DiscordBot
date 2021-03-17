
// returns original, with all the substrings matching replacee with replacewith
exports.strReplaceAll = (original, replacee, replacewith) => {
    let replaced = original.slice().replace(replacee, replacewith);
    if(replaced == original) {
        return original;
    } else {
        return exports.strReplaceAll(replaced, replacee, replacewith);
    }
}