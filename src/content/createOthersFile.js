/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

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
      //doc
      (new XMLSerializer()).serializeToStream(doc, oFOStream, "");  
      oFOStream.close();
      return file;
}
