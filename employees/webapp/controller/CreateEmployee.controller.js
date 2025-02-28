// @ts-nocheck
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	"sap/m/MessageBox",
	"sap/m/UploadCollectionParameter"
], function(
	Controller, JSONModel, MessageBox, UploadCollectionParameter
) {
	"use strict";

	function onBeforeRendering(){
		this.model = new JSONModel();
		this.getView().setModel(this.model);
		this.model.setData("EmployeeType", "Intern")
		this._wizard = this.byId("CreateEmployeeWizard");
		var oFirstStep = this._wizard.getSteps()[0];
		this._wizard.discardProgress(oFirstStep);
		// scroll to top
		this._wizard.goToStep(oFirstStep);
		// invalidate first step
		oFirstStep.setValidated(false);
		
		var resourceBundle =  this.getView().getModel("i18n").getResourceBundle();
		this._resourceBundle = resourceBundle;
	
		
	}

	function onInit(){
		
		// @ts-ignore
		this._wizard = this.byId("CreateEmployeeWizzard");
		// @ts-ignore
		this._oNavContainer = this.byId("wizardNavContainer");
		// @ts-ignore
		this._oWizardContentPage = this.byId("wizardContentPage");
		}	
		// @ts-ignore
		

	function goToStep2(oEvent){
		//step1
		var employeeTypeStep = this.byId("employeeTypeStep");
		//Step 2
		var employeeDetailStep = this.byId("employeeDetailStep");

		var employeeType = oEvent.getSource().data("employeeType")
		console.log(employeeType)
		

		var salary,type;
		switch(employeeType){
			case "intern":
				salary = 24000;
				type = "0";
				break;
			case "self employed":
				salary = 400;
				type = "1";
				break;
			case "manager":
				salary = 70000;
				type = "2";
				break;
			default:
				break;
		};
	
		//Al pulsar sobre el tipo, se sobreescribe el modelo registrando el tipo  y el valor del salario por defecto
		
		this.model.setData({
			_type : employeeType,
			Type : type,
			_Salary : salary
		});

		if(this._wizard.getCurrentStep() === employeeTypeStep.getId()){
			this._wizard.nextStep();
		}else{
		
				this._wizard.goToStep(employeeDetailStep);
			}
		
	}
	function employeeDetailsValidation(oEvent){
		console.log("data validate")
	}

	function validateDni(oEvent) {
		this.model.setProperty("/DniState","None");
		if(this.model.getProperty("/Type") !== "1"){
			var dni = oEvent.getParameter("value");
			var number;
			var letter;
			var letterList;
			var regularExp = /^\d{8}[a-zA-Z]$/;
			//Se comprueba que el formato es válido
			if(regularExp.test (dni) === true){
				//Número
				 number = dni.substr(0,dni.length-1);
				 //Letra
				 letter = dni.substr(dni.length-1,1);
				 number = number % 23;
				 letterList="TRWAGMYFPDXBNJZSQVHLCKET";
				 letterList=letterList.substring(number,number+1);
			if (letterList !== letter.toUpperCase()) {
				this.model.setProperty("/DniState","Error");
			 }else{
				this.model.setProperty("/DniState","None");
				this.dataEmployeeValidation();
			 }
			}else{
				this.model.setProperty("/DniState","Error");
			}	
		}
	}

	function containsOnlyLetters(str) {
		return /^[a-zA-Z]+$/.test(str);
	}
	function isValid(string){
		if (string && containsOnlyLetters(string)) {
			return true;
		}else{
			return false;
		}
	}
	function employeeDetailsValidation(){
		var object = this.model.getData();
		var validateStep = true;		
		//name
		if (isValid(object.Name)){
			object.NameState = 'None';
		}else{
			object.NameState = 'Error'
			var validateStep = false;	
		}
		//surname
		if (isValid(object.Surname)){
			object.SurnameState = 'None';
		}else{
			object.SurnameState = 'Error'
			var validateStep = false;
		}
		//date
		if(object.CreationDate) {
			object.CreationDateState = 'None';
		}else{
		object.CreationDateState = 'Error'
		var validateStep = false;
		}
		//dni
		if(!object.Dni){
			object.DniState = "Error";
			var validateStep = false;
		}

		if(validateStep) {
			this._wizard.validateStep(this.byId("employeeDetailStep"));
		} else {
			this._wizard.invalidateStep(this.byId("employeeDetailStep"));
		}
		console.log(object)
	}

	function wizardCompletedHandler(oEvent){
		//navigate to review
		var wizardNavContainer = this.byId("wizardNavContainer");
		wizardNavContainer.to(this.byId("wizardReviewPage"));
		//
		var uploadcollection = this.byId("UploadCollection");
		var files = uploadcollection.getItems();
		var filesNo = files.length;
		this.model.setProperty("/filesNo", filesNo);
		var uploadItems = [];
		for(var item of files) {
			var fileName = item.getFileName();

			console.log(mimeType, "MIME")
			//var fileObject = item.getProperty("file"); // Access the file object
			var mimeType = item.getProperty("mimeType") || _getMimeTypeFromFileName(fileName); // Use file.type or fallback
			uploadItems.push({DocName:item.getFileName(),MimeType: mimeType});
			
		};
		this.model.setProperty("/files",uploadItems);
		console.log(this.model);

	}
	function _getMimeTypeFromFileName(fileName) {
		var extension = fileName.split('.').pop().toLowerCase();
		switch (extension) {
			case "pdf":
				return "application/pdf";
			case "jpg":
			case "jpeg":
				return "image/jpeg";
			case "png":
				return "image/png";
			case "txt":
				return "text/plain";
			default:
				return "application/octet-stream"; // Default MIME type
		}
	}
	function editStepOne() {
		_handleNavigationToStep.bind(this)("employeeTypeStep");
	}

	function editStepTwo() {
		_handleNavigationToStep.bind(this)("employeeDetailStep");
	}

	function editStepThree() {
		_handleNavigationToStep.bind(this)("aditionalInfoStep");
	}
	
	
	function handleWizardCancel() {
		MessageBox.confirm(this._resourceBundle.getText("cancelMsg"),{
			onClose: function(oAction){
				if(oAction === "OK"){
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("RouteMain",{}, true);
				}
			}.bind(this)
		});
	}

	

	function handleWizardSubmit() {
		MessageBox.confirm(this._resourceBundle.getText("submitMsg"),{
			onClose: function(oAction){
				if(oAction === "OK"){
					var oModel = this.getView().getModel().getData()
					var employeeData = {
						SapId: this.getOwnerComponent().SapId,
						Type: oModel.Type,
						FirstName: oModel.Name,
						LastName: oModel.Surname,
						Dni: oModel.Dni,
						CreationDate: oModel.CreationDate,
						Comments: oModel.comments,
						UserToSalary: [{
							Amount:  parseFloat(oModel._Salary).toString(),
							Waers: "EUR"
						}],
						UserToAttachment: oModel.files

					};
					console.log("MODEL", oModel)
					this.getView().setBusy(true);
					this.getView().getModel("zemployees").create("/Users",employeeData,{
						success: function(data){
						this.getView().setBusy(false);
						console.log("new user", data)
						this.newUserId = "9"+data.EmployeeId.slice(1)
						MessageBox.information(this._resourceBundle.getText("employeeCreated",[this.newUserId]), {
							//navigate back to start
							onClose: function(){
								var wizardNavContainer = this.byId("wizardNavContainer");
								wizardNavContainer.back();
								var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
								oRouter.navTo("RouteMain",{}, true);
							}.bind(this)
						});
						//start upload
						console.log("ITEMS b4 upl",this.byId("UploadCollection").getHeaderParameters());
						this.byId("UploadCollection").upload();
						}.bind(this),
						error: function() {
							this.getView().setBusy(false);
							MessageBox.information(this._resourceBundle.getText("employeeFailed"))
						}.bind(this)

					});
				}
			}.bind(this)
		});
	}

	function _handleNavigationToStep(iStepId) {
		var fnAfterNavigate = function () {
			this._wizard.goToStep(this.byId(iStepId));
			this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
		}.bind(this);

		this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
		this.backToWizardContent();
	}
	function backToWizardContent() {
		this._oNavContainer.backToPage(this.byId("wizzardContentPage"));
	}

	function _handleMessageBoxOpen (sMessage, sMessageBoxType) {
		MessageBox[sMessageBoxType](sMessage, {
			actions: [MessageBox.Action.YES, MessageBox.Action.NO],
			onClose: function (oAction) {
				if (oAction === MessageBox.Action.YES) {
					this._handleNavigationToStep.bind(this)(0);
					this._wizard.discardProgress(this._wizard.getSteps()[0]);
				}
			}.bind(this)
		});
	}
/// uploader
	function onChange(oEvent) {
		var oUploadCollection = oEvent.getSource();
		// Header Token
		var oCustomerHeaderToken = new UploadCollectionParameter({
			name: "x-csrf-token",
			value: this.getView().getModel("zemployees").getSecurityToken()
		});
		oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		console.log("token = ", oCustomerHeaderToken)
		
	}
	function onBeforeUploadStarts (oEvent) {
		// Header Slug
		var fileName = oEvent.getParameter("fileName");
		if(!fileName){
			fileName = "a_test.txt"
		};
		var oCustomerHeaderSlug = new UploadCollectionParameter({
			name: "slug",
			value: this.getOwnerComponent().SapId+";"+this.newUserId+";"+fileName
		});

		console.log("slug = ", oCustomerHeaderSlug, fileName)		
		
		oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);

		var parametres = oEvent.getSource().getHeaderParameters()
		console.log("parametres = "  , parametres)
	}

	// function onStartUpload(oEvent) {
	// 	var that = this;
	// 	var oUploadCollection = that.byId("UploadCollection");
	// 	var cFiles = oUploadCollection.getItems().length;
	// 	if (cFiles > 0) {
	// 		oUploadCollection.upload();
	// 		console.log(cFiles, "uploaded")
	// 	}
	// }

	function onUploadComplete(oEvent) {
		var sUploadedFileNames = oEvent.getSource().getParameters("files");
		console.log("SATUS",sUploadedFileNames);
		
	}

	return Controller.extend("com.gangel.employees.employees.controller.CreateEmployee", {
		onBeforeRendering : onBeforeRendering,
		onInit: onInit,
		goToStep2: goToStep2,
		employeeDetailsValidation: employeeDetailsValidation,
		validateDni: validateDni,
		employeeDetailsValidation: employeeDetailsValidation,
		wizardCompletedHandler: wizardCompletedHandler,
		handleWizardSubmit: handleWizardSubmit,
		handleWizardCancel: handleWizardCancel,
		editStepOne: editStepOne,
		editStepTwo: editStepTwo,
		editStepThree: editStepThree,
	 	backToWizardContent: backToWizardContent,
		onChange: onChange,
		onBeforeUploadStarts: onBeforeUploadStarts,
		//onStartUpload: onStartUpload,
		
		onUploadComplete : onUploadComplete
	});
});