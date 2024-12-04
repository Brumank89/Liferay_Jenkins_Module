import { Component, OnInit } from '@angular/core';
import { TestCaseService } from '../test-case.service';
import { TestCaseModel, TestStep } from '../interface/test-case.model';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-test-case-menu',
  templateUrl: './test-case-menu.component.html',
  styleUrls: ['./test-case-menu.component.css'],
})
export class TestCaseMenuComponent implements OnInit {
  isDetailsOpen = false;
  isFormOpen = false;
  isStepsView = false;
  selectedTestCase: TestCaseModel | null = null;
  testCases: TestCaseModel[] = [];
  newStep: string = '';
  newExpectedResult: string = '';

  newTestCase: TestCaseModel = {
    key: '',
    name: '',
    status: '',
    objective: '',
    precondition: '',
    priority: '',
    component: '',
    owner: '',
    estimatedRunTime: '',
    steps: [],
  };
  constructor(
    private testCaseService: TestCaseService,
    private http: HttpClient,
    public snackBar: MatSnackBar
  ) {}
  ngOnInit(): void {
    this.testCases = this.testCaseService.getTestCases();
  }
  onTestCaseSelected(testCase: TestCaseModel): void {
    this.selectedTestCase = testCase;
    this.isDetailsOpen = true;
  }
  openNewTestCaseForm(): void {
    this.isFormOpen = true;
  }
  onFormClosed(): void {
    this.resetForm();
    this.isFormOpen = false;
  }
  onDetailsClosed(): void {
    this.isDetailsOpen = false;
    this.selectedTestCase = null;
    this.isStepsView = false;
  }
  addTestCase(): void {
    this.newTestCase.key = `CP-${this.testCases.length + 1}`;
    this.testCaseService.addTestCase(this.newTestCase);
    this.testCases = this.testCaseService.getTestCases();
    this.resetForm();
    this.onFormClosed();
  }
  deleteSelectedTestCases(): void {
    const selectedTestCases = this.testCases.filter(
      (testCase) => testCase.selected
    );
    this.testCaseService.deleteTestCases(selectedTestCases);
    this.testCases = this.testCaseService.getTestCases();
    this.testCases.forEach((testCase, index) => {
      testCase.key = `CP-${index + 1}`;
    });
    this.snackBar.open('Los casos de prueba seleccionados se eliminaron correctamente.','Cerrar',
      {
        duration: 3000,
        panelClass: ['custom-snackbar'],
      }
    );
  }

  resetForm(): void {
    this.newTestCase = {
      key: '',
      name: '',
      status: '',
      objective: '',
      precondition: '',
      priority: '',
      component: '',
      owner: '',
      estimatedRunTime: '',
      steps: [],
    };
  }
  showStepsView(): void {
    this.isStepsView = true;
  }
  showDetailsView(): void {
    this.isStepsView = false;
  }
  addStep(): void {
    const stepNumber = (this.selectedTestCase?.steps?.length || 0) + 1;
    const newStep: TestStep = {
      stepNumber,
      step: this.newStep,
      expectedResult: this.newExpectedResult,
    };
    if (this.selectedTestCase) {
      this.selectedTestCase.steps = [
        ...(this.selectedTestCase.steps || []),
        newStep,
      ];
    }
    this.newStep = '';
    this.newExpectedResult = '';
  }
  removeStep(index: number): void {
    if (this.selectedTestCase && this.selectedTestCase.steps) {
      this.selectedTestCase.steps.splice(index, 1);
      this.updateStepNumbers();
    }
  }
  updateStepNumbers(): void {
    if (this.selectedTestCase && this.selectedTestCase.steps) {
      this.selectedTestCase.steps.forEach((step, index) => {
        step.stepNumber = index + 1;
      });
    }
  }

  generateFeatureFileContent(): string {
    if (!this.selectedTestCase) {
      return '';
    }

    // Crear la 'tag' con el nombre del caso de prueba
    let content = `@${this.selectedTestCase.name}\n`;

    // Añadir la línea de 'Feature' y 'Scenario'
    content += `Feature: ${this.selectedTestCase.name}\n\n  Scenario: ${this.selectedTestCase.name}\n`;

    // Iterar sobre los pasos y añadir 'Given' para el primer paso y 'Then' para los demás
    (this.selectedTestCase.steps || []).forEach((step, index) => {
      if (index === 0) {
        content += `    Given ${step.step}\n`;
      } else {
        content += `    Then ${step.step}\n`;
      }
      content += `    ${step.expectedResult}\n`;
    });

    return content;
  }

  downloadFeatureFile(): void {
    const content = this.generateFeatureFileContent();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.selectedTestCase?.key}.feature`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  executeTestCase(): void {
    if (!this.selectedTestCase) {
      return;
    }

    const url = `http://localhost:9090/buildByToken/buildWithParameters`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    const body = new HttpParams()
      .set('job', 'LifeRay_Integration_Example')
      .set('token', 'TokenLiferayTest')
      .set('FEATURE_CONTENT', this.generateFeatureFileContent());

    this.http.post(url, body, { headers }).subscribe({
      next: () => {
        this.snackBar.open('La prueba se ejecutó correctamente.', 'Cerrar', {
          duration: 3000,
          panelClass: ['green-snackbar'],
        });
      },
      error: (error) => {
        console.error('Error triggering Jenkins job', error);
        this.snackBar.open('Error al ejecutar la prueba.', 'Cerrar', {
          duration: 3000,
          panelClass: ['green-snackbar'],
        });
      },
    });
  }
}

/*
@LifeRay_Integration 
Feature: LifeRay_Integration 

  Scenario: LifeRay_Integration 
    Given Abro la pagina "https://the-internet.herokuapp.com/login" en el navegador
    
    Then Ingreso el usuario "tomsmith" y la contraseña "SuperSecretPassword!"
    
    Then Presiono el boton Login
    
    Then Espero que el mensaje de error sea "You logged into a secure area!"
    
    Then Cierro la sesion
    */
