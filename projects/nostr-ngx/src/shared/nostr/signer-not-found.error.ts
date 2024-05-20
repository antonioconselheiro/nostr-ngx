export class SignerNotFoundError extends Error {
  constructor(
    message = 'no signer found'
  ) {
    super(message)
  }
}