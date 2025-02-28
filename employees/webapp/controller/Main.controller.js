sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    
    function navToCreate() {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("CreateEmployee")
        
    }

    function navToViewEmployee(){
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("ViewEmployee")		
		}    
    
    return Controller.extend("com.gangel.employees.employees.controller.Main", {
        onInit() {
        },

		navToCreate: navToCreate,
		navToViewEmployee: navToViewEmployee
        
    });
});