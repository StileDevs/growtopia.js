// https://github.com/ai/nanoevents

import { DefaultEvents, Emitter, EventsMap } from "../../types";

/**
 * Create event emitter.
 *
 * ```js
 * import { createNanoEvents } from 'nanoevents'
 *
 * class Ticker {
 *   constructor() {
 *     this.emitter = createNanoEvents()
 *   }
 *   on(...args) {
 *     return this.emitter.on(...args)
 *   }
 *   tick() {
 *     this.emitter.emit('tick')
 *   }
 * }
 * ```
 */
export function createNanoEvents<Events extends EventsMap = DefaultEvents>(): Emitter<Events> {
  return {
    emit(event, ...args) {
      for (
        let callbacks = this.events[event] || [], i = 0, length = callbacks.length;
        i < length;
        i++
      ) {
        callbacks[i](...args);
      }
    },
    events: {},
    on(event, cb) {
      (this.events[event] ||= []).push(cb);
      return () => {
        this.events[event] = this.events[event]?.filter((i) => cb !== i);
      };
    }
  };
}
const test = createNanoEvents();
