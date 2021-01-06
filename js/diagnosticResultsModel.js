define([
  'core/js/adapt',
  'core/js/models/componentModel'
], function(Adapt, ComponentModel) {

  class DiagnosticResultsModel extends ComponentModel {

    init() {
      this.listenTo(Adapt, {
        'diagnostic:complete': this.onDiagnosticAssessmentComplete
      });
    }

    /**
     * Checks to see if the diagnostic assessment was completed in a previous session or not
     */
    checkIfDiagnosticAssessmentComplete() {
      if (!Adapt.assessment || this.get('_diagnosticAssessmentId') === undefined) {
        return;
      }

      var assessmentModel = Adapt.assessment.get(this.get('_diagnosticAssessmentId'));
      if (!assessmentModel || assessmentModel.length === 0) return;

      var state = assessmentModel.getState();
      if (state.isComplete) {
        this.onDiagnosticAssessmentComplete(state);
        return;
      }

      this.setVisibility();
    }

    onDiagnosticAssessmentComplete(state) {
      /*
      make shortcuts to some of the key properties in the state object so that
      content developers can just use {{scoreAsPercent}} in json instead of {{state.scoreAsPercent}}
      */
      this.set({
        _state: state,
        score: state.score,
        scoreAsPercent: state.scoreAsPercent,
        maxScore: state.maxScore,
        isPass: state.isPass,
        isContinueEnabled: this.getIsContinueEnabled(state)
      });

      this.setFeedbackBand(state);

      this.setFeedbackText();

      this.toggleVisibility(true);
    }

    setFeedbackBand(state) {
      const scoreProp = state.isPercentageBased ? 'scoreAsPercent' : 'score';
      const bands = _.sortBy(this.get('_bands'), '_score');

      for (let i = (bands.length - 1); i >= 0; i--) {
        const isScoreInBandRange = (state[scoreProp] >= bands[i]._score);
        if (!isScoreInBandRange) continue;

        this.set('_feedbackBand', bands[i]);
        break;
      }
    }

    setFeedbackText() {
      const feedbackBand = this.get('_feedbackBand');

      // ensure any handlebars expressions in the .feedback are handled...
      const feedback = feedbackBand.feedback ? Handlebars.compile(feedbackBand.feedback)(this.toJSON()) : '';

      this.set({
        feedback,
        body: this.get('_completionBody')
      });
    }

    setVisibility() {
      if (!Adapt.assessment) return;

      const isVisibleBeforeCompletion = this.get('_isVisibleBeforeCompletion') || false;
      const wasVisible = this.get('_isVisible');

      const assessmentModel = Adapt.assessment.get(this.get('_diagnosticAssessmentId'));
      if (!assessmentModel || assessmentModel.length === 0) return;

      const state = assessmentModel.getState();
      const { isComplete, attemptInProgress, attemptsSpent } = state;
      const hasHadAttempt = (!attemptInProgress && attemptsSpent > 0);

      let isVisible = (isVisibleBeforeCompletion && !isComplete) || hasHadAttempt;

      if (!wasVisible && isVisible) isVisible = false;

      this.toggleVisibility(isVisible);
    }

    toggleVisibility (isVisible = !this.get('_isVisible')) {
      this.set('_isVisible', isVisible, { pluginName: 'diagnosticResults' });
    }

    getIsContinueEnabled({ isPass }) {
      if (!isPass) return true;

      return Adapt.contentObjects.where({ _isAvailable: true, _type: 'page' }).length > 1;
    }
  }

  return DiagnosticResultsModel;

});
