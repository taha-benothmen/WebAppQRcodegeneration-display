import { AfterViewInit, Component } from '@angular/core';
import { LoginQrCodeService } from '../../../services/login-qr-code.service';

@Component({
  selector: 'app-display',
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.scss'],
})
export class DisplayComponent implements AfterViewInit {
  constructor(private loginQrCodeService: LoginQrCodeService) {}

  ngAfterViewInit(): void {
    this.initialQrCodesDisplay();
  }

  codesList: any[] = [];

  /// ! Qr codes display handler
  initialQrCodesDisplay = () => {
    //handling the service call

    this.loginQrCodeService.getAllQrCodes().subscribe({
      next: (response) => {
        console.log(response);
        this.codesList = response;
      },
      error: (error) => {
        console.log(error);
        alert('error loading QR codes, please check internet & try again.');
      },
    });
  };

  // *download QR code function
  saveAsImage(fileType: string, index: number) {
    // fetches base 64 date from image
    const canvasElement = document.querySelectorAll('canvas')[
      index
    ] as HTMLCanvasElement;
    const dataUrl = canvasElement.toDataURL();

    // converts base 64 encoded image to blobData
    let blobData = this.convertBase64ToBlob(dataUrl);

    // saves as image
    const nav = window.navigator as any;
    if (window.navigator && nav.msSaveOrOpenBlob) {
      //IE
      nav.msSaveOrOpenBlob(blobData, 'Qrcode');
    } else {
      // chrome
      const blob = new Blob([blobData], { type: fileType });
      const url = window.URL.createObjectURL(blob);
      // window.open(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'qr-code';
      link.click();
    }
  }

  private convertBase64ToBlob(Base64Image: any) {
    // SPLIT INTO TWO PARTS
    const parts = Base64Image.split(';base64,');
    // HOLD THE CONTENT TYPE
    const imageType = parts[0].split(':')[1];
    // DECODE BASE64 STRING
    const decodedData = window.atob(parts[1]);
    // CREATE UNIT8ARRAY OF SIZE SAME AS ROW DATA LENGTH
    const uInt8Array = new Uint8Array(decodedData.length);
    // INSERT ALL CHARACTER CODE INTO UINT8ARRAY
    for (let i = 0; i < decodedData.length; ++i) {
      uInt8Array[i] = decodedData.charCodeAt(i);
    }
    // RETURN BLOB IMAGE AFTER CONVERSION
    return new Blob([uInt8Array], { type: imageType });
  }
}
