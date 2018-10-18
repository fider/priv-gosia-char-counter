const textract = require("textract");
const path = require("path");
const fs = require("fs");
const os = require("os");
const XlsxPopulate = require("xlsx-populate");
const { inspect } = require("util");



const log = console.log.bind(console);

// If true then all line-breaks will not be counted!! (less chars)
let preserveLineBreaks = true;


// ===================== APPLICATION ===========================


async function main() {


    let dir = process.cwd();
    let filePaths = await getKnownFilePaths(dir, "pptx");

    if ( ! filePaths.length) {
        log(`Nie znalazem żadnych plików (${knownFileTypes.join(", ")}) w ${dir}.`);
        log(`Przenieś policz-znaki.bat do folderu, w którym masz pliki do policzenia.\n\n`)
        return;
    }

    let dataRows = [];

    for(let file of filePaths) {
        let text = await getTextFromFile(file);

        text = normalizeText(text);

        fileName = file.split(path.sep).pop();

        const charCount = text.length;

        dataRows.push([fileName, charCount]);

        log(`${fileName}:`);
        log(`  ${charCount}  znaków`);
        log(``);
    }

    // Load a new blank workbook
    let workbook = await XlsxPopulate.fromBlankAsync();

    let data = [
        ["Plik", "Ilość znaków"],
        ...dataRows,
        ["", ""],
        ["RAZEM:"]
    ];

    const cell = workbook.sheet(0).cell("A1");
    cell.value(data);

    workbook.sheet(0).cell(`B${dataRows.length + 3}`).formula(`=SUM(B2:B${dataRows.length + 1})`);

    await workbook.toFileAsync("./Raport.xlsx");

    log(`OK`);
}



// ===================== HELPERS ===========================

const knownFileTypes = [
    "pptx"
];

async function getKnownFilePaths(dir) {

    let files = fs.readdirSync(dir)
    .filter( (fileName) => {
        ext = fileName.split(".").pop();
        return knownFileTypes.includes(ext);
    })
    .map( (fileName) => {
        return path.join(dir, fileName);
    });

    return files;
}


async function getTextFromFile(filePath) {

    return new Promise( (resolve, reject) => {

        // TODO important
        const config = {
            preserveLineBreaks: preserveLineBreaks,
        }

        textract.fromFileWithPath(filePath, config, function( err, text ) {
            if (err) {
                return reject(`getTextFromFile() err: ${err}`);
            }

            return resolve(text);
        });
    });
}


function normalizeText(text) {

	// Remove page numbers taken from notes
	text = text.replace(/(\r\n|\n)\d{1,4}(\r\n|\n)/g, "");

    // Double spaces and double new lines
    text = text.replace(/(\r\n\r\n|\n\n|  )/g, "");

    // New lines
    if (preserveLineBreaks) {
        text = text.replace(/(\r|\n)/g, "");
    }

    return text;
}



// ===================== RUN APP ===========================

main();
