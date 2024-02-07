const prompt = require("prompt-sync")();
const { textProcessor } = require('./textProcessor');

function main() {
  while(true) {
    let choice = prompt("Please input records filename with directory or QUIT to exit. Ex: ./calendar.ical: ")
    if (choice.match("QUIT")) break;
    else textProcessor(choice)
  }
}

function testMain() {
  
  const files = [
    './tests/duplicate_key.txt', 
    './tests/empty_file.txt',
    './tests/invalid_color.txt',
    './tests/invalid_extension.jpg',
    './tests/invalid_key.txt',
    './tests/invalid_line_format.txt',
    './tests/invalid_time.txt',
    './tests/invalid_weight.txt',
    './tests/missing_end_record.txt',
    './tests/unsorted_records.txt',
    './tests/valid_file.txt'
  ]

  
  const filePath =     './tests/invalid_key.txt'

  const output = textProcessor(filePath);
  console.log(output)

}

// testMain()
main()
