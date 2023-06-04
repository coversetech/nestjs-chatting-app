import { Logger } from "@nestjs/common";

export function LogMethod(logger?: Logger): MethodDecorator {
  return (
    target: any,
    key: string | symbol,
    descriptor: PropertyDescriptor
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const methodLogger = logger || new Logger(target.constructor.name);
      methodLogger.log(
        `Start executing ${key.toString()} with arguments: ${JSON.stringify(
          args
        )}`
      );

      try {
        const result = await originalMethod.apply(this, args);
        methodLogger.log(`Finished executing ${key.toString()}`);
        return result;
      } catch (error) {
        methodLogger.error(`Error executing ${key.toString()}: ${error}`);
        throw error;
      }
    };

    return descriptor;
  };
}
