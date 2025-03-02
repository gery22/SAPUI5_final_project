sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (
	Controller, Filter, FilterOperator, Item, MessageToast, MessageBox
) {
	"use strict";

	return Controller.extend("com.gangel.employees.employees.controller.ViewEmployee", {
		onInit: function () {
			this._resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this._splitApp = this.byId("idSplitApp");
		},

		onEmployeeSelect: function (oEvent) {
			this._splitApp.to(this.createId("employeeDetails"));
			var bindingContext = oEvent.getParameter("listItem").getBindingContext("zemployees");
			this.employeeId = bindingContext.getProperty("EmployeeId");

			var employeeDetails = this.byId("employeeDetails");
			employeeDetails.bindElement("zemployees>/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')");
		},

		onPressBack: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.navTo("RouteMain");
		},

		onSearchEmployee: function (oEvent) {
			var sInput = oEvent.getParameter("newValue");
			var oList = this.byId("list");
			var oBinding = oList.getBinding("items");

			var filters = [];
			if (sInput) {
				filters.push(new Filter({
					filters: [
						new Filter("LastName", FilterOperator.Contains, sInput),
						new Filter("FirstName", FilterOperator.Contains, sInput)
					],
					and: false
				}));
			}
			oBinding.filter(filters);
		},

		onPromote: function () {
			if (!this.promoteDialog) {
				this.promoteDialog = sap.ui.xmlfragment("com.gangel.employees.employees.fragment.PromoteEmployee", this);
				this.getView().addDependent(this.promoteDialog);
			}
			this.promoteDialog.setModel(new sap.ui.model.json.JSONModel({}), "promoteEmployee");
			this.promoteDialog.open();
		},

		onSubmitPromote: function () {
			var oData = this.promoteDialog.getModel("promoteEmployee").getData();
			var model = {
				SapId: this.getOwnerComponent().SapId,
				EmployeeId: this.employeeId,
				CreationDate: oData.CreationDate,
				Amount: oData.Salary,
				Comments: oData.Comments
			};

			this.getView().setBusy(true);
			this.getView().getModel("zemployees").create("/Salaries", model, {
				success: function () {
					this.getView().setBusy(false);
					MessageToast.show(this._resourceBundle.getText("promotedOk"));
				}.bind(this),
				error: function () {
					this.getView().setBusy(false);
					MessageToast.show(this._resourceBundle.getText("promoteFail"));
				}.bind(this)
			});

			this.promoteDialog.close();
		},

		onCancelPromote: function () {
			this.promoteDialog.close();
		},

		onTerminate: function () {
			MessageBox.confirm(this._resourceBundle.getText("deleteMsg"), {
				title: this._resourceBundle.getText("confirm"),
				onClose: function (oAction) {
					if (oAction === "OK") {
						this.getView().getModel("zemployees").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
							success: function () {
								MessageToast.show(this._resourceBundle.getText("deleted"));
							}.bind(this),
							error: function () {
								MessageToast.show(this._resourceBundle.getText("deleteFail"));
							}.bind(this)
						});
					}
				}.bind(this)
			});
		},

		onBeforeUploadStarts: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var slug = this.getOwnerComponent().SapId + ";" + this.employeeId + ";" + oItem.getFileName();
			var token = this.getView().getModel("zemployees").getSecurityToken();

			// Header Slug
			var oCustomerHeaderSlug = new Item({
				key: "slug",
				text: slug
			});

			// Token
			var oCustomerHeaderToken = new Item({
				key: "X-CSRF-Token",
				text: token
			});

			oItem.addHeaderField(oCustomerHeaderToken);
			oItem.addHeaderField(oCustomerHeaderSlug);
		},

		onAfterItemRemoved: function (oEvent) {
			var oItem = oEvent.getParameter("item");
			var sPath = oItem.getBindingContext("zemployees").getPath();

			this.getView().getModel("zemployees").remove(sPath, {
				success: function () {
					MessageToast.show(this._resourceBundle.getText("fileDeletedOk"));
				}.bind(this),
				error: function () {
					MessageToast.show(this._resourceBundle.getText("fileDeletedFail"));
				}.bind(this)
			});
		},

		onOpenFile: function () {
			var oUploadSet = this.byId("UploadSet");
			var aSelectedItems = oUploadSet.getSelectedItems();

			if (aSelectedItems.length === 0) {
				MessageBox.error("No file selected.");
				return;
			}

			var sPath = aSelectedItems[0].getBindingContext("zemployees").getPath();
			window.open("/comgangelemployeesemployee/sap/opu/odata/sap/ZEMPLOYEES_SRV" + sPath + "/$value");
		},
		/**
		 * Formatter for employee icon based on employee type.
		 * @param {string} sType - The employee type.
		 * @returns {string} - The icon to display.
		 */
		formatEmployeeIcon: function (sType) {
			switch (sType) {
				case "0": // Intern
					return "sap-icon://employee-pane";
				case "1": // Self-Employed
					return "sap-icon://employee";
				case "2": // Manager
					return "sap-icon://leads";
				default:
					return "sap-icon://employee";
			}
		},

		/**
		 * Formatter for employee type text.
		 * @param {string} sType - The employee type.
		 * @returns {string} - The text to display.
		 */
		formatEmployeeType: function (sType) {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			switch (sType) {
				case "0": // Intern
					return oResourceBundle.getText("intern");
				case "1": // Self-Employed
					return oResourceBundle.getText("selfEmployed");
				case "2": // Manager
					return oResourceBundle.getText("manager");
				default:
					return oResourceBundle.getText("unknown");
			}
		},
		/**
		 * Formatter to display date in a normal format (DD/MM/YYYY).
		 * @param {string} sDate - The date string from the model.
		 * @returns {string} - The formatted date string.
		 */
		formatDate: function (sDate) {
			if (!sDate) {
				return ""; // Return empty string if date is not provided
			}

			// Convert the date string to a Date object
			var oDate = new Date(sDate);

			// Check if the date is valid
			if (isNaN(oDate.getTime())) {
				return ""; // Return empty string if the date is invalid
			}

			// Format the date as DD/MM/YYYY
			var sDay = String(oDate.getDate()).padStart(2, "0"); // Ensure 2 digits for day
			var sMonth = String(oDate.getMonth() + 1).padStart(2, "0"); // Ensure 2 digits for month
			var sYear = oDate.getFullYear();

			return `${sDay}/${sMonth}/${sYear}`; // Return formatted date
		}
	});
});
