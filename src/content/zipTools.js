/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

/* Zipping functions */
const PR_RDONLY      = 0x01;
const PR_WRONLY      = 0x02;
const PR_RDWR        = 0x04;
const PR_CREATE_FILE = 0x08;
const PR_APPEND      = 0x10;
const PR_TRUNCATE    = 0x20;
const PR_SYNC        = 0x40;
const PR_EXCL        = 0x80;
 
/**
 *@function
* @param {nsIFile) source A folder containing files to compress
* @param {nsIFile} dest The destination. If the files exists, the users can choose to replace it.
* @param {nsIFile} mimetype The mimetype file wich should be added first, uncompressed.
*/
function zipFolder(source, dest, mimetype)
{
 // Create a new file
 var zipOk = true;
 
 //NS_ERROR_FILE_ALREADY_EXISTS
 //   Indicates that the file or directory already exists.
 // TODO try catch should handle both NS_ERROR_FILE_ALREADY_EXISTS and NS_ERROR_FILE_UNKNOWN_TYPE
 try{
    dest.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666); 
 }catch(err){
    if(confirm(err.message+"\n"+"This file already exists, do you want to replace it?")){
        dest.remove(false);
        dest.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666); 
    }
    else{
        zipOk = false;
    }
 }
 if(zipOk){
 var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
 var zipW = new zipWriter();
 
 zipW.open(dest, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
 // Adding mimetype as first file without compression
 zipW.addEntryFile("mimetype", Components.interfaces.nsIZipWriter.COMPRESSION_NONE, mimetype, false); 
 addFolderContentsToZip(zipW, source, "");
  
 // We don't want to block the main thread, so the zipping is done asynchronously
 // and here we get the notification that it has finished
 var observer = {
  onStartRequest: function(request, context) {},
  onStopRequest: function(request, context, status)
  {
   zipW.close();
   // Notify that we're done.
  }
 }
 
 zipW.processQueue(observer, null);
 }
}
 
/**
* @function to add the contents of a folder recursively
* @param {nsIZipWriter} zipW A nsIZipWriter object
* @param {nsIFile} folder A nsFile object pointing to a folder
* @param {String} root A string defining the relative path for this folder in the zip
*/
function addFolderContentsToZip(zipW, folder, root)
{
 var entries = folder.directoryEntries; 
 while(entries.hasMoreElements()) 
 { 
  var entry = entries.getNext(); 
  entry.QueryInterface(Ci.nsIFile);
    try{
        if (entry.isDirectory()){
            //TODO check aModTime paramater
            zipW.addEntryDirectory(root+entry.leafName+"/", 0, false);
            addFolderContentsToZip(zipW, entry, root + entry.leafName + "/");
        }
        else{
            zipW.addEntryFile(root + entry.leafName, Ci.nsIZipWriter.COMPRESSION_DEFAULT, entry, false);
        }
    }
    catch(e){}
 }
}
