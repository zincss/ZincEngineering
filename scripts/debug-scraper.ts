const cheerio = require('cheerio');

const URL = 'https://www.espn.com/nfl/player/_/id/3139477'; // Mahomes (Born in Tyler, TX)

async function run() {
    console.log(`Fetching ${URL}...`);
    const res = await fetch(URL, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' } });
    const html = await res.text();
    const $ = cheerio.load(html);

    const target = "Tyler, TX";
    console.log(`Searching for "${target}"...`);
    
    // Find elements containing the text
    $(`*:contains("${target}")`).each((i, el) => {
        // filter out parents, get mostly leaf nodes
        if ($(el).children().length === 0) {
             console.log(`Found in tag: <${el.tagName} class="${$(el).attr('class')}">`);
             console.log(`Parent: <${$(el).parent().prop('tagName')} class="${$(el).parent().attr('class')}">`);
             console.log(`Text: ${$(el).text().trim()}`);
        }
    });
}

run();