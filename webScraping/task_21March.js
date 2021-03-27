//url: https://www.espncricinfo.com/series/ipl-2020-21-1210595
let request = require("request");
let cheerio = require("cheerio"),
    fs = require("fs"),
    path = require("path");

const {parse, stringify} = require("flatted");
    
const baseurl = "https://www.espncricinfo.com";

console.log("Before");
const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/points-table-standings";
request(url, cb);
function cb(error, response, html) {
    if (error) {
        console.log(error)
    } else {
        extractHtml(html);
    }
}

function extractHtml(html) {
    let selTool = cheerio.load(html);
    let teamLinkSel = selTool(".label.d-flex.align-items-center.row-name");
    let teamName = selTool("td h5.header-title");
    let rootDir = "IPL_2020";

    createDir(rootDir);

    for(let i=0;i<teamLinkSel.length;i++) {
    // for(let i=0;i<1;i++) {   //debug

        let teamLink = selTool(teamLinkSel[i]).attr("href");
        teamName[i] = selTool(teamName[i]).text();
        console.log("name:",teamName[i],", link:",teamLink);
        createDir(path.join(rootDir, teamName[i]));
        let allMatchesLink = baseurl + teamLink + "/match-results";
        processMatchLink(allMatchesLink, teamName[i]);
    }
}

function processMatchLink(allMatchesLink, teamName) {
    request(allMatchesLink,(err, response, html)=>{
        if(err)
            console.log(err);
        else {
            getPlayerDetails(html, teamName);
        }
    })
}

async function getPlayerDetails(html, teamName) {
    let selTool = cheerio.load(html);
    let scorecardList = selTool(".match-cta-container .btn.btn-sm.btn-outline-dark.match-cta:nth-child(3)");    //1. select the scorecard of each match. - ".match-cta-container .btn.btn-sm.btn-outline-dark.match-cta:nth-child(3)"
    // let currTeamName = selTool(".match-info.match-info-MATCH div.team:not(.team-gray) p").text();
    /*
    //selectors:
    1. teamName for batting details = ".section-header.border-bottom.text-danger.cursor-pointer  h5.header-title.label" 
                                    or 
                                    ".match-info.match-info-MATCH .team"
    2. team Batting details = ".table.batsman" //select the curr-index of the given selected team
    3. batsman rows selector = ".table.batsman tbody tr"
    */
    let matchesList = [];

    //request each scorecardLinks
    for(let i=0;i<scorecardList.length;i++) {
    // for(let i=0;i<1;i++) {  //debug

        let scoreCardURL = baseurl + selTool(scorecardList[i]).attr("href");
        // let batsmanObj = await processScoreCardURL(scoreCardURL);
        matchesList.push(await processScoreCardURL(scoreCardURL));
        // request(scoreCardURL,(err, data, html)=>{
        //     if(err)
        //         console.log(err)
        //     else
        //         matchesList.push(getBatsmanListPerMatch(html));
        // })
    }
    // console.log(JSON.stringify(matchesList));   //debug
    createJSON(matchesList, teamName);
}

function processScoreCardURL(scoreCardURL) {
    return new Promise((resolve, reject)=>{
        request(scoreCardURL,(err, data, html)=>{
            if(err)
                reject(err);
            else {
                resolve(getBatsmanListPerMatch(html));
            }
        })
    })
}

function getBatsmanListPerMatch(html) {
    let selTool = cheerio.load(html);
    // let selTeamName = selTool(".match-info.match-info-MATCH .team p");  //".match-info.match-info-MATCH div.team:not(.team-gray)"
    let currTeamName = selTool(".match-info.match-info-MATCH div.team:not(.team-gray) p").text();
    let selTeamName = selTool(".match-info.match-info-MATCH .team p");
    let index = (selTeamName[0]==currTeamName)? 0:1;
    let batsmanTable = selTool(".table.batsman")[index];
    let tr = selTool(batsmanTable).find("tbody tr");

    let batsmanDetail = [];
    //Iterate throught the batsman details n store each row details
    for(let i=0; i<tr.length-1; i+=2) {    //cuz one tr is just a border so just skip it
        let td = selTool(tr[i]).find("td");
        batsmanDetail.push({
            "Name": selTool(tr[i]).find(".batsman-cell.text-truncate a").text(),
            "Runs": selTool(td[2]).text(),
            "Balls":selTool(td[3]).text(),
            "4s":   selTool(td[5]).text(),  //one of the index in td is disable so skip one index
            "6s":   selTool(td[6]).text(),
            "SR":   selTool(td[7]).text()
        });
    }

    /*selectors:
    venue: ".font-weight-bold.match-venue a",
    date: ".match-info.match-info-MATCH .description" - split(", ")[2]
    result: ".match-info.match-info-MATCH .status-text span"
    opponent: ".match-info.match-info-MATCH .team-gray p"
    */
   let resultObj = {
       "battingDetails": batsmanDetail,
       "venue": selTool(".font-weight-bold.match-venue a").text(),
       "date": selTool(".match-info.match-info-MATCH .description").text().split(", ")[2],
       "result": selTool(".match-info.match-info-MATCH .status-text span").text(),
       "opponent": selTool(".match-info.match-info-MATCH .team-gray p").text()
   };

    //now push the 'batsmanObj' to the Matches 'array of the matches' played by that team.
    // console.log(resultObj);  //debug
    return resultObj;
}

function createJSON(matchesList, currTeamName) {
    try {
        // console.log(JSON.stringify(matchesList));
        let filePath = path.join(__dirname,"IPL_2020",currTeamName,"results.json");
        // if(!fs.existsSync(filePath)) {
        let createStream = fs.createWriteStream(filePath);
        createStream.write(JSON.stringify(matchesList));
        createStream.end();
        console.log(currTeamName + " json is created!");
        // }
    }
    catch(err) {
        console.log("err while creating JSON:", err);
    }
}

function createDir(dir) {
    let pathOfFolder = path.join(__dirname, dir);
    if(fs.existsSync(pathOfFolder)==false) {
        fs.mkdirSync(pathOfFolder);
    }
}

// function createFile(repoName, topicName) {
//     let pathOfFile = path.join(__dirname,topicName,repoName+".json");
//     if(!fs.existsSync(pathOfFile)) {
//         let createStream = fs.createWriteStream(pathOfFile);
//         createStream.end();
//     }
// }