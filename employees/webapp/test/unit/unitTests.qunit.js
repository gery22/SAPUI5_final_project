/* global QUnit */
// https://api.qunitjs.com/config/autostart/
QUnit.config.autostart = false;

sap.ui.require([
	"comgangelemployees/employees/test/unit/AllTests"
], function (Controller) {
	"use strict";
	QUnit.start();
});