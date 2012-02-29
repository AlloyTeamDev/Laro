/**
 * module for user input
 * include mouse handlers keyboard
 */
Laro.register('.game', function (La) {
	var Class = La.Class,
		Vec2 = La.Vector2,
		Point2 = La.Point2;
		
	// input handlers
	var InputHandler = Class(function (canvas, useTouch) {
		this.offset = new Vec2(0, 0);
		this.scale = 1;
		this.useTouch = useTouch;

		// Button
		var Button = function () {
			this.down = false;
			this.press = function () {
				this.down = true;
			};
			this.release = function () {
				this.down = false;
			}
		}

		if (useTouch) {
			this.bufferedTouches = [];
			this.touches = {};
		} else {
			// Mouse
			var Mouse = function () {
				this.x = 0;
				this.y = 0;
				this.left = new Button();

				var _this = this;
				this.press = function () {
					_this.left.press();
				};
				this.release = function () {
					_this.left.release();
				}
			};

			//keyboard
			var Keyboard = function () {
				this.keys = [];
				for (var k = 0; k < 255; k ++) {
					this.keys[k] = new Button();
				}

				this.press = function (key) {
					this.keys[key].press();
				}

				this.release = function (key) {
					this.keys[key].release();
				}

				this.isAnyKeysDown = function () {
					for (var k = 0; k < 255; k++) {
						if (this.keys[k].down) {
							return true;
						}
						return false;
					}
				}
			};

			// 
			this.mouse = new Mouse();
			this.keyboard = new Keyboard();
			this.bufferedInput = [];
		}

		InputHandler.instance = this;

		this.updateCanvas(canvas);
		this.updateSize(canvas);
		// TODO
		//
	}).methods({
		updateCanvas: function (canvas) {
			this.setInput(canvas);
		},
		//include mousedown & keydown
		isAnythingPressed: function () {
			if (this.keyboard != null) {
				return (GameInput.instance.isAnyKeysDown() || this.mouse.down);
			}
			// touch
			for (var t in this.touches) {
				if (this.touches.hasOwnProperty(t)) {
					return true;
				}
			}
			return false;
		},
		updateSize: function (canvas) {
			var windowDimem = new Point2(window.innerWidth, window.innerHeight);
			var canvasWidth = canvas.parentNode.style.width;
			var canvasHeight = canvas.parentNode.style.height;
			//remove 'px';
			canvasWidth = parseFloat(canvasWidth);
			canvasHeight = parseFloat(canvasHeight);

			var canvasDimen = new Point2(canvasWidth, canvasHeight);
			this.offset = windowDimem.subNew(canvasDimen).div(2);
			var maxWidth = 800;
			this.scale = canvasWidth/maxWidth;
		},
		setSize: function (scale, offset) {
			this.scale = scale;
			this.offset = offset;
		},
		setInput: function (canvas) {
			var _this = this;
			if (this.useTouch) {
				canvas.addEventListener('touchstart', function (e) {
					e.preventDefault();
					for (var t = 0; t < e.changedTouches.length; t ++) {
						var ev = e.changedTouches.item(t);
						_this.bufferedTouches.push({
							dir: 1,
							x: ev.clientX,
							y: ev.clientY,
							id: ev.identifier
						});
					} 
				}, false);

				canvas.addEventListener('touchmove', function (evt) {
					evt.preventDefault();
					for (var t = 0; t < evt.changedTouches.length; t ++) {
						var e = evt.changedTouches.item(t);
						_this.bufferedTouches.push({
							dir:0,
							x: e.clientX,
							y: e.clientY,
							id: e.identifier
						});
					}
				}, false);

				canvas.addEventListener('touchend', function (evt) {
					evt.preventDefault();
					for (var t = 0; t < evt.changedTouches.length; t ++) {
						var e = evt.changedTouches.item(t);
						_this.bufferedTouches.push({
							dir: -1,
							x: e.clientX,
							y: e.clientY,
							id: e.identifier
						});
					}
				}, false)
			} else {
				canvas.addEventListener('mousedown', function (e) {
					if (e.button === 0) {
						_this.bufferedInput.push(_this.mouse.press);
					}	
				}, false);
				canvas.addEventListener('mousemove', function (e) {
					_this.bufferedInput.push(function () {
						_this.mouse.x = Math.floor((e.clientX - _this.offset.x)/_this.scale);
						_this.mouse.y = Math.floor((e.clientY - _this.offset.y)/_this.scale);
					})	
				}, false);
				canvas.addEventListener('mouseup', function (e) {
					if (e.button === 0) {
						_this.bufferedInput.push(_this.mouse.release);
					}	
				}, false);

				//对几个关键按键默认时间的阻止，以便响应自己程序
				var blockList = {
					27: 1,
					32: 1, 
					37: 1,
					38: 1,
					39: 1,
					40: 1
				}; // esc, space, arrows keys
				window.addEventListener('keydown', function (e) {
					if (blockList[e.keyCode]) {
						e.preventDefault();
					}	
					_this.bufferedInput.push(function () {
						_this.keyboard.press(e.keyCode);	
					})
				}, false);
				window.addEventListener('keyup', function (e) {
					if (blockList[e.keyCode]) {
						e.preventDefault();
					}		
					_this.bufferedInput.push(function () {
						_this.keyboard.release(e.keyCode);	
					})
				})
			}
		},
		addTouch: function (id, x, y) {
			this.moveTouch(id, x, y);		  
		},
		delTouch: function (id, x, y) {
			delete this.touches[id];		  
		},
		moveTouch: function (id, x, y) {
			this.touchesp[id] = {
				move: false,
				x: Math.floor((x-this.offset.x)/this.scale),
				y: Math.floor((y - this.offset.y)/this.scale)
			}		   
		},
		update: function () {
			if (this.useTouch) {
				for (var t = 0; t < this.bufferedTouches.length; t ++) {
					var e = this.bufferedTouches[t];
					switch(e.dir) {
						case 1: 
							this.addTouch(e.id, e.x, e.y);
							break;
						case -1:
							this.delTouch(e.id, e.x, e.y);
							break;
						case 0:
							this.moveTouch(e.id, e.x, e.y);
							break;
					}
				}
				this.bufferedTouches = [];
			} else {
				for (var i = 0; i < this.bufferedTouches.length; i ++) {
					this.bufferedInput[i];
				}
				this.bufferedTouches = [];
			}		
		},
		isClickInCircle: function (x, y, r) {
			if (this.useTouch) {
				for (var k in this.touches) {
					var touch = this.touches[k];
					if (Math.pow(touch.x - x, 2) + Math.pow(touch.y - y, 2) < Math.pow(r, 2)) {
						return true;
					}
				}
			} else {
				if (this.mouse.left.down && (Math.pow(this.mouse.x - x, 2) + Math.pow(this.mouse.y - y, 2) < Math.pow(r, 2))) {
					return true;
				}
			}

			return false;
		}
			
	})
})
