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
* source is a nsFile pointing to a folder
* dest is a zip nsIFile
*/
function zipFolder(source, dest)
{
 // Create a new file
 dest.create(Ci.nsIFile.NORMAL_FILE_TYPE, 0666); 
  
 var zipWriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
 var zipW = new zipWriter();
  
 zipW.open(dest, PR_RDWR | PR_CREATE_FILE | PR_TRUNCATE);
  
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
 
/**
* function to add the contents of a folder recursively
* zipW a nsIZipWriter object
* folder a nsFile object pointing to a folder
* root a string defining the relative path for this folder in the zip
*/
function addFolderContentsToZip(zipW, folder, root)
{
 var entries = folder.directoryEntries; 
 while(entries.hasMoreElements()) 
 { 
  var entry = entries.getNext(); 
  entry.QueryInterface(Ci.nsIFile); 
  zipW.addEntryFile(root + entry.leafName, Ci.nsIZipWriter.COMPRESSION_DEFAULT, entry, true);
  if (entry.isDirectory())
   addFolderContentsToZip(zipW, entry, root + entry.leafName + "/");
 }
}
