export abstract class AbstractBrowserStorage<T extends object> {

  protected abstract default: T;

  protected abstract getItem(): string | null;

  protected abstract setItem(serializedObject: string): void;

  abstract clear(): void;

  /**
   * @returns all content from storage already parsed
   */
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

  /**
   * override all content in storage
   */
  save(configs: T): void {
    this.setItem(JSON.stringify(configs));
  }

  /**
   * @param updater should be a function, the parameters received by the function is the storage content parsed
   * and the returned value from the function will override the content in storage
   */
  update(updater: (configs: T) => T): void {
    const local = this.read();
    this.save(updater(local));
  }

  /**
   * @param updater should be an async function, the parameters received by the function is the storage content parsed
   * and the returned value from the function will override the content in storage
   */
  async asyncUpdate(updater: (configs: T) => Promise<T>): Promise<void> {
    const local = this.read();
    const updatedLocal = await updater(local);
    this.save(updatedLocal);
  }

  /**
   * merge the given object into the current content in storage
   */
  patch(configs: Partial<T>): void {
    this.update(savedConfigs => {
      return { ...savedConfigs, ...configs };
    });
  }
}
