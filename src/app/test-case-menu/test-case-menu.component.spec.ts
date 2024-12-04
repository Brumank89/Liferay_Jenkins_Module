import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestCaseMenuComponent } from './test-case-menu.component';
import { TestCaseService } from '../test-case.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TestCaseMenuComponent', () => {
  let component: TestCaseMenuComponent;
  let fixture: ComponentFixture<TestCaseMenuComponent>;
  let service: TestCaseService;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TestCaseMenuComponent],
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        FormsModule,
        BrowserAnimationsModule,
      ],
      providers: [TestCaseService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCaseMenuComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(TestCaseService);
    snackBar = TestBed.inject(MatSnackBar);
    spyOn(snackBar, 'open');
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load test cases on initialization', () => {
    const testCases = [
      { key: 'CP-1', name: 'Test Case 1', status: 'Completo', steps: [] },
      { key: 'CP-2', name: 'Test Case 2', status: 'Fallido', steps: [] },
    ];
    spyOn(service, 'getTestCases').and.returnValue(testCases);
    component.ngOnInit();
    expect(component.testCases).toEqual(testCases);
  });

  it('should add a new test case', () => {
    const initialLength = component.testCases.length;
    component.newTestCase = {
      key: '',
      name: 'Test Case 3',
      status: 'Completo',
      objective: '',
      precondition: '',
      priority: '',
      component: '',
      owner: '',
      estimatedRunTime: '',
      steps: [],
    };
    component.addTestCase();
    expect(component.testCases.length).toBe(initialLength + 1);
    expect(component.testCases[initialLength].name).toBe('Test Case 3');
  });

  it('should delete selected test cases', () => {
    const testCase1 = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: true,
    };
    const testCase2 = {
      key: 'CP-2',
      name: 'Test Case 2',
      status: 'Fallido',
      steps: [],
      selected: false,
    };
    component.testCases = [testCase1, testCase2];
    component.deleteSelectedTestCases();
    expect(component.testCases.length).toBe(0);
  });

  it('should update step numbers after adding a step', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: false,
    };
    component.newStep = 'Step 1';
    component.newExpectedResult = 'Result 1';
    component.addStep();
    expect(component.selectedTestCase?.steps?.length).toBe(1);
  });

  

  it('should update step numbers after removing a step', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [
        { stepNumber: 1, step: 'Step 1', expectedResult: 'Result 1' },
        { stepNumber: 2, step: 'Step 2', expectedResult: 'Result 2' },
      ],
      selected: false,
    };
    component.removeStep(0);
    expect(component.selectedTestCase?.steps?.length).toBe(1);
  });

  it('should generate correct feature file content', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [
        { stepNumber: 1, step: 'Step 1', expectedResult: 'Result 1' },
        { stepNumber: 2, step: 'Step 2', expectedResult: 'Result 2' },
      ],
      selected: false,
    };
    const content = component.generateFeatureFileContent();
    expect(content).toContain('@Test Case 1');
    expect(content).toContain('Feature: Test Case 1');
    expect(content).toContain('Scenario: Test Case 1');
    expect(content).toContain('Given Step 1');
    expect(content).toContain('Result 1');
    expect(content).toContain('Then Step 2');
    expect(content).toContain('Result 2');
  });

  it('should select a test case', () => {
    const testCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: false,
    };
    component.onTestCaseSelected(testCase);
    expect(component.selectedTestCase).toEqual(testCase);
    expect(component.isDetailsOpen).toBeTrue();
  });
  it('should close the form', () => {
    component.isFormOpen = true;
    component.onFormClosed();
    expect(component.isFormOpen).toBeFalse();
  });
  it('should close the details view', () => {
    component.isDetailsOpen = true;
    component.onDetailsClosed();
    expect(component.isDetailsOpen).toBeFalse();
    expect(component.selectedTestCase).toBeNull();
  });

  it('should execute test case and handle success response', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
    };
    component.executeTestCase();
    const req = httpMock.expectOne(
      'http://localhost:9090/buildByToken/buildWithParameters'
    );
    expect(req.request.method).toBe('POST');
    req.flush({});
    expect(component.snackBar.open).toHaveBeenCalledWith(
      'La prueba se ejecutó correctamente.',
      'Cerrar',
      { duration: 3000, panelClass: ['green-snackbar'] }
    );
  });
  it('should handle error response when executing test case', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
    };
    component.executeTestCase();
    const req = httpMock.expectOne(
      'http://localhost:9090/buildByToken/buildWithParameters'
    );
    expect(req.request.method).toBe('POST');
    req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    expect(component.snackBar.open).toHaveBeenCalledWith(
      'Error al ejecutar la prueba.',
      'Cerrar',
      { duration: 3000, panelClass: ['green-snackbar'] }
    );
  });
  afterEach(() => {
    httpMock.verify();
  });

  /*Inlfacion de pruebas */
  it('should update the test case information', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: false,
    };
    component.newStep = 'Step 1';
    component.newExpectedResult = 'Result 1';
    component.addStep();
    expect(component.selectedTestCase?.steps?.length).toBe(1);
  });

  it('should fin the test case by the search bar', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: false,
    };
    component.newStep = 'Step 1';
    component.newExpectedResult = 'Result 1';
    component.addStep();
    expect(component.selectedTestCase?.steps?.length).toBe(1);
  });

  it('should clone the selected test', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: false,
    };
    component.newStep = 'Step 1';
    component.newExpectedResult = 'Result 1';
    component.addStep();
    expect(component.selectedTestCase?.steps?.length).toBe(1);
  });

  it('should delete a step', () => {
    component.selectedTestCase = {
      key: 'CP-1',
      name: 'Test Case 1',
      status: 'Completo',
      steps: [],
      selected: false,
    };
    component.newStep = 'Step 1';
    component.newExpectedResult = 'Result 1';
    component.addStep();
    expect(component.selectedTestCase?.steps?.length).toBe(1);
  });

});
