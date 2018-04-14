const natural = require('natural');
const fs = require('fs')


const DATA_FILE = 'dataset/data/v3.jsonl'
const OUTPUT_FILE = 'dataset/tfidf-results.jsonl'


var TfIdf = natural.TfIdf;
var s = fs.readFileSync('tfidf.json').toString()
var tfidf = new TfIdf(JSON.parse(s));

var tfidfMap = JSON.parse(fs.readFileSync('tfidf-map.json').toString())


function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

const mapIdx = (array) => array.map((x, i) => [x, i])


var tokenize = s => s.replace(/([A-Z])/g, ' $1').trim()
  .toLowerCase().split(/[^\wA-Z]/g).reduce((o,e) => {
    if (e === '') return o
    // e = stemmer(e)
    if (e in o) { o[e]+=1 }
    else { o[e]=1 }
    return o
  }, {})


var baseline = (o) => {
  var query = Object.keys(tokenize(o.phrase))
  var scores = mapIdx(tfidf.tfidfs(query)).sort((a,b)=>b[0]-a[0])
  // console.log(scores)
  // var best = scores[0]
  // scores.splice(0,30).map(res => {
  //   var [score, best] = res
  //   console.log(best, score, tfidfMap[''+best])
  // })
  var ranking = scores.map(s=>tfidfMap[''+s[1]])
  var rl = ranking.length
  for (var i = 0; i < rl; i++) {
    var rank = ranking[i]
    if(rank && rank.file === o.webpage) {
      return rank.xid
    }
  }
}




var dataset = fs.readFileSync(DATA_FILE).toString().split('\n')
  .map(s=>{
    try {
      return JSON.parse(s)
    } catch (err) {
      return null
    }
  })
  .filter(s=>!!s)


var results = dataset
  .map(o=>{
    var prediction = baseline(o)
    var match = prediction === (''+o.xid)
    console.log(`${match}\t${prediction}\t${o.xid}`)
    o.prediction = prediction
    return o
  })

var check = (actual, predicted) => {
  return predicted === actual
  // return (predicted >= actual-2 && predicted <= actual+2)
}

var correct = results.reduce((s, n) => s+=check(n.xid, parseInt(n.prediction)), 0)
var total = results.length

console.log('correct:', correct, '\ntotal:',total, '\naccuracy', correct/total);

fs.writeFileSync(OUTPUT_FILE, results.map(o=>JSON.stringify(o)).join('\n'))


