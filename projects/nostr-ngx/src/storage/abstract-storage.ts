export abstract class AbstractStorage<T extends object> {

  protected abstract default: T;

  protected abstract getItem(): string | null;

  protected abstract setItem(serializedObject: string): void;

  abstract clear(): void;

  read(): T {
    const data = this.getItem();
    if (data) {
      try {
        return JSON.parse(data) satisfies T;
      } catch (e) {
        console.error('corrupted JSON found', e);
        return this.default;
      }
    }

    return this.default;
  }

  save(configs: T): void {
    this.setItem(JSON.stringify(configs));
  }

  update(updater: (configs: T) => T): void {
    const local = this.read();
    this.save(updater(local));
  }

  async asyncUpdate(updater: (configs: T) => Promise<T>): Promise<void> {
    const local = this.read();
    const updatedLocal = await updater(local);
    this.save(updatedLocal);
  }

  patch(configs: Partial<T>): void {
    this.update(savedConfigs => {
      return { ...savedConfigs, ...configs };
    });
  }
}
