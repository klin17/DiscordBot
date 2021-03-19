const private = require('./private.json');
const fs = require('fs');

// returns if user with id <id> is an admin, with optional param pw
exports.isAdmin = (id, pw) => {
    console.log("isAdmin called");
    if(exports.isPermAdmin(id)) {
        return true;
    }
    // check if PW correct
    if(pw && private.adminPass) {
        // Update time stamp then return true
        private.admins[id] = Date.now();
        fs.writeFileSync('private.json', JSON.stringify(private, null, 4));
        return true;
    }
    // check if was within 5 min of login
    if(private.admins[id] && Date.now() - private.admins[id] < 5*60*1000) {
        return true;
    }
    return false;
}

// Checks if private.admins[id] exists and is -1
exports.isPermAdmin = (id) => {
    return (private.admins[id] && private.admins[id] == -1);
}