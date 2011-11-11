/**
 * Laro.global
 */

(function (win, undefined) {
 
 	var __INFO__ = {
		$name: 'Laro',
		$version: '0.1',
		$description: 'game engine based on html5'
	};

	var	toString = Object.prototype.toString,
		slice = Array.prototype.slice,
		self = this || win;


	function toType (o) {
		var r = toString.call(o).toLowerCase(),
			from = 8,
			to = r.length - 1;
		return r.substring(from, to);
	}

	function extend (target, source, isOverwrite) {
		var argInd = -1,
			args = slice.call(arguments, 0);
		target = self[__INFO__['$name']] || {};
		source = [];
		isOverwrite = true;
		while (args[++ argInd]) {
			if (toType(args[argInd]) === 'boolean') {
				isOverwrite = args[argInd];
			} else if (toType(args[argInd]) === 'object') {
				source.push(args[argInd]);
			} 
		}

		if (source.length >= 2) {
			target = source.splice(0, 1)[0];
		}

		for (var i = 0; i < source.length; i ++) {
			var _s = source[i];
			for (var key in _s) {
				if (!target.hasOwnProperty(key) || isOverwrite) {
					target[key] = _s[key];
				}
			}
		}

		return target;
	}

	function register (name, fn) {
		var names = name.split('.'),
			i = -1,
			loopName = self;

		if (names[0] == '') {names[0] = __INFO__['$name']}

		while (names[++ i]) {
			if (loopName[names[i]] === undefined) {
				loopName[names[i]] = {};
			}
			loopName = loopName[names[i]]
		}

		!!fn && fn.call(loopName, self[__INFO__['$name']]);
		
	}

	function randomRange(from, to) {
		return from + Math.random() * (to - from);
	}
	function randomBool() {
		return Math.random() >= 0.5;
	}
	function curry (cb, context) {
		return function () {
			typeof cb == 'function' && cb.apply(context, arguments);
		}
	}
	function curryWithArgs(cb, context) {
		var args = Array.prototype.slice.call(arguments, 0);
		delete args[0];
		delete args[1];
		return function () {
			typeof cb == 'function' && cb.apply(context, args.concat(arguments));
		};
	}

	var $public = {
		toType: toType,
		extend: extend,
		register: register,
		randomRange: randomRange,
		randomBool: randomBool,
		curry: curry,
		curryWithArgs: curryWithArgs
	};

	var Laro = extend({}, __INFO__, $public);
	this[__INFO__['$name']] = win[__INFO__['$name']] = Laro;
 
 })(window);

 // module.js
