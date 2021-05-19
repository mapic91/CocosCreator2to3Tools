/**
 * A simple and lightweight EventEmitter by TypeScript for Node.js or Browsers.
 *
 * @author billjs
 * @see https://github.com/billjs/event-emitter
 * @license MIT(https://opensource.org/licenses/MIT)
 */

/**
 * EventHandler
 *
 * @export
 */
export type EventHandler = ((evt: Event) => void) & { _once?: boolean };

/**
 * Event Object
 *
 * @export
 * @interface Event
 */
export interface Event {
  /**
   * event type
   *
   * @type {string}
   * @memberof Event
   */
  type: string;

  /**
   * event data
   *
   * @type {*}
   * @memberof Event
   */
  data: any;

  /**
   * the timestamp when event fired
   *
   * @type {number}
   * @memberof Event
   */
  timestamp: number;

  /**
   * it is an once event, that meaning listen off after event fired
   *
   * @type {boolean}
   * @memberof Event
   */
  once: boolean;
}

/**
 * It's a class for managing events.
 * It can be extended to provide event functionality for other classes or object.
 *
 * @export
 * @class EventEmitter
 */
export class EventEmitter {
  /**
   * the all event handlers are added.
   * it's a Map data structure(key-value), the key is event type, and the value is event handler.
   *
   * @memberof EventEmitter
   */
  _eventHandlers: Record<string, EventHandler[] | undefined> = {};

  /**
   * event type validator.
   *
   * @param {string} type event type
   * @returns {boolean}
   * @memberof EventEmitter
   */
  isValidType(type: string) {
    return typeof type === 'string';
  }

  /**
   * event handler validator.
   *
   * @param {EventHandler} handler event handler
   * @returns {boolean}
   * @memberof EventEmitter
   */
  isValidHandler(handler: EventHandler) {
    return typeof handler === 'function';
  }

  /**
   * listen on a new event by type and handler.
   * if listen on, the true is returned, otherwise the false.
   * The handler will not be listen if it is a duplicate.
   *
   * @param {string} type event type, it must be a unique string.
   * @param {EventHandler} handler event handler, when if the same handler is passed, listen it by only once.
   * @returns {boolean}
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  emitter.on('change:name', evt => {
   *    console.log(evt);
   *  });
   */
  on(type: string, handler: EventHandler) {
    if (!type || !handler) return false;

    if (!this.isValidType(type)) return false;
    if (!this.isValidHandler(handler)) return false;

    let handlers = this._eventHandlers[type];
    if (!handlers) handlers = this._eventHandlers[type] = [];

    // when the same handler is passed, listen it by only once.
    if (handlers.indexOf(handler) >= 0) return false;

    handler._once = false;
    handlers.push(handler);
    return true;
  }

  /**
   * listen on an once event by type and handler.
   * when the event is fired, that will be listen off immediately and automatically.
   * The handler will not be listen if it is a duplicate.
   *
   * @param {string} type event type, it must be a unique string.
   * @param {EventHandler} handler event handler, when if the same handler is passed, listen it by only once.
   * @returns {boolean}
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  emitter.once('change:name', evt => {
   *    console.log(evt);
   *  });
   */
  once(type: string, handler: EventHandler) {
    if (!type || !handler) return false;

    if (!this.isValidType(type)) return false;
    if (!this.isValidHandler(handler)) return false;

    const ret = this.on(type, handler);
    if (ret) {
      // set `_once` private property after listened,
      // avoid to modify event handler that has been listened.
      handler._once = true;
    }

    return ret;
  }

  /**
   * listen off an event by type and handler.
   * or listen off events by type, when if only type argument is passed.
   * or listen off all events, when if no arguments are passed.
   *
   * @param {string} [type] event type
   * @param {EventHandler} [handler] event handler
   * @returns
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  // listen off the specified event
   *  emitter.off('change:name', evt => {
   *    console.log(evt);
   *  });
   *  // listen off events by type
   *  emitter.off('change:name');
   *  // listen off all events
   *  emitter.off();
   */
  off(type?: string, handler?: EventHandler) {
    // listen off all events, when if no arguments are passed.
    // it does samething as `offAll` method.
    if (!type) return this.offAll();

    // listen off events by type, when if only type argument is passed.
    if (!handler) {
      this._eventHandlers[type] = [];
      return;
    }

    if (!this.isValidType(type)) return;
    if (!this.isValidHandler(handler)) return;

    const handlers = this._eventHandlers[type];
    if (!handlers || !handlers.length) return;

    // otherwise, listen off the specified event.
    for (let i = 0; i < handlers.length; i++) {
      const fn = handlers[i];
      if (fn === handler) {
        handlers.splice(i, 1);
        break;
      }
    }
  }

  /**
   * listen off all events, that means every event will be emptied.
   *
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  emitter.offAll();
   */
  offAll() {
    this._eventHandlers = {};
  }

  /**
   * fire the specified event, and you can to pass a data.
   * When fired, every handler attached to that event will be executed.
   * But, if it's an once event, listen off it immediately after called handler.
   *
   * @param {string} type event type
   * @param {*} [data] event data
   * @returns
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  emitter.fire('change:name', 'new name');
   */
   emit(type: string, data?: any) {
    if (!type || !this.isValidType(type)) return;

    const handlers = this._eventHandlers[type];
    if (!handlers || !handlers.length) return;

    const event = this.createEvent(type, data);

    for (const handler of handlers) {
      if (!this.isValidHandler(handler)) continue;
      if (handler._once) event.once = true;

      // call event handler, and pass the event argument.
      handler(event);

      // if it's an once event, listen off it immediately after called handler.
      if (event.once) this.off(type, handler);
    }
  }

  /**
   * check whether the specified event has been listen on.
   * or check whether the events by type has been listen on, when if only `type` argument is passed.
   *
   * @param {string} type event type
   * @param {EventHandler} [handler] event handler, optional
   * @returns {boolean}
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  const result = emitter.has('change:name');
   */
  has(type: string, handler?: EventHandler) {
    if (!type || !this.isValidType(type)) return false;

    const handlers = this._eventHandlers[type];
    // if there are no any events, return false.
    if (!handlers || !handlers.length) return false;

    // at lest one event, and no pass `handler` argument, then return true.
    if (!handler || !this.isValidHandler(handler)) return true;

    // otherwise, need to traverse the handlers.
    return handlers.indexOf(handler) >= 0;
  }

  /**
   * get the handlers for the specified event type.
   *
   * @param {string} type event type
   * @returns {EventHandler[]}
   * @memberof EventEmitter
   * @example
   *  const emitter = new EventEmitter();
   *  const handlers = emitter.getHandlers('change:name');
   *  console.log(handlers);
   */
  getHandlers(type: string) {
    if (!type || !this.isValidType(type)) return [];
    return this._eventHandlers[type] || [];
  }

  /**
   * create event object.
   *
   * @param {string} type event type
   * @param {*} [data] event data
   * @param {boolean} [once=false] is it an once event?
   * @returns {Event}
   * @memberof EventEmitter
   */
  createEvent(type: string, data?: any, once = false) {
    const event: Event = { type, data, timestamp: Date.now(), once };
    return event;
  }
}

/**
 * EventEmitter instance for global.
 * @type {EventEmitter}
 */
export const globalEvent = new EventEmitter();
