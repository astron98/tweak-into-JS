const fs = require('fs');

//check if its a valid file
exports.isValidPath(filePath) {
    try {
        const stats = fs.statSync(filePath);
        return stats.isFile();
    }
    catch(err) {
        console.error(err);
    }
}

// exports.removeLineBreaks() {

// }