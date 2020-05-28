sap.ui.define(['local/experiment/controller/BaseController'], function(BaseController) {
  'use strict';

  return BaseController.extend('local.experiment.controller.StartPage', {
    // sLang: null, Test

    onInit: function() {
      // Models
      this._oi18n = this.getResourceBundle();
      this._oODataModel = this.getOwnerComponent().getModel();
      // routing
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.getRoute('StartPage').attachPatternMatched(this.handleRouteMatched, this);
    },

    // Router
    handleRouteMatched: function(oEvent) {
      // first screen
    },
  });
});
