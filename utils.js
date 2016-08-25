Array.prototype.groupByUntilChanged = function(){
  return this.reduce( (acc, cur) => {
    if(!acc){
      return [[cur]];
    }

    const [lastArray, ...rest] = acc.reverse();
    const lead = rest.reverse();
    const [arrayValue, ..._] = lastArray;

    if(arrayValue === cur) {
      return lead.concat([lastArray.concat([cur])]);
    } else {
      return lead.concat([lastArray]).concat([[cur]]);
    }

    return [];
  }, undefined);
}

Array.prototype.average = function(){
  if(this.length === 0){
    return 0;
  }

  return this.reduce((acc, cur) => acc + cur, 0) / this.length;
}
