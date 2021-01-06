define([
  'core/js/adapt',
  'core/js/views/componentView'
], function(Adapt, ComponentView) {

  class DiagnosticResultsView extends ComponentView {

    events() {
      return {
        'click .js-diagnostic-continue-btn': 'onContinueClicked'
      };
    }

    preRender() {
      this.model.setLocking('_isVisible', false);

      this.listenTo(Adapt, 'preRemove', function () {
        this.model.unsetLocking('_isVisible');
      });

      this.listenTo(this.model, {
        'change:_feedbackBand': this.addClassesToArticle,
        'change:body': this.render
      });

      this.model.checkIfDiagnosticAssessmentComplete();
    }

    postRender() {
      this.setReadyStatus();
      this.setupInviewCompletion();
    }

    onContinueClicked() {
      Adapt.router.navigateToHomeRoute();
    }

    /**
     * If there are classes specified for the feedback band, apply them to the containing article
     * This allows for custom styling based on the band the user's score falls into
     */
    addClassesToArticle(model, value) {
      if (!value || !value._classes) return;

      this.$el.parents('.article').addClass(value._classes);
    }

  }

  DiagnosticResultsView.template = 'diagnosticResults';

  return DiagnosticResultsView;
});
