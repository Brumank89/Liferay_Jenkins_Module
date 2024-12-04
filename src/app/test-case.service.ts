import { Injectable } from '@angular/core';
import { TestCaseModel } from './interface/test-case.model';

@Injectable({
  providedIn: 'root',
})
export class TestCaseService {
  private testCases: TestCaseModel[] = [];

  constructor() {}

  getTestCases(): TestCaseModel[] {
    return this.testCases;
  }

  addTestCase(testCase: TestCaseModel): void {
    this.testCases.push(testCase);
  }
  
  deleteTestCases(selectedTestCases: TestCaseModel[]): void {
    this.testCases = this.testCases.filter(
      (tc) => !selectedTestCases.includes(tc)
    );
  }
}
