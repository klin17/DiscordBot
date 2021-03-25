require('dotenv').config();
const admins = require('./admins.json');
const fs = require('fs');

// returns if user with id <id> is an admin, with optional param pw
exports.isAdmin = (id, pw) => {
    console.log("isAdmin called");
    if(exports.isPermAdmin(id)) {
        return true;
    }
    if(admins.noadd.includes(id)) {
        return false;
    }
    // check if PW correct
    if(pw == process.env.ADMIN_PASS) {
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
exports.revokeAdmin = (id, perm) => {
    //only admins can revoke admin
    if(exports.isAdmin(id)) {
        admins[id] = undefined;
        if(perm) {
            admins.noadd.push(id);
        }
        fs.writeFileSync('admins.json', JSON.stringify(admins, null, 4));
        return true;
    }
    return false;
}

// Returns an array of IDs (numbers) for permanent bot admins
exports.getPermAdminIDs = () => {
    let perms = [];
    for(let field in admins) {
        if(field != "noadd") {
            //then it is a user
            if(admins[field] == -1) {
                perms.push(field);
            }
        }
    }
    return perms;
}