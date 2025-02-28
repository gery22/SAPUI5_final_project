sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Item",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(
	Controller, Filter, FilterOperator, Item, MessageToast, MessageBox
) {
	"use strict";


	function onInit() {
		this._resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		this._splitApp = this.byId("idSplitApp");
		
	}

	function onEmployeeSelect(oEvent) {
		this._splitApp.to(this.createId("employeeDetails"))
		var bindingContext = oEvent.getParameter("listItem").getBindingContext("zemployees");
		console.log(bindingContext)
		this.employeeId = bindingContext.getProperty("EmployeeId")
		console.log("ID=", this.employeeId)
		var employeeDetails = this.byId("employeeDetails");
		employeeDetails.bindElement("zemployees>/Users(EmployeeId='"+ this.employeeId +"',SapId='"+this.getOwnerComponent().SapId+"')");
		console.log(bindingContext)
	

		

	}

	function onPressBack(){
		var oRouter = this.getOwnerComponent().getRouter();
		oRouter.navTo("RouteMain");
	}

	function onSearchEmployee(oEvent){
		var sInput = oEvent.getParameter("newValue");
		var oList = this.byId("list");
		var oBinding = oList.getBinding("items");
		
		var filters = []
		if(sInput){
			filters.push(new Filter({
				filters:[
					new Filter("LastName", FilterOperator.Contains, sInput),
                     new Filter("FirstName", FilterOperator.Contains, sInput)
				],
				and: false
			}))
		};
		oBinding.filter(filters);
		// if(sInput){
		// 	var fnFilter = function (oContext) {
		// 		var sName = oContext.getProperty("FirstName");
		// 		return sName.toLowerCase().includes(sInput.toLowerCase());
		// 	};
		// oBinding.filter(new Filter({
		// 	filters: [],
		// 		and:false,
		// 		test: fnFilter
			
		// }))	
		// }else{
		// 	oBinding.filter([]);
		// }		

	}

	
	function onPromote() {
		if (!this.promoteDialog) {this.promoteDialog = sap.ui.xmlfragment("com.gangel.employees.employees.fragment.PromoteEmployee", this);
		this.getView().addDependent(this.promoteDialog);
		}
		this.promoteDialog.setModel(new sap.ui.model.json.JSONModel({}),"promoteEmployee");
		this.promoteDialog.open()
	}

	function onSubmitPromote(oEvent){
		var oData = this.promoteDialog.getModel("promoteEmployee").getData();
		var model = { 
			SapId: this.getOwnerComponent().SapId,
			EmployeeId: this.employeeId,
			CreationDate: oData.CreationDate,
			Amount: oData.Salary,
			Comments: oData.Comments				  
		}
		this.getView().setBusy(true);
		this.getView().getModel("zemployees").create("/Salaries", model,{
			success: function(){
				this.getView().setBusy(false);
				sap.m.MessageToast.show(this._resourceBundle.getText("promotedOk"))

			}.bind(this),
			error: function(){
				this.getView().setBusy(false);
				sap.m.MessageToast.show(this._resourceBundle.getText("promoteFail"))
			}.bind(this)
		});

		this.promoteDialog.close()

	}

	function onCancelPromote(oEvent){
		this.promoteDialog.close()
	}

	function onTerminate(oEvent){

		MessageBox.confirm(this._resourceBundle.getText("deleteMsg"),{
			title: this._resourceBundle.getText("confirm"),
			onClose: function(oAction){
				if(oAction === "OK"){
					this.getView().getModel("zemployees").remove("/Users(EmployeeId='" + this.employeeId + "',SapId='"+this.getOwnerComponent().SapId+"')", {
						success: function(){
							MessageToast.show(this._resourceBundle.getText("deleted"))
						}.bind(this),
						error: function(){
							MessageToast.show(this._resourceBundle.getText("deleteFail"))
						}.bind(this)
					});
				}
			}.bind(this)
		});
	}
		



	////Attachments
	function onBeforeUploadStarts(oEvent) {
		var oItem = oEvent.getParameter("item");
		console.log(oItem.getFileName());
		var slug = this.getOwnerComponent().SapId+";"+this.employeeId+";"+oItem.getFileName();
		var token = this.getView().getModel("zemployees").getSecurityToken();
		//Header Slug
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
		console.log(oItem)
	}
			
			

	

	function onAfterItemRemoved(oEvent){
		// remove item from the model
		var oItem = oEvent.getParameter("item");
		var sPath  = oItem.getBindingContext("zemployees").getPath();
		this.getView().getModel("zemployees").remove(sPath, {
			success: function(){
				MessageToast.show(this._resourceBundle.getText("fileDeletedOk"))
			
			}.bind(this),
			error:function(){
				MessageToast.show(this._resourceBundle.getText("fileDeletedFail"))
			}.bind(this)
		});
		

	}

	function onOpenFile(oEvent){
		
			// Get the selected item from the UploadSet
			var oUploadSet = this.byId("UploadSet");
			var aSelectedItems = oUploadSet.getSelectedItems();
		
			if (aSelectedItems.length === 0) {
				MessageBox.error("No file selected.");
				return;
			}
		
			// Get the first selected item
			var sPath = aSelectedItems[0].getBindingContext("zemployees").getPath();
			window.open("/sap/opu/odata/sap/ZEMPLOYEES_SRV"+sPath+"/$value");
		}
	




	return Controller.extend("com.gangel.employees.employees.controller.ViewEmployee", {
		onInit:onInit,
		onEmployeeSelect: onEmployeeSelect,
		onPressBack: onPressBack,
		onSearchEmployee: onSearchEmployee,
		onPromote: onPromote,
		onSubmitPromote: onSubmitPromote,
		onCancelPromote: onCancelPromote,
		onTerminate: onTerminate,
		onBeforeUploadStarts: onBeforeUploadStarts,
		onAfterItemRemoved : onAfterItemRemoved,
		onOpenFile: onOpenFile
	});
});