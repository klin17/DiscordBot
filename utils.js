
// returns original, with all the substrings matching replacee with replacewith
exports.strReplaceAll = (original, replacee, replacewith) => {
    let replaced = original.slice().replace(replacee, replacewith);
    if(replaced == original) {
        return original;
    } else {
        return exports.strReplaceAll(replaced, replacee, replacewith);
    }
}

// returns the substring of the original string after the arg <substring>
exports.strAfter = (original, substring, include=false) => {
	if(include) {
		return original.slice(original.indexOf(substring), original.length);
	}
	return original.slice(original.indexOf(substring) + substring.length, original.length);
}