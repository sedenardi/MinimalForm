(function() {

  const randomID = function() {
    const id = Math.random().toString(36).substr(2, 9);
    if (document.getElementById(id)) {
      return randomID();
    }
    return id;
  };

  const hasClass = function(elem, className) {
    return new RegExp(` ${className} `).test(` ${elem.className} `);
  };

  const addClass = function(elem, className) {
    if (!hasClass(elem, className)) {
      elem.className += ' ' + className;
    }
  };
  const removeClass = function(elem, className) {
    let newClass = ' ' + elem.className.replace(/[\t\r\n]/g, ' ') + ' ';
    if (hasClass(elem, className)) {
      while (newClass.indexOf(' ' + className + ' ') >= 0) {
        newClass = newClass.replace(' ' + className + ' ', ' ');
      }
      elem.className = newClass.replace(/^\s+|\s+$/g, '');
    }
  };

  class FormCarousel {
    constructor(formElement, opts) {
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
  		for (let i = this.questions.length - 1; i >= 0; i--) {
  			const formElement = this.questions[i].querySelector('input, textarea, select');
  			formElement.setAttribute('aria-describedby', this.questionStatus.id);
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
      const self = this;
			// first input
      const firstElInput = this.questions[this.current].querySelector('input, textarea, select');
			// focus
      const onFocusStartFn = function() {
        firstElInput.removeEventListener('focus', onFocusStartFn);
        addClass(self.ctrlNext, 'show');
      };

  		// show the next question control first time the input gets focused
  		firstElInput.addEventListener('focus', onFocusStartFn);

  		// show next question
  		this.ctrlNext.addEventListener('click', (ev) => {
  			ev.preventDefault();
  			this.nextQuestion();
  		});

  		// pressing enter will jump to next question
  		this.formElement.addEventListener('keydown', (ev) => {
  			const keyCode = ev.keyCode || ev.which;
  			// enter
  			if(keyCode === 13) {
  				ev.preventDefault();
  				this.nextQuestion();
  			}
  		});
    }
    showError(err) {
  		let message = '';
  		switch (err) {
  			case 'EMPTYSTR' :
  				message = 'Please fill the field before continuing';
  				break;
  			case 'INVALIDEMAIL' :
  				message = 'Please fill a valid email address';
  				break;
  			// ...
  			default :
  				message = err;
  		};
  		this.error.innerHTML = message;
  		addClass(this.error, 'show');
  	}
    clearError() {
      removeClass(this.error, 'show');
    }
    progress() {
      const currentProgress = this.current * (100 / this.questionsCount);
  		this.progress.style.width = currentProgress + '%';
  		// update the progressbar's aria-valuenow attribute
  		this.progress.setAttribute('aria-valuenow', currentProgress);
    }
    updateQuestionNumber() {
  		// first, create next question number placeholder
  		this.nextQuestionNum = document.createElement('span');
  		this.nextQuestionNum.className = 'number-next';
  		this.nextQuestionNum.innerHTML = Number(this.current + 1);
  		// insert it in the DOM
  		this.questionStatus.appendChild(this.nextQuestionNum);
  	}
    submit() {
  		this.options.onSubmit(this.formElement);
  	}
    nextQuestion() {
      // checks HTML5 validation
  		if (this.supportsHTML5Forms) {
  			const input = this.questions[this.current].querySelector('input, textarea, select');
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
  		const currentQuestion = this.questions[this.current];

  		// increment current question iterator
  		++this.current;

  		// update progress bar
  		this.progress();
      let nextQuestion;
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
  		const self = this;
      const onEndTransitionFn = function () {
        if (true/*support.transitions*/) {
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

  		if (true/*support.transitions*/) {
  			this.progress.addEventListener('transitionend', onEndTransitionFn);
  		} else {
  			onEndTransitionFn();
  		}
    }
  }

  if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
    window.FormCarousel = FormCarousel;
  } else {
    module.exports = FormCarousel;
  }
})();
