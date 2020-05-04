sap.ui.define(['local/calendar/controller/BaseController'], function(BaseController) {
  'use strict';

  return BaseController.extend('local.calendar.controller.NotFound', {
    /**
     * Navigates to the masterPR when the link is pressed
     * @public
     */
    onLinkPressed: function() {
      this.getRouter().navTo('StartPage');
    },
  });
});
