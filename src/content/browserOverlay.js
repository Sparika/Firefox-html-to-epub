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
      epub = fp.file;
      var epubPath = epub.path;

    /**
     * Save html page to working directory
     */
      var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
      var tmp_D = dirService.get("TmpD", Components.interfaces.nsIFile);
      //TODO: concatenate FHtE with a random number
      tmp_D.append("FHtE");
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
	  wbp.saveDocument(window.content.document, webPageLocal, webFilesLocal, null, wbp.ENCODE_FLAGS_RAW, null);  

    /**
     * Collect files informations
     */
//TODO

    /**
     * Create XML files which are mandatory for Epub such as mimetype, toc, content, container .. 
     */
//TODO

    /**
     * Zip the whole structure without compressing the first file (mimetype)
     */
//TODO

    /**
     * Delete all temporary files
     */
        //All file have been created in temporary directory 

      /*

//TODO conservé pour ref, a nettoyer une fois devenu inutile  
      var file_mimetype = new File(filePath + "/mimetype");
	  	file_mimetype.create();
	  	file_mimetype.open('w')
	  	file_mimetype.write("application/epub+zip");
	  	file_mimetype.close();
  
      
  
      var directory_images = new Dir(filePath + "/OEBPS" + "/images");
      directory_images .create("w");
  
      
  
  
      var file_container = new File(filePath + "/META-INF" + "/container.xml");
	  	file_container.create();
	  	file_container.open('w')
	  	file_container.write("<?xml version=\"1.0\"?> \n <container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\"> \n <rootfiles> \n <rootfile full-path=\"OEBPS/content.opf\" \n media-type=\"application/oebps-package+xml\" /> \n </rootfiles> \n </container>");	     
      file_container.close();
      //Suppression des fichiers temporaires 
      var directory_TESTDIR = new Dir(filePath + "/TESTDIR");
      directory_TESTDIR.create("w");
      var dirService = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
      var homeDirFile = dirService.get("Home", Components.interfaces.nsIFile);
      var homeDir = homeDirFile.path;
  
      var file = 
      file.append("test.tmp");
      file.createUnique(Components.interfaces.nsIFile.NORMAL_FIL_TYPE, 0666);
      alert(file.path);*/
      alert("terminé avec succès");
    }
  }
};
