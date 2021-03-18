const private = require('./private.json');
const fs = require('fs');

exports.isAdmin = (id, pw) => {
    console.log("isAdmin called");
    if(pw) {
        // check if pw is correct
        if(pw == private.adminPass) {
            //update time stamp
            if(private.admins[id] && private.admins[id] == -1) {
                return true; // -1 indicates nonupdating admin privileges
            }
            private.admins[id] = Date.now();
            // var name = 'fileName.json';
            // var m = JSON.parse(fs.readFileSync(name).toString());
            fs.writeFileSync('private.json', JSON.stringify(private, null, 4));
            return true;
        }
    }
    if(private.admins[id]) {
        if(private.admins[id] < 0) {
            return true;
        }
        // if within 5 min
        if(Date.now() - private.admins[id] < 5*60*1000) {
            return true;
        }
    }
    return false;
}