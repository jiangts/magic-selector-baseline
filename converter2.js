const fs = require('fs');

const INPUT_FILE = 'dataset/tfidf-results.jsonl'


var dataset = fs.readFileSync(INPUT_FILE).toString().split('\n')
  .map(s => {
    try {
      return JSON.parse(s)
    } catch (err) {
      return null
    }
  })


var currentSite = null;
var currArr = []
for(var i = 0; i < dataset.length; i++) {
  var datum = dataset[i]
  if (currentSite == null) {
    currentSite = datum.webpage
    currArr = []
  }
  if (currentSite == datum.webpage) {
    currArr.push({xid: datum.xid, answers: [
      {phrase: datum.phrase},
      {type:'prediction',xid:datum.prediction}
    ]})
  } else {
    fs.writeFileSync('answers/ans-'+currentSite+'.json', JSON.stringify(currArr))
    currentSite = datum.webpage
    currArr = []
  }
}


