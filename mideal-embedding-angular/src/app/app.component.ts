import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import MidealEmbed from '@mesoneer-ag/mideal-embed-dev';
import { ModalComponent } from './modal-component/modal-component.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'mideal-embed';

  startUrl: string;
  sandboxOptions: string;

  constructor(public dialog: MatDialog) {
    this.startUrl = '';
    this.sandboxOptions = 'allow-scripts allow-same-origin';
  }

  openModal(): void {
    this.startUrl = (document.getElementById('startUrl') as HTMLInputElement).value;
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '100%',
      data: { name: 'Mideal Embed' },
    });

    dialogRef.afterOpened().subscribe(() => {
      const mideal = new MidealEmbed();
      mideal.start({
        startUrl: this.startUrl,
        enclosingDomElement: document.getElementById('iframe-container') as HTMLElement,
        style: {
          width: '100%',
          height: '860px',
        },
        sandbox: this.sandboxOptions,
        onMessage: this.handleReceivedMessage,
      });
    });
  }

  onInputSandboxOptions(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.sandboxOptions = inputElement.value;
  }

  handleReceivedMessage(result: any): void {
    const messageElement = document.getElementById('scanResult');
    const messageTimeElement = document.getElementById('statusTime');
    const statusReasonElement = document.getElementById('statusReason');
    const statusDetailsElement = document.getElementById('statusDetails');
    const { scanResult, date, statusReason, statusDetails } = result;
    if(messageElement) {
      messageElement.innerHTML = scanResult ?? 'NO_STATUS';
    }
    if(messageTimeElement) {
      messageTimeElement.innerHTML = date ?? '-------';
    }
    if(statusReasonElement) {
      statusReasonElement.innerHTML = statusReason ?? '';
    }
    if(statusDetailsElement) {
      statusDetailsElement.innerHTML = statusDetails ?? '';
    }
  }
}
