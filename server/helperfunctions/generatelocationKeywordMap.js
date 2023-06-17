function generatelocationKeywordMap(keywordstructure){

    let constantkeywords = keywordstructure.constantkeywords;
   let constantlocations = keywordstructure.constantlocations


   const constantkeywordsplit =  split(constantkeywords, 10);
    const locationkeywordmap = {};
   for(let i=0; i < constantkeywordsplit.length; i++){
    const keywordstringlist = constantkeywordsplit[i].join("xxxxxx")

    // locationkeywordmap
    for(let j=0; j < constantlocations.length; j++){
        const location = constantlocations[j]
        locationkeywordmap[keywordstringlist + "xxxxxx"+ location] = 1
    }
   }


   return locationkeywordmap

   
    
}

function split(a, n) {
    let newArray = [];
    let total = a;
    for (let i = 0; i < total.length; i++) {
      if (a.length <= 0) return newArray;
      newArray.push([...a.slice(0, n)]);
      a = a.slice(n);
    }
    return newArray
  }

  module.exports = {generatelocationKeywordMap};