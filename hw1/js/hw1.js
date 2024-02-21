const prompt = require("prompt-sync")();
const { dateCreator } = require("./dateFunctions");

function main() {
  while(true) {
    console.log
    let choice = prompt("Please input date string or text QUIT to exit. ")
    if (choice.match("QUIT")) break;
    else dateCreator(choice)
  }
}

main()