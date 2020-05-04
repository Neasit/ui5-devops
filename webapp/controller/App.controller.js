sap.ui.define(['local/calendar/controller/BaseController'], function(BaseController) {
  'use strict';

  return BaseController.extend('local.calendar.controller.App', {
    onInit: function() {
      var oViewModel = new sap.ui.model.json.JSONModel({
        busy: false,
        delay: 0,
      });
      this.setModel(oViewModel, 'appModel');
    },
  });
});