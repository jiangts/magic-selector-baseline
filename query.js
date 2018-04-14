const natural = require('natural');
const fs = require('fs')



var TfIdf = natural.TfIdf;
var s = fs.readFileSync('tfidf.json').toString()
var tfidf = new TfIdf(JSON.parse(s));

var tfidfMap = JSON.parse(fs.readFileSync('tfidf-map.json').toString())


function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

const mapIdx = (array) => array.map((x, i) => [x, i])



var scores = mapIdx(tfidf.tfidfs(['click', 'sign', 'in'])).sort((a,b)=>b[0]-a[0])
console.log(scores)
var best = scores[0]

scores.splice(0,30).map(res => {
  var [score, best] = res
  console.log(best, score, tfidfMap[''+best])
})


