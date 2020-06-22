import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { FileOpener } from '@ionic-native/file-opener/ngx';

declare var window: any;
declare var cordova: any;

@Injectable({
  providedIn: 'root',
})
export class FileDownloaderService {

  constructor(
    private platform: Platform,
    private fileOpener: FileOpener,
  ) { }

  async download(url): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      const oReq = new XMLHttpRequest();
      oReq.open('GET', url, true);
      oReq.responseType = 'blob';
      oReq.onload = (oEvent) => {
        const blob = oReq.response; // Note: not oReq.responseText
        resolve(blob);
      };
      oReq.onerror = (oError) => {
        reject(oError);
      }
      oReq.send(null);
    });
  }

  async save(filename, data: Blob, mimeType: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const blob = new Blob([data], {
        type: mimeType
      });
      let storageLocation = '';
      if (this.platform.is('android')) {
        storageLocation = cordova.file.externalRootDirectory + 'Download';
      } else if (this.platform.is('ios')) {
        storageLocation = cordova.file.tempDirectory;
      } else {
        storageLocation = '/';
      }
      const folderPath = storageLocation;
      const resolveLocalFileSystemURL = window.resolveLocalFileSystemURL || window.webkitResolveLocalFileSystemURL;
      resolveLocalFileSystemURL(
        folderPath,
        (dir) => {
          dir.getFile(
            filename,
            {
              create: true
            },
            (file) => {
              file.createWriter(
                (fileWriter) => {
                  fileWriter.write(blob);
                  fileWriter.onwriteend = () => {
                    const url = file.toURL();
                    if (this.platform.is('ios')) {
                      this.fileOpener
                        .open(url, file.type);
                    }
                    resolve(url);
                  };
                  fileWriter.onerror = (err) => {
                    console.error(err);
                    reject(err);
                  };
                },
                (err) => {
                  console.error(err);
                  reject(err);
                }
              );
            },
            (err) => {
              console.error(err);
              reject(err);
            },
          );
        },
      );
    });
  }
}
