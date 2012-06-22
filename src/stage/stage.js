/**
 * canvas stage and sprite pattern from https://github.com/hongru/JCanvas
 * fit for Laro
 */

;(function (L) {
    
    var Class = L.Class,
        extend = L.extend,
        // mobile navigator
        isTouchDevice = (/andriod|iphone|ipad/.test(navigator.userAgent.toLowerCase()));
    
    // DisplayClass
    var DisplayClass = Class(function () {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.stage = null;
    });
    
    //InteractiveClass
    var InteractiveClass = DisplayClass.extend(function () {
        this.eventListener = {};
    }).methods({
        addEventListener: function (type, func) {
            if (this.eventListener[type] === null || this.eventListener[type] === undefined) {
                this.eventListener[type] = [];
            }
            this.eventListener[type].push(func);
        },
        removeEventListener: function (type, func) {
            if (this.eventListener[type] === null || this.eventListener[type] === undefined) {
                return;
            }
            for (var i=0; i<this.eventListener[type].length; i++) {
                // 删除指定的监听器
                if (this.eventListener[type][i] == func) {
                    delete this.eventListener[type][i];
                    this.eventListener[type].splice(i, 1);
                }
            }
            // 如果这种类型没有监听器，删除它
            if (this.eventListener[type].length === 0) {
                delete this.eventListener[type];
            }
        },
        removeAllEventListener: function (type) {
            if (this.eventListener[type] === null || this.eventListener[type] === undefined) {
                return;
            }	
            this.eventListener[type].splice();
            delete this.eventListener[type];
        },
        hasEventListener: function (type) {
            return (!!this.eventListener[type] && this.eventListener[type].length > 0);				 
        }
    });
    
    // ObjectContainerClass
    var ObjectContainerClass = InteractiveClass.extend(function () {
        this.children = [];
        this.maxWidth = 0;
        this.maxHeight = 0;
        this.hoverChildren = [];
    }).methods({

        addChild: function (child) {
            if (this.maxWidth < child.x + child.width) {
                this.maxWidth = child.x + child.width;
            }
            if (this.maxHeight < child.y + child.height) {
                this.maxHegiht = child.y + child.height;
            }
            child.stage = this;

            this.children.push(child);
        },
        addChildAt: function (child, index) {
            if (this.maxWidth < child.x + child.width) {
                this.maxWidth = child.x + child.width;
            }
            if (this.maxHeight < child.y + child.height) {
                this.maxHeight = child.y + child.height;
            }
            child.stage = this;
            this.children.splice(index, 0, child);
        },
        removeChild: function (child) {
            this.children.splice(this.getChildIndex(child), 1);
            // 如果是支撑最大宽高的child被移除了，重新处理最大宽高
            if (this.maxWidth == child.x + child.width) {
                this.maxWidth = 0;
                for (var i = 0; i < this.children.length; i++) {
                    if (this.maxWidth < this.children[i].x + this.children[i].width) {
                        this.maxWidth = this.children[i].x + this.children[i].width;
                    }
                }
            }
            if (this.maxHeight == child.y + child.height) {
                this.maxHeight = 0;
                for (var i = 0; i < this.children.length; i++) {
                    if (this.maxHeight < this.children[i].y + this.children[i].height) {
                        this.maxHeight = this.children[i].y + this.children[i].height;
                    }
                }
            }
            child.stage = null;
        },
        removeChildAt: function (index) {
            this.children[index].stage = null;
            var child = this.children.splice(index, 1);
            // 最大宽高
            if (this.maxWidth == child.x + child.width) {
                this.maxWidth = 0;
                for (var i = 0; i < this.children.length; i++) {
                    if (this.maxWidth < this.children[i].x + this.children[i].width) {
                        this.maxWidth = this.children[i].x + this.children[i].width;
                    }
                }
            }
            if (this.maxHeight == child.y + child.height) {
                this.maxHeight = 0;
                for (var i = 0; i < this.children.length; i++) {
                    this.maxHeight = 0;
                    if (this.maxHeight < this.children[i].y + this.children[i].height) {
                        this.maxHeight = this.children[i].y + this.children[i].height;
                    }
                }
            }
        },
        getChildAt: function (index) {
            return this.children[index];
        },
        getChildIndex: function (child) {
            for (var i = 0; i < this.children.length; i++) {
                if (this.children[i] == child) {
                    return i;
                }
            }
            return -1;
        },
        contains: function (child) {
            return (this.getChildIndex(child) != -1);
        },

        // 鼠标事件
        dispatchMouseEvent: function (type, x, y) {
            var mouseX = x,
                mouseY = y;
            var _hoverChildren = [];
            // check isMouseover
            function isMouseover(child) {
                var ret = false;
                // checkType  rect|circle|poly
                if (!child.checkType) {
                    child.checkType = 'rect';
                }
                switch (child.checkType) {
                case 'rect':
                    ret = (mouseX > child.x && mouseX < child.x + child.width && mouseY > child.y && mouseY < child.y + child.height);
                    break;
                case 'circle':
                    if (typeof child.radius != 'number') {
                        throw 'no radius or radius is not a number'
                    }
                    ret = (Math.sqrt(Math.pow((mouseX - child.x), 2) + Math.pow((mouseY - child.y), 2)) < child.radius);
                    break;
                case 'poly':
                    // to be continue...
                    break;
                }
                return ret;
            }

            for (var i = this.children.length-1; i >= 0; i--) {
                var child = this.children[i];
                if ( !! child.dispatchMouseEvent) {
                    child.dispatchMouseEvent(type, mouseX - child.x, mouseY - child.y);
                }
                //鼠标悬浮于子对象上面
                if (isMouseover(child)) {
                    type == 'mousemove' && _hoverChildren.length < 1 && _hoverChildren.push(child);

                    if (child.eventListener[type] == null || child.eventListener[type] == undefined) {
                        continue; // 没有事件监听器
                    }
                    // 有事件监听则遍历执行
                    for (var j = 0, arr = child.eventListener[type]; j < arr.length; j++) {
                        arr[j](mouseX - child.x, mouseY - child.y);
                    };
					// 按照绘制的倒序，只要找到第一个（最前的，亦是最后绘制的） 就 break;
					// 阻止事件冒泡
					break;
                }
            };
            if (type != 'mousemove') {
                return; // 不是 mousemove事件则到此结束
            }
            // 以下是处理mousemove事件
            for (var k = 0; k < this.hoverChildren.length; k++) {
                // 原来hoverChildren中有的，现在没有的，转而执行 mouseout
                var has = false;
                for (var m = 0; m < _hoverChildren.length; m++) {
                    if (this.hoverChildren[k] == _hoverChildren[m]) {
                        has = true;
                    }
                }
                if (!has) {
                    //不存在了，处理 this.hoverChildren[k] 的mouseout
                    // 刚好又有事件在监听mouseout，则执行
                    if ( !! this.hoverChildren[k].eventListener['mouseout']) {
                        for (var i = 0, outObj = this.hoverChildren[k]; i < outObj.eventListener['mouseout'].length; i++) {
                            outObj.eventListener['mouseout'][i](mouseX - outObj.x, mouseY - outObj.y);
                        };
                    }
                    // 处理完后就销毁
					delete this.hoverChildren[k];
					break;
                }
            };
            // 原来hoverChildren中没有的，现在有了，证明mouseover
            for (var k = 0; k < _hoverChildren.length; k++) {
                var has = false;
                for (var m = 0; m < this.hoverChildren.length; m++) {
                    if (_hoverChildren[k] == this.hoverChildren[m]) {
                        has = true;
                    }
                };
                if (!has && this.hoverChildren.length < 1/*0.4 更新；保证hover的只有一个*/) {
                    //证明鼠标刚进入，处理mouseenter或mouseover
                    this.hoverChildren.push(_hoverChildren[k]);
                    if (_hoverChildren[k].eventListener['mouseover']) {
                        for (var i = 0, enterObj = _hoverChildren[k]; i < enterObj.eventListener['mouseover'].length; i++) {
                            enterObj.eventListener['mouseover'][i](mouseX - enterObj.x, mouseY - enterObj.y);
                        }
                    }
					break;
                }
            };
            this.clearHoverChildren();
        },
        // 重新清理鼠标悬浮下的对象数组
        clearHoverChildren: function () {
            var tempArr = [];
            for (var i = 0; i < this.hoverChildren.length; i++) {
                if (this.hoverChildren[i] != null && this.hoverChildren[i] != undefined) {
                    tempArr.push(this.hoverChildren[i]);
                }
            }
            this.hoverChildren = tempArr;
        }
    });
    
    // Stage
    var Stage = ObjectContainerClass.extend(function (canvas, option) {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.stage = null;
        this.width = canvas.width;
        this.height = canvas.height;
        
        var win = window, 
            html = document.documentElement,
            context = this;
            
        function getWindowScroll() {
            return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop };
        }
        function getOffset (el) {
            el = el || context.canvas;
            var width = el.offsetWidth,
                height = el.offsetHeight,
                top = el.offsetTop,
                left = el.offsetLeft;
            while (el = el.offsetParent) {
                top = top + el.offsetTop;
                left = left + el.offsetLeft;
            }
            return {
                top: top,
                left: left,
                width: width,
                height: height
            };
        }

        // 对canvasElement 监听
        //
        var batchAddMouseEventListener = function (el, evArr) {
            for (var i=0; i<evArr.length; i++) { //console.log(evArr[i])
                el.addEventListener(evArr[i], function (param, i) {
                    return function (e) { 
                        var offset = getOffset(),
                            winScroll = getWindowScroll();

                        if (isTouchDevice) {
                            e.preventDefault();
                            var touch = evArr[i] == 'touchend' ? e.changedTouches[0] : e.touches[0];
                            var x = touch.pageX - offset.left + winScroll.x,
                                y = touch.pageY - offset.top + winScroll.y;
                        } else {
                            var x = e.clientX - offset.left + winScroll.x,
                                y = e.clientY - offset.top + winScroll.y;
                        }

                        if (!!param.eventListener[evArr[i]]) {
                            for (var j=0; j<param.eventListener[evArr[i]].length; j++) {
                                param.eventListener[evArr[i]][j](x, y);
                            }
                        }
                        param.dispatchMouseEvent(evArr[i], x, y);
                    }
                }(context, i), false);
            }
        };
        var batchAddKeyEventListener = function (el, evArr) {
            for (var i=0; i<evArr.length; i++) {
                el.addEventListener(evArr[i], function (param, i) {
                            return function (e) {
                                if (!!param.eventListener[evArr[i]]) {
                                    for (var j=0; j<param.eventListener[evArr[i]].length; j++) {
                                        param.eventListener[evArr[i]][j](e);
                                    }
                                }
                            }
                        }(context, i), false);
            }
        };
        batchAddMouseEventListener(this.canvas, ['mousemove', 'mouseup', 'mousedown', 'click', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'touchstart', 'touchmove', 'touchend']);	
        batchAddKeyEventListener(this.canvas, ['keyup', 'keydown', 'keypress']);
        
        typeof option == 'function' ? option.call(this) : extend(this, option || {});
        
    }).methods({
        onRefresh: function () {},
        getContext: function () {
            return this.ctx;
        },
        dispatchUpdate: function (dt) {
            this.update && this.update(dt);
            for (var i=0; i<this.children.length; i++) {
                this.children[i].dispatchUpdate(dt);
            }
        },
        dispatchDraw: function (rd) { 
            this.draw && this.draw(rd);
            // 画舞台元素
            for (var i=0; i<this.children.length; i++) {
                // 坐标系移到对应位置
                this.ctx.translate(this.children[i].x, this.children[i].y);
                this.children[i].dispatchDraw(rd);
                this.ctx.translate(-this.children[i].x, -this.children[i].y);
            }
        },
        clear: function (x, y, w, h) {
            if (x !== undefined && y !== undefined && w !== undefined && h !== undefined) {
                this.ctx.clearRect(x, y, w, h);
            } else {
                this.ctx.clearRect(0, 0, this.width, this.height);
            }
        }
    });
    
    /**
     * Sprite
     */
    var Sprite = ObjectContainerClass.extend(function (stage, option) {
        if (!(stage instanceof Stage)) {
            throw "sprite need a stage"
        }
        this.stage = stage;
        this.canvas = stage.canvas;
        this.ctx = stage.ctx;
        
        stage.addChild(this);
        
        typeof option == 'function' ? option.call(this) : extend(this, option || {});
    }).methods({
        getContext: function () {
            return this.ctx;
        },
        dispatchUpdate: function (dt) {
            this.update && this.update(dt);
            for (var i=0; i<this.children.length; i++) {
                this.children[i].dispatchUpdate(dt);
            }
        },
        // sprite 的dispatchDraw 加入强制缩放，保证子 sprite 不会比 自己大
        dispatchDraw: function (rd) {
            this.draw && this.draw(rd);
            // 强制缩放，保证子对象不会比自己大
            this.ctx.scale(
                this.width < this.maxWidth ? this.width/this.maxWidth : 1,
                this.height < this.maxHeight ? this.height/this.maxHeight : 1
            );
            // 绘制子对象
            for (var i=0; i<this.children.length; i++) {
                this.ctx.translate(this.children[i].x, this.children[i].y);
                this.children[i].dispatchDraw(rd);
                this.children[i].translate(-this.children[i].x, this.children[i].y);
            }
            this.ctx.scale(
                this.width < this.maxWidth ? this.maxWidth/this.width : 1,
                this.height < this.maxHeight ? this.maxHeight/this.height : 1
            );
        }
    });
    
    // public interface
    L.Stage = Stage;
    L.Sprite = Sprite;

})(Laro);