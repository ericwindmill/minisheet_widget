function Cell(id) {
	this.set(id);
}

Cell.prototype.set = function(id) {
	this.id = id;
	this.col = id.substr(0, 1);
	this.row = id.substr(1) * 1;
}

Cell.prototype.moveRight = function() {
	var chr = this.id.charCodeAt(0),
		num	= this.row;
	chr++;
	if (chr > 68) {
		chr = 65;
		num++;
		if (num > 8) {
			num = 1;
		}
	}
	return String.fromCharCode(chr) + num;
}

Cell.prototype.moveDown = function() {
	var chr = this.id.charCodeAt(0),
		num = this.row;
	num++;
	if (num > 7) {
		num = 1;
		chr++;
		if (chr > 68) {
			chr = 65;
		}
	}
	return String.fromCharCode(chr) + num;
}

Cell.prototype.moveLeft = function() {
	var chr = this.id.charCodeAt(0),
		num	= this.row;
	chr--;
	if (chr < 65) {
		chr = 68;
		num--;
		if (num < 1) {
			num = 7;
		}
	}
	return String.fromCharCode(chr) + num;
}

Cell.prototype.moveUp = function() {
	var chr = this.id.charCodeAt(0),
		num = this.row;
	num--;
	if (num < 1) {
		num = 6;
		chr--;
		if (chr < 65) {
			chr = 68;
		}
	}
	return String.fromCharCode(chr) + num;
}
