export type FileAssertions = Record<string, boolean | ((content: any) => void | Promise<void>)>;

export type FileMutations = Record<string, string | ((content: string) => string)>;

export interface TestContext {
  root: string;
  id: string;
  run(cmd: string): Promise<string>;
  setRef(id: string, file: string): void;
  getRef(id: string): string;
  readFile(file: string): Promise<string>;
  assertFiles(files: FileAssertions): Promise<void>;
  findFiles(glob: string): Promise<Array<string>>;
  setFiles(files: FileMutations): Promise<void>;
}

export interface TestEnvironment {
  dir: string;
  createTestContext(id: string): Promise<TestContext>;
}

export interface TestEnvironmentRef {
  env: TestEnvironment;
  setup(cb: (ctx: TestContext) => Promise<void>): void;
  test(
    prefix: string,
    description: string,
    bundlerFeatures: Array<string>,
    cb: (ctx: TestContext) => Promise<void>,
  ): void;
}

interface CustomMatchers<R> {
  toBePresent(status: boolean): R;
}

declare module 'expect/build/types' {
  interface Matchers<R> extends CustomMatchers<R> {}
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers<R> {}
  }
}
