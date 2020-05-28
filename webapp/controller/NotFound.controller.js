sap.ui.define(['local/experiment/controller/BaseController'], function(BaseController) {
  'use strict';

  return BaseController.extend('local.experiment.controller.NotFound', {
    /**
     * Navigates to the masterPR when the link is pressed
     * @public
     */
    onLinkPressed: function() {
      this.getRouter().navTo('StartPage');
    },
  });
});
