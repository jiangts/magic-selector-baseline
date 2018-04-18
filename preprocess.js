const cheerio = require('cheerio');
const fs = require('fs');
const Tokenizer = require('tokenize-text');
const tokenize = require('./utils').tokenize




// const DATA_FILE = 'dataset-v3/dataset.jsonl'
// const OUTPUT_FILE = 'dataset-v3/results.jsonl'
// const PAGE_PATH = p => 'dataset-v3/pages/v3/'+p+'.html'

// const DATA_FILE = 'dataset/data/v3.jsonl'
// const PAGE_PATH = p => 'dataset/pages/v3/'+p+'.html'

const DIR = '../webrep/data/phrase-node-dataset/'
const DATA_FILE = DIR+'data/v3.jsonl'
const PAGE_PATH = p => DIR+'pages/v3/'+p+'.html'
const OUTPUT_FILE = DIR+'all-nodes.jsonl'


var dataset = fs.readFileSync(DATA_FILE).toString().split('\n')
  .map(s => {
    try {
      return JSON.parse(s)
    } catch (err) {
      return null
    }
  })
  .filter(s=>!!s)
// .filter(s=>s.webpage === 'about.com')


var files = Object.keys(dataset.reduce((o, d) => {
  if(d) o[d.webpage] = true
  return o
}, {}))


var renderMap = function(visibility) {
  visibility = visibility.info
  return visibility.reduce((o, m) => {
    if (m.attributes) {
      var xid = m.attributes['data-xid']
      if(xid) {
        o[xid] = m
      }
    }
    return o
  }, {})
}



var documents =
  files.map(f => {
    return [f, fs.readFileSync(PAGE_PATH(f)).toString()]
  })
  .map(result => {
    var [file, html] = result
    var $ = cheerio.load(html)
    var visibility = JSON.parse(fs.readFileSync('phrase-node-render-test2/info-'+file+'.html').toString())
    var renderInfo = renderMap(visibility)

    var whitelistElements = ['a', 'span', 'button']
    var blacklistElements = ['p', 'style', 'script', 'code', 'pre', 'small', 'center']
    return $('body :not(script)')
      .filter((i, elem) => {
        var tag = elem.tagName.toLowerCase();
        var xid = $(elem).attr('data-xid')
        var render = renderInfo[xid]
        var rendered = (render && 'hidden' in render // && 'topLevel' in render
        && 'width' in render && 'height' in render) ?
          // render.width fails if width is 0. same for height
          (render.width && render.height) &&
          (render.hidden === false /*&& render.topLevel === true*/) :
          true;

        var keep = rendered && (blacklistElements.indexOf(tag) < 0) && (whitelistElements.indexOf(tag) >= 0 || $(elem).children().length === 0)

        return keep
      })
      .map((i, el) => {
        var attrs = []
        for (var nm in el.attribs) {
          if(nm &&
            nm==='class' ||
            nm==='id' ||
            nm==='value' ||
            nm==='placeholder' ||
            nm==='name' ||
            nm.includes('aria') ||
            nm.includes('label') ||
            nm.includes('tooltip') ||
            nm.includes('src') ||
            nm.includes('href')) {
              attrs.push(el.attribs[nm])
            }
        }
        el = $(el)
        return {
          attrs: tokenize(attrs.join(',')),
          // text: (',' +el.text().trim()).repeat(3),
          text: tokenize(el.text().trim()),
          xid: el.attr('data-xid'),
          file: file
        }
      })
      .get()
  })



fs.writeFileSync(OUTPUT_FILE,
  documents.map(d=>JSON.stringify(d)).join('\n'))


