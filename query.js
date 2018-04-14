const natural = require('natural');
const fs = require('fs')
var tokenize = require('./utils').tokenize


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


var baseline = (o) => {
  var query = tokenize(o.phrase)
  var scores = mapIdx(tfidf.tfidfs(query)).sort((a,b)=>b[0]-a[0])
  // console.log(scores)
  // var best = scores[0]
  // scores.splice(0,30).map(res => {
  //   var [score, best] = res
  //   console.log(best, score, tfidfMap[''+best])
  // })
  var results = [];
  var ranking = scores.map(s=>[s[0], s[1], tfidfMap[''+s[1]]])
  var rl = ranking.length
  for (var i = 0; i < rl; i++) {
    var [score, idx, rank] = ranking[i]
    if(rank && rank.file === o.webpage) {
      // results.push(rank)
      results.push([rank.xid, score, Object.keys(tfidf.documents[idx]).join(' ')])
      if (results.length >= 5) {
        break
      }
      // return rank.xid
    }
  }
  console.log('query', query)
  console.log(results)
  // return results[0].xid
  return results[0][0]
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
// .filter(s=>s.webpage === 'about.com')


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


