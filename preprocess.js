const cheerio = require('cheerio');
const fs = require('fs');
const Tokenizer = require('tokenize-text');
const tokenize = require('./utils').tokenize
const { DIR, DATA_FILE, PAGE_PATH, PREPROCESS_OUTPUT } = require('./files')






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


var files = dataset.reduce((o, d) => {
  if(d) o[d.webpage] = d.version
  return o
}, {})


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


var yuckimperative = []
for(var webpage in files) {
  const version = files[webpage]
  return yuckimperative.push([webpage, fs.readFileSync(PAGE_PATH(version, webpage)).toString()])
}

var documents =
  yuckimperative
  .map(result => {
    var [file, html] = result
    var $ = cheerio.load(html)
    // var visibility = JSON.parse(fs.readFileSync('phrase-node-render-test2/info-'+file+'.html').toString())
    // var renderInfo = renderMap(visibility)

    var whitelistElements = ['a', 'span', 'button']
    var blacklistElements = ['p', 'style', 'script', 'code', 'pre', 'small', 'center']
    return $('body :not(script)')
      .filter((i, elem) => {
        var tag = elem.tagName.toLowerCase();
        var xid = $(elem).attr('data-xid')
        // var render = renderInfo[xid]
        // var rendered = (render && 'hidden' in render // && 'topLevel' in render
        // && 'width' in render && 'height' in render) ?
        //   // render.width fails if width is 0. same for height
        //   (render.width && render.height) &&
        //   (render.hidden === false /*&& render.topLevel === true*/) :
        //   true;
        var rendered = true

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



fs.writeFileSync(PREPROCESS_OUTPUT,
  documents.map(d=>JSON.stringify(d)).join('\n'))


