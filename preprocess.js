const cheerio = require('cheerio');
const fs = require('fs');
const stemmer = require('porter-stemmer').stemmer



// const DATA_FILE = 'dataset-v3/dataset.jsonl'
// const OUTPUT_FILE = 'dataset-v3/results.jsonl'
// const PAGE_PATH = p => 'dataset-v3/pages/v3/'+p+'.html'

const DATA_FILE = 'dataset/data/v3.jsonl'
const PAGE_PATH = p => 'dataset/pages/v3/'+p+'.html'


var dataset = fs.readFileSync(DATA_FILE).toString().split('\n')
  .map(s => {
    try {
      return JSON.parse(s)
    } catch (err) {
      return null
    }
  })


var files = Object.keys(dataset.reduce((o, d) => {
  if(d) o[d.webpage] = true
  return o
}, {}))


var documents =
  files.map(f => {
    return [f, fs.readFileSync(PAGE_PATH(f)).toString()]
  })
  .map(result => {
    var [file, html] = result
    var $ = cheerio.load(html)

    var whitelistElements = ['a', 'span', 'button']
    var blacklistElements = ['p']
    return $('body :not(script)')
      .filter((i, elem) => {
        var tag = elem.tagName.toLowerCase();
        console.log($(elem).attr('data-xid'))
        return (blacklistElements.indexOf(tag) < 0) && (whitelistElements.indexOf(tag) >= 0 || elem.children.length === 0)
      })
      .map((i, el) => {
        var attrs = []
        for (var nm in el.attribs) {
          if(nm && nm.includes('class') ||
            nm.includes('label') ||
            nm.includes('tooltip') ||
            nm.includes('src') ||
            nm.includes('href')) {
              attrs.push(el.attribs[nm])
            }
        }
        el = $(el)
        return {
          attrs: attrs.join(','),
          // text: (',' +el.text().trim()).repeat(3),
          text: el.text().trim(),
          xid: el.attr('data-xid'),
          file: file
        }
      })
      .get()
  })



fs.writeFileSync('all-nodes.jsonl',
  documents.map(d=>JSON.stringify(d)).join('\n'))


