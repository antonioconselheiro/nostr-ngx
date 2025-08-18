/** Used to indicate acceptance or denial of an `EVENT` message. */
export type OkResultset = ['OK', eventId: string, ok: boolean, reason: string];
