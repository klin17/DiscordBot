const Discord = require('discord.js');
const fs = require('fs');
const cv = require('canvas');       // for converting image urls to imageData
const { bmvbhash } = require('blockhash-core');

const pokeinfo = require("./pokeInfo.json")["infos"]; // [{index, link, hash, name}]
const { isAdmin } = require('./privileges');

// Call this if we need to rehash all images 
function loadImages() {
    console.log("Loading images... ");
    const newPokeInfo = [];
    let pokeIndex = 0;
    function getNext(i, callback) {
        if(i < pokeinfo.length) {
            console.log(`getting i = ${i}`);
            const {index, link, hash, name} = pokeinfo[i];
            convertURIToImageData(link).then(data => {
                newPokeInfo[index] = {
                    index: index,
                    link: link,
                    hash: bmvbhash(data, 16),
                    name: name,
                };
                if(newPokeInfo.length == pokeinfo.length && !newPokeInfo.includes(undefined)) {
                    console.log("All images loaded");
                    fs.writeFileSync('pokeInfo.json', JSON.stringify({infos: newPokeInfo}, null, 4));
                    // console.log(newPokeInfo);
                    for(let j = 0; j < pokeinfo.length; j++) {
                        pokeinfo[j] = newPokeInfo[j];
                    }
                    console.log("pokeinfo updated");
                }
                callback();
            }).catch(err => console.log(err));
        }
    }
    function callback() {
        const numCalls = 50; // arbitrary
        for(let i = 0; i < numCalls; i++) {
            pokeIndex++;
            if(pokeIndex < pokeinfo.length) {
                getNext(pokeIndex, () => {return;});
            }
        }
        pokeIndex++;
        if(pokeIndex < pokeinfo.length) {
            getNext(pokeIndex, callback);
        }
    }
    getNext(pokeIndex, callback);
}
// setTimeout(loadImages, 3000);
// loadImages();

exports.rehash = loadImages;

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// returns Promise<ImageData>
function convertURIToImageData(URI) {
    return new Promise(function(resolve, reject) {
        if (URI == null) return reject();
        var canvas = new cv.Canvas(800, 800);
        var context = canvas.getContext('2d');
        cv.loadImage(URI).then(img => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(context.getImageData(0, 0, canvas.width, canvas.height));
        }).catch (err => {
            console.log(`Image load failed for URI: ${URI}`);
            return reject(err);
        })
    });
}

// one_bits and hammingDistance are taken from blockhash index.js
// see: https://github.com/commonsmachinery/blockhash-js/blob/master/index.js

// number of ones in binary representation of index (eg one_bits[0110] = 2)
const one_bits = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
// returns the hamming distance between binary strings represented with hex strings
const hammingDistance = function(hash1, hash2) {
    if (hash1.length !== hash2.length) {
        throw new Error("Can't compare hashes with different length");
    }

    let d = 0;
    for (let i = 0; i < hash1.length; i++) {
        const n1 = parseInt(hash1[i], 16);
        const n2 = parseInt(hash2[i], 16);
        d += one_bits[n1 ^ n2];     // XOR n1 and n2
    }
    return d;
};

// function getNameFromLink(link) {
//     const arr = link.split("/");
//     const number = parseInt(arr[arr.length - 1].split(".")[0]);
//     return pokemon[number - 1];
// }

// Sets pokeinfo and pokeInfo.json to use link and hash for the named pokemon
function setLink(name, link, hash) {
    pokeinfo.forEach(obj => {
        if(obj.name == name) {
            obj.link = link; // reassign link
            obj.hash = hash; // reassign hash also
        }
    });
    fs.writeFileSync('pokeInfo.json', JSON.stringify({infos: pokeinfo}, null, 4));
}

const sayClosest = (target, channel) => {
    let top = [];
    const numTop = 5; // arbitrary number for limiting size of top

    convertURIToImageData(target).then(targetData => {
        const targetHash = bmvbhash(targetData, 16);
        // find the top numTop closest pokemon and put them in top
        for(let info of pokeinfo) {
            const dist = hammingDistance(info.hash, targetHash);
            const calcFurthest = top.reduce((acc, e) => Math.max(acc, e.distance), 0);
            // compare furthest of top if exists, else just add
            const shouldAdd = calcFurthest > 0 ? dist < calcFurthest : true;
            if(shouldAdd) {
                if(top.length == numTop) {
                    top = top.filter(obj => obj.distance != calcFurthest);
                }
                top.push({
                    distance: dist,
                    number: info.index + 1,
                    name: info.name,
                    link: info.link,
                });
            }
        }
        
        // use the rightmost (ie most recent) in the case of a tie
        const best = top.reduce((acc, e) => acc.distance < e.distance ? acc : e, top[0]);
        const pokeHelpEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Best Match')
            .setThumbnail(best.link)
            .setDescription(`#${best.number} **${best.name}**\ndistance: ${best.distance}`);
            
        // Time within which to react
        const timeout = 15000; // arbitrary
        pokeHelpEmbed.setFooter(`Bot admin can react with 👍 within ${timeout / 1000} sec to save image`);

        channel.send({embeds: [pokeHelpEmbed]}).then(message => {
            // check for admin approval for using best.link as new link for best.name
            const filter = (reaction, user) => reaction.emoji.name === '👍' && isAdmin(user.id, undefined);
            message.awaitReactions(filter, { time: timeout }).then(collected => {
                if(collected.size > 0) {
                    setLink(best.name, target, targetHash);
                    channel.send(`Image link for ${best.name} saved as ${target}`);
                }
            }).catch(console.error);
        });
        console.log(top);
    })
}

let pokehelp = false;

exports.sayClosest = sayClosest;

exports.getPokeHelp = () => pokehelp;

exports.setPokeHelp = (val, channel) => {
    pokehelp = val;
}

// expected link format is:
// https://cdn.discordapp.com/attachments/????/????/image.png
// [ 'https:', '', 'cdn.discordapp.com', 'attachments', '????', '????', 'image.png' ]
// runs sayClosest if pokehelp is on and target is expected format
// returns if we ran sayClosest
exports.checkedPokeHelp = (target, channel) => {
    if(!pokehelp) {
        channel.send("Pokehelp is inactive");
        return false;
    }
    if(!target) {
        // this case should never happen since we check for existence before calling
        channel.send("No target specified");
        return false;
    }
    if(!target.endsWith(".png")) {
        channel.send("Invalid target -- must be .png url");
        return false;
    }
    sayClosest(target, channel);
    return true;
}

// update internal pokeinfo and pokeInfo.json to use link for named pokemon
exports.pokeUpdate = (name, link, channel) => {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
    convertURIToImageData(link).then(data => {
        const hash = bmvbhash(data, 16);
        setLink(capitalizedName, link, hash);
        channel.send(`Updated ${capitalizedName} to use link: ${link}`);
    });
} 