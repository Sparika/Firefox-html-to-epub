// file est le répertoire (nsIFile)
function nomsfichiers(nsIFile){
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
//Retourne l'extension du fichier.
function extension(fileName){
	var extension = "";
	chaine = fileName;
	extension = chaine.substring(chaine.lastIndexOf(".")+1); 
	return extension;	
}

//Retourne le nom du fichier sans l'extension.
function pagewithoutext(fileName){
	var nom = "";
	chaine = fileName;
	nom = chaine.substring(0,chaine.lastIndexOf(".")-1); 
	return nom;	
}
//Ajoute au fichier content.opf les références des différents fichiers. 
function addToContent(array){
/*
	var filename = "";
	var ext = "";

	var file;
      
        file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
        // file.initWithPath(METAINF_D.path);
 	var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
        file.append("content.opf"); // filename
        oFOStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
	
	var reader  = Components.classes["@mozilla.org/network/file-input-stream;1"]  
                 .createInstance(Components.interfaces.nsIFileInputStream);  
	reader.init(file, 1, 0, false);  
	

	
	 oFOStream.close();
*/ 





var doc = document.implementation.createDocument("", "", null);
var Package = doc.createElement("package");
Package.setAttribute("version","2.0");
Package.setAttribute("xmlns","http://www.idpf.org/2007/opf");
Package.setAttribute("unique-identifier","BookId");

var metadata = doc.createElement("metadata");

var title = doc.createElement("dc:title");
titleText = title.createTextNode("titleText"); // A MODIF  /*title.createTextNode n'est pas une fonction*/
title.appendChild(titleText);
var creator = doc.createElement("dc:creator");
creatorText = creator.createTextNode("creatorText"); // A MODIF
creator.appendChild(creatorText);
var language = doc.createElement("dc:language");
languageText = language.createTextNode("languageText"); // A MODIF
language.appendChild(languageText);
var rights = doc.createElement("dc:rights");
rightsText = rights.createTextNode("rightsText"); // A MODIF
rights.appendChild(rightsText);
var publisher = doc.createElement("dc:publisher");
publisherText = publisher.createTextNode("publisherText"); // A MODIF
publisher.appendChild(publisherText);

var identifier = doc.createElement("dc:identifier");
identifier.setAttribute("id","bookid");
identifierText = identifier.createTextNode("identifierText"); // A MODIF
identifier.appendChild(identifierText);

metadata.appendChild(title);
metadata.appendChild(creator);
metadata.appendChild(language);
metadata.appendChild(rights);
metadata.appendChild(publisher);
metadata.appendChild(identifier);

length = array.length;

var manifest = doc.createElement("manifest");

var spine = doc.createElement("spine");
spine.setAttribute("toc","ncx");

//var item = doc.createElement("item");
//item.setAttribute("id","ncx");
//item.setAttribute("href","toc.ncx");
//item.setAttribute("media-type","application/x-dtbncx+xml");
//manifest.appendChild(item);

for(var i = 0;i<array.length;i++){
		pageref = array[i];
		ext = extension(pageref);
		name = pagewithoutext(pageref);
		
		var item = doc.createElement("item");
		
		item.setAttribute("id",name);
		item.setAttribute("href",pageref);
		
		switch(ext){
			case "html":
				item.setAttribute("media-type","application/xhtml+xml");
				var itemspine = doc.createElement("item");
				itemspine.setAttribute("idref",name);
				spine.appendChild(itemspine);
			break;

			case "css":
				item.setAttribute("media-type","text/css");
			break;

			case "jpeg":
			      item.setAttribute("media-type","image/jpeg+xml");
			break;
			
			case "png":
			      item.setAttribute("media-type=","image/png+xml");
			break;
	      
		}//switch
		manifest.appendChild(item);
	}//for
	


Package.appendChild(metadata);
Package.appendChild(manifest);
Package.appendChild(spine);

doc.appendChild(Package);

}//addToContent