(function (win, undefined) {
    
    var toString = Object.prototype.toString,
        nativeIsArray = Array.isArray,
        _ = {};
        
    _.isArray = nativeIsArray || function (o) {
        return toString.call(o) === '[object Array]';
	}
    _.isString = function (o) {
		return !!(o === '' || (o && o.charCodeAt && o.substr));	
	}
	/**
	 * Method 判断是否为Object
	 * {}, [] , function(){}  都会返回true
	 */
	_.isObject = function (o) {
		return o === Object(o);
	}

    /**
     * Method 使用模块的主函数
     * @param (String or Array) 要使用的模块名
     * @param (Function) *optional 加载模块后的回调函数
     * @param (Object) *optional 回调绑定对象
     * @return undefined
     * xhr同步的方式由于http请求，暂不能支持跨域模块loader
     * 默认register为异步
    **/ 
    var _module = function (moduleName, callback, context) {
        var argIndex=-1;
        
        // private method 监测moduleName,如果是url(http://*)路径形式，register后load
            function checkURL(src) {
                var dsrc = src;
                if (src && src.substring(0, 4) == "url(") {
                    dsrc = src.substring(4, src.length - 1);
                }
                var r = _module.registered[dsrc];
                return (!r && (!_module.__checkURLs || !_module.__checkURLs[dsrc]) && src && src.length > 4 && src.substring(0, 4) == "url(");
            }
            
        // 并发调用的模块列表
        var moduleNames = new Array();
        
        if (_.isArray(moduleName)) {
            var _moduleNames = moduleName;
            for (var s=0;s<_moduleNames.length; s++) {
                if (_module.registered[_moduleNames[s]] || checkURL(_moduleNames[s])) {
                    moduleNames.push(_moduleNames[s]);
                }
            }
            moduleName = moduleNames[0];
            argIndex = 1;
        } else {
            while (typeof(arguments[++argIndex]) == "string") {
                if (_module.registered[moduleName] || checkURL(moduleName)) {
                    moduleNames.push(arguments[argIndex]);
                }
            }
        }
        callback = arguments[argIndex];
        context = arguments[++argIndex];
        
        if (moduleNames.length > 1) {
            var cb = callback;
            callback = function() {
                _module(moduleNames, cb, context);
            }
        }
        
        // 已经register过的模块hash
        var reg = _module.registered[moduleName];
        // 处理直接使用url的情况
        if (!_module.__checkURLs) _module.__checkURLs = {};
        if (checkURL(moduleName) && moduleName.substring(0, 4) == "url(") {
            moduleName = moduleName.substring(4, moduleName.length - 1);
            if (!_module.__checkURLs[moduleName]) {
                moduleNames[0] = moduleName;
                _module.register(moduleName, moduleName);
                reg = _module.registered[moduleName];
                var callbackQueue = _module.prototype.getCallbackQueue(moduleName);
                var cbitem = new _module.prototype.curCallBack(function() {
                    _module.__checkURLs[moduleName] = true;
                });
                callbackQueue.push(cbitem);
                callbackQueue.push(new _module.prototype.curCallBack(callback, context));
                callback = undefined;
                context = undefined;
            }
        }
        
        if (reg) {
            // 先处理被依赖的模块
            for (var r=reg.requirements.length-1; r>=0; r--) {
                if (_module.registered[reg.requirements[r].name]) {
                    _module(reg.requirements[r].name, function() {
                        _module(moduleName, callback, context); 
                    }, context);
                    return;
                }
            }

            // load每个模块
            for (var u=0; u<reg.urls.length; u++) {
                if (u == reg.urls.length - 1) {
                    if (callback) {
                        _module.load(reg.name, reg.urls[u], reg.isAsyn, reg.asyncWait, new _module.prototype.curCallBack(callback, context));
                    } else { 
                        _module.load(reg.name, reg.urls[u], reg.isAsyn, reg.asyncWait);
                    }
                } else {
                    _module.load(reg.name, reg.urls[u], reg.isAsyn, reg.asyncWait);
                }
            }
            
        } else {
            !!callback && callback.call(context);
        }
    }
        
    _module.prototype = {

        /**
         * Method 模块注册
         * @param (String or Object) 注册的模块名或者对象字面量
         * @param (Number) *optional 异步等待时间
         * @param (String or Array) 注册模块对应的url地址
         * @return (Object) 注册模块的相关信息对象字面量
        **/
        register : function(name, isAsyn, asyncWait, urls) {
            var reg;
            if (_.isObject(name)) {
                reg = name;
                reg = new _module.prototype.__register(reg.name, reg.isAsyn, reg.asyncWait, urls);
            } else {
                reg = new _module.prototype.__register(name, isAsyn, asyncWait, urls);
            }
            if (!_module.registered) _module.registered = { };
            if (_module.registered[name] && window.console) {
                window.console.log("Warning: Module named \"" + name + "\" was already registered, Overwritten!!!");
            }
            _module.registered[name] = reg;
            return reg;
        },
        // -- 注册模块的行动函数，并提供链式调用
        __register : function(_name, _isAsyn, _asyncWait, _urls) {
            this.name = _name;
            var a=0;
            var arg = arguments[++a];
            
            if (arg && typeof arg == 'boolean') {
                this.isAsyn = arg;
                arg = arguments[++a];
            } else {
                this.isAsyn = true;
            }
            
            if (arg && typeof(arg) == "number") { 
                this.asyncWait = _asyncWait; 
            } else { 
                this.asyncWait = 0; 
            }
            
            this.urls = new Array();
            if (arg && arg.length && typeof(arg) != "string") {
                this.urls = arg;
            } else {
                for (a=a; a<arguments.length; a++) {
                    if (arguments[a] && typeof(arguments[a]) == "string") this.urls.push(arguments[a]);
                }
            }
            // 依赖列表
            this.requirements = new Array();
            
            this.require = function(resourceName) {
                var reqM = [];
                if (Object.prototype.toString.call(resourceName) == '[object Array]' && !!resourceName.length) {
                    reqM = resourceName;
                } else {
                    reqM = Array.prototype.slice.call(arguments, 0);
                }
                for (var i = 0; i < reqM.length; i ++) {
                    this.requirements.push({ name : reqM[i] })
                }

                return this;
            }
            this.register = function(name, isAsyn, asyncWait, urls) {
                return _module.register(name, isAsyn, asyncWait, urls);
            }
            return this;
        },

        defaultAsyncTime: 10,
        
        // -- 处理加载模块逻辑
        load: function(moduleName, scriptUrl, isAsyn, asyncWait, cb) {
            if (asyncWait == undefined) asyncWait = _module.defaultAsyncTime;
            
            if (!_module.loadedscripts) _module.loadedscripts = new Array();

             var callbackQueue = _module.prototype.getCallbackQueue(scriptUrl);
             callbackQueue.push(new _module.prototype.curCallBack( function() {
                 _module.loadedscripts.push(_module.registered[moduleName]);
                 _module.registered[moduleName] = undefined;
             }, null));
             if (cb) {
                 callbackQueue.push(cb);
                 if (callbackQueue.length > 2) return;
             }
             
             if (isAsyn) {
                _module.asynLoadScript(scriptUrl, asyncWait, callbackQueue);
             } else {
                _module.xhrLoadScript(moduleName, scriptUrl, callbackQueue);
             }
        }, 
        
        xhrLoadScript: function (moduleName, scriptUrl, callbackQueue) {
            var xhr;
            if (window.XMLHttpRequest)
				xhr = new XMLHttpRequest();
			else if (window.ActiveXObject) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP"); 
			}
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    _module.injectScript(xhr.responseText, moduleName);
                    if (callbackQueue) {
                        for (var q=0; q<callbackQueue.length; q++) {
                            callbackQueue[q].runCallback();
                        }
                    }
                    _module.__callbackQueue[scriptUrl] = undefined;
                }
            }
            
            if (callbackQueue.length > 1) {
                xhr.open("GET", scriptUrl, true);
            } else {
                xhr.open("GET", scriptUrl, false);
            }
            xhr.send(null);
        },
        
        // -- 加载模块行动函数
        asynLoadScript : function(scriptUrl, asyncWait, callbackQueue) {
            var scriptNode = _module.prototype.createScriptNode();
            scriptNode.setAttribute("src", scriptUrl);
            if (callbackQueue) {
                // 执行callback队列
                var execQueue = function() {
                    _module.__callbackQueue[scriptUrl] = undefined;
                    for (var q=0; q<callbackQueue.length; q++) {
                        callbackQueue[q].runCallback();
                    }
                    // 重置callback队列
                    callbackQueue = new Array(); 
                }
                scriptNode.onload = scriptNode.onreadystatechange = function() {
                    if ((!scriptNode.readyState) || scriptNode.readyState == "loaded" || scriptNode.readyState == "complete" || scriptNode.readyState == 4 && scriptNode.status == 200) {
                        asyncWait > 0 ? setTimeout(execQueue, asyncWait) : execQueue();
                    }
                };
            }
            var headNode = document.getElementsByTagName("head")[0];
            headNode.appendChild(scriptNode);
        },    
        
        // -- 执行当前 callback
        curCallBack : function(_callback, _context) {
            this.callback = _callback;
            this.context = _context;
            this.runCallback = function() {
                !!this.callback && (!!this.context ? this.callback.call(this.context) : this.callback());
            };
        },
        // -- 获取callback列表
        getCallbackQueue: function(scriptUrl) {
            if (!_module.__callbackQueue) _module.__callbackQueue = {};    
             var callbackQueue = _module.__callbackQueue[scriptUrl];        
             if (!callbackQueue) callbackQueue = _module.__callbackQueue[scriptUrl] = new Array();
             return callbackQueue;
        },
        
        createScriptNode : function() {
            var scriptNode = document.createElement("script");
            scriptNode.setAttribute("type", "text/javascript");
            scriptNode.setAttribute("language", "Javascript");
            return scriptNode;    
        },
        injectScript: function (scriptText, scriptName) {
            var scriptNode = _module.prototype.createScriptNode();
            try {
                scriptNode.setAttribute("name", scriptName);
            } catch (err) { }
            scriptNode.text = scriptText;
            var headNode = document.getElementsByTagName("head")[0];
            headNode.appendChild(scriptNode);
        }
        
    }
    // 提供静态方法
    _module.register = _module.prototype.register;
    _module.load = _module.prototype.load;
    _module.defaultAsyncTime = _module.prototype.defaultAsyncTime;
    _module.asynLoadScript = _module.prototype.asynLoadScript;
    _module.xhrLoadScript = _module.prototype.xhrLoadScript;
    
    /**
     * 模块并发（确认并发模块间没有依赖关系）。可以代替如下：
     * Laro.module('a');
     * Laro.module('b');
     * --> Laro.multiModule('a','b') or Leta.multiModule(['a', 'b'])
     * 本方法暂只提供“组回调”，每个并发模块也有回调的请分开写
     * 
     */
    var multiModule = function (moduleNames, cb, context) {
        var argInd = -1,
			loadSuccNum = 0,
            moduleArr = [];
       	if (_.isArray(moduleNames)) {
			moduleArr = moduleNames;
		} else {
			while (_.isString(arguments[++argInd])) {
				moduleArr.push(arguments[argInd]);
			}
			cb = arguments[argInd];
			context = arguments[++argInd];
		}
        for (var i=0, l=moduleArr.length; i < l; i++) {
			_module(moduleArr[i], function () {
						loadSuccNum ++;
						//alert(loadSuccNum);
						if (loadSuccNum == moduleArr.length) {
							!!cb && cb.call(context);							
						}
					})
		}
    }
    
    
    Laro.extend({
        module: _module,
        use: _module,
        multiModule: multiModule
    })

})(window)


