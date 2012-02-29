/**
 * module for GUI
 * such as buttons and so on
 */

Laro.register('.gui', function (La) {

	var Class = Laro.Class,
		Point2 = Laro.Point2;
	
	// base button Class
	var GUIBox = Class(function () {
		this.buttons = [];
		this.maxWidth = 0;
		this.xCenter = 400; // xCenter
		this.y = 200;
		this.spacing = 6; // default spacing
		this.keyboardPosition = null;
	}).methods({
		draw: function (render) {
			for (var i = 0; i < this.buttons.length; i ++) {
				var btn = this.buttons[i];
				btn.draw(render, btn.position.x, btn.position.y, null);
			}
		},
		addButton: function (newButton) {
			this.buttons.push(newButton);
			var y = this.y;
			for (var i = 0; i < this.buttons.length; i ++) {
				var btn = this.buttons[i];
				btn.position = new Point2(Math.floor(this.xCenter - btn.size.width/2), y);
				y = y + btn.size.height + this.spacing;
			}
		},
		update: function (dt) {
			//TODO
		}
	
	});
		
})
