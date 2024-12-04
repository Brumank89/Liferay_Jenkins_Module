import { TestBed } from '@angular/core/testing';
import { TestCaseService } from './test-case.service';
import { TestCaseModel } from './interface/test-case.model';

describe('TestCaseService', () => {
  let service: TestCaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestCaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a test case', () => {
    const testCase: TestCaseModel = { key: 'CP-1', name: 'Test Case 1', status: 'Completo', steps: [] };
    service.addTestCase(testCase);
    expect(service.getTestCases().length).toBe(1);
    expect(service.getTestCases()[0]).toEqual(testCase);
  });

  it('should delete selected test cases', () => {
    const testCase1: TestCaseModel = { key: 'CP-1', name: 'Test Case 1', status: 'Completo', steps: [] };
    const testCase2: TestCaseModel = { key: 'CP-2', name: 'Test Case 2', status: 'Fallido', steps: [] };
    service.addTestCase(testCase1);
    service.addTestCase(testCase2);
    service.deleteTestCases([testCase1]);
    expect(service.getTestCases().length).toBe(1);
    expect(service.getTestCases()[0]).toEqual(testCase2);
  });
});
