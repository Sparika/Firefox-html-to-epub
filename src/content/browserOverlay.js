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
	* |1| Ask for file name and location
	*/
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	fp.init(window, "Save webpage as epub", nsIFilePicker.modeSave);
	fp.appendFilter("EPUB File","*.html");

	var rv = fp.show();
	if (rv == fp.returnCancel) return;

	if(rv == nsIFilePicker.returnOK)
	{
	
	epub = fp.file;
	var cleanpath = epub.path;
   	cleanpath = cleanpath.replace(".epub", "", "gi");
	var epubPath = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	epubPath.initWithPath(cleanpath+".epub");
      
	var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);  
	var uri = ios.newURI("http://www.google.com/", null, null);
    
	var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"].getService(Components.interfaces.nsIUUIDGenerator);
	var uuid = uuidGenerator.generateUUID();
	var uuidString = uuid.toString();
	var uri = "urn:uuid:"+uuidString;
    
	/**
	* |2| Save the main html page and create the working directory
	*/
	var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
	var tmp_D = dirService.get("TmpD", Components.interfaces.nsIFile);
      
	tmp_D.append("FHtE"+uuidString);
	if( !tmp_D.exists() || !tmp_D.isDirectory() ) {   // if it doesn't exist, create  
		tmp_D.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
	}
	
	//Create OEBPS Folder (cloning nsIFile then append)
	var OEBPS_D = tmp_D.clone();
	OEBPS_D.append("OEBPS");
	if( !OEBPS_D.exists() || !OEBPS_D.isDirectory() ) {   // if it doesn't exist, create  
		OEBPS_D.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
	} 
	 
	//Create METAINF Folder (cloning nsIFile then append)
	var METAINF_D = tmp_D.clone();
	METAINF_D.append("META-INF");
	if( !METAINF_D.exists() || !METAINF_D.isDirectory() ) {   // if it doesn't exist, create  
		METAINF_D.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
	}  
    
	//Save webPage.html (the main page of the epub)
	var webPage = OEBPS_D.clone();
	webPage.append("webPage.html");
	var webPageLocal = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	webPageLocal.initWithPath(webPage.path);
      
      	//Create Files Folder (that contains all the linked file of the epub)
	var webFiles = OEBPS_D.clone();
	webFiles.append("Files");
	var webFilesLocal = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	webFilesLocal.initWithPath(webFiles.path);

	var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
	//wbp.persistFlags=PERSIST_FLAGS_IGNORE_REDIRECTED_DATA | PERSIST_FLAGS_IGNORE_IFRAMES;
	wbp.saveDocument(window.content.document, webPageLocal, webFilesLocal, null, wbp.ENCODE_FLAGS_RAW, null);

	alert("TOOOOOOOOOOOOOOTOOOOOOOOOOOOOOOO");

	/**
	* |3| Create XML files which are mandatory for Epub such as mimetype, toc, content, container .. 
	*/
	// mimetype
	var minetypePtr = createMimetypeFile(tmp_D.path);
	// container.xml
	createContainerFile(METAINF_D.path);
	// content.opf
	createContentFile(OEBPS_D.path);
	// toc.ncx
	createTocFile(OEBPS_D.path);

	/**
	* Zip the whole structure without compressing the first file (mimetype)
	*/
	zipFolder(tmp_D, epubPath, minetypePtr);

	/**
	* Delete all temporary files
	*/
	//All file have been created in temporary directory
	alert("EXIT SUCCESS");
    }
  }
};
