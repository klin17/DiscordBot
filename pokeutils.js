const Discord = require('discord.js');
const cv = require('canvas');       // for converting image urls to imageData
const { bmvbhash } = require('blockhash-core');

const pokeinfo = require("./pokeInfo.json")["infos"]; // [{index, link, hash, name}]


// // uncomment this if we need to get pokeInfo again

// const pokeImageLinks = pokemon.map((name, index) => `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${pad(index + 1, 3, '0')}.png`);
// const pokeInfo = [];
// function loadImages() {
//     console.log("Loading images... ");
//     let pokeIndex = 0;
//     function getNext(index, callback) {
//         if(index < pokemon.length) {
//             const pokeLink = pokeImageLinks[index];
//             convertURIToImageData(pokeLink).then(data => {
//                 pokeInfo.push({
//                     index: index,
//                     link: pokeLink,
//                     hash: bmvbhash(data, 16),
//                     name: getNameFromLink(pokeLink),
//                 })
//                 if(pokeInfo.length == pokemon.length) {
//                     console.log("All images loaded");
//                     fs.writeFileSync('pokeInfo.json', JSON.stringify({infos: pokeInfo}, null, 4));
//                     console.log(pokeInfo);
//                 }
//                 callback();
//             }).catch(err => console.log(err));
//         }
//     }
//     function callback() {
//         for(let i = 0; i < 4; i++) {
//             pokeIndex++;
//             if(pokeIndex < pokemon.length) {
//                 getNext(pokeIndex, () => {return;});
//             }
//         }
//         pokeIndex++;
//         if(pokeIndex < pokemon.length) {
//             getNext(pokeIndex, callback);
//         }
//     }
//     getNext(pokeIndex, callback);
// }
// loadImages();

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
            console.log("image load fail");
            console.log(URI);
            return reject(err);
        })
    });
}

// hammingdistance taken from blockhash index.js
// see: https://github.com/commonsmachinery/blockhash-js/blob/master/index.js
const one_bits = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];
const hammingDistance = function(hash1, hash2) {
    var d = 0;
    var i;

    if (hash1.length !== hash2.length) {
        throw new Error("Can't compare hashes with different length");
    }

    for (i = 0; i < hash1.length; i++) {
        var n1 = parseInt(hash1[i], 16);
        var n2 = parseInt(hash2[i], 16);
        d += one_bits[n1 ^ n2];
    }
    return d;
};

// function getNameFromLink(link) {
//     const arr = link.split("/");
//     const number = parseInt(arr[arr.length - 1].split(".")[0]);
//     return pokemon[number - 1];
// }

const sayClosest = (target, channel) => {
    let top = [];
    const numTop = 5; // arbitrary number for limiting size of top

    convertURIToImageData(target).then(targetData => {
        const targetHash = bmvbhash(targetData, 16);
        console.log("Target hashed successfully");

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
        // use the rightmost in the case of a tie
        const best = top.reduce((acc, e) => acc.distance < e.distance ? acc : e, top[0]);
        const pokeHelpEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle('Best Match')
                    .setThumbnail(best.link)
                    .setDescription(`#${best.number} **${best.name}**\ndistance: ${best.distance}`)
        channel.send(pokeHelpEmbed);
        console.log(top);
    })
}

let pokehelp = true;

exports.sayClosest = sayClosest;

exports.getPokeHelp = () => pokehelp;

exports.setPokeHelp = (val, channel) => {
    pokehelp = val;
}

// expected link format is:
// https://cdn.discordapp.com/attachments/830280123805859860/????/image.png
// [ 'https:', '', 'cdn.discordapp.com', 'attachments', '830280123805859860', '????', 'image.png' ]
                                                         830280123805859860
// runs sayClosest if pokehelp is on and target is expected format
// returns if we ran sayClosest
exports.checkedPokeHelp = (target, channel) => {
    if(!pokehelp || !target) {
        channel.send("Pokehelp is inactive");
        return false;
    }
    if(!target) {
        // this case should never happen since we check for existence before calling
        channel.send("No target specified");
        return false;
    }
    const tokens = target.split("/");
    if(tokens.length !== 7 || tokens[3] !== "attachments" || tokens[4] !== "830280123805859860") {
        channel.send("Invalid target -- must be cdn.discordapp.com/attatchment/830280123805859860/.../image.png");
        return false;
    }
    sayClosest(target, channel);
    return true;
}