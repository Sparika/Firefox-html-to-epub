/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ncx_NS = "http://www.daisy.org/z3986/2005/ncx/";

/**
* @function to create and fill the minetype file
* @param {String} folderPath A string defining the OEBPS path to save the content.opf
* @return {nsIFile} An nsIFile pointing on minetype
*/
function createMimetypeFile(folderPath)
{
      var file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(folderPath);
      file.append("mimetype");
      var ostream = FileUtils.openSafeFileOutputStream(file);  
  
      var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].  
                      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);  
      converter.charset = "UTF-8";  
      var istream = converter.convertToInputStream("application/epub+zip");    
      NetUtil.asyncCopy(istream, ostream);
      return file;
}

/**
* @function to create and fill the container.xml file
* @param {String} folderPath A string defining the OEBPS path to save the content.opf
* @return {nsIFile} An nsIFile pointing on container.xml
*/
function createContainerFile(folderPath)
{
      var file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(folderPath);
      var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);   
      file.append("container.xml"); // filename  
      oFOStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
      
      //Append XML versions (seems to not be added without this code)
      var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
                createInstance(Components.interfaces.nsIConverterOutputStream);  
      converter.init(oFOStream, "UTF-8", 0, 0);  
      converter.writeString("<?xml version=\"1.0\"?>");  

      //create DOM doc
      var doc = document.implementation.createDocument("", "", null);
      var container = doc.createElement("container");
      container.setAttribute("version", "1.0");
      var rootfiles = doc.createElement("rootfiles");
      var rootfile1 = doc.createElement("rootfile");
      rootfile1.setAttribute("full-path", "OEBPS/content.opf");
      rootfile1.setAttribute("media-type", "application/oebps-package+xml");
      rootfiles.appendChild(rootfile1);
      container.appendChild(rootfiles);
      doc.appendChild(container);

      (new XMLSerializer()).serializeToStream(doc, oFOStream, "");  
      oFOStream.close();
      return file;
}

/**
* @function to create and fill the toc.ncx file
* @param {String} folderPath A string defining the OEBPS path to save the content.opf
* @return {nsIFile} An nsIFile pointing on toc.ncx
*/
function createTocFile(folderPath)
{
      var file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(folderPath);
      var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream); 
      file.append("toc.ncx"); // filename  
      oFOStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
      var doc = document.implementation.createDocument("", "", null);
      
      //Append XML versions (seems to not be added without this code)
      var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
                createInstance(Components.interfaces.nsIConverterOutputStream);  
      converter.init(oFOStream, "UTF-8", 0, 0);  
      converter.writeString("<?xml version=\"1.0\"?>");  

     /*fill toc.ncx*/
      var doc = document.implementation.createDocument("", "", null);
      var ncx = doc.createElementNS(ncx_NS,"ncx");
      //ncx.setAttribute("xmlns","http://www.daisy.org/z3986/2005/ncx/");
      ncx.setAttributeNS(null,"version","2005-1");
      
      var head = doc.createElementNS(ncx_NS,"head");
      
      var meta = doc.createElementNS(ncx_NS,"meta");
      meta.setAttributeNS(null,"name","dtb:uid");
      meta.setAttributeNS(null,"content","http://sparika.github.com/Firefox-html-to-epub/");
      
      var meta1 = doc.createElementNS(ncx_NS,"meta");
      meta1.setAttributeNS(null,"name","dtb:depht");
      meta1.setAttributeNS(null,"content","2");
      
      var meta2 = doc.createElementNS(ncx_NS,"meta");
      meta2.setAttributeNS(null,"name","dtb:totalPageCount");
      meta2.setAttributeNS(null,"content","0");
      
      var meta3 = doc.createElementNS(ncx_NS,"meta");
      meta3.setAttributeNS(null,"name","dtb:maxPageNumber");
      meta3.setAttributeNS(null,"content","0");
      
      head.appendChild(meta);
      head.appendChild(meta1);
      head.appendChild(meta2);
      head.appendChild(meta3);
      
      var docTitle = doc.createElementNS(ncx_NS,"docTitle");
      var text = doc.createElementNS(ncx_NS,"text");
      text.appendChild( doc.createTextNode("Epub page"));
      
      docTitle.appendChild(text);
      
      var navMap = doc.createElementNS(ncx_NS,"navMap");
      
      var navPoint = doc.createElementNS(ncx_NS,"navPoint");
      navPoint.setAttributeNS(null,"id","WebPage");
      navPoint.setAttributeNS(null,"playOrder","1");
      
      var navLabel = doc.createElementNS(ncx_NS,"navLabel");
      var text1 = doc.createElementNS(ncx_NS,"text");
      text1.appendChild(doc.createTextNode("Page"));
      navLabel.appendChild(text1);
      
      var content = doc.createElementNS(ncx_NS,"content");
      content.setAttributeNS(null,"src","webPage.html");
      
      navPoint.appendChild(navLabel);
      navPoint.appendChild(content);
      
      navMap.appendChild(navPoint);
      
      ncx.appendChild(head);
      ncx.appendChild(docTitle);
      ncx.appendChild(navMap);

      doc.appendChild(ncx);

      (new XMLSerializer()).serializeToStream(doc, oFOStream, "");  
      oFOStream.close();
      return file;
}
