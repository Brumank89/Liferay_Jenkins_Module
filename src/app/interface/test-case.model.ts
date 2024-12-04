export interface TestStep {
  stepNumber: number;
  step: string;
  expectedResult: string;
}

export interface TestCaseModel {
  key: string;
  name: string;
  status: string;
  objective?: string;
  precondition?: string;
  priority?: string;
  component?: string;
  owner?: string;
  estimatedRunTime?: string;
  steps?: TestStep[];
  selected?: boolean;
}
