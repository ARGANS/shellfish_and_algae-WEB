// v2 2022/08/01
class EventEmitter {
	#eventHandlers = Object.create(null)
	
	/**
	 * @param {string} eventName
	 * @param {function} handler 
	 */
	on(eventName, handler){
		if (!Array.isArray(this.#eventHandlers[eventName])) this.#eventHandlers[eventName] = [];
		this.#eventHandlers[eventName].push(handler);
		return handler;
	}
	
	/**
	 * @param {string} [eventName]
	 * @param {function} [handler] 
	 */
	off(eventName, handler) {
		if (handler) {
			const handlers = this.#eventHandlers[eventName];
			if (!Array.isArray(handlers)) return;
		
			let i = handlers.length - 1;
		
			while (i--> 0) {
		  		handlers.splice(i, 1);
			}
	  	} else if (eventName) {
			if (!Array.isArray(this.#eventHandlers[eventName])) return;
			this.#eventHandlers[eventName].length = 0;
		} else {
			this.#eventHandlers = Object.create(null);
		}
	}
	
	// Each handler can cancel the event
	emit(eventName_s, ...args) {
		if (!Array.isArray(this.#eventHandlers[eventName_s])) return;
	  
		const handlers = this.#eventHandlers[eventName_s];
		for(let i = 0; i < handlers.length; i++) {
			if (!handlers[i](...args)) return true;
		}
	}
	
	/**
	 * @param {{[string]:function}} handlers_o
	 * @param {boolean} [withDestructor]
	 * @return {() => void | null}
	 */
	listen(handlers_o, withDestructor=false) {
		const handlers = {};
		for (let eventName_s in handlers_o) {
			handlers[eventName_s] = this.on(eventName_s, handlers_o[eventName_s]);
		}
	  
		return withDestructor ? () => {
			for (let eventName_s in handlers) {
				this.off(eventName_s, handlers[eventName_s]);
			}
		} : null;
	}
	
	once(eventName, handler){
		const _handler = (...args) => {
			this.off(eventName, _handler);
			return handler(...args);
		};
		this.on(eventName, _handler);
	}
}

export default EventEmitter;
  