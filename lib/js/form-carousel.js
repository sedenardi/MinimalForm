'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {

  var randomID = function randomID() {
    var id = Math.random().toString(36).substr(2, 9);
    if (document.getElementById(id)) {
      return randomID();
    }
    return id;
  };

  var hasClass = function hasClass(elem, className) {
    return new RegExp(' ' + className + ' ').test(' ' + elem.className + ' ');
  };

  var addClass = function addClass(elem, className) {
    if (!hasClass(elem, className)) {
      elem.className += ' ' + className;
    }
  };
  var removeClass = function removeClass(elem, className) {
    var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
    if (hasClass(elem, className)) {
      while (newClass.indexOf(' ' + className + ' ') >= 0) {
        newClass = newClass.replace(' ' + className + ' ', ' ');
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  };

  var FormCarousel = function () {
    function FormCarousel(formElement, opts) {
      var _this = this;

      _classCallCheck(this, FormCarousel);

      this.formElement = formElement;
      if (typeof this.formElement === 'string') {
        this.formElement = document.querySelector(this.formElement);
      }
      this.options = opts;

      /***** init *****/

      // current question
      this.current = 0;

      // questions
      this.questions = [].slice.call(this.formElement.querySelectorAll('ol > li'));
      // total questions
      this.questionsCount = this.questions.length;
      // show first question
      addClass(this.questions[0], 'current');

      // next question control
      this.ctrlNext = this.formElement.querySelector('button.next');
      this.ctrlNext.setAttribute('aria-label', 'Next');

      // progress bar
      this.progress = this.formElement.querySelector('div.progress');
      // set progressbar attributes
      this.progress.setAttribute('role', 'progressbar');
      this.progress.setAttribute('aria-readonly', 'true');
      this.progress.setAttribute('aria-valuemin', '0');
      this.progress.setAttribute('aria-valuemax', '100');
      this.progress.setAttribute('aria-valuenow', '0');

      // question number status
      this.questionStatus = this.formElement.querySelector('span.number');
      // give the questions status an id
      this.questionStatus.id = this.questionStatus.id || randomID();
      // associate "x / y" with the input via aria-describedby
      for (var i = this.questions.length - 1; i >= 0; i--) {
        var _formElement = this.questions[i].querySelector('input, textarea, select');
        _formElement.setAttribute('aria-describedby', this.questionStatus.id);
      };
      // current question placeholder
      this.currentNum = this.questionStatus.querySelector('span.number-current');
      this.currentNum.innerHTML = Number(this.current + 1);
      // total questions placeholder
      this.totalQuestionNum = this.questionStatus.querySelector('span.number-total');
      this.totalQuestionNum.innerHTML = this.questionsCount;

      // error message
      this.error = this.formElement.querySelector('span.error-message');

      // checks for HTML5 Form Validation support
      // a cleaner solution might be to add form validation to the custom Modernizr script
      this.supportsHTML5Forms = typeof document.createElement('input').checkValidity === 'function';

      /***** initEvents *****/
      var self = this;
      // first input
      var firstElInput = this.questions[this.current].querySelector('input, textarea, select');
      // focus
      var onFocusStartFn = function onFocusStartFn() {
        firstElInput.removeEventListener('focus', onFocusStartFn);
        addClass(self.ctrlNext, 'show');
      };

      // show the next question control first time the input gets focused
      firstElInput.addEventListener('focus', onFocusStartFn);

      // show next question
      this.ctrlNext.addEventListener('click', function (ev) {
        ev.preventDefault();
        _this.nextQuestion();
      });

      // pressing enter will jump to next question
      this.formElement.addEventListener('keydown', function (ev) {
        var keyCode = ev.keyCode || ev.which;
        // enter
        if (keyCode === 13) {
          ev.preventDefault();
          _this.nextQuestion();
        }
      });
    }

    _createClass(FormCarousel, [{
      key: 'showError',
      value: function showError(err) {
        var message = '';
        switch (err) {
          case 'EMPTYSTR':
            message = 'Please fill the field before continuing';
            break;
          case 'INVALIDEMAIL':
            message = 'Please fill a valid email address';
            break;
          // ...
          default:
            message = err;
        };
        this.error.innerHTML = message;
        addClass(this.error, 'show');
      }
    }, {
      key: 'clearError',
      value: function clearError() {
        removeClass(this.error, 'show');
      }
    }, {
      key: 'updateProgress',
      value: function updateProgress() {
        var currentProgress = this.current * (100 / this.questionsCount);
        this.progress.style.width = currentProgress + '%';
        // update the progressbar's aria-valuenow attribute
        this.progress.setAttribute('aria-valuenow', currentProgress);
      }
    }, {
      key: 'updateQuestionNumber',
      value: function updateQuestionNumber() {
        // first, create next question number placeholder
        this.nextQuestionNum = document.createElement('span');
        this.nextQuestionNum.className = 'number-next';
        this.nextQuestionNum.innerHTML = Number(this.current + 1);
        // insert it in the DOM
        this.questionStatus.appendChild(this.nextQuestionNum);
      }
    }, {
      key: 'submit',
      value: function submit() {
        this.options.onSubmit(this.formElement);
      }
    }, {
      key: 'validate',
      value: function validate() {
        // current question´s input
        var input = this.questions[this.current].querySelector('input, textarea, select').value;
        if (input === '') {
          this.showError('EMPTYSTR');
          return false;
        }

        return true;
      }
    }, {
      key: 'nextQuestion',
      value: function nextQuestion() {
        if (!this.validate()) {
          return false;
        }
        // checks HTML5 validation
        if (this.supportsHTML5Forms) {
          var input = this.questions[this.current].querySelector('input, textarea, select');
          // clear any previous error messages
          input.setCustomValidity('');

          // checks input against the validation constraint
          if (!input.checkValidity()) {
            // Optionally, set a custom HTML5 valiation message
            // comment or remove this line to use the browser default message
            input.setCustomValidity('Whoops, that\'s not an email address!');
            // display the HTML5 error message
            this.showError(input.validationMessage);
            // prevent the question from changing
            return false;
          }
        }

        // check if form is filled
        if (this.current === this.questionsCount - 1) {
          this.isFilled = true;
        }

        // clear any previous error messages
        this.clearError();

        // current question
        var currentQuestion = this.questions[this.current];

        // increment current question iterator
        ++this.current;

        // update progress bar
        this.updateProgress();
        var nextQuestion = void 0;
        if (!this.isFilled) {
          // change the current question number/status
          this.updateQuestionNumber();

          // add class "show-next" to form element (start animations)
          addClass(this.formElement, 'show-next');

          // remove class "current" from current question and add it to the next one
          // current question
          nextQuestion = this.questions[this.current];
          removeClass(currentQuestion, 'current');
          addClass(nextQuestion, 'current');
        }

        // after animation ends, remove class "show-next" from form element and change current question placeholder
        var self = this;
        var onEndTransitionFn = function onEndTransitionFn() {
          if (true /*support.transitions*/) {
              this.removeEventListener('transitionend', onEndTransitionFn);
            }
          if (self.isFilled) {
            self.submit();
          } else {
            removeClass(self.formElement, 'show-next');
            self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
            self.questionStatus.removeChild(self.nextQuestionNum);
            // force the focus on the next input
            nextQuestion.querySelector('input, textarea, select').focus();
          }
        };

        if (true /*support.transitions*/) {
            this.progress.addEventListener('transitionend', onEndTransitionFn);
          } else {
          onEndTransitionFn();
        }
      }
    }, {
      key: 'setSubmitted',
      value: function setSubmitted() {
        addClass(this.formElement.querySelector('.form-carousel-inner'), 'hide');
        addClass(this.formElement.querySelector('.final-message'), 'show');
      }
    }]);

    return FormCarousel;
  }();

  if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
    window.FormCarousel = FormCarousel;
  } else {
    module.exports = FormCarousel;
  }
})();