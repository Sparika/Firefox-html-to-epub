/**
 * XULSchoolChrome namespace.
 */
if ("undefined" == typeof(XULSchoolChrome)) {
  var XULSchoolChrome = {};
};

/**
 * Controls the browser overlay for the Hello World extension.
 */
XULSchoolChrome.BrowserOverlay = {
  /**
   * Says 'Hello' to the user.
   */
  sayHello : function(aEvent) {


var nsIFilePicker = Components.interfaces.nsIFilePicker;
var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
fp.init(window, "Save webpage as epub", nsIFilePicker.modeSave);
fp.appendFilter("EPUB File","*.html");

var rv = fp.show();
if (rv == fp.returnCancel) return;

if(rv == nsIFilePicker.returnOK){
file = fp.file;
var filePath = file.path;


include('chrome://jslib/content/io/file.js'); 
include('chrome://jslib/content/io/dir.js'); 


var directory_epub = new Dir(filePath);
directory_epub .create("w");



		  var file_mimetype = new File(filePath + "/mimetype");
		  file_mimetype.create();
		  file_mimetype.open('w')
		  file_mimetype.write("application/epub+zip");
		  file_mimetype.close();

var directory_OEBPS = new Dir(filePath + "/OEBPS");
directory_OEBPS .create("w");

var directory_images = new Dir(filePath + "/OEBPS" + "/images");
directory_images .create("w");

var directory_METAINF = new Dir(filePath + "/META-INF");
directory_METAINF .create("w");


  var file_container = new File(filePath + "/META-INF" + "/container.xml");
		  file_container.create();
		  file_container.open('w')
		  file_container.write("<?xml version=\"1.0\"?> \n <container version=\"1.0\" xmlns=\"urn:oasis:names:tc:opendocument:xmlns:container\"> \n <rootfiles> \n <rootfile full-path=\"OEBPS/content.opf\" \n media-type=\"application/oebps-package+xml\" /> \n </rootfiles> \n </container>");
		  file_container.close();


		  alert("5");
}


		}
      };
