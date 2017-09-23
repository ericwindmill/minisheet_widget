function Formula(string) {
	string = string.toUpperCase();
	string = string.replace(/,/g, ';');

	this.cursor = 0;
	this.string = string;
}

Formula.prototype.parse = function() {
	var fnc = null,
		bgn = this.cursor,
		str = this.string.replace(/=/g, ''),
		opn = 0,
		tmp = '', equ = '', rsl = '';

	if (arguments[0] != null) {
		fnc = arguments[0];
	}

	for (var i = bgn, len = str.length; i < len; i++) {
		if (str[i].match(/[-+*/%();]/) || (i + 1) == len) {
			tmp = str.substring(bgn, i);
			if (tmp.match(/(AVG)|(COUNT)|(MAX)|(MIN)|(SUM)/)) {
				equ += this.parse(tmp);
				i = this.cursor;
			} else if (tmp.indexOf(':') != -1) {
				equ += this.span(tmp);
			} else if (sheet.data[tmp] != undefined) {
				equ += this.cellValue(tmp);
			} else if (isNaN(tmp)) {
				equ += 0;
			} else {
				equ += tmp;
			}
			if (str[i]) equ += str[i];
			if (str[i] == '(') opn++;
			if (str[i] == ')') opn--;
			bgn = i + 1;
		}
		if (fnc && opn == 0) {
			this.cursor++;
			break;
		}
		this.cursor++;
	}

	switch (fnc) {
		case 'AVG':
			equ = this.AVG(equ);
			break;
		case 'COUNT':
			equ = this.COUNT(equ);
			break;
		case 'MAX':
			equ = this.MAX(equ);
			break;
		case 'MIN':
			equ = this.MIN(equ);
			break;
		case 'SUM':
			equ = this.SUM(equ);
			break;
	}

	try {
		rsl = eval(equ);
		rsl = Math.round(rsl*100)/100;
	}
	catch (err) {
		rsl = 'Error';
	}
	
	return rsl;
};

Formula.prototype.SUM = function(str) {
	return str.replace(/;/g, '+');
};

Formula.prototype.MAX = function(str) {
	var arr = str.split(';').toNumber();
	return Math.max.apply(Math, arr);
};

Formula.prototype.MIN = function(str) {
	var arr = str.split(';').toNumber();
	return Math.min.apply(Math, arr);
};

Formula.prototype.COUNT = function(str) {
	return str.split(';').length;
};

Formula.prototype.AVG = function(str) {
	var arr = str.split(';'), num = 0, x;
	for (var i = 0, len = arr.length; i < len; i++) {
		x = arr[i] * 1;
		arr[i] = (isNaN(x)) ? 0 : x;
		num = num + arr[i];
	}
	return num/len;
}

Formula.prototype.span = function(str) {
	var arr  = str.split(':'),
		bCol = arr[0].substr(0,1).charCodeAt(0),
		bRow = arr[0].substr(1),
		eCol = arr[1].substr(0,1).charCodeAt(0),
		eRow = arr[1].substr(1),
		sCol, iRow, n = [], cel;

	while (bCol <= eCol && bCol < 90) {
		sCol = String.fromCharCode(bCol);
		iRow = bRow;
		while (iRow != eRow && iRow < 26) {
			cel = sCol + iRow++;
			if (sheet.data[cel] != undefined) {
				n.push(this.cellValue(cel))
			}
		}
		cel = sCol + iRow;
		if (sheet.data[cel] != undefined) {
			n.push(this.cellValue(cel))
		}
		bCol++;
	}

	return n.join(';');
};

Formula.prototype.cellValue = function(cel) {
	var rsl;
	if (sheet.data[cel].substr(0, 1) == '=') {
		rsl = sheet.values[cel];
	} else if (isNaN(sheet.data[cel])) {
		rsl = 0;
	} else {
		rsl = sheet.data[cel];
	}

	return rsl;
}
