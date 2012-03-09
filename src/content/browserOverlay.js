/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/NetUtil.jsm");  
Components.utils.import("resource://gre/modules/FileUtils.jsm"); 
/**
 * XULfhte namespace.
 */
if ("undefined" == typeof(XULFHtEChrome)) {
  var XULFHtEChrome = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
XULFHtEChrome.BrowserOverlay = {
  /**
   * Save current web page to epub format
   */
  doWork : function(aEvent) {

    /**
     * Ask for file name and location
     */
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Save webpage as epub", nsIFilePicker.modeSave);
    fp.appendFilter("EPUB File","*.html");

    var rv = fp.show();
    if (rv == fp.returnCancel) return;

    if(rv == nsIFilePicker.returnOK){
      if(rv == nsIFilePicker.returnOK){
      epub = fp.file;
      var cleanpath = epub.path;
      cleanpath = cleanpath.replace(".epub", "", "gi");
      var epubPath = Components.classes["@mozilla.org/file/local;1"]
	.createInstance(Components.interfaces.nsILocalFile);
      epubPath.initWithPath(cleanpath+".epub");
      
      var ios = Components.classes['@mozilla.org/network/io-service;1']  
        .getService(Components.interfaces.nsIIOService);  
       var uri = ios.newURI("http://www.google.com/", null, null);
    
    var uuidGenerator =  
    Components.classes["@mozilla.org/uuid-generator;1"].getService(Components.interfaces.nsIUUIDGenerator);
    var uuid = uuidGenerator.generateUUID();
    var uuidString = uuid.toString();
    var uri = "urn:uuid:"+uuidString;
    
    //alert(buffer.toString());
    /**
     * Save html page to working directory
     */
      var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
      var tmp_D = dirService.get("TmpD", Components.interfaces.nsIFile);
      //TODO: concatenate FHtE with a random number
      tmp_D.append("FHtE"+uuidString);
      if( !tmp_D.exists() || !tmp_D.isDirectory() ) {   // if it doesn't exist, create  
        tmp_D.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
      }
      //clone nsIFile then append
      var OEBPS_D = tmp_D.clone();
      OEBPS_D.append("OEBPS");
      if( !OEBPS_D.exists() || !OEBPS_D.isDirectory() ) {   // if it doesn't exist, create  
        OEBPS_D.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
      }  
      //clone nsIFile then append
      var METAINF_D = tmp_D.clone();
      METAINF_D.append("META-INF");
      if( !METAINF_D.exists() || !METAINF_D.isDirectory() ) {   // if it doesn't exist, create  
        METAINF_D.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
      }  
    
      //save web page
      var webPage = OEBPS_D.clone();
      //var webFiles = OEBPS_D.clone();
      webPage.append("webPage.html");
      var webPageLocal = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);
      webPageLocal.initWithPath(webPage.path);
      //webPage.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);
      //webPage.QueryInterface(Components.interfaces.nsILocalFile);
      
      var webFiles = OEBPS_D.clone();
      webFiles.append("Files");
      var webFilesLocal = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsILocalFile);
      webFilesLocal.initWithPath(webFiles.path);
      /*webFiles.append("Files");
      if( !webFiles.exists() || !webFiles.isDirectory() ) {   // if it doesn't exist, create  
        webFiles.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
      }*/
      var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']  
		      .createInstance(Components.interfaces.nsIWebBrowserPersist);
	  //wbp.persistFlags=PERSIST_FLAGS_IGNORE_REDIRECTED_DATA | PERSIST_FLAGS_IGNORE_IFRAMES;
	  wbp.saveDocument(window.content.document, webPageLocal, webFilesLocal, null, wbp.ENCODE_FLAGS_RAW, null);

    /**
     * Collect files informations
     */
      var array = [];
      if (webFiles.exists()){
	var entries = webFiles.directoryEntries;
	//var array = [];  
	while(entries.hasMoreElements())  
	{
	  var entry = entries.getNext();  
	  entry.QueryInterface(Components.interfaces.nsIFile);  
	  array.push(entry);
	}
      }
    /**
     * Create XML files which are mandatory for Epub such as mimetype, toc, content, container .. 
     */
    // mimetype
      var mimetype = tmp_D.clone();
      mimetype.append("mimetype");
      var ostream = FileUtils.openSafeFileOutputStream(mimetype);  
  
      var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].  
                      createInstance(Components.interfaces.nsIScriptableUnicodeConverter);  
      converter.charset = "UTF-8";  
      var istream = converter.convertToInputStream("application/epub+zip");    
      NetUtil.asyncCopy(istream, ostream);

    // var file will be reused for each files
      var file;
      
    // container.xml
      file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(METAINF_D.path);
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
      
    // content.opf
      file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(OEBPS_D.path);
      var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);   
      file.append("content.opf"); // filename  
      oFOStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
      /*fill content.opf*/
      
      var doc = document.implementation.createDocument("", "", null);
      var Package = doc.createElement("package");
      Package.setAttribute("version","2.0");
      Package.setAttribute("xmlns","http://www.idpf.org/2007/opf");
      Package.setAttribute("unique-identifier","BookId");
      
      var metadata = doc.createElement("metadata");

      var title = doc.createElement("dc:title");
      title.appendChild(doc.createTextNode("titleText"));
      
      var creator = doc.createElement("dc:creator");
      creator.appendChild(doc.createTextNode("creatorText")); 
      
      var language = doc.createElement("dc:language");
      language.appendChild(doc.createTextNode("languageText")); 

      var rights = doc.createElement("dc:rights");
      rights.appendChild(doc.createTextNode("rightsText")); 

      var publisher = doc.createElement("dc:publisher");
      publisher.appendChild(doc.createTextNode("publisherText")); 

      var identifier = doc.createElement("dc:identifier");
      identifier.appendChild(doc.createTextNode(uri)); 
      
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

      var itemSpine = doc.createElement("item");
      itemSpine.setAttribute("id","ncx");
      itemSpine.setAttribute("href","toc.ncx");
      itemSpine.setAttribute("media-type","application/x-dtbncx+xml");
      manifest.appendChild(itemSpine);
      
      alert("Il y a  : "+length+" Elements");
      
      for(var i = 0;i<array.length;i++)
      {
	pageref = array[i];
	alert("NSIFILE NUMERO "+i+" : "+ pageref);
	pageref = pageref.leafName;
	
	var name = pagewithoutext(pageref);
	var ext = exte(pageref);
	alert("PAGEREF : "+pageref+" NAME : "+name+" EXT : "+ext);
	if (ext == "html")
	{
	  var item = doc.createElement("item");
	  item.setAttribute("id",name);
	  item.setAttribute("href",pageref);  
	  item.setAttribute("media-type","application/xhtml+xml");
	  var itemspine = doc.createElement("item");
	  itemspine.setAttribute("idref",name);
	  spine.appendChild(itemspine);
	  manifest.appendChild(item);
	}
	else if (ext == "css")
	{
	  var item = doc.createElement("item");
	  item.setAttribute("id",name);
	  item.setAttribute("href",pageref);
	  item.setAttribute("media-type","text/css");
	  manifest.appendChild(item);
	}
	else if (ext == "jpeg")
	{
	  var item = doc.createElement("item");
	  item.setAttribute("id",name);
	  item.setAttribute("href",pageref);
	  item.setAttribute("media-type","image/jpeg+xml");
	  manifest.appendChild(item);
	}
	else if (ext == "png")
	{
	  var item = doc.createElement("item");
	  item.setAttribute("id",name);
	  item.setAttribute("href",pageref);
	  item.setAttribute("media-type","image/png+xml");
	  manifest.appendChild(item);
	}
	else
	{
	  var item = doc.createElement("item");
	  item.setAttribute("id",name);
	  item.setAttribute("href",pageref);
	  item.setAttribute("media-type","text/plain");
	  manifest.appendChild(item);
	}	
      }//for
      
      Package.appendChild(metadata);
      Package.appendChild(manifest);
      Package.appendChild(spine);
      doc.appendChild(Package);
      
      (new XMLSerializer()).serializeToStream(doc, oFOStream, "");  
      oFOStream.close();
      
    // toc.ncx
      file = Components.classes["@mozilla.org/file/local;1"]
             .createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(OEBPS_D.path);
      var oFOStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);   
      file.append("toc.ncx"); // filename  
      oFOStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
      //doc
      (new XMLSerializer()).serializeToStream(doc, oFOStream, "");  
      oFOStream.close();
      
      
      alert("Avant zippage");
      
    /**
     * Zip the whole structure without compressing the first file (mimetype)
     */
      zipFolder(tmp_D, epubPath, mimetype);

    /**
     * Delete all temporary files
     */
        //All file have been created in temporary directory
	
	
      alert("terminé avec succès");
    }
  }
  }
};
