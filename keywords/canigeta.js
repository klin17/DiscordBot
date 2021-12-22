const { makeRegex, pickRandom } = require("../utils");

const getPics = {
    "owa owa": [
        "https://cdn.discordapp.com/attachments/821835099456405504/821873042032558110/pudgywoke-tiktok-videos.jpg",
        "https://pbs.twimg.com/profile_images/1337810830138744837/bxhDUW5-_400x400.jpg",
        "https://hashtaghyena.com/wp-content/uploads/2021/01/IMG_4374.jpeg",
        "https://media1.popsugar-assets.com/files/thumbor/lqNAj98ANxGQ7DycASpJsRkOQ00/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2021/01/12/187/n/1922243/addurlAw4hlQ/i/pudgywoke.jpg",
    ],
    "shaq": [
        "https://cdn.discordapp.com/attachments/821580269286457347/821884871512686602/https3A2F2Fblogs-images.png", 
        "https://cdn.discordapp.com/attachments/821580269286457347/821884893038247946/image.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821884935769948160/shaq1.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821884960151175189/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885526897328178/shaquille-oneal-apjpg-9375ed782cfd464d.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885546669408366/shaquille-oneal-music-videos.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885583546122240/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/821885653943189514/images.png",
        "https://cdn.discordapp.com/attachments/821580269286457347/822255455035850762/unknown.png",
    ],
    "bananya": [
        "https://tenor.com/view/banana-cat-cute-kawaii-gif-13326985",
        "https://tenor.com/view/bananya-banana-cat-kawaii-cute-gif-11155423",
        "https://tenor.com/view/ck004-gif-8195459",
        "https://tenor.com/view/bananya-banana-kittens-gif-13326982",
        "https://tenor.com/view/cat-kitten-excited-happy-smile-gif-5681144",
        "https://tenor.com/view/cute-cat-bananya-anime-kawaii-gif-5735863",
        "https://tenor.com/view/bananya-banana-cat-cute-shining-eyes-gif-15873885",
        "https://tenor.com/view/banana-fruits-gif-7763515",
        "https://tenor.com/view/banana-kitty-cat-gif-13333733",
        "https://cdn.discordapp.com/attachments/821835099456405504/823964378683539466/bFXfuA8.gif",
        "https://cdn.discordapp.com/attachments/821835099456405504/823964287168938014/51d0a2401492fd1560969079c22b1051db512777a77eb3955a2716cd1f23eeb4_1.gif",
    ],
    "gibby": [
        "https://tenor.com/view/gibby-gif-8339722",
        "https://tenor.com/view/excited-happy-sexy-dance-funny-gif-12655757",
        "https://tenor.com/view/icarly-fall-down-faceplant-fall-falling-down-gif-17810175",
        "https://tenor.com/view/im-awesome-mom-mommas-boy-gif-10631335",
        "https://tenor.com/view/gibby-gif-8339724",
        "https://tenor.com/view/gibbeh-gibby-my-beloved-joejoe-gif-20648194",
        "https://tenor.com/view/gibby-gif-8339686",
        "https://tenor.com/view/happy-birthday-gif-4211526",
        "https://tenor.com/view/spencer-stop-sign-april-fools-gif-20077049",
    ],
}

// because it doesn't like recursion for some reason?
const canigetaRegex = ["c+a+n+ +i+ +g+e+t+ +a+n*", "gi"]

module.exports = {
    name: "canigeta",
    regexStrings: canigetaRegex,
    description: "Responds with a random meme for 'owa owa', 'shaq', 'bananya', 'gibby'",
    restricted: false,
    action: (msg) => {
        let regex = makeRegex(canigetaRegex);
        regex.test(msg.content);
        let rest = msg.content.slice(regex.lastIndex, msg.content.length);

        if(rest.length > 0) {
            let piclinks = [];
            for(let key in getPics) {
                let keyExp = RegExp(key.split("").join("+") + "+", "i");
                if(rest.match(keyExp)) {
                    piclinks.push(pickRandom(getPics[key]));
                }
            }
            msg.channel.send(rest);
            piclinks.forEach(link => msg.channel.send(link));
        }
    },
}
// "can i get a": {
//     regexStrings: ["c+a+n+ +i+ +g+e+t+ +a+n*", "gi"],
//     action: (msg) => {
//         let regex = makeRegex(keywords["can i get a"].regexStrings);
//         regex.test(msg.content);
//         let rest = msg.content.slice(regex.lastIndex, msg.content.length);

//         if(rest.length > 0) {
//             let piclinks = [];
//             for(let key in getPics) {
//                 let keyExp = RegExp(key.split("").join("+") + "+", "i");
//                 if(rest.match(keyExp)) {
//                     piclinks.push(pickRandom(getPics[key]));
//                 }
//             }
//             msg.channel.send(rest);
//             piclinks.forEach(link => msg.channel.send(link));
//         }
//     }
// },