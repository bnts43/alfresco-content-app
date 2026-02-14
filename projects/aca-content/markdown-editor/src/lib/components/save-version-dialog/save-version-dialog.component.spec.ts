import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { SaveVersionDialogComponent, SaveVersionDialogResult } from './save-version-dialog.component';

describe('SaveVersionDialogComponent', () => {
  let fixture: ComponentFixture<SaveVersionDialogComponent>;
  let component: SaveVersionDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<SaveVersionDialogComponent>>;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [SaveVersionDialogComponent, NoopTranslateModule],
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: dialogRefSpy }
      ]
    });

    fixture = TestBed.createComponent(SaveVersionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to minor version', () => {
    expect(component.majorVersion).toBe(false);
  });

  it('should default to empty comment', () => {
    expect(component.comment).toBe('');
  });

  describe('onCancel', () => {
    it('should close dialog without result', () => {
      component.onCancel();
      expect(dialogRefSpy.close).toHaveBeenCalledWith();
    });
  });

  describe('onSave', () => {
    it('should close dialog with result when comment is provided', () => {
      component.comment = 'Test comment';
      component.majorVersion = false;

      component.onSave();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        majorVersion: false,
        comment: 'Test comment'
      } as SaveVersionDialogResult);
    });

    it('should close dialog with major version when selected', () => {
      component.comment = 'Major update';
      component.majorVersion = true;

      component.onSave();

      expect(dialogRefSpy.close).toHaveBeenCalledWith({
        majorVersion: true,
        comment: 'Major update'
      } as SaveVersionDialogResult);
    });

    it('should not close dialog when comment is empty', () => {
      component.comment = '';
      component.onSave();
      expect(dialogRefSpy.close).not.toHaveBeenCalled();
    });
  });
});