/**
 * Exception
 * error handler & notifier
 * @require [global]
 */

Laro.register('.err', function (La) {
	
	/* runtime Error 扩展 */
	function RuntimeException (msg) {
		this.assign(msg);
	}

	RuntimeException.prototype = new Error();
	RuntimeException.prototype.constructor = RuntimeException;

	RuntimeException.prototype.assign = function (msg) {
		this.message = msg === undefined ? '' : msg;
	};

	/* AssertionError */
	function AssertionError (msg) {
		this.assign(msg);
	}

	AssertionError.prototype = new RuntimeException();
	AssertionError.prototype.constructor = AssertionError;

	/* Exception */
	function Exception (msg) {
		this.assign(msg);
	}

	Exception.prototype = new RuntimeException();
	Exception.prototype.constructor = Exception;

	/* interface */
	// 根据条件抛异常
	this.assert = function (condition, msg) {
		if (!condition) {
			throw new AssertionError(msg);
		}
	};
	this.RuntimeException = RuntimeException;
	this.AssertionError = AssertionError;
	this.Exception = Exception;

});


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

/**
 * util of geometry
 * @require [global]
 */

Laro.register('.geometry.util', function (La) {

	var slice = Array.prototype.slice,
		toType = La.toType,
		self = this;

	var findNumber = function (p, arr) {
		var result = arr.splice(0, 1)[0];

		for (var i = 0; i < arr.length; i ++) {
			if (toType(arr[i]) == 'number') {
				result = Math[p](result, arr[i]);
			}
		}
		return result;
	} 
	// 返回几个数中最小那个	
	this.min = Math.min;

	// 返回最大的数
	this.max = Math.max;
    
	// 返回三个数中间那个
	this.clamp = function (arg) {
		var arr = toType(arg) == 'array' ? arg : slice.call(arguments, 0),
			_min = Math.min(arr[0], Math.min(arr[1], arr[2]));
		if (arr.length === 3) {
			for (var i = 0; i < arr.length; i ++) {
				if (arr[i] === _min) {
					arr.splice(i, 1);
					break;
				}
			}
			return Math.min(arr[0], arr[1]);
		}
	};
	// 返回指定插值系数的两数插值
	this.lerp = function (from, to, t) {
		return from + t * (to - from);
	};
})


/**
 * point2
 * @require [global]
 */

Laro.register('.geometry', function (La) {
	
	var self = this,
		Class = La.base.Class;
		
	// 二维点
	var Point2 = Class({
		initialize: function (x, y) {
			this.x = x;
			this.y = y;
		},
		// x, y 平方和
		magnitudeSquared: function () {
			return this.x * this.x + this.y * this.y;
		},
		// 平方和 根
		magnitude: function () {
			return Math.sqrt(this.magnitudeSquared());
		},
		// add 
		// return this;
		add: function (v) {
			this.x += v.x;
			this.y += v.y;
			return this;
		},
		// add a vector
		// return new vector
		addNew: function (v) {
			return new Point2(this.x + v.x, this.y + v.y);		
		},
		sub: function (v) {
			this.x -= v.x;
			this.y -= v.y;
			return this;
		},
		subNew: function (v) {
			return new Point2(this.x - v.x, this.y - v.y);		
		},
		mul: function (f) {
			this.x *= f;
			this.y *= f;
			return this;
		},
		mulNew: function (f) {
			return new Point2(this.x * f, this.y * f);		
		},
		div: function (f) {
			this.x /= f;
			this.y /= f;
			return this;
		},
		divNew: function (f) {
			return new Point2(this.x / f, this.y / f);		
		},
		equal: function (v) {
			return (this.x === v.x && this.y === v.y);	   
		},
		notEqual: function (v) {
			return (this.x !== v.x || this.y !== v.y);		  
		},
		copy: function () {
			return new Point2(this.x, this.y);	  
		}
	});

	this.Point2 = Point2;

});


/**
 * Vector2
 * @require [global, base.class, geometry.point2]
 */

Laro.register('.geometry', function (La) {
		
	var self = this,
		Class = La.base.Class,
		Point2 = La.geometry.Point2;

	var Vector2 = Point2.extend({
		// 矢量点积
		dot: function (v) {
			return this.x * v.x + this.y * v.y;
		},
		
		cross: function (v) {
			return this.x * v.x - this.y * v.y; 
		},
		length: function () {
			return this.magnitude();
		},
		// 单位化
		normalize: function () {
			var inv = 1 / this.length();
			this.x *= inv;
			this.y *= inv;
			return this;
		},
		copy: function () {
			return new Vector2(this.x, this.y);
		} 
	});

	Vector2.zero = new Vector2(0, 0);
	Vector2.X = new Vector2(1, 0);
	Vector2.Y = new Vector2(0, 1);

	this.Vector2 = Vector2;
		
})


/**
 * Perlin
 * 噪声花边
 * @require [global, point2, vector2, geometry.util]
 */

Laro.register('.geometry.perlin', function (La) {
	this.start = true;
	this.g1 = [];
	this.p = [];
		
	this.noise = function (arg) {
		var bx0, bx1,
			rx0, rx1,
			sx , t, u, v;

		if (this.start) {
			this.start = false;
			this.init();
		}

		var s = this.setup(arg, bx0, bx1, rx0, rx1);

		sx = this.s_curve(s.rx0);
		u = s.rx0 * this.g1[this.p[s.bx0]];
		v = s.rx1 * this.g1[this.p[s.bx1]];

		return La.geometry.util.lerp(u, v, sx);
	};
	// 三次曲线，可调整
	this.s_curve = function (t) {
		return t * t * (3 - 2*t);
	};

	this.setup = function (i, bx0, bx1, rx0, rx1) {
		var B = 0x100, // 256
			BM = 0xff, // 255
			N = 0x1000,// 4096
			NP = 12,   // 
			NM = 0xfff,// 4095
			s = {};

		s.t = i + N;
		s.bx0 = Math.floor(s.t) & BM;
		s.bx1 = (s.bx0 + 1) & BM;
		s.rx0 = s.t - Math.floor(s.t);
		s.rx1 = s.rx0 - 1;
		return s;
	};	

	this.init = function () {
		var B = 0x100, // 256
			i, j, k;
		for (i = 0; i < B; i ++) {
			this.p[i] = i;
			this.g1[i] = (Math.random() * (2*B) - B) / B;
		}

		while (-- i) {
			k = this.p[i];
			j = Math.floor(Math.random() * B);
			this.p[i] = this.p[j];
			this.p[j] = k;
		}

		for (i = 0; i < B + 2; i ++) {
			this.p[B+i] = this.p[i];
			this.g1[B + i] = this.g1[i];
		}
	}
	
})


