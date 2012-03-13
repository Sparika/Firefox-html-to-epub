/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

  var opf_NS = "http://www.idpf.org/2007/opf";
  var dc_NS = "http://purl.org/dc/elements/1.1/";

/**
* @function to get the extension of a file
* @param {String} file A string defining the a fileName
* @return {String} The extension of the file
*/
function getExtension(fileName){
  var extension = fileName.substring(fileName.lastIndexOf(".")+1);
  if (extension == "")
    return "error";
  else
    return extension;
}

/**
* @function to get the baseName of a file
* @param {String} file A string defining the a fileName
* @return {String} The filename without the extension. 
*/
function getBaseName(fileName){
  return fileName.substring(0,fileName.lastIndexOf(".")-1); 
}

/**
* @function to add the contents of a folder recursively
* @param {???} manifestDomElement A Dom Element object
* @param {???} spineDomElement A Dom Element object
* @param {nsIFile} nsiFolder A nsFile object pointing to a folder
* @param {String} root A string defining the relative path for this folder in the zip
*/
function addToManifest(manifestDomElement, spineDomElement, nsiFolder, root)
{
  //Get all entries from the folder 
  var entries = nsiFolder.directoryEntries;
  while(entries.hasMoreElements()) 
  {
    var entry = entries.getNext(); 
    entry.QueryInterface(Components.interfaces.nsIFile);
    try{
    if (entry.isDirectory())
    {
      //alert("EXPLODE : "+ entry.leafName);
      addToManifest(manifestDomElement, spineDomElement, entry, root + entry.leafName + "/");
    }
    else
    {
      pageref = entry.leafName;
      var doc = document.implementation.createDocument("", "", null);
      var basicName = getBaseName(pageref);
      var ext = getExtension(pageref);
      var item = doc.createElement("item");

      //alert("DEBUG : "+pageref+" NAME : "+basicName+" EXT : "+ext);
      
      item.setAttribute("id",basicName);
      item.setAttribute("href",root+pageref);
      
      if (ext == "html" || ext == "xhtml" )
      {
	item.setAttribute("media-type","application/xhtml+xml");
	var itemSpine = doc.createElement("itemref");
	itemSpine.setAttribute("idref",basicName);
	spineDomElement.appendChild(itemSpine);
      }
      else if (ext == "css")
      {
	item.setAttribute("media-type","text/css");
      }
      else if (ext == "jpeg")
      {
	item.setAttribute("media-type","image/jpeg+xml");
      }
      else if (ext == "png")
      {
	item.setAttribute("media-type","image/png+xml");
      }
      else
      {
	item.setAttribute("media-type","text/plain");
      }
      manifestDomElement.appendChild(item);
    }
    }
    catch(e){
      alert("DEBUG ERROR : "+e)
    }
  }
}

/**
* @function to create and fill the content.opf file
* @param {String} OEBPSPath A string defining the OEBPS path to save the content.opf
* @return {nsIFile} An nsIFile pointing on content.opf
*/
function createContentFile(OEBPSPath)
{  
      var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(OEBPSPath);

      var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);   
      file.append("content.opf"); // filename  
      oFOStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate

      /*fill content.opf*/
      var doc = document.implementation.createDocument("", "", null);
      var Package = doc.createElementNS(opf_NS,"package");
      Package.setAttributeNS(null,"version","2.0");
      //Package.setAttribute("xmlns","http://www.idpf.org/2007/opf");
      Package.setAttributeNS(null,"unique-identifier","BookId");
      var metadata = doc.createElementNS(opf_NS,"metadata");

      var title = doc.createElementNS(dc_NS,"dc:title");
      title.appendChild(doc.createTextNode("titleText"));
      var creator = doc.createElementNS(dc_NS,"dc:creator");
      creator.appendChild(doc.createTextNode("creatorText")); 
      var language = doc.createElementNS(dc_NS,"dc:language");
      language.appendChild(doc.createTextNode("languageText")); 
      var rights = doc.createElementNS(dc_NS,"dc:rights");
      rights.appendChild(doc.createTextNode("rightsText")); 
      var publisher = doc.createElementNS(dc_NS,"dc:publisher");
      publisher.appendChild(doc.createTextNode("publisherText")); 
      var identifier = doc.createElementNS(dc_NS,"dc:identifier");
      identifier.appendChild(doc.createTextNode("dc:identifier")); 

      metadata.appendChild(title);
      metadata.appendChild(creator);
      metadata.appendChild(language);
      metadata.appendChild(rights);
      metadata.appendChild(publisher);
      metadata.appendChild(identifier);

      var manifest = doc.createElementNS(opf_NS,"manifest");

      var spine = doc.createElementNS(opf_NS,"spine");
      spine.setAttribute("toc","ncx");

      var itemSpine = doc.createElement("item");
      itemSpine.setAttribute("id","ncx");
      itemSpine.setAttribute("href","toc.ncx");
      itemSpine.setAttribute("media-type","application/x-dtbncx+xml");
      manifest.appendChild(itemSpine);
      
      var itemWebPage = doc.createElement("item");
      itemWebPage.setAttribute("id","webPage");
      itemWebPage.setAttribute("href","webPage.html");
      itemWebPage.setAttribute("media-type","application/xhtml+xml");
      manifest.appendChild(itemWebPage);
      var itemSpine = doc.createElement("itemref");
      itemSpine.setAttribute("idref","webPage");
      spine.appendChild(itemSpine);
      
      var nsiFolder = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
      nsiFolder.initWithPath(OEBPSPath);
      nsiFolder.append("Files");  
      //Add all the file in the nsiFolder in manifest (and spine if html).
      addToManifest(manifest, spine, nsiFolder, nsiFolder.leafName+"/")
      
      Package.appendChild(metadata);
      Package.appendChild(manifest);
      Package.appendChild(spine);
      doc.appendChild(Package);

      (new XMLSerializer()).serializeToStream(doc, oFOStream, "");  
      oFOStream.close();
      return file;
}
