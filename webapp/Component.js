sap.ui.define(['sap/ui/core/UIComponent', 'local/experiment/model/models'], function(
  UIComponent,
  models
) {
  'use strict';

  return UIComponent.extend('local.experiment.Component', {
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
