/**
 * Result type for explicit error handling
 * Inspired by Rust's Result<T, E>
 */
export type Result<T, E = Error> = Ok<T> | Err<E>;

export class Ok<T> {
  constructor(readonly value: T) {}

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(defaultValue: T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Result<U> {
    return new Ok(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    return fn(this.value);
  }
}

export class Err<E> {
  constructor(readonly error: E) {}

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  unwrap(): never {
    throw this.error;
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  map<U>(_fn: (value: never) => U): Result<U> {
    return new Err(this.error);
  }

  flatMap<U>(_fn: (value: never) => Result<U>): Result<U> {
    return new Err(this.error);
  }
}

export const ok = <T>(value: T): Result<T> => new Ok(value);
export const err = <E>(error: E): Result<never, E> => new Err(error);
