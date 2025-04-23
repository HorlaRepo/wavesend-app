// date-range-modal.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-date-range-modal',
  template: `
    <h2 mat-dialog-title>Generate Statement</h2>
    <mat-dialog-content>
      <div class="form-group">
        <label for="fromDate">From:</label>
        <input type="datetime-local" id="fromDate" class="form-control" [(ngModel)]="fromDate" required>
      </div>
      <div class="form-group">
        <label for="toDate">To:</label>
        <input type="datetime-local" id="toDate" class="form-control" [(ngModel)]="toDate" required>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button [disabled]="!fromDate || !toDate" (click)="onGenerate()">Generate</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; }
  `]
})
export class DateRangeModalComponent {
  fromDate: string = '';
  toDate: string = '';
  format: string;

  constructor(
    public dialogRef: MatDialogRef<DateRangeModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { format: string }
  ) {
    this.format = data.format;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onGenerate(): void {
    this.dialogRef.close({ fromDate: this.fromDate, toDate: this.toDate, format: this.format });
  }
}
