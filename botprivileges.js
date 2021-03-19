require('dotenv').config();
const admins = require('./admins.json');
const fs = require('fs');

// returns if user with id <id> is an admin, with optional param pw
exports.isAdmin = (id, pw) => {
    console.log("isAdmin called");
    if(exports.isPermAdmin(id)) {
        return true;
    }
    // check if PW correct
    if(pw && process.env.ADMIN_PASS) {
        // Update time stamp then return true
        admins[id] = Date.now();
        fs.writeFileSync('admins.json', JSON.stringify(admins, null, 4));
        return true;
    }
    // check if was within 5 min of login
    if(admins[id] && Date.now() - admins[id] < 5*60*1000) {
        return true;
    }
    return false;
}

// Checks if private.admins[id] exists and is -1
exports.isPermAdmin = (id) => {
    return (admins[id] && admins[id] == -1);
}

// Removes timestamp
exports.revokeAdmin = (id) => {
    //only admins can revoke admin
    if(exports.isAdmin(id)) {
        admins[id] = undefined;
        fs.writeFileSync('admins.json', JSON.stringify(admins, null, 4));
        return true;
    }
    return false;
}