// General Syntax:
// wcat [options] [files]
// option to remove big line break (-s)
// option to add line number to non empty lines (-b)
// option to add line numbers to all lines (-n) 
// Commands:
// 1- node wcat.js filepath => displays content of the file in the terminal 
// 2- node wcat.js filepath1 filepath2 filepath3... => displays content of all files in the terminal(contactinated form) in the given order.
// 3- node wcat.js -s filepath => convert big line breaks into a singular line break
// 4- node wcat -n filepath => give numbering to all the lines 
// 5- node wcat -b filepath => give numbering to non-empty lines
// We can mix and match the options.


// Edge cases:
// 1- If file entered is not found then it gives file does not exist error.
// 2- -n and -b are 2 options which are mutually exclusive so if user types both of them together only the first enter option should work.
let catFunc = require('./commands/catFunc.js');
let input = process.argv.slice(2);

let option = "none", files = new Array();

if(input[0]=="-s" || input[0]=="-n" || input[0]=="-b") {
    option = input[0];
}
let index = (option=="none")? 0 : 1;
//store all the filepaths to files[] array.
for(let i=index;i<input.length;i++) {
    files.push(input[i]);
}

let files = 
switch(option) {
    //1. check if the [options] is given? if not directly consider input[0] as filepath...input[n]
    case "-s":
        break;
    default:
        break;
}