/**
 * Chaikin
 * 球面插值曲线算法
 * @require [global, geometry.point2, geometry.vector2]
 */

Laro.register('.geometry.chaikin', function (La) {

	var Point2 = La.geometry.Point2,
		Vector2 = La.geometry.Vector2,
		self = this;
		
	this.subDivide = function (handles, subdivs) {
		if (handles.length) {
			do {
				var numHandles = handles.length;
				// 第一个点
				handles.push(new Point2(handles[0].x, handles[0].y));
 
				for (var i = 0; i < numHandles - 1; ++i) {
					// 每次拿出两个点
					var p0 = handles[i];
					var p1 = handles[i + 1];

					// 根据两个原始点创建两个新点，做插值
					var Q = new Point2(0.75 * p0.x + 0.25 * p1.x, 0.75 * p0.y + 0.25 * p1.y);
					var R = new Point2(0.25 * p0.x + 0.75 * p1.x, 0.25 * p0.y + 0.75 * p1.y);
	 
					handles.push(Q);
					handles.push(R);
				}
				// 最后一个店
				handles.push(new Point2(handles[numHandles - 1].x, handles[numHandles - 1].y));
 
				// 更新数组
				for (var i = 0; i < numHandles; ++i)
					handles.shift();
				//handles.shift(numHandles);
			} while (--subdivs > 0);
		}
	};

	// 获取多点间距
	this.getLength = function (points) {
		var len = 0;
		var diff = null;
		for (var i = 1; i < points.length; i++) {
			diff = points[i].subNew(points[i-1]);
			len += Math.sqrt(diff.x * diff.x + diff.y * diff.y);
		}
		return len;
	};
	
	// 根据长度获取点
	this.getPointAtLength = function (points, len) {
		if (points.length === 0) { return new Point2(0, 0); }
		if (points.length === 1) { return points[0]; }
 
		var diff = null;
		for (var i = 0; i !== points.length - 1; i++) {
			diff = points[i+1].subNew(points[i]);
			var segLen = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
			if (segLen > len) {
				return new Point2(points[i].x + diff.x * len / segLen, points[i].y + diff.y * len / segLen);
			} else {
				len -= segLen;
			}
		}
		return points[points.length-1];
	};

	this.getDirAtParam = function (points, param) {
		if (points.length < 2) { return new Point2(0, 0); }
 
		var totalLen = this.getLength(points);
		var tgtLen = param * totalLen;
		var diff = null;
 
		for (var i = 0; i !== points.length - 1; i++) {
			diff = points[i+1].subNew(points[i]);
			var segLen = Math.sqrt(diff.x * diff.x + diff.y * diff.y);
			if (segLen > tgtLen) {
				return diff;
			} else {
				tgtLen -= segLen;
			}
		}
	 
		return points[points.length-1].subNew(points[points.length-2]);
	};
	
	this.getEvenlySpacedPoints = function (handles, count, normals) {
		var tmp = handles.slice(0);
		var points = [];
		var dir = null;
		this.subdivide(tmp, 3);
		var len = this.getLength(tmp);
		var spacing = len / (count - 1);
		points.push(tmp[0]);
 
		if (normals) {
			dir = this.getDirAtParam(tmp, 0);
			normals.push(new Point2(-dir.y, dir.x));
		}
 
		for (var i = 1; i < count - 1; i++) {
			points.push(this.getPointAtLength(tmp, i * spacing));
			if (normals) {
				dir = this.getDirAtParam(tmp, i * spacing / len);
				normals.push(new Point2(-dir.y, dir.x));
			}
		}
	
		points.push(tmp[tmp.length-1]);
 
		if (normals) {
			dir = this.getDirAtParam(tmp, 1);
			normals.push(new Point2(-dir.y, dir.x));
		}
	 
		return points;
	};
	
	
});


/**
 * Pixel32
 * 32位像素点
 */
Laro.register('.geometry', function (La) {
		
	var assert = La.err.assert,
		Class = La.base.Class;

	var Pixel32 = Class({
		initialize: function (r, g, b, a) {
			assert(r >= 0 && r <= 255, 'Pixel32 wrong --> r');
			assert(g >= 0 && g <= 255, 'Pixel32 wrong --> g');
			assert(b >= 0 && b <= 255, 'Pixel32 wrong --> b');

			this.r = r;
			this.g = g;
			this.b = b;
			this.a = a === undefined ? 255 : a;

			this.normalized = [r/255.0, g/255.0, b/255.0, a > 1 ? a/255.0 : a];
		},
		equal: function (pix) {
			if (pix instanceof Pixel32) {
				return this.r = pix.r 
						&& this.g = pix.g
						&& this.b = pix.b
						&& this.a = pix.a;
			} else {
				return false;
			}
		},
		toString: function () {
			return 'rgba('+ this.r +', '+ this.g +', '+ this.b +', '+ this.normalized[3] +')';		  
		},
		rgbString: function () {
			return 'rgb('+ this.r +', '+ this.g +', '+ this.b +')';
		}
	});

	this.Pixel32 = Pixel32;
})

/**
 * Image Wrapper
 * 给图片加上包装，增加一些额外的参数来使用
 */

Laro.register('.texture', function (La) {
	var assert = La.err.assert,
		Class = La.base.Class || la.Class;

	/**
	 * 定义一个图片的部分区域
	 * param {Image} htmlImageElement
	 * param {number} 所要使用的region的x坐标
	 * param {number} region的y坐标
	 * param {number} region 宽
	 * param {number} region 高
	 * param {number} x 方向padding值
	 * param {number} y 方向padding
	 * param {number} 所要使用这个区域的目标宽度
	 * param {number} 目标高度
	 */
	var ImageRegion = Class(function (image, x, y, width, height, offsetX, offsetY, textureW, textureH) {
		assert(image instanceof HTMLImageElement || image instanceof HTMLCanvasElement, 'invalid image');
		this.image = image;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.offsetX = offsetX == null ? 0 : offsetX;
		this.offsetY = offsetY == null ? 0 : offsetY;
		this.textureWidth = textureW == null ? width : textureW;
		this.textureHeight = textureH == null ? height : textureH;
		this.hasPadding = (offsetX > 0) || (offsetY > 0) || (textureW > width) || (textureH > height);
	}).methods({
		getImageWidth : function () {
			return this.image.width;
		},
		getImageHeight: function () {
			return this.image.height;
		}
	});

	this.ImageRegion = ImageRegion;
		
})


/**
 * Class Rectf
 * 定义一个矩形
 */

