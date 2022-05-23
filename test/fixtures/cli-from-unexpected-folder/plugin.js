module.exports = function(){
  return function(files){
    files['empty.json'].contents = Buffer.from(JSON.stringify({"result":"success"}));
  };
};
