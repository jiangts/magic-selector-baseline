const natural = require('natural');
const fs = require('fs')
const tokenize = require('./utils').tokenize


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
  .filter(s=>!!s)
//.filter(s=>s.webpage === 'about.com')



var TfIdf = natural.TfIdf;
var tfidf = new TfIdf();


var tfidfMap = {}
var counter = 0

for(var i = 0; i < documents.length; i++) {
  var doc = documents[i];
  doc.map(d => {
    //var words = d.attrs + ',' + d.text
    var words = d.text
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
    var words = tokenize((data.phrase+' ').repeat(3) + data.attrs)
    tfidf.addDocument(words)
  }
}


fs.writeFileSync('tfidf.json', JSON.stringify(tfidf))
fs.writeFileSync('tfidf-map.json', JSON.stringify(tfidfMap))