Laro.register('.geometry', function (La) {
		
	var Class = La.base.Class || La.Class,
		assert = La.err.assert,
		Vector2 = La.geometry.Vector2,
		Point2 = La.geometry.Point2,
		Circle = La.geometry.Circle;

	var Rectf = Class(function (x0, y0, x1, y1) {
		this.x0 = x0;
		this.x1 = x1;
		this.y0 = y0;
		this.y1 = y1;
		this.width = x1 - x0 + 1;
		this.height = y1 - y0 + 1;
	}).methods({
		// 矩形中心，返回一个向量
		center: function () {
			return new Vector2((this.x0 + this.x1 + 1)/2, (this.y0 + this.y1 + 1)/2);
		},
		// 沿指定轴翻转
		invertBy: function (f) {
			f = f || 'x';
			if (f == 'x') {
				return new Rectf(-this.x1, this.y0, -this.x0, this.y1);
			} else if (f == 'y') {
				return new Rectf(this.x0, -this.y1, this.x1, -this.y0);
			}
		},
		// 移动
		offset: function (x, y) {
			if (x instanceof Vector2 || x instanceof Point2) {
				x = x.x;
				y = x.y;
			}
			return new Rectf(this.x0 + x, this.y0 + y, this.x1 + x, this.y1 + y);
		},
		// 扩展矩形
		expand: function (w, h) {
			if (w instanceof Vector2 || w instanceof Point2) {
				w = w.x;
				h = w.y;
			}
			return new Rectf(this.x0 - w, this.y0 - h, this.x1 + w, this.y1 + h);
		},
		// 检测是否包含
		// 支持 对点， 向量， 矩形的检测
		contains: function (x, y) {
			var o = x;
			if (x instanceof Vector2 || x instanceof Point2) {
				// 对指定向量或点的包含关系
				return this.x0 <= o.x
					&& this.y0 <= o.y
					&& this.x1 >= o.x
					&& this.y1 >= o.y;
			} else if (x instanceof Rectf) {
				// 矩形包含关系检测
				return this.x0 <= o.x0
					&& this.y0 <= o.y0
					&& this.x1 >= o.x1
					&& this.y1 >= o.y1;
			} else {
				// 自定义 x y 坐标的点
				return this.x0 <= x
					&& this.y0 <= y
					&& this.x1 >= x
					&& this.y1 >= y;
			}
		},
		// 交叠判断
		// 支持 圆形， 矩形
		overlaps: function (shape, ox, oy) {
			var r, x, y;
			if (ox == undefined && oy == undefined) {
				ox = 0;
				oy = 0;
			} else if (ox instanceof Vector2 || ox instanceof Point2) {
				ox = ox.x;
				oy = ox.y;
			}

			if (shape instanceof Circle) {
				r = shape.r;
				// 圆心位置
				x = shape.c.x + ox;
				y = shape.c.y + oy;
				return this.x0 - r <= x
					&& this.y0 - r <= y
					&& this.x1 + r >= x
					&& this.y1 + r >= y;
			} else if (shape instanceof Rectf) {
				return !(this.x0 > shape.x1 + ox || this.x1 < shape.x0 + ox || this.y0 > shape.y1 + oy || this.y1 < shape.y0 + oy);
			} else {
				// TODO
			}
		},
		// 用矩形去剪裁一个向量
		clip: function (v) {
			return new Vector2(Math.max(this.x0, Math.min(this.x1, v.x)), Math.max(this.y0, Math.min(this.y1, v.y)));	   
		},
		// copy
		copy : function () {
			return new Rectf(this.x0, this.y0, this.x1, this.y1);
		},
		// include
		include: function (x, y) {
			if (x instanceof Vector2 || x instanceof Point2) {
				x = x.x;
				y = x.y;
			}
			this.x0 = Math.min(this.x0, x);
			this.y0 = Math.min(this.y0, y);
			this.x1 = Math.max(this.x1, x);
			this.y1 = Math.max(this.y1, y);
			this.width = this.x1 - this.x0 + 1;
			this.height = this.y1 - this.y0 + 1;
		}
	});

	this.Rectf = Rectf;
	this.Rectangle = Rectf;
})

/**
 * layer for render
 * {Class}
 */

Laro.register('.world', function (La) {
	var Class = La.base.Class || Laro.Class,
		assert = La.err.assert,
		Rectf = La.geometry.Rectf;

	// tiles 是一个list
	// 包含元组（imageW, x, y, centered, flipped）
	// *暂时要求为必须
	var Layer = Class(function (tiles) {
		if (tiles != undefined) {
			this.tiles = tiles;
			this.image = this.tiles[0].image;
			assert(this.count > 0, 'arguments of Layer is not enough');
		}	
	}).methods({
		count: function () {
			return this.tiles.length / 5;
		},
		// 获取当前layer 元组在layers list 的参数里的实际位置
		offset: function (i) {
			return i * 5;
		}
	});

	/**
	 * TileLayer
	 * 地图层
	 * @inherit from Layer
	 * tiles @param 用于组成tile 的元组
	 * indices @param {Array} 用于标记被分成每一小块地图的位置
	 * sx @param {Number} 横向tile的个数
	 * sy @param {Number} 纵向tile的个数
	 */
	var TileLayer = Layer.extend(function (tiles, indices, sx, sy) {
		assert(indices.length == sx * sy);
		this.indices = indices;
		this.sx = sx;
		this.sy = sy;
	}).methods({
		// 获取指定位置tile
		// i, j 都是从0 开始
		index : function (i, j) {
			return this.indices[i + this.sx * j];
		},
		// 获取对应tile的配置的位置
		tile: function (i, j) {
			var ind = j == null ? i : this.index(i, j);
			return ind == -1 ? -1 : ind * 5;
		},
		// 获取上一个指定位置的上一个tile
		previous: function (i, j) {
			if (i === 0) {
				return j == 0 ? -1 : this.index(this.sx - 1, j - 1)
			} else {
				return this.index(i - 1, j);
			}
		}
	});

	/**
	 * SpriteLayer
	 * 精灵层
	 * @inherit from Layer
	 * tiles @param {Array} tile 元组组成的list
	 * rectangles @param {Rect} 矩形边框
	 * rect @param {Rect}
	 */
	var SpriteLayer = Layer.extend(function (tiles, rectangles, rect) {
		assert(rect instanceof Rectf);
		this.rectangles = rectangles;
		this.rect = rect;
	});

	this.Layer = Layer;
	this.TileLayer = TileLayer;
	this.SpriteLayer = SpriteLayer;
			
});

/**
 * Render
 * {Class}
 */

