/**
 * Laro.base.class
 */
 
Laro.register('.base', function (L) {

	var context = this,
		$name = L['$name'],
		fnTest = /'lero'/.test(function () { lero }) ? /\b_super\b/ : /.*/,
		isFunction  = function (o) {
			return (L.toType(o) == 'function' && o.apply && o.call);
		};

	function Class (o) {
		return extend.call(isFunction(o) ? o : function () {}, o, 1);
	}

	function process (target, o, _super) {
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				target[k] = (isFunction(o[k]) && isFunction(_super.prototype[k]) && fnTest.test(o[k])) ? wrap(k, o[k], _super) : o[k];
			}
		}
	}

	function wrap (k, fn, _super) {
		return function () {
			var tmp = this._super;
			this._super = _super.prototype[k];

			var ret = fn.apply(this, arguments);
			this._super = tmp;
			return ret;
		}
	}

	function extend (o, fromSub) {
		
		function superClass () {}
		superClass.prototype = this.prototype;

		var _super = this,
			prototype = new superClass(),
			_constructor = isFunction(o) ? o : this,
			_methods = isFunction(o) ? {} : o;

		function Class () {
			if (!!this.initialize) {
				this.initialize.apply(this, arguments);
			} else {
				(!!fromSub || isFunction(o)) && _super.apply(this, arguments);
				_constructor.apply(this, arguments);
			}
		}

		Class.methods = function (o) {
			process(prototype, o, _super);
			Class.prototype = prototype;
			return this;
		};
		
		Class.methods.call(Class, _methods).prototype.constructor = Class;

		Class.extend = arguments.callee;

		Class.prototype.implement = Class.statics = function (o, optFn) {
			o = L.toType(o) === 'string' ? (function () {
						var obj = {};
						obj[o] = optFn;
						return obj;
					}()) : o;
			process(this, o, _super);

			return this;
		}

		return Class;

	}

	this.Class = Class;
    
});
