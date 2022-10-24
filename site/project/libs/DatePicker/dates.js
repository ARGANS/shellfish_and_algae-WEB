const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'November', 'December'];

export class DateZ {
    constructor(date) {
        this._date = date;
    }
    
    get YYYY() {
        return this._date.getFullYear();
    }
    
    get MM() {
        return this.constructor.withLeadingZero(this._date.getMonth() + 1);
    }

    get DD() {
        return this.constructor.withLeadingZero(this._date.getDate());
    }

	get HOUR() {
		return this.constructor.withLeadingZero(this._date.getHours());
	}
	get MIN() {
		return this.constructor.withLeadingZero(this._date.getMinutes());
	}
	get SEC() {
		return this.constructor.withLeadingZero(this._date.getSeconds());
	}

    static withLeadingZero(n) {
        return (n < 10 ? '0' : '') + n;
    }

	get ML() {
		return MONTHS_SHORT[this._date.getMonth()];
	}

	/**
	 * 
	 * @param  {int[] | string[] | undefined} args 
	 * @return {DateZ | null}
	 */
    static from(...args) {
		let date;
        if (args.length > 0 && args.length < 4) {
			// In case of unvalid arguments the Date constructor returns an 'Invalid Date' object
			date = new Date(...args);
        } else {
			date = args[0] instanceof Date && args[0] || new Date();
		}
		if (date.toString() === 'Invalid Date') {
			return null;
		}
        return new DateZ(date);
    }

    YYYYMMDD(splitter) {
        let s = splitter || '';
        return this.YYYY + s + this.MM + s + this.DD;
	}
	
	DDMMYYYY(splitter) {
        let s = splitter || '';
        return this.DD + s + this.MM + s + this.YYYY;
	}
	
	dayBefore() {
		this._date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate() - 1);
		return this;
	}

	t(pattern) {
		return pattern.replace(/YYYY|MM|DD|ML|HOUR|MIN|SEC/g, (match) => {
			if (this[match]) return this[match];
			else return match;
		})
	}
}
