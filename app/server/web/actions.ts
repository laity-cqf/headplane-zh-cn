// Expected action failures must be shown in the form, including direct POSTs.
export class ActionError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}
