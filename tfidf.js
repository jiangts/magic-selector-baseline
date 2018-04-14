const natural = require('natural');
const fs = require('fs')
const stemmer = require('porter-stemmer').stemmer


const DATA_FILE = 'dataset/data/v3.jsonl'


var documents = fs.readFileSync('all-nodes.jsonl')
  .toString().split('\n').map(s=>JSON.parse(s))


var dataset = fs.readFileSync(DATA_FILE).toString().split('\n')
  .map(s => {
    try {
      return JSON.parse(s)
    } catch (err) {
      return null
    }
  })


var tokenize = s => s.replace(/([A-Z])/g, ' $1').trim()
  .toLowerCase().split(/[^\wA-Z]/g).reduce((o,e) => {
    if (e === '') return o
    // e = stemmer(e)
    if (e in o) { o[e]+=1 }
    else { o[e]=1 }
    return o
  }, {})


var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();


var tfidfMap = {}
var counter = 0

for(var i = 0; i < documents.length; i++) {
  var doc = documents[i];
  doc.map(d => {
    var words = Object.keys(tokenize(d.attrs + ',' + d.text))
    tfidf.addDocument(words)
    tfidfMap[counter] = {
      xid: d.xid,
      file: d.file
    }
    counter += 1
  })
}

for(var i = 0; i < dataset.length; i++) {
  var data = dataset[i];
  if(data) {
    var words = Object.keys(tokenize(data.phrase))
    tfidf.addDocument(words)
  }
}


fs.writeFileSync('tfidf.json', JSON.stringify(tfidf))
fs.writeFileSync('tfidf-map.json', JSON.stringify(tfidfMap))

