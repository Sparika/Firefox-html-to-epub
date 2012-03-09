//file is a Directory.
function nomsfichiers(file){
  var entries = file.directoryEntries;
  var array = [];
  while(entries.hasMoreElements())
  {
    var entry = entries.getNext();
    entry.QueryInterface(Components.interfaces.nsIFile);
    array.push(entry);
  }
  return array;
}

//return the extension
function exte(fileName){
  var extension = "";
  extension = fileName.substring(fileName.lastIndexOf(".")+1);
  if (extension == "")
    return "error";
  else
    return extension;
}

//Return the filename without the extension. 
function pagewithoutext(fileName){
  var nom = "";
  nom = fileName.substring(0,fileName.lastIndexOf(".")-1); 
  return nom;	
}