Laro.register('.world', function (La) {
	var Class = La.base.Class || La.Class,
		Pixel32 = La.geometry.Pixel32,
		Rectf = La.geometry.Rectf,
		assert = La.err.assert,
		Layer = La.world.Layer,
		TileLayer = La.world.TileLayer,
		SpriteLayer = La.world.SpriteLayer;

	var Render = Class(function () {
		// scale
		this.scaleFactor = 1.0;
		this.width = 0;
		this.height = 0;
		this.clips = [];
		this.defaultClip = null;

		this.frontToBack = false;

		this.calls = 0;
		this.maxCalls = 10000;

		this.red = new Pixel32(255, 0, 0);
		this.green = new Pixel32(0, 255, 0);
		this.blue = new Pixel32(0, 0, 255);
		this.black = new Pixel32(0, 0, 0);
		this.white = new Pixel32(255, 255, 255);
		this.transparent = new Pixel32(0, 0, 0, 0);
	}).methods({
		isFrontToBack: function () {
			return this.frontToBack;
		},
		clear: function () {},
		getWidth: function () { return this.width },
		getHeight: function () { return this.height },
		getSafeRect: function () { return new Rectf(0, 0, this.getWidth(), this.getHeight()) },
		reset: function (w, h) {
			assert(w > 0 && h > 0, 'invalid arguments');
			this.width = w;
			this.height = h;
			this.defaultClip = new Rectf(0, 0, w/this.scaleFactor, h/this.scaleFactor);
		},
		setScaleFactor: function (factor) {
			assert(factor > 0.0, 'factor wrong');
			this.scaleFactor = factor;
			this.defaultClip = new Rectf(0, 0, this.getWidth()/this.scaleFactor, this.getHeight()/this.scaleFactor);
		},

		/**
		 * 以下未定义的空函数会在继承于Render的子类中定义
		 * 
		 */

		drawLine: function (x0, y0, x1, y1, color) {  },
		drawCircle: function (x, y, r, color) {},
		drawRect: function (x0, y0, x1, y1, color) {},
		//折线
		drawQuad: function (verts, cols) {
			
		},
		// 三角形
		drawTris: function (verts, cols) {},
		// 从上向下渐变的rect
		drawFilledRect: function (x0, y0, x1, y1, c1, c2) {},
		// 渐变三角形
		drawFilledTris: function (verts, cols) {},
		// image
		// @param imgW {ImageWapper}
		// @param x {Number} 坐标 0 到 width
		// @param y {Number} 坐标 0 到Height
		// @param angle {Number} 图片旋转角度
		// @param centered {Boolean} 是否居中
		// @param alpha ｛Number｝0-255 透明度。默认255
		// @param tint {Pixel32} 像素混合
		// @param flipped {Boolean} 是否沿y 轴翻转
		drawImage: function (imgW, x, y, angle, centered, alpha, tint, flipped) {},
		/**
		 * 在三角形区域画图
		 *
		 * @param imgW {ImageWapper}
		 * @param xy {Array} 三角形三个顶点的坐标list
		 * @param uv {Array} 三角形texture 的坐标list
		 * @param tint {Pixel32} 32位像素点混合
		 */
		drawTriangleImage: function (imgW, xy, uv, tint) {},
		/**
		 * draws a particle
		 *
		 * @param imgW {ImageWapper}
		 * @param x {number}
 		 * @param y {Number} 0..height
		 * @param angle {Number} a float in radians
		 * @param scaleX {Number} defines image scaling
		 * @param scaleY {Number} defines image scaling
		 * @param alpha {Number} default is 255
		 * @param color {Pixel32}
		 * @param additive {Boolean} defines alpha blending mode
		 */		
		drawParticle: function (imgW, x, y, angle, scaleX, scaleY, alpha, color, additive) {},
		/**
		 * 一系列图片，当需要平铺的图片或者可以用同一张图片的时候。
		 *
		 * @param imgW {ImageWapper}
		 * @param x {Number} 0..width
		 * @param y {Number} 0..height
		 * @param htiles {Number} horizontal tiles: > 0
		 * @param vtiles {Number} vertical tiles: > 0
		 * @param alpha {Number} 0..255
		 */
		drawTilingImage: function (imgW, x, y, htiles, vtiles, alpha) {
			var i, j,
				w = imgW.textureWidth,
				h = imgW.textureHeight;
			for (i = 0; i < htiles; i ++) {
				for (j = 0; j < vtiles; j ++) {
					this.drawImage(imgW, x + i*w, y + j*h, 0, true, alpha);
				}
			}
		},
		/**
		 * draws a layer
		 *
		 * @param layer {Layer}
		 * @param ox {Number} offset in pixels
		 * @param oy {Number} offset in pixels
		 * @param x {Number} first tile
		 * @param y {Number} first tile
		 * @param nx {Number} tile index
		 * @param ny {Number} tile index
		 */
		drawLayer: function (layer, ox, oy, x, y, nx, ny) {
			var i, j, img, ix, iy, centered, flipped, offset;
			if (layer instanceof Layer) {
				// draw 所有行
				for (j = y; j < y + ny; j ++) {
					var previous = layer.previous(x, j),
						last = layer.index(x + nx - 1, j);
					// 画所有列
					var imgW, ix, iy, centered, flipped, offset;
					for (i = previous + 1, offset = i*5; i <= last; i ++) {
						imgW = layer.tiles[offset++];
						ix = layer.tiles[offset++];
						iy = layer.tiles[offset++];
						centered = layer.tiles[offset++];
						flipped = Layer.tiles[offset++];

						this.drawImage(imgW, ox + ix, oy + iy, 0, centered, 1, null, flipped);
					}
				}
			} else if (layer instanceof SpriteLayer) {
				var frontToBack = this.isFrontToBack();
				for (i = 0; i < layer.count(); i ++) {
					offset = 4 * (frontToBack ? this.count() - 1 - i : i);
					var minX = layer.rectangles[offset ++],
						minY = layer.rectangles[offset++],
						maxX = layer.rectangles[offset++],
						maxY = layer.rectangles[offset++];
					if (maxX >= x && minX <= x + nx && maxY >= y && minY <= y + ny) {
						offset = 5 * (frontToBack ? layer.count() - 1 - i : i);

						imgW = layer.tiles[offset++];
						ix = layer.tiles[offset++];
						iy = layer.tiles[offset++];
						centered = layer.tiles[offset++];
						flipped = layer.tiles[offset++];

						this.drawImage(imgW, ox + ix, oy + iy, 0, centered, 1, null, flipped);
					}
				}
			} else {
				assert(false);
			}
		},
		// image text
		drawText: function (imgW, x, y, alpha) {
					  
		},
		drawCanvas: function (canvas, x, y) {},
		// pure text on canvas
		drawSystemText: function (txt, x, y, color) {},
		// fill screen
		drawFillScreen: function (color) {},
		
		/**
		 * clip methods
		 * 剪裁
		 */
		pushClipRect: function (r) {
			assert(r instanceof Rectf);
			this.clips.push(r);
		},
		popClipRect: function () {
			assert(this.clips.length > 0, 'no clip to pop');
			return this.clips.pop();
		},
		// 获取当前起作用的clip，通常是最后一个
		getClipRect: function () {
			if (this.clips.length == 0) {
				return this.defaultClip;
			} else {
				return this.clips[this.clips.length - 1];
			}			 
		},
		flush: function () {
			this.calls = 0;	   
		}

	});

	this.Render = Render;
});


/**
 * canvas render
 * {Class}
 * @inherit from {Render}
 */

