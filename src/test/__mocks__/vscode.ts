// Mock VS Code API for testing
class MockRange {
  constructor(
    public start: { line: number; character: number },
    public end: { line: number; character: number }
  ) {}

  contains(position: { line: number; character: number }): boolean {
    return (
      (this.start.line < position.line ||
        (this.start.line === position.line && this.start.character <= position.character)) &&
      (this.end.line > position.line ||
        (this.end.line === position.line && this.end.character >= position.character))
    );
  }
  intersection(other: MockRange): MockRange | undefined {
    const start = {
      line: Math.max(this.start.line, other.start.line),
      character: Math.max(this.start.character, other.start.character),
    };
    const end = {
      line: Math.min(this.end.line, other.end.line),
      character: Math.min(this.end.character, other.end.character),
    };
    if (start.line > end.line || (start.line === end.line && start.character > end.character)) {
      return undefined;
    }
    return new MockRange(start, end);
  }
}

export const Range = MockRange as any;

class MockSelection extends MockRange {
  constructor(
    public anchor: { line: number; character: number },
    public active: { line: number; character: number }
  ) {
    super(anchor, active);
  }
  get isEmpty(): boolean {
    return (
      this.anchor.line === this.active.line && this.anchor.character === this.active.character
    );
  }
}

export const Selection = MockSelection as any;

export const Position = class {
  constructor(public line: number, public character: number) {}
};

export const Uri = {
  parse: (value: string) => ({ toString: () => value }),
  file: (path: string) => ({ toString: () => `file://${path}` }),
};

class MockTextDocument {
  constructor(
    public uri: ReturnType<typeof Uri.file>,
    public languageId: string,
    public version: number,
    public text: string
  ) {}

  getText(): string {
    return this.text;
  }
  positionAt(offset: number): { line: number; character: number } {
    const lines = this.text.substring(0, offset).split('\n');
    return {
      line: lines.length - 1,
      character: lines[lines.length - 1].length,
    };
  }
}

export const TextDocument = MockTextDocument as any;

class MockTextEditor {
  constructor(
    public document: MockTextDocument,
    public selections: MockSelection[]
  ) {}

  setDecorations(decorationType: any, ranges: MockRange[]): void {
    // Mock implementation
  }
}

export const TextEditor = MockTextEditor as any;

export const window = {
  createTextEditorDecorationType: (options: any) => ({}),
  activeTextEditor: undefined as any,
  onDidChangeActiveTextEditor: () => ({ dispose: () => {} }),
  onDidChangeTextEditorSelection: () => ({ dispose: () => {} }),
};

export const workspace = {
  onDidChangeTextDocument: () => ({ dispose: () => {} }),
};

export const ExtensionContext = class {
  subscriptions: Array<{ dispose: () => void }> = [];
};

export const ThemeColor = class {
  constructor(public id: string) {}
};

