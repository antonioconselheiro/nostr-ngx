export class NoCredentialsFoundError extends Error {
  constructor(
    message = 'no nsec found'
  ) {
    super(message)
  }
}