Laro.register('.world', function (La) {
		
	var assert = La.err.assert,
		Render = La.world.Render,
		Class = La.base.Class,
		toType = La.toType,
		Layer = La.world.Layer,
		TileLayer = La.world.TileLayer,
		SpriteLayer = La.world.SpriteLayer;

	var CanvasRender = Render.extend(function (canvasElement, scale, frontToBack) {
		this.canvas = canvasElement;
		this.context = this.canvas.getContext('2d');
		this.scaleFactor = toType(scale) == 'number' ? scale : 1.0;

		this.context.scale(this.scaleFactor, this.scaleFactor);

		this.frontToBack = frontToBack == undefined ? false : frontToBack;

		if (this.frontToBack) {
			this.context.globalCompositeOperation = 'destination-over';
		}

		this.secondCanvas = document.createElement('canvas');
		this.secondContext = this.secondCanvas.getContext('2d');
	}).methods({
		getWidth: function () {
			return this.canvas.width || 800;
		},
		getHeight: function () {
			return this.canvas.height || 600;
		},
		// draw Rect
		drawRect: function (x0, y0, x1, y1, color) {
			x0 = Math.floor(x0);
			y0 = Math.floor(y0);
			x1 = Math.floor(x1);
			y1 = Math.floor(y1);
			this.context.lineWidth = 2;
			this.context.strokeStyle = color.toString();
			this.context.strokeRect(x0, y0, x1 - x0, y1 - y0);
		},
		drawLine: function (x0, y0, x1, y1, color) {
			x0 = Math.floor(x0);
			y0 = Math.floor(y0);
			x1 = Math.floor(x1);
			y1 = Math.floor(y1);
			this.context.lineWidth = 2;
			this.context.strokeStyle = color.toString();
			this.context.beginPath();
			this.context.moveTo(x0, y0);
			this.context.lineTo(x1, y1);
			this.context.stroke();
		},
		// draw circle
		drawCircle: function (x, y, r, color) {
			this.context.lineWidth = 2;
			this.context.strokeStyle = color.toString();
			this.context.beginPath();
			this.context.arc(x, y, r, 0, Math.PI*2, true);
			this.context.stroke();
		},
		// 填充颜色的矩形
		// 如果指定两个颜色，则由上向下渐变
		drawFilledRect: function (x0, y0, x1, y1, color, color2) {
			if (this.calls ++ > this.maxCalls) return;
			this.context.save();
			if (color2 != undefined) {
				var gradient = this.context.createLinearGradient(0, y0, 0, y1);
				gradient.addColorStop(0, color.toString());
				gradient.addColorStop(0, color2.toString());
				this.context.fillStyle = gradient;
			} else {
				this.context.fillStyle = color.toString();
			}

			this.context.fillRect(x0, y0, x1-x0, y1 - y0);
			this.context.restore();
		},
		drawImage: function (imgW, x, y, angle, centered, alpha, tint, hFlipped) {
			if (this.calls++ > this.maxCalls) return;
			this.context.save();
			if (toType(alpha) == 'number' && alpha != 1) {
				this.context.globalAlpha = alpha;
			}
			this.context.translate(x, y);

			var halfWidth = Math.floor(imgW.textureWidth / 2);
			var halfHeight = Math.floor(imgW.textureHeight / 2);

			if (toType(angle) == 'number' && angle != 0) {
				if (!centered) {
					this.context.translate(halfWidth, halfHeight);
				}
				this.context.rotate(angle);
				this.context.translate(-halfWidth, -halfHeight);
			} else if (centered) {
				this.context.translate(-halfWidth, -halfHeight);
				x = -halfWidth;
				y = -halfHeight;
			}

			if (hFlipped) {
				//横向，沿y轴翻转
				x = -x;
				this.context.scale(-1, 1);
				this.context.translate(-imgW.textureWidth, 0);
				x -= imgW.textureWidth;
			}
			// offset of the image
			this.context.translate(imgW.offsetX, imgW.offsetY);
			x += imgW.offsetX;
			y += imgW.offsetY;

			if(!this.frontToBack) {
				this.drawEMBImage(imgW, x, y, angle !== 0, this.context);
			}

			//图片边缘混合色
			if (!!tint && tint.a != 0) {
				//在secondCanvas上画image，加上alpha通道
				//再画一个矩形覆盖在上面用tint的color来模拟边缘模糊效果
				this.secondContext.clearRect(0, 0, this.secondCanvas.width, this.secondCanvas.height);
				if (this.secondCanvas.width != imgW.width) {
					this.secondCanvas.width = imgW.width;
				}
				if (this.secondCanvas.height != imgW.height) {
					this.secondCanvas.height = imgW.height;
				}
				this.secondContext.save();

				this.drawEMBImage(imgW, 0, 0, false, this.secondContext);

				// 保留相交部分
				this.secondContext.globalCompositeOperation = 'source-in';
				this.secondContext.globalAlpha = tint.a > 1 ? tint.a/255 : tint.a;
				this.secondContext.fillStyle = tint.rgbString();
				this.secondContext.fillRect(0, 0, this.secondCanvas.width, this.secondCanvas.height);
				this.secondContext.restore();

				this.context.drawImage(this.secondCanvas, 0, 0);
			}

			if (this.frontToBack) {
				this.drawEMBImage(imgW, x, y, angle != 0, this.context);
			}

			this.context.restore();
		},
		scale: function (v) {
			return Math.ceil(v * this.scaleFactor) / this.scaleFactor;	   
		},
		drawEMBImage: function (imgW, x, y, angled, context) {
			if (!imgW.image.complete) return;
			if (this.scaleFactor !== 1 && !angled) {
				var xs = this.scale(x);
				var ys = this.scale(y);
				var xe = this.scale(x + imgW.width - xs);
				var ye = this.scale(y + imgW.height - ys);
				// drawImage 后面8个关于位置的参数，前4个是针对image的，后面四个是针对canvas的
				context.drawImage(imgW.image, imgW.x, imgW.y, imgW.width, imgW.height, xs-x, ys-y, xe, ye);
			} else {
				context.drawImage(imgW.image, imgW.x, imgW.y, imgW.width, imgW.height, 0, 0, imgW.width, imgW.height);
			}
		},
		// image text
		drawText: function (img, x, y, alpha, forced) {
			if (this.calls++ > this.maxCalls && !forced) return;
			this.context.save();
			if (toType(alpha) == 'number') {
				this.context.globalAlpha = alpha;
			}
			this.context.drawImage(img, x, y);
			this.context.restore();
		},
		// clear canvas
		// 如果指定了color，则在clear画布之后加上颜色
		clear: function (color) {
			this.calls = 0;
			this.context.clearRect(0, 0, this.canvas.width/this.scaleFactor, this.canvas.height/this.scaleFactor);
			!!color && this.context.fillRect(0, 0, this.canvas.width/this.scaleFactor, this.canvas.height/this.scaleFactor, color.toString());
		},
		// 针对画布上已经分好的格子 画一系列的 image（平铺拼接）
		drawTilingImage: function (imgW, x, y, htiles, vtiles, alpha) {
			alpha = alpha == undefined ? 1 : alpha;
			this.context.save();
			if (alpha != 1) {
				this.globalAlpha = alpha;
			}
			for (var i = 0; i < htiles; i ++) {
				for (var j = 0; j < vtiles; j ++) {
					this.context.save();
					var xpos = x + imgW.textureWidth * i - imgW.textureWidth/2;
					var ypos = y + imgW.textureHeight * j - imgW.textureHeight/2;
					this.context.translate(xpos, ypos);
					this.drawEMBImage(imgW, xpos, ypos, false, this.context);
					this.context.restore();
				}
			}
			this.context.restore();
		},
		// 画n边形
		// @param verts {Array} 2n个元素数组，分别是n个点的xy坐标
		drawQuad: function (verts, color) {
			var i2 = verts.length - 2;
			for (var i = 0; i < verts.length; i += 2) {
				this.drawLine(verts[i], verts[i + 1], verts[i2], verts[i2 + 1], color);
				i2 = i;
			}
		},
		drawPoly: function (verts, color) {
			this.drawQuad(verts, color);		  
		},
		// n个三角形
		// @param verts {Array} 6n个元素数组，n个三角形的3个点的x,y坐标
		drawTris: function (verts, color) {
			assert(verts.length%6 !== 0, 'invalid points number');
			var n = verts.length / 6,
				i2;
			for (var v = 0; v < n; v += 6) {
				i2 = v + 4;
				for (var i = v; i < v + 6; i += 2) {
					this.drawLine(verts[i], verts[i + 1], verts[i2], verts[i2 + 1], color);
					i2 = i;
				}
			}
		},
		drawFillScreen: function (color) {
			if (this.calls ++ > this.maxCalls) return;
			this.context.fillStyle = color.toString();
			this.context.fillRect(0, 0, this.canvas.width/this.scaleFactor, this.canvas.height/this.scaleFactor);
		},
		// 纯文本
		drawSystemText: function (txt, x, y, color) {
			this.context.textAlign = 'left';
			this.context.fillStyle = color.toString();
			this.context.fillText(txt, x, y);
		},
		setScaleFactor: function (factor, reset) {
			if (!!reset) {
				this.context.scale(1/this.scaleFactor, 1/this.scaleFactor);
			}			
			this.scaleFactor = factor;
			this.context.scale(this.scaleFactor, this.scaleFactor);
			if (this.frontToBack) {
				this.context.globalCompositeOperation = 'destination-over';
			}
		},
		getContext: function () {
			return this.context;			
		},
		// http://tulrich.com/geekstuff/canvas/jsgl.js
		drawTriangleImage : function(image, xy, uv, tint) {
			var x0 = xy[0];
			var y0 = xy[1];
			var x1 = xy[2];
			var y1 = xy[3];
			var x2 = xy[4];
			var y2 = xy[5];
 
			var sx0 = uv[0];
			var sy0 = uv[1];
			var sx1 = uv[2];
			var sy1 = uv[3];
			var sx2 = uv[4];
			var sy2 = uv[5];
 
			this.context.save();
			this.context.beginPath();
			this.context.moveTo(x0, y0);
			this.context.lineTo(x1, y1);
			this.context.lineTo(x2, y2);
			this.context.closePath();
			this.context.clip();
 
			var denom = sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0;
			if (denom === 0) return;
 
			var m11 = -(sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) / denom;
			var m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) / denom;
			var m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) / denom;
			var m22 = -(sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) / denom;
			var dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) / denom;
			var dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) / denom;
 
			this.context.transform(m11, m12, m21, m22, dx, dy);
			this.drawEMBImage(image, 0, 0, false, this.context);
			this.context.restore();
		},
		// image particle
		drawParticle: function (img, x, y, angle, scaleX, scaleY, alpha, color, additive) {
			if (this.calls ++ > this.maxCalls) return;
			this.context.save();
			this.context.translate(x, y);
			if (scaleX != 1 || scaleY != 1) {
				this.context.scale(scaleX, scaleY);
			}
			if (additive) {
				// 相交处颜色中和
				this.context.globalCompositeOperation = 'lighter';
			}
			this.drawImage(img, 0, 0, angle, true, alpha, null, false);
			this.context.restore();
		},
		drawCanvas: function (canvas, x, y) {
			if (this.calls ++ > this.maxCalls) return;
			this.drawImage(canvas, x, y);
		},
		drawLayer: function (layer, ox, oy, x, y, nx, ny) {
			var i, j, offset;
			if (layer instanceof TileLayer) {
				for (j = y; j < y + ny; j ++) {
					var previous = layer.previous(x, j),
						last = layer.index(x + nx - 1, j);
					var img, ix, iy, centered, flipped;
					for (i = previous + 1, offset = i * 5; i <= last; i ++) {
						if (this.calls ++ > this.maxCalls) continue;
						img = layer.tiles[offset++];
						ix = layer.tiles[offset++];
						iy = layer.tiles[offset++];
						offset ++;
						flipped = layer.tiles[offset++];
						// draw tile image
						var px = ox + ix + img.offsetX,
							py = oy + iy + img.offsetY,
							width = img.width,
							height = img.height;

						if (this.scaleFactor != 1) {
							px = this.scale(px);
							py = this.scale(py);
							width = this.scale(width);
							height = this.scale(height);
						}

						if (!flipped) {
							this.context.drawImage(img.image, img.x, img.y, img.width, img.height, px, py, width, height);
						} else {
							this.context.scale(-1, 1);
							this.context.drawImage(img.image, img.x, img.y, img.width, img.height, -(px + width), py, width, height);
							this.context.scale(-1, 1);
						}
					}
				}
			} else if (layer instanceof SpriteLayer) {
				var count = layer.count;
				for (i = 0; i < count; i ++) {
					offset = 4 * i;
					var minX = layer.rectangles[offset ++],
						minY = layer.rectangles[offset ++],
						maxX = layer.rectangles[offset ++],
						maxY = layer.rectangles[offset ++];

					if (maxX >= x && minX <= x + nx && maxY >= y && minY <= y + ny) {
						if (this.calls++ > this.maxCalls) continue;
						offset = 5 * i;
						img = layer.tiles[offset ++];
						ix = layer.tiles[offset ++];
						iy = layer.tiles[offset ++];
						centered = layer.tiles[offset ++];
						flipped = layer.tiles[offset ++];

						this.drawImage(img, ox + ix, oy + iy, 0, centered, 1, null, flipped);
					}
				}
			} else {
				assert(false);
			}
		},
		pushClipRect: function (rect) {
			this.context.save();
			this.context.beginPath();
			this.context.moveTo(rect.x0, rect.y0);
			this.context.lineTo(rect.x0, rect.y1);
			this.context.lineTo(rect.x1, rect.y1);
			this.context.lineTo(rect.x1, rect.y0);
			this.context.lineTo(rect.x0, rect.y0);
			this.context.clip();
		},
		popClipRect: function () {
			this.context.restore();			 
		}
	});

	this.CanvasRender = CanvasRender;
})




