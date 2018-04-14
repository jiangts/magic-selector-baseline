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
for(var i = 0; i < dataset.length; i++) {
  var datum = dataset[i]
  if (currentSite == null) {
    currentSite = {
      webpage: datum.webpage,
      answers: [],
      special: []
    }
  }
  if (currentSite.webpage == datum.webpage) {
    currentSite.answers.push(datum)
    currentSite.special.push({type:'prediction',xid:datum.prediction})
  } else {
    var page = currentSite.webpage
    fs.writeFileSync('answers/ans-'+page+'.json', JSON.stringify(currentSite))
    currentSite = {
      webpage: datum.webpage,
      answers: [],
      special: []
    }
  }
}


