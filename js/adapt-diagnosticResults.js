define([
  'core/js/adapt',
  './diagnosticResultsModel',
  './diagnosticResultsView'
], function(Adapt, DiagnosticResultsModel, DiagnosticResultsView) {

  return Adapt.register('diagnosticResults', {
    model: DiagnosticResultsModel,
    view: DiagnosticResultsView
  });

});
