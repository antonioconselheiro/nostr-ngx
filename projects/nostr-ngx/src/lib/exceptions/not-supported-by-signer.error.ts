export class NotSupportedBySigner extends Error {
  constructor(
    message = 'method not supported by signer'
  ) {
    super(message)
  }
}