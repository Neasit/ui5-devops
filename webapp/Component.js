sap.ui.define(['sap/ui/core/UIComponent', 'sap/ui/Device', 'local/calendar/model/models'], function(
  UIComponent,
  Device,
  models
) {
  'use strict';

  return UIComponent.extend('local.calendar.Component', {
    metadata: {
      manifest: 'json',
    },

    /**
     * The component is initialized by UI5 automatically during the startup of the app and
     * calls the init method once.
     * @public
     * @override
     */
    init: function() {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);
      // Create connection to addition oData service or do request
      // set the device model
      this.setModel(models.createDeviceModel(), 'device');
      // Router
      this.getRouter().initialize();
    },
  });
});
