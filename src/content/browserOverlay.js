/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

Components.utils.import("resource://gre/modules/NetUtil.jsm");
Components.utils.import("resource://gre/modules/FileUtils.jsm");

var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"].getService(Components.interfaces.nsIUUIDGenerator);
var uuid = uuidGenerator.generateUUID();
var uuidString = uuid.toString();
var uri = "urn:uuid:"+uuidString;
    uri = uri.replace("{", "", "gi");
    uri = uri.replace("}", "", "gi");

/**
 * XULfhte namespace.
 */
if ("undefined" == typeof(XULFHtEChrome)) {
	var XULFHtEChrome = {};
};

/**
 * Controls the browser overlay for the extension.
 */
XULFHtEChrome.BrowserOverlay = {
    /**
  * Save current web page to epub format
  */
  doWork : function(aEvent) {
    savePage();
  }
};
  // nsIFile :
  var tmp_D; //System's temorary directory
  var epubPath; //path to the EPUB to be created
  var METAINF_D; //METAINF directory
  var OEPBS_D; //OEPBS directory
  var mimetypePtr; //mimetype file
  
  var wbp; //nsIWebBrowserPersist object
  
  const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;  
  const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;  

  var myListener =  {
    QueryInterface: function(aIID)  
    {  
     if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||  
	 aIID.equals(Components.interfaces.nsISupportsWeakReference) ||  
	 aIID.equals(Components.interfaces.nsISupports))  
       return this;  
     throw Components.results.NS_NOINTERFACE;  
    },  
    
    onStateChange: function(aWebProgress, aRequest, aFlag, aStatus)  
    {  
     // If you use myListener for more than one tab/window, use  
     // aWebProgress.DOMWindow to obtain the tab/window which triggers the state change  
     if(aFlag & Components.interfaces.nsIWebProgressListener.STATE_START)  
     {  
       // This fires when the load event is initiated  
     }  
     if(aFlag & Components.interfaces.nsIWebProgressListener.STATE_STOP)  
     {
      if (aFlag & Components.interfaces.nsIWebProgressListener.STATE_IS_NETWORK)
	// This fires when the load finishes
	createEPUB();
     }  
    },  
    
    onLocationChange: function(aProgress, aRequest, aURI) {  },  
    
    // For definitions of the remaining functions see related documentation  
    onProgressChange: function(aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot) { },  
    onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) { },  
    onSecurityChange: function(aWebProgress, aRequest, aState) { }  
  }
  
function savePage(){
    /**
    * |1| Ask for file name and location
    */
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    fp.init(window, "Save webpage as epub", nsIFilePicker.modeSave);
    fp.appendFilter("EPUB File","*.epub");
  
    var rv = fp.show();
    if (rv == fp.returnCancel) return;
  
    if(rv == nsIFilePicker.returnOK)
    {
    
    epub = fp.file;
    var cleanpath = epub.path;
    cleanpath = cleanpath.replace(".epub", "", "gi");
    epubPath = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
    epubPath.initWithPath(cleanpath+".epub");
  
    var ios = Components.classes['@mozilla.org/network/io-service;1'].getService(Components.interfaces.nsIIOService);  
  
    /**
    * |2| Save the main html page and create the working directory
    */
    var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
    tmp_D = dirService.get("TmpD", Components.interfaces.nsIFile);
  
    tmp_D.append("FHtE"+uuidString);
    if( !tmp_D.exists() || !tmp_D.isDirectory() ) {   // if it doesn't exist, create  
	    tmp_D.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
    }
    
    //Create OEBPS Folder (cloning nsIFile then append)
    OEBPS_D = tmp_D.clone();
    OEBPS_D.append("OEBPS");
    if( !OEBPS_D.exists() || !OEBPS_D.isDirectory() ) {   // if it doesn't exist, create  
	    OEBPS_D.createUnique(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);  
    } 
     
    //Create METAINF Folder (cloning nsIFile then append)
    METAINF_D = tmp_D.clone();
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
    wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1'].createInstance(Components.interfaces.nsIWebBrowserPersist);
    //There isn't a addProgressListner for WebBrowserPersist    
    wbp.progressListener = myListener;
    wbp.saveDocument(window.content.document, webPageLocal, webFilesLocal, null, null, null);
    //ISSUE : We need to wait for the saveDocument to be completed.

  }
}
  
function createEPUB(){
  /**
  * |3| Create XML files which are mandatory for Epub such as mimetype, toc, content, container .. 
  */
  //There isn't a removeProgressListner for WebBrowserPersist
  //wbp.progressListener = null;
  // mimetype
  mimetypePtr = createMimetypeFile(tmp_D.path);
  // container.xml
  createContainerFile(METAINF_D.path);
  // content.opf
  createContentFile(OEBPS_D.path, uri);
  // toc.ncx
  createTocFile(OEBPS_D.path);

  /**
  * Zip the whole structure without compressing the first file (mimetype)
  */
  zipFolder(tmp_D, epubPath, mimetypePtr);

  /**
  * Delete all temporary files
  */
  //All file have been created in temporary directory
  //alert("EXIT SUCCESS");
}