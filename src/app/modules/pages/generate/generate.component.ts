import { LoginQrCodeService } from '../../../services/login-qr-code.service';
import {
  Component,
  AfterViewInit,
  Inject,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import * as confetti from 'canvas-confetti';

@Component({
  selector: 'app-generator-page',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss'],
})
export class GenerateComponent implements AfterViewInit {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private loginQrCodeService: LoginQrCodeService,
    private renderer2: Renderer2,
    private elementRef: ElementRef
  ) {}

  // ? Event listeners are needed for convenience purposes implemented below
  ngAfterViewInit(): void {
    // Close modal with Esc key
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.visibleModal != null) {
        this.closeModal(this.visibleModal);
      }
    });
  }

  // create the custom validator function
  MyCustomValidator(control: AbstractControl): ValidationErrors | null {
    // returns null if value is valid, or an error message otherwise
    return control.value > control.parent?.get('startDate')?.value
      ? null
      : { fieldIsInvalid: true };
  }

  //form validation
  qrCodeForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required, this.MyCustomValidator]),
    rights1: new FormControl(true, [Validators.requiredTrue]),
    rights2: new FormControl(false),
    info: new FormControl('', [Validators.required]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
    ]),
  });

  resultString: string = '';

  onSubmit = (e: any) => {
    const startDate = this.qrCodeForm.value.startDate;
    const endDate = this.qrCodeForm.value.endDate;
    const rights1 = this.qrCodeForm.value.rights1;
    const rights2 = this.qrCodeForm.value.rights2;
    const info = this.qrCodeForm.value.info;
    const password = this.qrCodeForm.value.password;

    console.log('Start date is:', new Date(startDate!).toISOString());
    console.log('End date is:', endDate!.toString());
    console.log('rigths are:', rights1);
    console.log('rigths two:', rights2);
    console.log('password here', password);

    // the result string format is as follows:
    // startDate$endDate$right1*right2$information

    this.resultString = `${new Date(startDate!).toISOString()}$${new Date(
      endDate!
    ).toISOString()}$${rights1 ? 'scan' : 'none'}*${
      rights2 ? 'edit' : 'none'
    }$${info}`;
    console.log(this.resultString);
    this.toggleModal(e);
  };

  //getters for easy access to the form fields used in the ngIf
  get startDate() {
    return this.qrCodeForm.get('startDate');
  }
  get endDate() {
    return this.qrCodeForm.get('endDate');
  }
  get info() {
    return this.qrCodeForm.get('info');
  }
  get rights1() {
    return this.qrCodeForm.get('rights1');
  }
  get rights2() {
    return this.qrCodeForm.get('rights2');
  }
  get password() {
    return this.qrCodeForm.get('password');
  }

  //! Modal interaction implementation using Pico classes

  // Config
  isOpenClass = 'modal-is-open';
  openingClass = 'modal-is-opening';
  closingClass = 'modal-is-closing';
  animationDuration = 400; // ms
  visibleModal = null;

  // *Toggle modal number 1 (confirmation modal)
  toggleModal = (event: any) => {
    event.preventDefault();
    const modal = this.document.getElementById('confirmation-modal');
    typeof modal != 'undefined' && modal != null && this.isModalOpen(modal)
      ? this.closeModal(modal)
      : this.openModal(modal);
  };

  // Is modal open
  isModalOpen = (modal: any) => {
    return modal.hasAttribute('open') && modal.getAttribute('open') != 'false'
      ? true
      : false;
  };

  // Open modal
  openModal = (modal: any) => {
    if (this.isScrollbarVisible()) {
      this.document.documentElement.style.setProperty(
        '--scrollbar-width',
        `${this.getScrollbarWidth()}px`
      );
    }
    this.document.documentElement.classList.add(
      this.isOpenClass,
      this.openingClass
    );
    setTimeout(() => {
      this.visibleModal = modal;
      this.document.documentElement.classList.remove(this.openingClass);
    }, this.animationDuration);
    console.log(modal);

    modal.setAttribute('open', true);
  };

  // Close modal
  closeModal = (modal: any) => {
    this.visibleModal = null;
    this.document.documentElement.classList.add(this.closingClass);
    setTimeout(() => {
      this.document.documentElement.classList.remove(
        this.closingClass,
        this.isOpenClass
      );
      this.document.documentElement.style.removeProperty('--scrollbar-width');
      modal.removeAttribute('open');
    }, this.animationDuration);
  };

  // Get scrollbar width
  getScrollbarWidth = () => {
    // Creating invisible container
    const outer = this.document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    this.document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = this.document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    outer.parentNode!.removeChild(outer);

    return scrollbarWidth;
  };

  // Is scrollbar visible
  isScrollbarVisible = () => {
    return this.document.body.scrollHeight > screen.height;
  };

  //*toggle of second modal (qr display modal)
  toggleModalDisplay = (event: any) => {
    event.preventDefault();
    const modal = this.document.getElementById('display-modal');
    typeof modal != 'undefined' && modal != null && this.isModalOpen(modal)
      ? this.closeModal(modal)
      : this.openModal(modal);
  };

  /// ! Qr code display handler
  handleQrCodeDisplay = (event: any) => {
    //handling the service call
    let requestModel = {
      Id: 0,
      QrCodeString: this.qrCodeForm.value.info,
      Password: this.qrCodeForm.value.password,
    };

    this.loginQrCodeService.addLoginQrCode(requestModel).subscribe({
      next: (response) => {
        console.info(response);
      },
      error: (error) => {
        console.log(error);
        alert('error uploading QR code; please check internet & try again.');
        this.navigateEnd();
      },
    });
    //QR code modal display functions
    this.toggleModal(event);
    setTimeout(() => {
      this.toggleModalDisplay(event);
    }, 500);
    setTimeout(() => {
      this.confettiFunction();
    }, 1000);
  };

  confettiFunction = () => {
    const canvas = this.renderer2.createElement('canvas');

    this.renderer2.appendChild(this.elementRef.nativeElement, canvas);

    const myConfetti = confetti.create(canvas, {
      resize: true, // will fit all screen sizes
    });

    myConfetti({
      particleCount: 150,
      spread: 60,
    });
  };

  navigateEnd = () => {
    window.location.reload();
  };

  // * download QR code function
  saveAsImage(fileType: string) {
    // fetches base 64 date from image
    const canvasElement = document.querySelector('canvas') as HTMLCanvasElement;
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
